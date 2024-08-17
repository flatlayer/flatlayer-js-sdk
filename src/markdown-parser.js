/**
 * A class for parsing markdown content with embedded components and fenced code blocks.
 */
class MarkdownComponentParser {
    constructor() {
        this.componentRegex = /<(\w+)([^>]*)(?:\/>|>([\s\S]*?)<\/\1>)/;
        this.propRegex = /(\w+)(?:=(?:(?:"((?:\\.|[^"])*)")|(?:'((?:\\.|[^'])*)')|({(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*})))?/g;
        this.fencedCodeRegex = /^```(\w*)\n([\s\S]*?)^```/m;
    }

    /**
     * Parse the input markdown content with embedded components and fenced code blocks.
     * @param {string} input - The input markdown content to parse.
     * @returns {Array<Object>} An array of parsed content objects.
     */
    parse(input) {
        const result = [];
        let remainingInput = input.trim();

        while (remainingInput.length > 0) {
            const codeMatch = this.fencedCodeRegex.exec(remainingInput);
            const componentMatch = this.componentRegex.exec(remainingInput);

            if (codeMatch && (!componentMatch || codeMatch.index < componentMatch.index)) {
                // Process fenced code block
                if (codeMatch.index > 0) {
                    this.addMarkdownContent(result, remainingInput.slice(0, codeMatch.index));
                }
                result.push({
                    type: 'markdown',
                    content: codeMatch[0],
                    codeBlocks: [{
                        content: codeMatch[0],
                        language: codeMatch[1] || null
                    }]
                });
                remainingInput = remainingInput.slice(codeMatch.index + codeMatch[0].length).trim();
            } else if (componentMatch) {
                // Process component
                if (componentMatch.index > 0) {
                    this.addMarkdownContent(result, remainingInput.slice(0, componentMatch.index));
                }
                const [fullMatch, name, propsString, children] = componentMatch;
                const props = this.parseProps(propsString);
                result.push({
                    type: 'component',
                    name,
                    props,
                    children: children ? this.parse(children) : null
                });
                remainingInput = remainingInput.slice(componentMatch.index + fullMatch.length).trim();
            } else {
                // No more matches, add remaining content as markdown
                this.addMarkdownContent(result, remainingInput);
                break;
            }
        }

        return result;
    }

    /**
     * Add trimmed markdown content to the result array.
     * @param {Array} result - The array to add the markdown content to.
     * @param {string} content - The markdown content to add.
     * @private
     */
    addMarkdownContent(result, content) {
        const trimmedContent = content.trim();
        if (trimmedContent) {
            result.push({ type: 'markdown', content: trimmedContent });
        }
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
 * Parse the given markdown content with embedded components and fenced code blocks.
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