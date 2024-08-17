# Image Handling with Flatlayer SDK

## Introduction

The Flatlayer SDK provides robust image handling capabilities through the `FlatlayerImage` class and related methods. This guide will walk you through the process of working with images, generating responsive attributes, and optimizing image delivery in your Flatlayer-powered applications.

## Creating a FlatlayerImage Instance

To work with images, first create a `FlatlayerImage` instance:

```javascript
import Flatlayer from 'flatlayer-sdk';

const flatlayer = new Flatlayer('https://api.yourflatlayerinstance.com');

const imageData = {
    id: '12345',
    dimensions: { width: 1200, height: 800 },
    meta: { alt: 'A beautiful landscape' }
};

const flatlayerImage = flatlayer.createImage(imageData, { quality: 80 });
```

The `createImage` method accepts two parameters:
1. `imageData`: The image data object from your Flatlayer CMS.
2. `defaultTransforms` (optional): Default transformation parameters for the image.

## Generating Responsive Image Attributes

You can generate responsive image attributes for use in an `<img>` tag:

```javascript
const imgAttributes = flatlayerImage.generateImgAttributes(
  ['100vw', 'md:50vw', 'lg:33vw'],
  { class: 'my-image' },
  true,
  [800, 600]
);

console.log('Responsive image attributes:', imgAttributes);
```

This method returns an object with attributes like `src`, `srcset`, `sizes`, and more, optimized for responsive design.

Parameters:
1. `sizes`: An array of size descriptors (e.g., `['100vw', 'md:50vw', 'lg:33vw']`).
2. `attributes` (optional): Additional HTML attributes for the img tag.
3. `isFluid` (optional): Whether to use fluid sizing (default: true).
4. `displaySize` (optional): The intended display size as `[width, height]`.

For more information on calculating appropriate sizes, see the [Calculating Sizes Guide](./calculating-sizes.md).

## Using in Frameworks

### Svelte Example

Here's an example of how to use the Flatlayer SDK's image handling in a Svelte component:

```svelte
<script>
import { onMount } from 'svelte';
import Flatlayer from 'flatlayer-sdk';
import ResponsiveImage from 'flatlayer-sdk/svelte/ResponsiveImage';

const flatlayer = new Flatlayer('https://api.yourflatlayerinstance.com');

let post;

onMount(async () => {
  post = await flatlayer.getEntry('post', 'my-blog-post', ['title', 'featured_image']);
});
</script>

{#if post}
  <h1>{post.title}</h1>
  <ResponsiveImage
    baseUrl={flatlayer.baseUrl}
    imageData={post.featured_image}
    sizes={['100vw', 'md:50vw', 'lg:33vw']}
    attributes={{ class: 'my-image' }}
  />
{/if}
```

This creates a responsive image that adapts to different viewport sizes and device pixel ratios. For more information on using Flatlayer with Svelte, see the [Svelte Integration Guide](./svelte.md).

## Getting Image URLs

You can also get URLs for transformed images:

```javascript
const imageUrl = flatlayer.getImageUrl('image-id', {
  width: 800,
  height: 600,
  quality: 80,
  format: 'webp'
});

console.log('Transformed image URL:', imageUrl);
```

This method is useful when you need to generate image URLs programmatically, such as for background images or custom image components.

## FlatlayerImage Class Methods

The `FlatlayerImage` class includes several methods for handling responsive image sizes. Here's a detailed look at some key methods:

### parseSizes(sizes: Array<string>): Object

This method parses an array of size descriptors into a structured format.

```javascript
const sizes = ['100vw', 'md:50vw', 'lg:33vw'];
const parsedSizes = flatlayerImage.parseSizes(sizes);
console.log(parsedSizes);
// Output:
// {
//   0: { type: 'vw', value: 100 },
//   768: { type: 'vw', value: 50 },
//   1024: { type: 'vw', value: 33 }
// }
```

### parseSize(size: string): Object

This method parses a single size descriptor.

```javascript
console.log(flatlayerImage.parseSize('100vw'));
// Output: { type: 'vw', value: 100 }

console.log(flatlayerImage.parseSize('500px'));
// Output: { type: 'px', value: 500 }

console.log(flatlayerImage.parseSize('calc(100vw - 20px)'));
// Output: { type: 'calc', vw: 100, px: 20 }
```

### formatSize(size: Object): string

This method formats a size object into a string representation.

```javascript
console.log(flatlayerImage.formatSize({ type: 'vw', value: 100 }));
// Output: '100vw'

console.log(flatlayerImage.formatSize({ type: 'px', value: 500 }));
// Output: '500px'

console.log(flatlayerImage.formatSize({ type: 'calc', vw: 100, px: 20 }));
// Output: 'calc(100vw - 20px)'
```

These methods are used internally by the `generateImgAttributes` method to handle responsive image sizing, but they can also be useful for advanced customization scenarios.

## Advanced Usage

### Custom Size Parsing

You can use these methods to create custom size parsing logic:

```javascript
const customSizes = ['small:300px', 'medium:50vw', 'large:calc(100vw - 40px)'];
const parsedSizes = customSizes.map(size => {
  const [breakpoint, value] = size.split(':');
  return { breakpoint, size: flatlayerImage.parseSize(value) };
});
```

### Generating Custom Srcset

For more control over the srcset attribute, you can use the `generateSrcset` method:

```javascript
const srcset = flatlayerImage.generateSrcset(true, [800, 600]);
console.log('Custom srcset:', srcset);
```

This generates a srcset string for responsive images, taking into account the fluid nature of the image and the desired display size.

## Performance Considerations

1. Use appropriate image sizes to avoid unnecessary large file downloads.
2. Leverage the `webp` format when possible for better compression.
3. Implement lazy loading for images below the fold to improve initial page load times.
4. Use the `sizes` attribute accurately to ensure the browser downloads the most appropriate image size.

For more performance optimization techniques, see the [Advanced Usage Guide](./advanced.md).

## Error Handling

When working with images, it's important to handle potential errors:

```javascript
try {
  const flatlayerImage = flatlayer.createImage(imageData, { quality: 80 });
  const imgAttributes = flatlayerImage.generateImgAttributes(sizes);
  // Use imgAttributes...
} catch (error) {
  if (error instanceof FlatlayerError) {
    console.error('Flatlayer API Error:', error.message);
  } else {
    console.error('An unexpected error occurred:', error.message);
  }
  // Provide fallback image or error handling...
}
```

## Conclusion

The image handling features of the Flatlayer SDK allow you to easily work with responsive and optimized images in your Flatlayer-powered applications, providing fine-grained control over image sizing and responsiveness.

For more information on related topics, check out these guides:
- [Calculating Sizes Guide](./calculating-sizes.md)
- [Image Sizes Guide](./image-sizes.md)
- [Svelte Integration Guide](./svelte.md)
- [Advanced Usage Guide](./advanced.md)
- [Entry Retrieval Guide](./entry-retrieval.md)

By mastering these image handling techniques, you can ensure that your applications deliver optimized images across various devices and screen sizes, improving both performance and user experience.