import MarkdownParser from '../src/markdown-parser';

describe('MarkdownParser', () => {
    let parser;

    beforeEach(() => {
        parser = new MarkdownParser.MarkdownComponentParser();
    });

    describe('Basic Parsing', () => {
        it('should parse plain markdown content', () => {
            const input = 'This is **bold** and *italic* text.';
            const result = parser.parse(input);
            expect(result).toEqual([
                { type: 'markdown', content: 'This is **bold** and *italic* text.' }
            ]);
        });

        it('should parse content with a single component', () => {
            const input = 'Before <Component foo="bar" /> After';
            const result = parser.parse(input);
            expect(result).toEqual([
                { type: 'markdown', content: 'Before' },
                { type: 'component', name: 'Component', props: { foo: 'bar' }, children: null },
                { type: 'markdown', content: 'After' }
            ]);
        });

        it('should parse content with multiple components and markdown', () => {
            const input = `# Title

<Component1 />

Some text here.

<Component2>
  <NestedComponent />
</Component2>

More text.`;
            const result = parser.parse(input);
            expect(result).toEqual([
                { type: 'markdown', content: '# Title' },
                { type: 'component', name: 'Component1', props: {}, children: null },
                { type: 'markdown', content: 'Some text here.' },
                { type: 'component', name: 'Component2', props: {}, children: [
                        { type: 'component', name: 'NestedComponent', props: {}, children: null },
                    ]},
                { type: 'markdown', content: 'More text.' }
            ]);
        });
    });

    describe('Component Parsing', () => {
        it('should parse components with children', () => {
            const input = 'Start <Wrapper><p>Hello</p></Wrapper> End';
            const result = parser.parse(input);
            expect(result).toEqual([
                { type: 'markdown', content: 'Start' },
                { type: 'component', name: 'Wrapper', props: {}, children: [
                        { type: 'component', name: 'p', props: {}, children: [
                                { type: 'markdown', content: 'Hello' }
                            ]}
                    ]},
                { type: 'markdown', content: 'End' }
            ]);
        });

        it('should handle nested components including HTML tags', () => {
            const input = '<Outer><Inner><p>Content</p></Inner></Outer>';
            const result = parser.parse(input);
            expect(result).toEqual([
                { type: 'component', name: 'Outer', props: {}, children: [
                        { type: 'component', name: 'Inner', props: {}, children: [
                                { type: 'component', name: 'p', props: {}, children: [
                                        { type: 'markdown', content: 'Content' }
                                    ]}
                            ]}
                    ]}
            ]);
        });

        it('should parse components with complex JSON arguments', () => {
            const input = '<Component data={{"key": "value", "array": [1, 2, 3]}} />';
            const result = parser.parse(input);
            expect(result).toEqual([
                { type: 'component', name: 'Component', props: { data: {"key": "value", "array": [1, 2, 3]} }, children: null }
            ]);
        });

        it('should handle components with multiline attributes', () => {
            const input = `
<Component
  prop1="value1"
  prop2={42}
  prop3={{ 
    key: "value",
    array: [1, 2, 3]
  }}
/>`;
            const result = parser.parse(input);
            expect(result).toEqual([
                { type: 'component', name: 'Component', props: {
                        prop1: 'value1',
                        prop2: 42,
                        prop3: {
                            key: "value",
                            array: [1, 2, 3]
                        }
                    }, children: null }
            ]);
        });

        it('should correctly parse various prop types in components', () => {
            const input = `
<Component
  stringProp="hello"
  numberProp={42}
  booleanProp={true}
  objectProp={{ key: "value" }}
  arrayProp={[1, 2, 3]}
/>`;
            const result = parser.parse(input);
            expect(result).toEqual([
                { type: 'component', name: 'Component', props: {
                        stringProp: 'hello',
                        numberProp: 42,
                        booleanProp: true,
                        objectProp: { key: 'value' },
                        arrayProp: [1, 2, 3]
                    }, children: null }
            ]);
        });
    });

    describe('HTML Tag Handling', () => {
        it('should treat paragraph tags as components', () => {
            const input = '<p>This is a paragraph.</p>';
            const result = parser.parse(input);
            expect(result).toEqual([
                {
                    type: 'component',
                    name: 'p',
                    props: {},
                    children: [
                        { type: 'markdown', content: 'This is a paragraph.' }
                    ]
                }
            ]);
        });

        it('should keep all paragraph tags as components, including those with attributes or nested elements', () => {
            const input = '<p class="special">This is special.</p><p>This is <strong>important</strong>.</p>';
            const result = parser.parse(input);
            expect(result).toEqual([
                {
                    type: 'component',
                    name: 'p',
                    props: { class: 'special' },
                    children: [
                        { type: 'markdown', content: 'This is special.' }
                    ]
                },
                {
                    type: 'component',
                    name: 'p',
                    props: {},
                    children: [
                        { type: 'markdown', content: 'This is' },
                        {
                            type: 'component',
                            name: 'strong',
                            props: {},
                            children: [
                                { type: 'markdown', content: 'important' }
                            ]
                        },
                        { type: 'markdown', content: '.' }
                    ]
                }
            ]);
        });
    });

    describe('Code Block Handling', () => {
        it('should preserve fenced code blocks and not parse components within them', () => {
            const input = `
# Title

Some text with a <Component prop="value" /> embedded.

\`\`\`javascript
// This JavaScript code block will be preserved
const x = <Component>This is not parsed</Component>;
\`\`\`

\`\`\`python
# This Python code block will also be preserved
def hello():
    print("Hello, <AnotherComponent />")
\`\`\`

More text after the code blocks with another <Component />.
`;
            const result = parser.parse(input);
            expect(result).toEqual([
                { type: 'markdown', content: '# Title\n\nSome text with a' },
                { type: 'component', name: 'Component', props: { prop: 'value' }, children: null },
                { type: 'markdown', content: 'embedded.\n\n```javascript\n// This JavaScript code block will be preserved\nconst x = <Component>This is not parsed</Component>;\n```\n\n```python\n# This Python code block will also be preserved\ndef hello():\n    print("Hello, <AnotherComponent />")\n```\n\nMore text after the code blocks with another' },
                { type: 'component', name: 'Component', props: {}, children: null },
                { type: 'markdown', content: '.' }
            ]);
        });

        it('should handle fenced code blocks without language specification', () => {
            const input = `
Some text before.

\`\`\`
This is a code block without language specification
<Component /> should not be parsed here
\`\`\`

Some text after.
`;
            const result = parser.parse(input);
            expect(result).toEqual([
                {
                    type: 'markdown',
                    content: 'Some text before.\n\n```\nThis is a code block without language specification\n<Component /> should not be parsed here\n```\n\nSome text after.'
                }
            ]);
        });

        it('should correctly handle mixed content with fenced code blocks and components', () => {
            const input = `
# Mixed Content Test

<Component1 prop="value" />

\`\`\`javascript
// Code block
const x = 5;
\`\`\`

<Component2>
Nested content
\`\`\`
Nested code block
<Component3 /> (should not be parsed)
\`\`\`
</Component2>

Final text.
`;
            const result = parser.parse(input);
            expect(result).toEqual([
                {
                    type: 'markdown',
                    content: '# Mixed Content Test'
                },
                {
                    type: 'component',
                    name: 'Component1',
                    props: {
                        prop: 'value'
                    },
                    children: null
                },
                {
                    type: 'markdown',
                    content: '```javascript\n// Code block\nconst x = 5;\n```'
                },
                {
                    type: 'component',
                    name: 'Component2',
                    props: {},
                    children: [
                        {
                            type: 'markdown',
                            content: 'Nested content\n```\nNested code block\n<Component3 /> (should not be parsed)\n```'
                        }
                    ]
                },
                {
                    type: 'markdown',
                    content: 'Final text.'
                }
            ]);
        });
    });

    describe('Edge Cases', () => {
        it('should handle multiple components in a single line', () => {
            const input = 'Start <Component1 /> Middle <Component2 prop="value" /> End';
            const result = parser.parse(input);
            expect(result).toEqual([
                { type: 'markdown', content: 'Start' },
                { type: 'component', name: 'Component1', props: {}, children: null },
                { type: 'markdown', content: 'Middle' },
                { type: 'component', name: 'Component2', props: { prop: 'value' }, children: null },
                { type: 'markdown', content: 'End' }
            ]);
        });

        it('should handle empty components', () => {
            const input = 'Before <EmptyComponent></EmptyComponent> After';
            const result = parser.parse(input);
            expect(result).toEqual([
                { type: 'markdown', content: 'Before' },
                { type: 'component', name: 'EmptyComponent', props: {}, children: null },
                { type: 'markdown', content: 'After' }
            ]);
        });

        it('should handle components with only whitespace content', () => {
            const input = 'Before <WhitespaceComponent>   </WhitespaceComponent> After';
            const result = parser.parse(input);
            expect(result).toEqual([
                { type: 'markdown', content: 'Before' },
                { type: 'component', name: 'WhitespaceComponent', props: {}, children: null },
                { type: 'markdown', content: 'After' }
            ]);
        });

        it('should handle markdown with inline code', () => {
            const input = 'This is `inline code` and <Component /> more text';
            const result = parser.parse(input);
            expect(result).toEqual([
                { type: 'markdown', content: 'This is `inline code` and' },
                { type: 'component', name: 'Component', props: {}, children: null },
                { type: 'markdown', content: 'more text' }
            ]);
        });

        it('should handle markdown with links', () => {
            const input = 'This is a [link](https://example.com) and <Component /> more text';
            const result = parser.parse(input);
            expect(result).toEqual([
                { type: 'markdown', content: 'This is a [link](https://example.com) and' },
                { type: 'component', name: 'Component', props: {}, children: null },
                { type: 'markdown', content: 'more text' }
            ]);
        });
    });

    describe('parseContent function', () => {
        it('should use MarkdownComponentParser to parse content', () => {
            const input = 'Text <Component prop="value" /> More text';
            const result = MarkdownParser.parseContent(input);
            expect(result).toEqual([
                { type: 'markdown', content: 'Text' },
                { type: 'component', name: 'Component', props: { prop: 'value' }, children: null },
                { type: 'markdown', content: 'More text' }
            ]);
        });

        it('should handle complex nested structures', () => {
            const input = `
# Main Title

<OuterComponent prop1="value1">
  Some text inside OuterComponent

  <InnerComponent prop2={42}>
    ## Inner Title
    
    <DeepNestedComponent />

    More inner text
  </InnerComponent>

  Final text in OuterComponent
</OuterComponent>

Conclusion paragraph.
`;
            const result = MarkdownParser.parseContent(input);
            expect(result).toEqual([
                { type: 'markdown', content: '# Main Title' },
                { type: 'component', name: 'OuterComponent', props: { prop1: 'value1' }, children: [
                        { type: 'markdown', content: 'Some text inside OuterComponent' },
                        { type: 'component', name: 'InnerComponent', props: { prop2: 42 }, children: [
                                { type: 'markdown', content: '## Inner Title' },
                                { type: 'component', name: 'DeepNestedComponent', props: {}, children: null },
                                { type: 'markdown', content: 'More inner text' }
                            ]},
                        { type: 'markdown', content: 'Final text in OuterComponent' }
                    ]},
                { type: 'markdown', content: 'Conclusion paragraph.' }
            ]);
        });
    });
});