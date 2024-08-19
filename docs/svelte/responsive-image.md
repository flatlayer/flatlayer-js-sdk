# ResponsiveImage Component

The `ResponsiveImage` component is a powerful tool for rendering responsive, optimized images from your Flatlayer CMS. It now features improved size handling for better adaptability to various layouts and screen sizes.

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
- `imageEndpoint` (optional): Custom image endpoint URL.
- `sizes` (optional): Array of size descriptors for responsive images or a string. Default: `['100vw']`.
- `attributes` (optional): Additional HTML attributes for the img tag.
- `isFluid` (optional): Use fluid sizing. Default: `true`.
- `displaySize` (optional): Intended display size as `[width, height]`.
- `lazyLoad` (optional): Enable lazy loading of images. Default: `true`.
- `blurRadius` (optional): Blur radius for the image placeholder. Default: `40`.
- `alt` (optional): Alternative text for the image.
- `title` (optional): Title attribute for the image.
- `fallbackSrc` (optional): URL of a fallback image to display if the main image fails to load.
- `maxWidth` (optional): Maximum width for the image. Useful for constraining image size in fluid layouts.

## Size Handling

The component now dynamically calculates sizes based on the provided props and the image's container width. Here's how it works:

1. If `sizes` is provided, it uses that directly.
2. If `displaySize` is provided and `isFluid` is false, it uses the width from `displaySize`.
3. If `maxWidth` is provided, it uses that to create a responsive size string.
4. If none of the above apply, it calculates the size based on the image's container width and viewport width.

## Events

- `on:load`: Dispatched when the image successfully loads.
- `on:error`: Dispatched if there's an error loading the image.

## Advanced Example

Here's an example demonstrating how to use the `ResponsiveImage` component with the new size handling features:

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
  <div class="image-container" style="max-width: 800px; margin: 0 auto;">
    <ResponsiveImage
      baseUrl={env.PUBLIC_FLATLAYER_ENDPOINT}
      imageData={post.featured_image}
      sizes="(min-width: 1024px) 800px, 100vw"
      attributes={{ class: 'rounded-lg shadow-md' }}
      defaultTransforms={{ quality: 80, format: 'webp' }}
      maxWidth={800}
      isFluid={true}
      lazyLoad={true}
      blurRadius={20}
      fallbackSrc="/path/to/fallback-image.jpg"
      on:error={handleImageError}
      on:load={handleImageLoad}
    />
  </div>
  {#if imageLoadError}
    <p>Failed to load image. Displaying fallback.</p>
  {/if}
{/if}
```

In this example:

- We set a `maxWidth` of 800px, which corresponds to the container's max-width.
- The `sizes` attribute is set to `"(min-width: 1024px) 800px, 100vw"`, meaning the image will be 800px wide on screens 1024px and wider, and full viewport width on smaller screens.
- The component will automatically calculate the most appropriate size based on the container width and viewport width if these values change.

## Responsive Design Considerations

1. **Fluid Layouts**: For fluid layouts, you can omit the `sizes` prop and let the component calculate the appropriate size based on its container.

2. **Fixed Widths**: For images with fixed widths at certain breakpoints, provide a `sizes` string that reflects your layout.

3. **Maximum Width**: Use the `maxWidth` prop to prevent the image from expanding beyond a certain width, even in fluid layouts.

4. **Performance**: The component uses a debounced resize observer to update sizes, ensuring smooth performance even with dynamic layout changes.

By leveraging these features, you can create truly responsive images that adapt to various layouts and screen sizes while maintaining optimal performance.