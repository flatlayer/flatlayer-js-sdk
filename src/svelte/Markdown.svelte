<script>
    import { marked } from 'marked';

    export let content = [];
    export let components = {};
</script>

{#each content as item}
    {#if item.type === 'markdown'}
        {@html marked(item.content)}
    {:else if item.type === 'component'}
        {#if components[item.name]}
            <svelte:component this={components[item.name]} {...item.props}>
                {#if item.children}
                    <svelte:self content={item.children} {components} />
                {/if}
            </svelte:component>
        {:else}
            <svelte:element this={item.name} {...item.props}>
                {#if item.children}
                    <svelte:self content={item.children} {components} />
                {/if}
            </svelte:element>
        {/if}
    {/if}
{/each}