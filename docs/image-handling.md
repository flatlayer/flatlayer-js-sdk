# Image Handling with Flatlayer SDK

## Introduction

The Flatlayer SDK provides essential image handling capabilities through the `FlatlayerImage` class and related methods. This guide will walk you through the process of working with images and optimizing image delivery in your Flatlayer-powered applications.

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

## Generating Image Attributes

You can generate image attributes for use in an `<img>` tag:

```javascript
const imgAttributes = flatlayerImage.generateImgAttributes(
  { class: 'my-image' },
  [800, 600]
);

console.log('Image attributes:', imgAttributes);
```

This method returns an object with attributes like `src`, `alt`, `width`, and `height`.

Parameters:
1. `attributes` (optional): Additional HTML attributes for the img tag.
2. `displaySize` (optional): The intended display size as `[width, height]`.

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
    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    attributes={{ class: 'my-image' }}
  />
{/if}
```

This creates a responsive image that adapts to different viewport sizes. For more information on using Flatlayer with Svelte, see the [Svelte Integration Guide](./svelte.md).

## Getting Image URLs

You can get URLs for transformed images:

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

The `FlatlayerImage` class includes several methods for handling images. Here's a look at some key methods:

### getAlt(): string

This method returns the alt text for the image.

```javascript
const altText = flatlayerImage.getAlt();
console.log('Alt text:', altText);
```

### getUrl(transforms: Object): string

This method returns the URL for the image with applied transforms.

```javascript
const url = flatlayerImage.getUrl({ width: 800, height: 600, quality: 80 });
console.log('Image URL:', url);
```

### getThumbhashDataUrl(): string

This method returns the data URL for the thumbhash of the image.

```javascript
const thumbhashUrl = flatlayerImage.getThumbhashDataUrl();
console.log('Thumbhash data URL:', thumbhashUrl);
```

## Performance Considerations

1. Use appropriate image sizes to avoid unnecessary large file downloads.
2. Leverage the `webp` format when possible for better compression.
3. Implement lazy loading for images below the fold to improve initial page load times.
4. Use the `sizes` attribute accurately in the ResponsiveImage component to ensure the browser downloads the most appropriate image size.

For more performance optimization techniques, see the [Advanced Usage Guide](./advanced.md).

## Error Handling

When working with images, it's important to handle potential errors:

```javascript
try {
  const flatlayerImage = flatlayer.createImage(imageData, { quality: 80 });
  const imgAttributes = flatlayerImage.generateImgAttributes();
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

The image handling features of the Flatlayer SDK allow you to easily work with optimized images in your Flatlayer-powered applications. By using these tools effectively, you can ensure that your applications deliver high-quality images while maintaining good performance across various devices and screen sizes.

For more information on related topics, check out these guides:
- [Image Sizes Guide](./image-sizes.md)
- [Svelte Integration Guide](./svelte.md)
- [Advanced Usage Guide](./advanced.md)
- [Entry Retrieval Guide](./entry-retrieval.md)