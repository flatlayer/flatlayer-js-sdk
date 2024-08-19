# Markdown Component - Image Handling

The `Markdown` component now includes enhanced support for responsive images using the `ResponsiveImage` component. This integration allows for optimized image rendering within your Markdown content.

## Image Handling in Markdown

When you include an image in your Markdown content using the standard Markdown syntax, the `Markdown` component will automatically render it using the `ResponsiveImage` component. This provides all the benefits of responsive and optimized images without requiring any additional markup.

### Basic Image Usage

In your Markdown content, you can include images using the standard Markdown syntax:

```markdown
![Alt text](https://example.com/image.jpg "Optional title")
```

The `Markdown` component will automatically convert this to use the `ResponsiveImage` component.

## Customizing Image Rendering

You can customize how images are rendered by providing default props for the `ResponsiveImage` component.

### Example Usage

```svelte
<script>
import Markdown from "flatlayer-sdk/svelte/Markdown";
import { env } from '$env/dynamic/public';

let parsedContent = [/* your parsed content */];

const componentDefaults = {
  ResponsiveImage: {
    baseUrl: env.PUBLIC_FLATLAYER_ENDPOINT,
    defaultTransforms: { quality: 80, format: 'webp' },
    sizes: '(min-width: 1024px) 800px, 100vw',
    class: 'rounded-lg shadow-sm',
    isFluid: true,
    lazyLoad: true,
    blurRadius: 20,
    maxWidth: 800
  }
};
</script>

<Markdown content={parsedContent} {componentDefaults} />
```

In this example, all images within the Markdown content will be rendered using these default settings for the `ResponsiveImage` component.

## Advanced Image Usage

For more control over image rendering, you can use the `ResponsiveImage` component directly within your Markdown content. This allows you to specify props for individual images.

### Example of Advanced Image Usage in Markdown

```markdown
# My Blog Post

Here's a responsive image with custom properties:

<ResponsiveImage
  imageData={{ id: 'image-id', alt: 'A beautiful landscape' }}
  sizes="(min-width: 1024px) 800px, 100vw"
  maxWidth={800}
  class="my-custom-image-class"
/>

The rest of your content goes here...
```

This approach allows you to fine-tune the rendering of specific images within your Markdown content.

## Image Optimization

The `ResponsiveImage` component automatically handles image optimization, including:

- Responsive sizing based on the `sizes` attribute
- Lazy loading for improved performance
- Automatic WebP format usage when supported by the browser
- Placeholder images using blur-up technique

These optimizations are applied to all images in your Markdown content, ensuring optimal performance and user experience.

## Styling Images

You can style images rendered by the `ResponsiveImage` component using CSS. The component adds a wrapper div with the class `flatlayer-image-wrapper`, which you can target for styling:

```css
.flatlayer-image-wrapper {
  /* Your styles here */
}

.flatlayer-image-wrapper img {
  /* Styles for the actual image */
}
```

You can also add custom classes to images using the `class` prop in the `componentDefaults` or when using the `ResponsiveImage` component directly in Markdown.

By leveraging these features, you can ensure that images within your Markdown content are responsive, optimized, and consistent with your application's design.