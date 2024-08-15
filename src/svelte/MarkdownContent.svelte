<script>
    import { marked } from 'marked';
    import ResponsiveImage from "./ResponsiveImage.svelte";

    export let content = '';
    export let componentDefaults = {};

    function parseContent(content) {
        const regex = /^<(\w+)\s+({.*?})\s*\/>$/gm;
        const parts = [];
        let lastIndex = 0;
        let match;

        while ((match = regex.exec(content)) !== null) {
            // Add any preceding text as a markdown part
            if (match.index > lastIndex) {
                parts.push({
                    type: 'markdown',
                    content: content.slice(lastIndex, match.index)
                });
            }

            // Add the component part
            const componentName = match[1];
            const componentProps = JSON.parse(match[2]);

            // Merge default props with component-specific props
            const mergedProps = {
                ...componentDefaults[componentName],
                ...componentProps
            };

            parts.push({
                type: 'component',
                name: componentName,
                props: mergedProps
            });

            lastIndex = regex.lastIndex;
        }

        // Add any remaining text as a markdown part
        if (lastIndex < content.length) {
            parts.push({
                type: 'markdown',
                content: content.slice(lastIndex)
            });
        }

        return parts;
    }

    $: contentParts = parseContent(content);
</script>

{#each contentParts as part}
    {#if part.type === 'markdown'}
        {@html marked(part.content)}
    {:else if part.type === 'component'}
        {#if part.name === 'ResponsiveImage'}
            <ResponsiveImage {...part.props} />
        {:else}
            <!-- Handle unknown components -->
            <p>Unknown component: {part.name}</p>
        {/if}
    {/if}
{/each}