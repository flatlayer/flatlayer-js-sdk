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
- `lazyLoad` (optional): Enable lazy loading of images. Default: `true`.
- `blurRadius` (optional): Blur radius for the image placeholder. Default: `40`.

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
    lazyLoad={true}
    blurRadius={20}
  />
{/if}
```

This example fetches an image entry from Flatlayer and renders it as a responsive image. It demonstrates:

- Custom breakpoints
- Size descriptors for different screen sizes
- Default image transformations (quality and format)
- Additional HTML attributes
- Lazy loading
- Custom blur radius for the placeholder

## Performance Optimizations

1. **Lazy Loading**: The component uses native lazy loading by default (`lazyLoad={true}`). Images off-screen won't be loaded until needed. You can disable this by setting `lazyLoad={false}`.

2. **Placeholder**: A low-resolution placeholder (using `thumbhash`) is displayed while the full image loads, improving perceived performance. The `blurRadius` prop allows you to control the blur effect of this placeholder.

3. **Responsive Sizing**: The `sizes` attribute ensures the browser downloads appropriately sized images for the user's device and viewport.

4. **WebP Support**: Use the `format: 'webp'` transform for better compression on supporting browsers.

## TypeScript Support

While the ResponsiveImage component isn't explicitly typed for TypeScript, you can still use it in TypeScript-based Svelte projects. However, you may need to provide your own type definitions for full TypeScript support.

To use the component with TypeScript, you might need to create a declaration file (e.g., `flatlayer-sdk.d.ts`) with a basic type definition:

```typescript
declare module 'flatlayer-sdk/svelte' {
  import { SvelteComponentTyped } from 'svelte';

  export interface ResponsiveImageProps {
    baseUrl: string;
    imageData: any; // You might want to define a more specific type for imageData
    sizes?: string[];
    defaultTransforms?: Record<string, any>;
    breakpoints?: Record<string, number>;
    imageEndpoint?: string;
    attributes?: Record<string, any>;
    isFluid?: boolean;
    displaySize?: [number, number];
    lazyLoad?: boolean;
    blurRadius?: number;
  }

  export default class ResponsiveImage extends SvelteComponentTyped<ResponsiveImageProps> {}
}
```

This approach allows for basic type checking and autocompletion in TypeScript Svelte files. However, please note that this is a minimal type definition and may not cover all aspects of the component's functionality.

If you frequently use TypeScript in your projects, consider contributing TypeScript definitions to the Flatlayer SDK to improve its TypeScript support.

## Best Practices

1. Always provide meaningful `alt` text for accessibility.
2. Use the `sizes` attribute accurately to reflect your layout.
3. Leverage `defaultTransforms` to optimize image quality and format globally.
4. Consider using `displaySize` for critical images to prevent layout shifts.
5. Adjust the `blurRadius` to balance between a smooth loading experience and initial image clarity.
6. Use `lazyLoad={false}` for above-the-fold images that need to load immediately.

By utilizing the ResponsiveImage component, you can efficiently manage responsive images in your Svelte application while leveraging the power of the Flatlayer CMS.