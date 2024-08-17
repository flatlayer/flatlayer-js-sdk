import { parse } from 'svelte/compiler';

class MarkdownComponentParser {
    constructor() {
        this.componentRegex = /<([A-Z]\w+)([^>]*)(?:\/>|>([\s\S]*?)<\/\1>)/;
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

                try {
                    const props = this.parseComponentWithSvelte(fullMatch);
                    const parsedChildren = children ? this.parse(children) : null;
                    result.push({
                        type: 'component',
                        name,
                        props,
                        children: parsedChildren
                    });
                } catch (error) {
                    console.error('Failed to parse component:', fullMatch, error);
                    this.addMarkdownContent(result, fullMatch);
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

    parseComponentWithSvelte(componentString) {
        const ast = parse(componentString);

        const htmlNode = ast.html;
        if (htmlNode && htmlNode.children && htmlNode.children.length > 0) {
            const componentNode = htmlNode.children[0];
            const props = {};

            if (componentNode.attributes) {
                componentNode.attributes.forEach(attr => {
                    if (attr.type === 'Attribute') {
                        props[attr.name] = this.getAttributeValue(componentString, attr);
                    }
                });
            }

            return props;
        }

        return {};
    }

    getAttributeValue(componentString, attr) {
        if (attr.value.length === 1) {
            const value = attr.value[0];
            if (value.type === 'Text') {
                return value.data;
            } else if (value.type === 'Expression') {
                const rawValue = componentString.slice(value.start, value.end).trim();
                return this.evaluateExpression(rawValue);
            }
        }
        // For complex values or multiple value nodes, return the raw expression
        const start = attr.start + attr.name.length + 1; // +1 for the '='
        const end = attr.end;
        const rawValue = componentString.slice(start, end).trim();
        return this.evaluateExpression(rawValue);
    }

    evaluateExpression(expression) {
        // Remove curly braces if present
        expression = expression.replace(/^\{|\}$/g, '').trim();

        // Check if it's a simple number
        if (/^-?\d+(\.\d+)?$/.test(expression)) {
            return Number(expression);
        }

        // For other expressions, we'll return them as strings
        // You might want to add more sophisticated evaluation here
        // if you need to handle more complex expressions
        return expression;
    }
}

function parseContent(input) {
    const parser = new MarkdownComponentParser();
    return parser.parse(input);
}

export default {
    MarkdownComponentParser,
    parseContent
};