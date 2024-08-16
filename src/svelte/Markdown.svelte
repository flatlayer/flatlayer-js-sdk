<script>
    import { marked } from 'marked';

    export let content = [];
    export let components = {};
    export let componentDefaults = {};

    function mergeProps(defaults, props) {
        return { ...defaults, ...props };
    }
</script>

{#each content as item}
    {#if item.type === 'markdown'}
        {@html marked(item.content)}
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