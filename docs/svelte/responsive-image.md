# ResponsiveImage Component

The `ResponsiveImage` component is a powerful tool for rendering responsive, optimized images from your Flatlayer CMS.

## Basic Usage

Import and use the `ResponsiveImage` component in your Svelte file:

```svelte
<script>
import ResponsiveImage from "flatlayer-sdk/svelte/ResponsiveImage";
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

## Props

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

## Events

- `on:load`: Dispatched when the image successfully loads.
- `on:error`: Dispatched if there's an error loading the image.

## Advanced Example

Here's an example demonstrating how to use the `ResponsiveImage` component with data fetched from Flatlayer, including error handling and fallback image:

```svelte
<script>
import { onMount } from 'svelte';
import ResponsiveImage from "flatlayer-sdk/svelte/ResponsiveImage";
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

This example demonstrates how to handle image loading, errors, and use custom breakpoints and transforms.