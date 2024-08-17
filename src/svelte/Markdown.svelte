<script>
    import { marked } from 'marked';
    import DOMPurify from 'dompurify';
    import { onMount } from 'svelte';
    import slugify from 'slugify';

    export let content = [];
    export let components = {};
    export let componentDefaults = {};

    let memoizedContent = new Map();

    function mergeProps(defaults, props) {
        return { ...defaults, ...props };
    }

    function sanitizeAndParse(markdown) {
        try {
            const parsed = marked(markdown);
            return DOMPurify.sanitize(parsed);
        } catch (error) {
            console.error('Error parsing markdown:', error);
            return 'Error parsing content';
        }
    }

    // Custom renderer
    const renderer = {
        heading(text, level) {
            const id = slugify(text, { lower: true, strict: true });
            return `<h${level} id="${id}">${text}</h${level}>`;
        },
        link(href, title, text) {
            const isExternal = href.startsWith('http') || href.startsWith('//');
            const attributes = isExternal ? ' rel="noopener noreferrer"' : '';
            return `<a href="${href}"${title ? ` title="${title}"` : ''}${attributes}>${text}</a>`;
        }
    };

    marked.use({ renderer });

    onMount(() => {
        return () => {
            memoizedContent.clear();
        };
    });

    function getMarkdownContent(item) {
        if (!memoizedContent.has(item.content)) {
            memoizedContent.set(item.content, sanitizeAndParse(item.content));
        }
        return memoizedContent.get(item.content);
    }
</script>

{#each content as item}
    {#if item.type === 'markdown'}
        {@html getMarkdownContent(item)}
    {:else if item.type === 'component'}
        {#if components[item.name]}
            <svelte:component
                    this={components[item.name]}
                    {...mergeProps(componentDefaults[item.name] || {}, item.props)}
            >
                {#if item.children}
                    <svelte:self
                            content={item.children}
                            {components}
                            {componentDefaults}
                    />
                {/if}
            </svelte:component>
        {:else}
            <svelte:element
                    this={item.name}
                    {...mergeProps(componentDefaults[item.name] || {}, item.props)}
            >
                {#if item.children}
                    <svelte:self
                            content={item.children}
                            {components}
                            {componentDefaults}
                    />
                {/if}
            </svelte:element>
        {/if}
    {/if}
{/each}