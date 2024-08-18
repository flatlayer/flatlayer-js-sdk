import { parse } from 'svelte/compiler';

/**
 * A class for parsing markdown content with embedded Svelte components.
 */
class MarkdownComponentParser {
    /**
     * Creates an instance of MarkdownComponentParser.
     */
    constructor() {
        this.codeBlockRegex = /^```[\s\S]*?^```/gm;
        this.codeBlocks = [];
    }

    /**
     * Parses the input markdown and component content.
     * @param {string} input - The input string containing markdown and component tags.
     * @returns {Array} An array of parsed content objects.
     */
    parse(input) {
        const preprocessedInput = this.preserveCodeBlocks(input);
        const parsed = parse(preprocessedInput);
        return this.processNode(parsed.html);
    }

    /**
     * Preserves code blocks by replacing them with placeholders.
     * @param {string} text - The input text.
     * @returns {string} The text with code blocks replaced by placeholders.
     */
    preserveCodeBlocks(text) {
        this.codeBlocks = [];
        return text.replace(this.codeBlockRegex, (match) => {
            this.codeBlocks.push(match);
            return `__CODE_BLOCK_${this.codeBlocks.length - 1}__`;
        });
    }

    /**
     * Restores code blocks by replacing placeholders with original content.
     * @param {string} text - The text with code block placeholders.
     * @returns {string} The text with original code blocks restored.
     */
    restoreCodeBlocks(text) {
        return text.replace(/__CODE_BLOCK_(\d+)__/g, (_, index) => this.codeBlocks[parseInt(index)]);
    }

    /**
     * Processes a parsed node.
     * @param {Object} node - The parsed node object.
     * @returns {Array} An array of processed content objects.
     */
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

    /**
     * Processes child nodes.
     * @param {Array} children - An array of child nodes.
     * @returns {Array} An array of processed content objects from all children.
     */
    processChildren(children) {
        return children.flatMap(child => this.processNode(child));
    }

    /**
     * Processes a component node.
     * @param {Object} node - The component node object.
     * @returns {Array} An array containing the processed component object.
     */
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

    /**
     * Processes component attributes.
     * @param {Array} attributes - An array of attribute objects.
     * @returns {Object} An object containing processed attributes.
     */
    processAttributes(attributes) {
        const props = {};
        for (const attr of attributes) {
            if (attr.type === 'Attribute') {
                props[attr.name] = this.getAttributeValue(attr);
            }
        }
        return props;
    }

    /**
     * Gets the value of an attribute.
     * @param {Object} attr - The attribute object.
     * @returns {*} The processed attribute value.
     */
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

    /**
     * Evaluates a JavaScript expression.
     * @param {Object} expression - The expression object to evaluate.
     * @returns {*} The result of the evaluated expression.
     */
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

    /**
     * Evaluates an object expression.
     * @param {Object} objExpr - The object expression to evaluate.
     * @returns {Object} The evaluated object.
     */
    evaluateObjectExpression(objExpr) {
        const result = {};
        for (const prop of objExpr.properties) {
            const key = this.evaluateExpression(prop.key);
            const value = this.evaluateExpression(prop.value);
            result[key] = value;
        }
        return result;
    }

    /**
     * Evaluates a binary expression.
     * @param {Object} expression - The binary expression to evaluate.
     * @returns {*} The result of the binary operation.
     */
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

    /**
     * Processes a text node.
     * @param {Object} node - The text node object.
     * @returns {Array} An array containing the processed text content object.
     */
    processText(node) {
        const content = this.restoreCodeBlocks(node.data).trim();
        return content ? [{ type: 'markdown', content }] : [];
    }

    /**
     * Processes a comment node.
     * @param {Object} node - The comment node object.
     * @returns {Array} An array containing the processed comment content object.
     */
    processComment(node) {
        return [{ type: 'markdown', content: `<!--${node.data}-->` }];
    }
}

/**
 * Parses the input content using MarkdownComponentParser.
 * @param {string} input - The input string containing markdown and component tags.
 * @returns {Array} An array of parsed content objects.
 */
function parseContent(input) {
    const parser = new MarkdownComponentParser();
    return parser.parse(input);
}

export default {
    MarkdownComponentParser,
    parseContent
};