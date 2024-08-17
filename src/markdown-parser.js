/**
 * A class for parsing markdown content with embedded components and fenced code blocks.
 */
class MarkdownComponentParser {
    constructor() {
        this.componentRegex = /<(\w+)([^>]*)(?:\/>|>([\s\S]*?)<\/\1>)/;
        this.propRegex = /(\w+)(?:=(?:(?:"((?:\\.|[^"])*)")|(?:'((?:\\.|[^'])*)')|(\{[^}]*\})|([^{}\s]+)))?/g;
        this.codeBlockRegex = /^```[\s\S]*?^```/gm;
    }

    parse(input) {
        const result = [];
        const codeBlocks = [];

        // First, identify all code blocks and replace them with placeholders
        input = input.replace(this.codeBlockRegex, (match) => {
            codeBlocks.push(match);
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
                const props = this.parseProps(propsString);
                const parsedChildren = children ? this.parse(children) : null;
                result.push({
                    type: 'component',
                    name,
                    props,
                    children: parsedChildren
                });
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
        let match;

        while ((match = this.propRegex.exec(propsString)) !== null) {
            const [, key, doubleQuoted, singleQuoted, objectLiteral, unquotedValue] = match;
            let value;

            if (doubleQuoted !== undefined) {
                value = doubleQuoted;
            } else if (singleQuoted !== undefined) {
                value = singleQuoted;
            } else if (objectLiteral !== undefined) {
                try {
                    const trimmedLiteral = objectLiteral.slice(1, -1).trim();
                    value = Function(`"use strict";return (${trimmedLiteral})`)();
                } catch (e) {
                    console.warn(`Invalid object literal for ${key}:`, objectLiteral);
                    value = objectLiteral;
                }
            } else if (unquotedValue !== undefined) {
                if (unquotedValue === 'true') {
                    value = true;
                } else if (unquotedValue === 'false') {
                    value = false;
                } else if (!isNaN(unquotedValue)) {
                    value = Number(unquotedValue);
                } else {
                    value = unquotedValue;
                }
            } else {
                value = true;
            }

            props[key] = value;
        }

        return props;
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