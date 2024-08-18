import { parse } from 'svelte/compiler';

class MarkdownComponentParser {
    constructor() {
        this.codeBlockRegex = /^```[\s\S]*?^```/gm;
        this.codeBlocks = [];
    }

    parse(input) {
        // Preserve code blocks before parsing
        const preprocessedInput = this.preserveCodeBlocks(input);
        const parsed = parse(preprocessedInput);
        return this.processNode(parsed.html);
    }

    preserveCodeBlocks(text) {
        this.codeBlocks = [];
        return text.replace(this.codeBlockRegex, (match) => {
            this.codeBlocks.push(match);
            return `__CODE_BLOCK_${this.codeBlocks.length - 1}__`;
        });
    }

    restoreCodeBlocks(text) {
        return text.replace(/__CODE_BLOCK_(\d+)__/g, (_, index) => this.codeBlocks[parseInt(index)]);
    }

    processNode(node) {
        if (node.type === 'Fragment') {
            return this.processChildren(node.children);
        } else if (node.type === 'InlineComponent' || node.type === 'Element') {
            return this.processComponent(node);
        } else if (node.type === 'Text') {
            return this.processText(node);
        } else if (node.type === 'Comment') {
            return this.processComment(node);
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
        else if (!Array.isArray(attr.value)) {
            return attr.value;
        }

        // For complex values, return as string
        return attr.value.map(v => v.raw || v.expression.raw).join('');
    }

    evaluateExpression(expression) {
        switch (expression.type) {
            case 'Literal':
                return expression.value;
            case 'Identifier':
                return expression.name;
            case 'ObjectExpression':
                return this.evaluateObjectExpression(expression);
            case 'ArrayExpression':
                return expression.elements.map(elem => this.evaluateExpression(elem));
            case 'BinaryExpression':
                return this.evaluateBinaryExpression(expression);
            default:
                // For other expressions, return as string
                return expression.raw || JSON.stringify(expression);
        }
    }

    evaluateObjectExpression(objExpr) {
        const result = {};
        for (const prop of objExpr.properties) {
            const key = this.evaluateExpression(prop.key);
            const value = this.evaluateExpression(prop.value);
            result[key] = value;
        }
        return result;
    }

    evaluateBinaryExpression(expression) {
        const left = this.evaluateExpression(expression.left);
        const right = this.evaluateExpression(expression.right);
        switch (expression.operator) {
            case '+': return left + right;
            case '-': return left - right;
            case '*': return left * right;
            case '/': return left / right;
            // Add more operators as needed
            default:
                // If we don't recognize the operator, return as string
                return `${left} ${expression.operator} ${right}`;
        }
    }

    processText(node) {
        const content = this.restoreCodeBlocks(node.data).trim();
        return content ? [{ type: 'markdown', content }] : [];
    }

    processComment(node) {
        return [{ type: 'markdown', content: `<!--${node.data}-->` }];
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