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
                { type: 'markdown', content: 'Before ' },
                { type: 'component', name: 'Component', props: { foo: 'bar' }, children: null },
                { type: 'markdown', content: ' After' }
            ]);
        });

        it('should parse content with a component that has children', () => {
            const input = 'Start <Wrapper><p>Hello</p></Wrapper> End';
            const result = parser.parse(input);
            expect(result).toEqual([
                { type: 'markdown', content: 'Start ' },
                { type: 'component', name: 'Wrapper', props: {}, children: [
                        { type: 'markdown', content: 'Hello' }
                    ]},
                { type: 'markdown', content: ' End' }
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
                        { type: 'markdown', content: 'This is ' },
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
                { type: 'markdown', content: '' },
                { type: 'component', name: 'Component', props: {
                        prop1: 'value1',
                        prop2: 42,
                        prop3: {
                            key: "value",
                            array: [1, 2, 3]
                        }
                    }, children: null },
                { type: 'markdown', content: '' }
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
                { type: 'markdown', content: '# Title\n\n' },
                { type: 'component', name: 'Component1', props: {}, children: null },
                { type: 'markdown', content: '\n\nSome text here.\n\n' },
                { type: 'component', name: 'Component2', props: {}, children: [
                        { type: 'component', name: 'NestedComponent', props: {}, children: null },
                    ]},
                { type: 'markdown', content: '\n\nMore text.' }
            ]);
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