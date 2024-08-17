# Markdown Component

The `Markdown` component allows you to render Markdown content with embedded components.

## Basic Usage

Import and use the `Markdown` component in your Svelte file:

```svelte
<script>
import Markdown from "flatlayer-sdk/svelte/Markdown";
import ResponsiveImage from "flatlayer-sdk/svelte/ResponsiveImage";
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

## Props

- `content` (required): An array of parsed content objects.
- `components` (optional): An object mapping component names to their implementations.
- `componentDefaults` (optional): Default props for components.

## Parsing Content

To use the `Markdown` component, you need to parse your content first. You can do this using the `MarkdownParser` from the Flatlayer SDK:

```javascript
import { MarkdownParser } from 'flatlayer-sdk';

const rawContent = '# Title\n\nSome markdown content with <ResponsiveImage imageData={...} />';
const parsedContent = MarkdownParser.parseContent(rawContent);
```

This parsed content can then be passed to the `Markdown` component.

## Using Custom Components

You can use custom components within your Markdown content. Define these components and pass them to the `Markdown` component:

```svelte
<script>
import Markdown from "flatlayer-sdk/svelte/Markdown";
import CustomComponent from './CustomComponent.svelte';

const components = {
  CustomComponent
};

const parsedContent = [/* ... */];
</script>

<Markdown content={parsedContent} {components} />
```

Now, you can use `<CustomComponent />` within your Markdown content, and it will be rendered correctly.

## Styling

The `Markdown` component renders standard HTML elements for Markdown content. You can style these elements using your preferred CSS method. For embedded components, you can pass class names or inline styles through the `componentDefaults` or within the Markdown content itself.