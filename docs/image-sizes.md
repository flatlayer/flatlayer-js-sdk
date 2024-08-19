# Using Sizes with Flatlayer SDK

## Introduction

The `sizes` attribute is a crucial feature in the Flatlayer SDK that enables the creation of truly responsive images adaptable to various screen sizes and layouts. This guide will help you understand how to use the `sizes` attribute effectively, especially in conjunction with Tailwind CSS and the `ResponsiveImage` component.

For a deeper understanding of image handling in general, please refer to the [Image Handling Guide](./image-handling.md).

## Basic Concept

The `sizes` attribute in Flatlayer SDK follows a mobile-first approach, similar to Tailwind CSS. It allows you to specify how much space an image will occupy at different breakpoints. The syntax is based on the standard HTML `sizes` attribute, using media conditions and size values.

## Syntax

The `sizes` attribute accepts a string that follows this general format:

```javascript
sizes="(max-width: breakpoint1) size1, (max-width: breakpoint2) size2, defaultSize"
```

Where:
- `breakpoint1`, `breakpoint2`, etc., are CSS pixel values for viewport widths
- `size1`, `size2`, etc., are length values (using vw, px, or calc expressions)
- `defaultSize` is the size to use when no media condition matches

## Examples

### Basic Usage

```javascript
sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
```

This means:
- On screens up to 640px wide: Image takes full width (100vw)
- On screens between 641px and 768px: Image takes half width (50vw)
- On screens larger than 768px: Image takes one-third width (33vw)

### With Padding Consideration

When your layout includes padding, you can subtract it from the viewport width:

```javascript
sizes="(max-width: 640px) calc(100vw - 32px), (max-width: 768px) calc(50vw - 32px), calc(33vw - 32px)"
```

This accounts for 16px padding on each side (total 32px).

### Fixed Sizes for Larger Screens

You can use pixel values for larger screens where you want a fixed size:

```javascript
sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 480px"
```

## Converting Tailwind Classes to Sizes

When working with Tailwind, you'll often need to convert Tailwind classes to appropriate `sizes` values. Here are some common conversions:

1. Padding:
   - `p-4` (1rem = 16px) → Subtract 32px: `calc(100vw - 32px)`
   - `p-6` (1.5rem = 24px) → Subtract 48px: `calc(100vw - 48px)`

2. Columns:
   - `w-1/2` → `50vw`
   - `w-1/3` → `33.33vw`
   - `w-1/4` → `25vw`

Remember to account for gaps in grid layouts by subtracting them from the viewport width.

## Using with ResponsiveImage

Here's how to use the `sizes` attribute with the `ResponsiveImage` component:

```svelte
<script>
import { ResponsiveImage } from 'flatlayer-sdk/svelte';
import { flatlayer } from './your-flatlayer-instance';

// Assuming you have fetched the image data
let imageData = {/* your image data */};
</script>

<ResponsiveImage
  baseUrl={flatlayer.baseUrl}
  imageData={imageData}
  sizes="(max-width: 640px) calc(100vw - 32px), (max-width: 768px) calc(50vw - 32px), (max-width: 1024px) calc(33vw - 32px), 480px"
  attributes={{ class: 'rounded-lg shadow-md' }}
/>
```

This setup creates a responsive image that:
1. Takes full width minus 32px padding on mobile (up to 640px)
2. Occupies half the width minus 32px padding on small screens (641px to 768px)
3. Takes up a third of the width minus 32px padding on medium screens (769px to 1024px)
4. Has a fixed width of 480px on large screens (above 1024px)

For more information on using Flatlayer with Svelte, see the [Svelte Integration Guide](./svelte.md).

## Performance Considerations

1. **Optimize Image Delivery**: Use the `sizes` attribute accurately to ensure browsers download the most appropriate image size.

2. **Lazy Loading**: Implement lazy loading for images below the fold to improve initial page load times. The `ResponsiveImage` component supports this out of the box.

3. **Use WebP Format**: Leverage the WebP format for better compression when supported by the browser. You can specify this in the `defaultTransforms` when creating a `FlatlayerImage` instance.

4. **Caching**: Implement appropriate caching strategies for your images. While this is typically handled at the server level, ensure your application doesn't unnecessarily invalidate the cache for static images.

For more performance optimization techniques, see the [Advanced Usage Guide](./advanced.md).

## Best Practices

1. **Start Mobile-First**: Always begin with the smallest size and work your way up in your `sizes` attribute.

2. **Consider Layout Context**: Factor in paddings, margins, and grid gaps when calculating sizes.

3. **Use Precise Values**: Use precise values in `sizes` (e.g., `33.33vw` instead of `33vw` for more accurate sizing).

4. **Optimize for Performance**: Use fixed pixel values for larger screens when the image size won't change beyond a certain point.

5. **Test Thoroughly**: Always test your responsive images across various device sizes to ensure they behave as expected.

6. **Balance Flexibility and Precision**: While `vw` units offer flexibility, sometimes fixed `px` values are more appropriate, especially for larger screens.

7. **Document Your Choices**: When using complex `sizes` attributes, consider adding comments to explain the reasoning behind each breakpoint decision.

## Error Handling

When working with images and sizes, it's important to handle potential errors:

```javascript
try {
  // Use ResponsiveImage component or other image-related logic
} catch (error) {
  if (error instanceof FlatlayerError) {
    console.error('Flatlayer Error:', error.message);
    // Provide fallback image or error handling...
  } else {
    console.error('Unexpected error:', error.message);
  }
}
```

For more information on error handling, refer to the [Error Handling section](./advanced.md#error-handling) in the Advanced Usage Guide.

## Conclusion

Understanding and effectively using the `sizes` attribute in the Flatlayer SDK allows you to create truly responsive images that adapt seamlessly to various layouts and screen sizes. By combining this with Tailwind CSS principles and the `ResponsiveImage` component, you can ensure optimal performance and visual consistency across your application.

Remember, the key to effective use of `sizes` is understanding your layout requirements and how they change across different breakpoints. With practice, you'll be able to craft precise and efficient responsive image solutions for any design scenario.

For more information on related topics, check out these guides:
- [Image Handling Guide](./image-handling.md)
- [Svelte Integration Guide](./svelte.md)
- [Advanced Usage Guide](./advanced.md)
- [Entry Retrieval Guide](./entry-retrieval.md)