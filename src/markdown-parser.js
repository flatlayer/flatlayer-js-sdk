import { parse } from 'svelte/compiler';

class MarkdownComponentParser {
    constructor() {
        this.codeBlockRegex = /^```[\s\S]*?^```/gm;
    }

    parse(input) {
        const parsed = parse(input);
        return this.processNode(parsed.html);
    }

    processNode(node) {
        if (node.type === 'Fragment') {
            return this.processChildren(node.children);
        } else if (node.type === 'InlineComponent' || node.type === 'Element') {
            return this.processComponent(node);
        } else if (node.type === 'Text') {
            return this.processText(node);
        }
        return [];
    }

    processChildren(children) {
        return children.flatMap(child => this.processNode(child));
    }

    processComponent(node) {
        const props = this.processAttributes(node.attributes);
        let children = null;
        if (node.children && node.children.length > 0) {
            const processedChildren = this.processChildren(node.children);
            children = processedChildren.length > 0 ? processedChildren : null;
        }
        return [{
            type: 'component',
            name: node.name,
            props,
            children
        }];
    }

    processAttributes(attributes) {
        const props = {};
        for (const attr of attributes) {
            if (attr.type === 'Attribute') {
                props[attr.name] = this.getAttributeValue(attr);
            }
        }
        return props;
    }

    getAttributeValue(attr) {
        if (attr.value.length === 1) {
            const value = attr.value[0];
            if (value.type === 'Text') {
                return value.data;
            } else if (value.type === 'MustacheTag') {
                return this.evaluateExpression(value.expression);
            }
        }
        // For complex values, return as string
        return attr.value.map(v => v.raw || v.expression.raw).join('');
    }

    evaluateExpression(expression) {
        if (expression.type === 'Literal') {
            return expression.value;
        }
        // For other expressions, return as string
        return expression.raw;
    }

    processText(node) {
        const content = this.preserveCodeBlocks(node.data);
        return content.trim() ? [{ type: 'markdown', content: content.trim() }] : [];
    }

    preserveCodeBlocks(text) {
        const codeBlocks = [];
        const preservedText = text.replace(this.codeBlockRegex, (match) => {
            codeBlocks.push(match);
            return `__CODE_BLOCK_${codeBlocks.length - 1}__`;
        });

        return preservedText.replace(/__CODE_BLOCK_(\d+)__/g, (_, index) => codeBlocks[parseInt(index)]);
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