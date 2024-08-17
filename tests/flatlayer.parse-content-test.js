import MarkdownParser from '../src/markdown-parser';

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

    it('should handle fenced code blocks in parseContent', () => {
        const input = `
# Code Example

Here's some code:

\`\`\`javascript
function hello() {
    console.log("Hello, world!");
}
\`\`\`

And some more text.
`;
        const result = MarkdownParser.parseContent(input);
        expect(result).toEqual([
            {
                type: 'markdown',
                content: `# Code Example

Here's some code:

\`\`\`javascript
function hello() {
    console.log("Hello, world!");
}
\`\`\`

And some more text.`
            }
        ]);
    });

    it('should handle mixed content with components and fenced code blocks', () => {
        const input = `
# Mixed Content

<Component1 />

\`\`\`python
def greet():
    print("Hello!")
\`\`\`

<Component2>
  Some text
  \`\`\`
  Nested code
  \`\`\`
</Component2>
`;
        const result = MarkdownParser.parseContent(input);
        expect(result).toEqual([
            { type: 'markdown', content: '# Mixed Content' },
            { type: 'component', name: 'Component1', props: {}, children: null },
            { type: 'markdown', content: '```python\ndef greet():\n    print("Hello!")\n```' },
            { type: 'component', name: 'Component2', props: {}, children: [
                    { type: 'markdown', content: 'Some text\n  ```\n  Nested code\n  ```' }
                ]}
        ]);
    });

    it('should handle multiple components in a single line', () => {
        const input = 'Start <Component1 /> Middle <Component2 prop="value" /> End';
        const result = MarkdownParser.parseContent(input);
        expect(result).toEqual([
            { type: 'markdown', content: 'Start' },
            { type: 'component', name: 'Component1', props: {}, children: null },
            { type: 'markdown', content: 'Middle' },
            { type: 'component', name: 'Component2', props: { prop: 'value' }, children: null },
            { type: 'markdown', content: 'End' }
        ]);
    });

    it('should handle components with children that include both markdown and other components', () => {
        const input = `
<OuterComponent>
  # Heading inside component
  
  <InnerComponent />
  
  Some text *with formatting*
</OuterComponent>
`;
        const result = MarkdownParser.parseContent(input);
        expect(result).toEqual([
            { type: 'component', name: 'OuterComponent', props: {}, children: [
                    { type: 'markdown', content: '# Heading inside component' },
                    { type: 'component', name: 'InnerComponent', props: {}, children: null },
                    { type: 'markdown', content: 'Some text *with formatting*' }
                ]}
        ]);
    });

    it('should handle empty components', () => {
        const input = 'Before <EmptyComponent></EmptyComponent> After';
        const result = MarkdownParser.parseContent(input);
        expect(result).toEqual([
            { type: 'markdown', content: 'Before' },
            { type: 'component', name: 'EmptyComponent', props: {}, children: null },
            { type: 'markdown', content: 'After' }
        ]);
    });

    it('should handle components with only whitespace content', () => {
        const input = 'Before <WhitespaceComponent>   </WhitespaceComponent> After';
        const result = MarkdownParser.parseContent(input);
        expect(result).toEqual([
            { type: 'markdown', content: 'Before' },
            { type: 'component', name: 'WhitespaceComponent', props: {}, children: [] },
            { type: 'markdown', content: 'After' }
        ]);
    });

    it('should handle markdown with inline code', () => {
        const input = 'This is `inline code` and <Component /> more text';
        const result = MarkdownParser.parseContent(input);
        expect(result).toEqual([
            { type: 'markdown', content: 'This is `inline code` and' },
            { type: 'component', name: 'Component', props: {}, children: null },
            { type: 'markdown', content: 'more text' }
        ]);
    });

    it('should handle markdown with links', () => {
        const input = 'This is a [link](https://example.com) and <Component /> more text';
        const result = MarkdownParser.parseContent(input);
        expect(result).toEqual([
            { type: 'markdown', content: 'This is a [link](https://example.com) and' },
            { type: 'component', name: 'Component', props: {}, children: null },
            { type: 'markdown', content: 'more text' }
        ]);
    });
});