# Server-Side Data Fetching with Flatlayer SDK

SvelteKit allows for server-side data loading, which can be particularly useful when working with the Flatlayer SDK. This approach enables you to fetch and process data before it reaches the client, improving performance and SEO.

## Setting up Flatlayer Instance

First, create a Flatlayer instance to interact with your CMS:

```javascript
// src/lib/flatlayer.js
import { Flatlayer } from 'flatlayer-sdk';
import { env } from '$env/dynamic/public';

export const flatlayer = new Flatlayer(env.PUBLIC_FLATLAYER_ENDPOINT);
```

## Fetching Data and Parsing Content on the Server

Here's an example of how to fetch a blog post and parse its content on the server using a SvelteKit `+page.server.js` file:

```javascript
// src/routes/blog/[slug]/+page.server.js
import { env } from '$env/dynamic/public';
import { error } from '@sveltejs/kit';
import { Flatlayer, MarkdownParser } from 'flatlayer-sdk';

const flatlayer = new Flatlayer(env.PUBLIC_FLATLAYER_ENDPOINT);

export async function load({ params }) {
    try {
        const post = await flatlayer.getEntry('posts', params.slug, [
            'id',
            'title',
            'content',
            'published_at',
            'images.featured',
            'images.content'
        ]);

        // Parse the markdown content into an array structure
        const parsedContent = MarkdownParser.parseContent(post.content);

        return {
            post: {
                ...post,
                parsedContent
            }
        };
    } catch (err) {
        console.error('Error fetching blog post:', err);
        throw error(404, 'Blog post not found');
    }
}
```

In this example:

1. We import the necessary dependencies, including the Flatlayer SDK and SvelteKit's `error` function.
2. We create a Flatlayer instance using the environment variable for the API endpoint.
3. In the `load` function, we use `flatlayer.getEntry()` to fetch a blog post by its slug.
4. We then use `MarkdownParser.parseContent()` to parse the Markdown content into a structured array.
5. The parsed content is added to the post object and returned.
6. If an error occurs, we throw a 404 error using SvelteKit's `error` function.

## Using the Fetched Data in a Svelte Component

After fetching and parsing the data on the server, you can use it in your Svelte component:

```svelte
<!-- src/routes/blog/[slug]/+page.svelte -->
<script>
    import Markdown from "flatlayer-sdk/svelte/Markdown";
    import ResponsiveImage from "flatlayer-sdk/svelte/ResponsiveImage";
    import { env } from '$env/dynamic/public';

    export let data;
    const { post } = data;

    const components = { ResponsiveImage };
    const componentDefaults = {
        ResponsiveImage: {
            baseUrl: env.PUBLIC_FLATLAYER_ENDPOINT,
            defaultTransforms: {quality: 80, format: 'webp'},
            sizes: ['100vw', 'md:75vw', 'lg:50vw'],
            class: 'rounded-lg shadow-sm',
            isFluid: true,
            lazyLoad: true,
            blurRadius: 20
        }
    };

    function handleImageError() {
        console.error('Image failed to load');
        // Additional error handling logic
    }

    function handleImageLoad() {
        console.log('Image loaded successfully');
        // Additional load handling logic
    }
</script>

<svelte:head>
    <title>{post.title} - My Blog</title>
</svelte:head>

<article>
    <h1>{post.title}</h1>
    {#if post.images?.featured?.[0]}
        <ResponsiveImage
            imageData={post.images.featured[0]}
            sizes={['100vw']}
            class="w-full h-auto rounded-xl shadow-sm mb-8"
            fallbackSrc="/path/to/fallback-image.jpg"
            on:error={handleImageError}
            on:load={handleImageLoad}
        />
    {/if}
    <Markdown content={post.parsedContent} {components} {componentDefaults} />
</article>
```

This setup allows you to:

1. Fetch data on the server, improving initial load times and SEO.
2. Parse complex content structures before sending to the client.
3. Handle errors gracefully, showing appropriate messages to users.
4. Use the fetched and parsed data seamlessly in your Svelte components.

By leveraging server-side data fetching and content parsing, you can create more efficient and SEO-friendly applications while still benefiting from the dynamic capabilities of Svelte and the Flatlayer SDK.