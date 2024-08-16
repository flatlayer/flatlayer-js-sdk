class MarkdownComponentParser {
    constructor() {
        this.componentRegex = /<(\w+)([^>]*)(?:\/>|>([\s\S]*?)<\/\1>)/g;
        this.propRegex = /(\w+)(?:=(?:(?:"((?:\\.|[^"])*)")|(?:'((?:\\.|[^'])*)')|({(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*})))?/g;
    }

    parse(input) {
        const result = [];
        let lastIndex = 0;
        for (const match of input.matchAll(this.componentRegex)) {
            if (match.index > lastIndex) {
                result.push({ type: 'markdown', content: input.slice(lastIndex, match.index) });
            }
            const [fullMatch, name, propsString, children] = match;
            const props = this.parseProps(propsString);
            let parsedChildren = children ? this.parse(children) : null;

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
            result.push({ type: 'markdown', content: input.slice(lastIndex) });
        }
        return result;
    }

    parseProps(propsString) {
        const props = {};
        for (const match of propsString.matchAll(this.propRegex)) {
            const [, key, doubleQuoted, singleQuoted, objectLiteral] = match;
            let value;
            if (objectLiteral) {
                try {
                    value = JSON.parse(objectLiteral);
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
}

function parseContent(input) {
    const parser = new MarkdownComponentParser();
    return parser.parse(input);
}

export default {
    MarkdownComponentParser,
    parseContent
};