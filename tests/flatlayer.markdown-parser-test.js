import MarkdownParser from '../src/markdown-parser';

describe('MarkdownComponentParser', () => {
    let parser;

    beforeEach(() => {
        parser = new MarkdownParser.MarkdownComponentParser();
    });

    describe('parse', () => {
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

        it('should parse content with a component that has children', () => {
            const input = 'Start <Wrapper><p>Hello</p></Wrapper> End';
            const result = parser.parse(input);
            expect(result).toEqual([
                { type: 'markdown', content: 'Start' },
                { type: 'component', name: 'Wrapper', props: {}, children: [
                        { type: 'markdown', content: 'Hello' }
                    ]},
                { type: 'markdown', content: 'End' }
            ]);
        });

        it('should treat paragraph tags with only text as markdown', () => {
            const input = '<p>This is a paragraph.</p>';
            const result = parser.parse(input);
            expect(result).toEqual([
                { type: 'markdown', content: 'This is a paragraph.' }
            ]);
        });

        it('should keep paragraph tags as components if they have attributes or nested elements', () => {
            const input = '<p class="special">This is special.</p><p>This is <strong>important</strong>.</p>';
            const result = parser.parse(input);
            expect(result).toEqual([
                { type: 'component', name: 'p', props: { class: 'special' }, children: [
                        { type: 'markdown', content: 'This is special.' }
                    ]},
                { type: 'component', name: 'p', props: {}, children: [
                        { type: 'markdown', content: 'This is' },
                        { type: 'component', name: 'strong', props: {}, children: [
                                { type: 'markdown', content: 'important' }
                            ]},
                        { type: 'markdown', content: '.' }
                    ]}
            ]);
        });

        it('should handle nested components', () => {
            const input = '<Outer><Inner><p>Content</p></Inner></Outer>';
            const result = parser.parse(input);
            expect(result).toEqual([
                { type: 'component', name: 'Outer', props: {}, children: [
                        { type: 'component', name: 'Inner', props: {}, children: [
                                { type: 'markdown', content: 'Content' }
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

        describe('with fenced code blocks', () => {
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
                    { type: 'markdown', content: '# Title' },
                    { type: 'markdown', content: 'Some text with a' },
                    { type: 'component', name: 'Component', props: { prop: 'value' }, children: null },
                    { type: 'markdown', content: 'embedded.' },
                    {
                        type: 'markdown',
                        content: '```javascript\n// This JavaScript code block will be preserved\nconst x = <Component>This is not parsed</Component>;\n```',
                        codeBlocks: [{
                            content: '```javascript\n// This JavaScript code block will be preserved\nconst x = <Component>This is not parsed</Component>;\n```',
                            language: 'javascript'
                        }]
                    },
                    {
                        type: 'markdown',
                        content: '```python\n# This Python code block will also be preserved\ndef hello():\n    print("Hello, <AnotherComponent />")\n```',
                        codeBlocks: [{
                            content: '```python\n# This Python code block will also be preserved\ndef hello():\n    print("Hello, <AnotherComponent />")\n```',
                            language: 'python'
                        }]
                    },
                    { type: 'markdown', content: 'More text after the code blocks with another' },
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
                    { type: 'markdown', content: 'Some text before.' },
                    {
                        type: 'markdown',
                        content: '```\nThis is a code block without language specification\n<Component /> should not be parsed here\n```',
                        codeBlocks: [{
                            content: '```\nThis is a code block without language specification\n<Component /> should not be parsed here\n```',
                            language: null
                        }]
                    },
                    { type: 'markdown', content: 'Some text after.' }
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
                    { type: 'markdown', content: '# Mixed Content Test' },
                    { type: 'component', name: 'Component1', props: { prop: 'value' }, children: null },
                    {
                        type: 'markdown',
                        content: '```javascript\n// Code block\nconst x = 5;\n```',
                        codeBlocks: [{
                            content: '```javascript\n// Code block\nconst x = 5;\n```',
                            language: 'javascript'
                        }]
                    },
                    {
                        type: 'component',
                        name: 'Component2',
                        props: {},
                        children: [
                            { type: 'markdown', content: 'Nested content' },
                            {
                                type: 'markdown',
                                content: '```\nNested code block\n<Component3 /> (should not be parsed)\n```',
                                codeBlocks: [{
                                    content: '```\nNested code block\n<Component3 /> (should not be parsed)\n```',
                                    language: null
                                }]
                            }
                        ]
                    },
                    { type: 'markdown', content: 'Final text.' }
                ]);
            });
        });
    });

    describe('parseProps', () => {
        it('should parse string props', () => {
            const propsString = 'prop1="value1" prop2=\'value2\'';
            const result = parser.parseProps(propsString);
            expect(result).toEqual({ prop1: 'value1', prop2: 'value2' });
        });

        it('should parse number props', () => {
            const propsString = 'prop1={42} prop2={3.14}';
            const result = parser.parseProps(propsString);
            expect(result).toEqual({ prop1: 42, prop2: 3.14 });
        });

        it('should parse boolean props', () => {
            const propsString = 'prop1={true} prop2={false} prop3';
            const result = parser.parseProps(propsString);
            expect(result).toEqual({ prop1: true, prop2: false, prop3: true });
        });

        it('should parse object props', () => {
            const propsString = 'prop1={{"key": "value"}} prop2={{nested: {foo: "bar"}}}';
            const result = parser.parseProps(propsString);
            expect(result).toEqual({
                prop1: {"key": "value"},
                prop2: {nested: {foo: "bar"}}
            });
        });

        it('should parse array props', () => {
            const propsString = 'prop1={[1, 2, 3]} prop2={["a", "b", "c"]}';
            const result = parser.parseProps(propsString);
            expect(result).toEqual({
                prop1: [1, 2, 3],
                prop2: ["a", "b", "c"]
            });
        });

        it('should handle invalid JSON in props', () => {
            const propsString = 'prop1={invalid json} prop2="valid"';
            const result = parser.parseProps(propsString);
            expect(result).toEqual({
                prop1: '{invalid json}',
                prop2: "valid"
            });
        });

        it('should handle mixed prop types', () => {
            const propsString = 'str="hello" num={42} bool={true} obj={{"key": "value"}} arr={[1,2,3]}';
            const result = parser.parseProps(propsString);
            expect(result).toEqual({
                str: "hello",
                num: 42,
                bool: true,
                obj: {"key": "value"},
                arr: [1,2,3]
            });
        });

        it('should handle props with spaces in values', () => {
            const propsString = 'prop1="value with spaces" prop2=\'another spaced value\'';
            const result = parser.parseProps(propsString);
            expect(result).toEqual({
                prop1: "value with spaces",
                prop2: "another spaced value"
            });
        });

        it('should handle props with escaped quotes', () => {
            const propsString = 'prop1="value \\"quoted\\"" prop2=\'value \\\'quoted\\\'\'';
            const result = parser.parseProps(propsString);
            expect(result).toEqual({
                prop1: 'value "quoted"',
                prop2: "value 'quoted'"
            });
        });

        it('should handle props with line breaks', () => {
            const propsString = `
            prop1="multi
            line"
            prop2={{
                key: "value"
            }}
        `;
            const result = parser.parseProps(propsString);
            expect(result).toEqual({
                prop1: "multi\n            line",
                prop2: {key: "value"}
            });
        });
    });
});