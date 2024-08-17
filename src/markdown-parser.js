/**
 * A class for parsing markdown content with embedded components.
 */
class MarkdownComponentParser {
    constructor() {
        /**
         * Regular expression for matching components in the markdown.
         * @type {RegExp}
         * @private
         */
        this.componentRegex = /<(\w+)([^>]*)(?:\/>|>([\s\S]*?)<\/\1>)/g;

        /**
         * Regular expression for parsing component properties.
         * @type {RegExp}
         * @private
         */
        this.propRegex = /(\w+)(?:=(?:(?:"((?:\\.|[^"])*)")|(?:'((?:\\.|[^'])*)')|({(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*})))?/g;
    }

    /**
     * Parse the input markdown content with embedded components.
     * @param {string} input - The input markdown content to parse.
     * @returns {Array<Object>} An array of parsed content objects.
     */
    parse(input) {
        const result = [];
        let lastIndex = 0;
        for (const match of input.matchAll(this.componentRegex)) {
            if (match.index > lastIndex) {
                const content = input.slice(lastIndex, match.index).trim();
                if (content) {
                    result.push({ type: 'markdown', content });
                }
            }
            const [fullMatch, name, propsString, children] = match;
            const props = this.parseProps(propsString);
            let parsedChildren = children ? this.parse(children.trim()) : null;

            // Special case for paragraph tags
            if (name === 'p') {
                if (Object.keys(props).length === 0 && // No attributes
                    parsedChildren &&
                    parsedChildren.length === 1 &&
                    parsedChildren[0].type === 'markdown' &&
                    !/<\w+/.test(parsedChildren[0].content)) { // No nested tags
                    result.push(parsedChildren[0]);
                } else {
                    result.push({
                        type: 'component',
                        name,
                        props,
                        children: parsedChildren
                    });
                }
            } else {
                result.push({
                    type: 'component',
                    name,
                    props,
                    children: parsedChildren
                });
            }
            lastIndex = match.index + fullMatch.length;
        }
        if (lastIndex < input.length) {
            const content = input.slice(lastIndex).trim();
            if (content) {
                result.push({ type: 'markdown', content });
            }
        }
        return result;
    }

    /**
     * Parse the properties string of a component.
     * @param {string} propsString - The string containing component properties.
     * @returns {Object} An object containing parsed properties.
     * @private
     */
    parseProps(propsString) {
        const props = {};
        for (const match of propsString.matchAll(this.propRegex)) {
            const [, key, doubleQuoted, singleQuoted, objectLiteral] = match;
            let value;
            if (objectLiteral) {
                try {
                    const trimmedLiteral = objectLiteral.replace(/^\{([\s\S]*)\}$/, '$1').trim();
                    value = this.parseJSONLike(trimmedLiteral);
                } catch (e) {
                    console.warn(`Invalid JSON in prop ${key}:`, objectLiteral);
                    value = objectLiteral;
                }
            } else if (doubleQuoted !== undefined) {
                value = doubleQuoted;
            } else if (singleQuoted !== undefined) {
                value = singleQuoted;
            } else {
                value = true; // Boolean attribute
            }
            props[key] = value;
        }
        return props;
    }

    /**
     * Parse a JSON-like string into a JavaScript object.
     * @param {string} str - The JSON-like string to parse.
     * @returns {*} The parsed JavaScript object or value.
     * @private
     */
    parseJSONLike(str) {
        return Function('"use strict";return (' + str + ')')();
    }
}

/**
 * Parse the given markdown content with embedded components.
 * @param {string} input - The input markdown content to parse.
 * @returns {Array<Object>} An array of parsed content objects.
 */
function parseContent(input) {
    const parser = new MarkdownComponentParser();
    return parser.parse(input);
}

export default {
    MarkdownComponentParser,
    parseContent
};