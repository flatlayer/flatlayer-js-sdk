# ResponsiveImage Svelte Component

The `ResponsiveImage` component enhances the Flatlayer SDK's image handling capabilities within Svelte applications. It provides a declarative way to render responsive, optimized images from your Flatlayer CMS.

## Installation

Assuming you've already installed the Flatlayer SDK, no additional installation is required. The ResponsiveImage component is included in the SDK package.

## Usage in Svelte

1. Import the component in your Svelte file:

```svelte
<script>
import ResponsiveImage from 'flatlayer-sdk/svelte';
import { flatlayer } from './your-flatlayer-instance';
</script>
```

2. Use the component in your template:

```svelte
<ResponsiveImage
  baseUrl={flatlayer.baseUrl}
  imageData={yourImageData}
  sizes={['100vw', 'md:50vw', 'lg:33vw']}
/>
```

## Props

- `baseUrl` (required): Your Flatlayer CMS API base URL (typically `flatlayer.baseUrl`).
- `imageData` (required): The image data object from a Flatlayer entry.
- `defaultTransforms` (optional): Default image transformation parameters.
- `breakpoints` (optional): Custom breakpoints for responsive sizes.
- `imageEndpoint` (optional): Custom image endpoint URL.
- `sizes` (optional): Array of size descriptors for responsive images. Default: `['100vw']`.
- `attributes` (optional): Additional HTML attributes for the img tag.
- `isFluid` (optional): Use fluid sizing. Default: `true`.
- `displaySize` (optional): Intended display size as `[width, height]`.

## Advanced Example

Here's an example demonstrating how to use the `ResponsiveImage` component with data fetched from Flatlayer:

```svelte
<script>
import { onMount } from 'svelte';
import ResponsiveImage from 'flatlayer-sdk/svelte';
import { flatlayer } from './your-flatlayer-instance';

let imageData;

onMount(async () => {
  const entry = await flatlayer.getEntry('image', 'hero-image');
  imageData = entry.image;
});

const customBreakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280
};
</script>

{#if imageData}
  <ResponsiveImage
    baseUrl={flatlayer.baseUrl}
    {imageData}
    sizes={['100vw', 'md:50vw', 'lg:33vw']}
    attributes={{ class: 'hero-image', alt: 'Hero image' }}
    defaultTransforms={{ quality: 80, format: 'webp' }}
    breakpoints={customBreakpoints}
    isFluid={true}
  />
{/if}
```

This example fetches an image entry from Flatlayer and renders it as a responsive image. It demonstrates:

- Custom breakpoints
- Size descriptors for different screen sizes
- Default image transformations (quality and format)
- Additional HTML attributes

## Performance Optimizations

1. **Lazy Loading**: The component uses native lazy loading. Images off-screen won't be loaded until needed.

2. **Placeholder**: A low-resolution placeholder (using `thumbhash`) is displayed while the full image loads, improving perceived performance.

3. **Responsive Sizing**: The `sizes` attribute ensures the browser downloads appropriately sized images for the user's device and viewport.

4. **WebP Support**: Use the `format: 'webp'` transform for better compression on supporting browsers.

## TypeScript Support

The component and its props are fully typed. In a TypeScript Svelte file, you'll get type checking and autocompletion for the component props.

## Best Practices

1. Always provide meaningful `alt` text for accessibility.
2. Use the `sizes` attribute accurately to reflect your layout.
3. Leverage `defaultTransforms` to optimize image quality and format globally.
4. Consider using `displaySize` for critical images to prevent layout shifts.

By utilizing the ResponsiveImage component, you can efficiently manage responsive images in your Svelte application while leveraging the power of the Flatlayer CMS.