<script>
    import { marked } from 'marked';
    import DOMPurify from 'dompurify';
    import { onMount } from 'svelte';
    import slugify from 'slugify';
    import ResponsiveImage from './ResponsiveImage.svelte';

    export let content = [];
    export let components = {};
    export let componentDefaults = {};
    export let isComponentChild = false;

    let memoizedContent = new Map();

    // Always include ResponsiveImage in the components
    components = { ResponsiveImage, ...components };

    function mergeProps(defaults, props) {
        return { ...defaults, ...props };
    }

    function sanitizeAndParse(markdown, isComponentChild) {
        try {
            const parsed = marked(markdown);
            let sanitized = typeof window !== 'undefined' && DOMPurify ? DOMPurify.sanitize(parsed) : parsed;
            sanitized = sanitized.trim();

            // Check if the parsed content is a single line (excluding whitespace)
            const singleLine = sanitized.trim().split('\n').length === 1;

            // If it's a single line, a component child, and wrapped in <p> tags, remove the tags
            if (isComponentChild && singleLine && sanitized.startsWith('<p>') && sanitized.endsWith('</p>')) {
                sanitized = sanitized.slice(3, -4);
            }

            return sanitized;
        } catch (error) {
            console.error('Error parsing markdown:', error);
            return 'Error parsing content';
        }
    }

    // Custom renderer
    const renderer = {
        heading(token) {
            const { text, depth } = token;
            const id = slugify(text, { lower: true, strict: true });
            return `<h${depth} id="${id}">${text}</h${depth}>`;
        },
        link(token) {
            const { href, title, text } = token;
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

    function getMarkdownContent(item, isComponentChild) {
        const key = `${item.content}-${isComponentChild}`;
        if (!memoizedContent.has(key)) {
            memoizedContent.set(key, sanitizeAndParse(item.content, isComponentChild));
        }
        return memoizedContent.get(key);
    }
</script>

{#each content as item}
    {#if item.type === 'markdown'}
        {@html getMarkdownContent(item, isComponentChild)}
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
                            isComponentChild={true}
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
                            isComponentChild={true}
                    />
                {/if}
            </svelte:element>
        {/if}
    {/if}
{/each}