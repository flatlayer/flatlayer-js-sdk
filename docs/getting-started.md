# Getting Started with Flatlayer SDK

## Introduction

The Flatlayer SDK is a powerful JavaScript library designed to simplify interaction with the Flatlayer CMS API. This SDK provides an intuitive interface for retrieving entries, performing searches, handling responsive images, and more in your Flatlayer-powered applications.

## Key Features

- Simple API for retrieving entries and performing searches
- Support for advanced filtering and field selection
- Responsive image handling with adaptive sizing
- TypeScript support for enhanced development experience
- Svelte integration for seamless component-based development

## Installation

You can install the Flatlayer SDK using npm:

```bash
npm install flatlayer-sdk
```

Or using yarn:

```bash
yarn add flatlayer-sdk
```

## Basic Setup

To start using the Flatlayer SDK, create an instance of the `Flatlayer` class with the base URL of your Flatlayer CMS API:

```javascript
import Flatlayer from 'flatlayer-sdk';

const flatlayer = new Flatlayer('https://api.yourflatlayerinstance.com');
```

Now you're ready to interact with your Flatlayer CMS!

## Quick Start Guide

### Fetching Entries

To retrieve a list of entries:

```javascript
flatlayer.getEntryList('post', {
  page: 1,
  perPage: 10,
  filter: { status: 'published' },
  fields: ['title', 'excerpt', 'author']
})
  .then(response => {
    console.log('Blog posts:', response.data);
    console.log('Total posts:', response.total);
  })
  .catch(error => console.error('Error fetching blog posts:', error));
```

For more details on entry retrieval, see the [Entry Retrieval Guide](./entry-retrieval.md).

### Retrieving a Single Entry

To fetch a single entry by its slug:

```javascript
flatlayer.getEntry('page', 'about-us', ['title', 'content', 'meta'])
  .then(page => {
    console.log('Page title:', page.title);
    console.log('Page content:', page.content);
  })
  .catch(error => console.error('Error fetching page:', error));
```

### Performing a Search

To search across your content:

```javascript
flatlayer.search('JavaScript', 'post', {
  page: 1,
  perPage: 20,
  fields: ['title', 'excerpt']
})
  .then(results => {
    console.log('Search results:', results.data);
    console.log('Total results:', results.total);
  })
  .catch(error => console.error('Error performing search:', error));
```

For more information on search functionality, see the [Search Functionality Guide](./search.md).

### Handling Images

To work with responsive images:

```javascript
flatlayer.getEntry('post', 'my-image-post', ['title', 'featured_image'])
  .then(post => {
    const imageAttributes = flatlayer.getResponsiveImageAttributes(
      post.featured_image,
      ['100vw', 'md:50vw', 'lg:33vw']
    );
    console.log('Image attributes:', imageAttributes);
  })
  .catch(error => console.error('Error fetching post:', error));
```

For more details on image handling and responsive sizing, see the [Image Handling Guide](./image-handling.md) and [Calculating Sizes Guide](./calculating-sizes.md).

## Advanced Usage

### Filtering

The SDK supports advanced filtering capabilities:

```javascript
const filter = {
  status: 'published',
  category: { $in: ['technology', 'programming'] },
  published_at: { $gte: '2023-01-01' }
};

flatlayer.getEntryList('post', { filter })
  .then(response => console.log('Filtered posts:', response.data))
  .catch(error => console.error('Error fetching filtered posts:', error));
```

For more information on filtering, see the [Advanced Filtering Guide](./advanced-filtering.md).

### Field Selection

You can specify which fields to retrieve:

```javascript
const fields = ['title', 'author.name', 'content'];

flatlayer.getEntry('post', 'my-first-post', fields)
  .then(post => console.log('Selected post data:', post))
  .catch(error => console.error('Error:', error));
```

For more details on field selection, see the [Advanced Selection Guide](./advanced-selection.md).

## TypeScript Support

The Flatlayer SDK includes TypeScript definitions. Here's an example of using the SDK with TypeScript:

```typescript
import Flatlayer from 'flatlayer-sdk';

interface BlogPost {
  title: string;
  content: string;
  author: string;
}

const flatlayer: Flatlayer = new Flatlayer('https://api.yourflatlayerinstance.com');

flatlayer.getEntry<BlogPost>('post', 'my-first-post')
  .then(post => {
    console.log(post.title);
    console.log(post.content);
    console.log(post.author);
  })
  .catch(error => console.error('Error:', error));
```

## Svelte Integration

If you're using Svelte, the SDK provides components for easy integration:

```svelte
<script>
import { onMount } from 'svelte';
import { flatlayer } from './flatlayer-instance';
import ResponsiveImage from 'flatlayer-sdk/svelte/ResponsiveImage';

let post = null;

onMount(async () => {
  try {
    post = await flatlayer.getEntry('post', 'my-awesome-post');
  } catch (error) {
    console.error('Error fetching post:', error);
  }
});
</script>

{#if post}
  <h1>{post.title}</h1>
  <ResponsiveImage
    baseUrl={flatlayer.baseUrl}
    imageData={post.featured_image}
    sizes={['100vw', 'md:50vw', 'lg:33vw']}
  />
  <div>{@html post.content}</div>
{:else}
  <p>Loading...</p>
{/if}
```

For more information on using Flatlayer with Svelte, see the [Svelte Integration Guide](./svelte.md).

## Error Handling

The SDK uses a custom `FlatlayerError` class for error handling:

```javascript
flatlayer.getEntry('post', 'non-existent-post')
  .then(post => console.log('Post:', post))
  .catch(error => {
    if (error instanceof FlatlayerError) {
      console.error(`API Error (${error.status}):`, error.message);
    } else {
      console.error('An unexpected error occurred:', error.message);
    }
  });
```

For more advanced error handling techniques, see the [Advanced Usage Guide](./advanced.md).

## Next Steps

Now that you're familiar with the basics of the Flatlayer SDK, you can explore more advanced features and optimizations:

- Learn about [Advanced Filtering](./advanced-filtering.md) and [Advanced Selection](./advanced-selection.md) for precise data retrieval.
- Dive into [Image Handling](./image-handling.md) and [Image Sizes](./image-sizes.md) for optimal responsive image management.
- Explore [Search Functionality](./search.md) for implementing powerful content search features.
- Check out the [Advanced Usage Guide](./advanced.md) for performance tips and best practices.

By leveraging these features, you can create efficient and powerful applications with the Flatlayer SDK. Happy coding!