/**
 * A class for parsing markdown content with embedded components and fenced code blocks.
 */
class MarkdownComponentParser {
    constructor() {
        this.componentRegex = /<(\w+)([^>]*)(?:\/>|>([\s\S]*?)<\/\1>)/;
        this.propRegex = /(\w+)(?:=(?:(?:"((?:\\.|[^"])*)")|(?:'((?:\\.|[^'])*)')|({(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*})))?/g;
        this.codeBlockRegex = /^```[\s\S]*?^```/gm;
    }

    parse(input) {
        const result = [];
        const codeBlocks = [];
        let lastIndex = 0;

        // First, identify all code blocks and replace them with placeholders
        input = input.replace(this.codeBlockRegex, (match, offset) => {
            codeBlocks.push(match);
            lastIndex = offset + match.length;
            return `__CODE_BLOCK_${codeBlocks.length - 1}__`;
        });

        // Now parse the content, treating code block placeholders as regular text
        while (input.length > 0) {
            const componentMatch = this.componentRegex.exec(input);

            if (componentMatch) {
                if (componentMatch.index > 0) {
                    this.addMarkdownContent(result, input.slice(0, componentMatch.index));
                }
                const [fullMatch, name, propsString, children] = componentMatch;

                // Check if it's a paragraph with only text content
                if (name === 'p' && !this.componentRegex.test(children)) {
                    this.addMarkdownContent(result, children);
                } else {
                    const props = this.parseProps(propsString);
                    const parsedChildren = children ? this.parse(children) : null;
                    result.push({
                        type: 'component',
                        name,
                        props,
                        children: parsedChildren
                    });
                }
                input = input.slice(componentMatch.index + fullMatch.length);
            } else {
                this.addMarkdownContent(result, input);
                break;
            }
        }

        // Replace code block placeholders with actual code blocks
        return result.map(item => {
            if (item.type === 'markdown') {
                item.content = item.content.replace(/__CODE_BLOCK_(\d+)__/g, (_, index) => codeBlocks[parseInt(index)]);
            }
            return item;
        });
    }

    addMarkdownContent(result, content) {
        const trimmedContent = content.trim();
        if (trimmedContent) {
            result.push({ type: 'markdown', content: trimmedContent });
        }
    }

    parseProps(propsString) {
        const props = {};
        for (const match of propsString.matchAll(this.propRegex)) {
            const [, key, doubleQuoted, singleQuoted, objectLiteral] = match;
            let value;
            if (objectLiteral) {
                try {
                    // Ensure we're parsing the entire object literal
                    value = this.parseJSONLike(objectLiteral);
                } catch (e) {
                    console.warn(`Invalid object literal for ${key}:`, objectLiteral);
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

    parseJSONLike(str) {
        // Remove any leading/trailing whitespace
        str = str.trim();
        // Ensure the string starts and ends with curly braces
        if (!str.startsWith('{') || !str.endsWith('}')) {
            str = `{${str}}`;
        }
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