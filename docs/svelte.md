# Svelte Integration with Flatlayer SDK

## Introduction

The Flatlayer SDK provides seamless integration with Svelte applications, offering components and utilities to enhance your development experience. This guide covers how to use Flatlayer SDK components in your Svelte projects, with a focus on the `ResponsiveImage` and `Markdown` components.

## Installation

First, ensure you have the Flatlayer SDK installed in your Svelte project:

```bash
npm install flatlayer-sdk
```

or

```bash
yarn add flatlayer-sdk
```

## ResponsiveImage Component

The `ResponsiveImage` component is a powerful tool for rendering responsive, optimized images from your Flatlayer CMS.

### Basic Usage

Import and use the `ResponsiveImage` component in your Svelte file:

```svelte
<script>
import { ResponsiveImage } from 'flatlayer-sdk/svelte';
import { env } from '$env/dynamic/public';

// Assuming you have fetched the image data
let imageData = {/* your image data */};
</script>

<ResponsiveImage
  baseUrl={env.PUBLIC_FLATLAYER_ENDPOINT}
  {imageData}
  sizes={['100vw', 'md:50vw', 'lg:33vw']}
/>
```

### Props

- `baseUrl` (required): Your Flatlayer CMS API base URL.
- `imageData` (required): The image data object from a Flatlayer entry.
- `defaultTransforms` (optional): Default image transformation parameters.
- `breakpoints` (optional): Custom breakpoints for responsive sizes.
- `imageEndpoint` (optional): Custom image endpoint URL.
- `sizes` (optional): Array of size descriptors for responsive images. Default: `['100vw']`.
- `attributes` (optional): Additional HTML attributes for the img tag.
- `isFluid` (optional): Use fluid sizing. Default: `true`.
- `displaySize` (optional): Intended display size as `[width, height]`.
- `lazyLoad` (optional): Enable lazy loading of images. Default: `true`.
- `blurRadius` (optional): Blur radius for the image placeholder. Default: `40`.
- `fallbackSrc` (optional): URL of a fallback image to display if the main image fails to load.

### Events

- `on:load`: Dispatched when the image successfully loads.
- `on:error`: Dispatched if there's an error loading the image.

### Advanced Example

Here's an example demonstrating how to use the `ResponsiveImage` component with data fetched from Flatlayer, including error handling and fallback image:

```svelte
<script>
import { onMount } from 'svelte';
import { ResponsiveImage } from 'flatlayer-sdk/svelte';
import { env } from '$env/dynamic/public';
import { flatlayer } from './your-flatlayer-instance';

let post;
let imageLoadError = false;

onMount(async () => {
  post = await flatlayer.getEntry('post', 'my-awesome-post', ['title', 'featured_image']);
});

const customBreakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280
};

function handleImageError() {
  imageLoadError = true;
  console.error('Image failed to load');
}

function handleImageLoad() {
  console.log('Image loaded successfully');
}
</script>

{#if post}
  <h1>{post.title}</h1>
  <ResponsiveImage
    baseUrl={env.PUBLIC_FLATLAYER_ENDPOINT}
    imageData={post.featured_image}
    sizes={['100vw', 'md:50vw', 'lg:33vw']}
    attributes={{ class: 'rounded-lg shadow-md' }}
    defaultTransforms={{ quality: 80, format: 'webp' }}
    breakpoints={customBreakpoints}
    isFluid={true}
    lazyLoad={true}
    blurRadius={20}
    fallbackSrc="/path/to/fallback-image.jpg"
    on:error={handleImageError}
    on:load={handleImageLoad}
  />
  {#if imageLoadError}
    <p>Failed to load image. Displaying fallback.</p>
  {/if}
{/if}
```

## Markdown Component

The `Markdown` component allows you to render Markdown content with embedded components.

### Basic Usage

Import and use the `Markdown` component in your Svelte file:

```svelte
<script>
import { Markdown } from 'flatlayer-sdk/svelte';
import { ResponsiveImage } from 'flatlayer-sdk/svelte';
import { env } from '$env/dynamic/public';

// Assuming you have fetched the parsed content
let parsedContent = [/* your parsed content */];

const components = {
  ResponsiveImage
};

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
</script>

<Markdown content={parsedContent} {components} {componentDefaults} />
```

### Props

- `content` (required): An array of parsed content objects.
- `components` (optional): An object mapping component names to their implementations.
- `componentDefaults` (optional): Default props for components.

## Integration with Flatlayer SDK

### Setting up Flatlayer Instance

Create a Flatlayer instance to interact with your CMS:

```javascript
// src/lib/flatlayer.js
import { Flatlayer } from 'flatlayer-sdk';
import { env } from '$env/dynamic/public';

export const flatlayer = new Flatlayer(env.PUBLIC_FLATLAYER_ENDPOINT);
```

## Server-Side Data Fetching and Content Parsing

SvelteKit allows for server-side data loading, which can be particularly useful when working with the Flatlayer SDK. This approach enables you to fetch and process data before it reaches the client, improving performance and SEO.

### Setting up Flatlayer Instance

First, create a Flatlayer instance to interact with your CMS:

```javascript
// src/lib/flatlayer.js
import { Flatlayer } from 'flatlayer-sdk';
import { env } from '$env/dynamic/public';

export const flatlayer = new Flatlayer(env.PUBLIC_FLATLAYER_ENDPOINT);
```

### Fetching Data and Parsing Content on the Server

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

### Using the Fetched Data in a Svelte Component

After fetching and parsing the data on the server, you can use it in your Svelte component:

```svelte
<!-- src/routes/blog/[slug]/+page.svelte -->
<script>
    import { Markdown, ResponsiveImage } from 'flatlayer-sdk/svelte';
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

## Performance Considerations

1. Use the `lazyLoad` prop on `ResponsiveImage` for images below the fold.
2. Leverage the `sizes` attribute to ensure browsers download appropriately sized images.
3. Use the WebP format when possible by setting it in `defaultTransforms`.
4. For frequently accessed content, consider implementing caching strategies.

## Error Handling

Implement error handling when working with Flatlayer SDK components:

```svelte
<script>
import { onMount } from 'svelte';
import { ResponsiveImage } from 'flatlayer-sdk/svelte';
import { flatlayer } from '$lib/flatlayer';

let imageData;
let error = null;

onMount(async () => {
  try {
    const post = await flatlayer.getEntry('post', 'featured-post', ['featured_image']);
    imageData = post.featured_image;
  } catch (err) {
    error = 'Failed to load image data';
    console.error(err);
  }
});

function handleImageError() {
  console.error('Image failed to load');
  // Additional error handling logic
}
</script>

{#if imageData}
  <ResponsiveImage 
    {imageData} 
    sizes={['100vw']} 
    fallbackSrc="/path/to/fallback-image.jpg"
    on:error={handleImageError}
  />
{:else if error}
  <p class="error">{error}</p>
{:else}
  <p>Loading...</p>
{/if}
```

## Best Practices

1. Always provide meaningful `alt` text for accessibility.
2. Use the `sizes` attribute accurately to reflect your layout.
3. Leverage `defaultTransforms` to optimize image quality and format globally.
4. Consider using `displaySize` for critical images to prevent layout shifts.
5. Adjust the `blurRadius` to balance between a smooth loading experience and initial image clarity.
6. Utilize the `fallbackSrc` prop to provide a backup image in case the primary image fails to load.
7. Implement error handling using the `on:error` event to gracefully manage image loading failures.
8. Use the `on:load` event to perform actions once the image has successfully loaded, if needed.

## Conclusion

By utilizing the Flatlayer SDK's Svelte components, you can efficiently manage responsive images and render dynamic content in your Svelte applications. These components seamlessly integrate with your Flatlayer CMS, providing a powerful toolkit for building performant and flexible web applications.

For more information on related topics, check out these guides:
- [Getting Started Guide](./getting-started.md)
- [Entry Retrieval Guide](./entry-retrieval.md)
- [Image Handling Guide](./image-handling.md)
- [Calculating Sizes Guide](./calculating-sizes.md)
- [Advanced Usage Guide](./advanced.md)