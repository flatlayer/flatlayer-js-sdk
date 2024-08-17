# Entry Retrieval Guide

## Introduction

The Flatlayer SDK provides powerful methods for retrieving entries from your Flatlayer CMS. This guide covers the two main methods for entry retrieval: `getEntryList` for fetching multiple entries, and `getEntry` for retrieving a single entry by its slug. Understanding these methods is crucial for efficiently accessing and displaying content in your applications.

## Fetching Multiple Entries

To retrieve a list of entries, use the `getEntryList` method. This method is versatile and supports pagination, filtering, and field selection.

### Basic Usage

```javascript
flatlayer.getEntryList('post', {
  page: 1,
  perPage: 10,
  filter: { published: true },
  fields: ['title', 'excerpt', 'author', 'published_at']
})
  .then(response => {
    console.log('Blog posts:', response.data);
    console.log('Total posts:', response.total);
    console.log('Current page:', response.current_page);
  })
  .catch(error => console.error('Error fetching blog posts:', error));
```

### Parameters

- `type` (string): The type of entries to retrieve (e.g., 'post', 'page').
- `options` (object, optional): An object containing query parameters:
  - `page` (number): Page number (default: 1)
  - `perPage` (number): Number of entries per page (default: 15)
  - `filter` (object): Filter object (see [Advanced Filtering Guide](./advanced-filtering.md))
  - `fields` (array): Array of fields to include in the response (see [Advanced Selection Guide](./advanced-selection.md))
  - `search` (string): Search query string (see [Search Functionality Guide](./search.md))

### Advanced Example

Here's an example that combines pagination, filtering, and field selection:

```javascript
const options = {
  page: 2,
  perPage: 20,
  filter: {
    published: true,
    category: { $in: ['technology', 'programming'] },
    published_at: { $gte: '2023-01-01' }
  },
  fields: ['title', 'excerpt', 'author.name', 'published_at'],
  search: 'JavaScript'
};

flatlayer.getEntryList('post', options)
  .then(response => {
    console.log('Filtered blog posts:', response.data);
    console.log('Total matching posts:', response.total);
    console.log('Current page:', response.current_page);
  })
  .catch(error => {
    if (error instanceof FlatlayerError) {
      console.error('API Error:', error.message);
    } else {
      console.error('An unexpected error occurred:', error.message);
    }
  });
```

For more information on filtering, see the [Advanced Filtering Guide](./advanced-filtering.md).

## Retrieving a Single Entry

To fetch a single entry by its slug, use the `getEntry` method. This method is useful when you need to retrieve detailed information about a specific entry.

### Basic Usage

```javascript
flatlayer.getEntry('page', 'about-us', ['title', 'content', 'meta'])
  .then(page => {
    console.log('Page title:', page.title);
    console.log('Page content:', page.content);
    console.log('Page meta:', page.meta);
  })
  .catch(error => console.error('Error fetching page:', error));
```

### Parameters

- `type` (string): The type of entry to retrieve.
- `slug` (string): The slug of the entry.
- `fields` (array, optional): Array of fields to include in the response.

### Advanced Example

Here's an example that retrieves a blog post with its associated images:

```javascript
flatlayer.getEntry('post', 'my-awesome-blog-post', [
  'title',
  'content',
  'author.*',
  'featured_image',
  'gallery_images'
])
  .then(post => {
    console.log('Post title:', post.title);
    console.log('Author:', post.author.name);
    console.log('Featured image URL:', post.featured_image.url);
    console.log('Gallery image count:', post.gallery_images.length);
  })
  .catch(error => {
    if (error instanceof FlatlayerError) {
      if (error.status === 404) {
        console.error('Post not found');
      } else {
        console.error('API Error:', error.message);
      }
    } else {
      console.error('An unexpected error occurred:', error.message);
    }
  });
```

For more information on working with images, see the [Image Handling Guide](./image-handling.md).

## Pagination

When working with large datasets, it's important to implement pagination. Here's an example of how to retrieve all pages of entries:

```javascript
async function getAllPosts() {
  let page = 1;
  let allPosts = [];
  let hasMorePages = true;

  while (hasMorePages) {
    try {
      const response = await flatlayer.getEntryList('post', { page, perPage: 100 });
      allPosts = allPosts.concat(response.data);
      hasMorePages = response.current_page < response.last_page;
      page++;
    } catch (error) {
      console.error('Error fetching page', page, ':', error.message);
      break;
    }
  }

  return allPosts;
}

getAllPosts()
  .then(posts => console.log('All posts:', posts))
  .catch(error => console.error('Error fetching all posts:', error));
```

For more advanced usage and performance optimization techniques, see the [Advanced Usage Guide](./advanced.md).

## Working with Images

When retrieving entries that contain images, you can use the `FlatlayerImage` class to generate responsive image attributes:

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

For more information on working with images and calculating sizes, see the [Image Handling Guide](./image-handling.md) and [Calculating Sizes Guide](./calculating-sizes.md).

## Using with Svelte

If you're using Svelte, you can easily integrate entry retrieval with Svelte components. Here's an example:

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

## Conclusion

The `getEntryList` and `getEntry` methods provide powerful and flexible ways to retrieve content from your Flatlayer CMS. By combining these methods with filtering, field selection, and pagination, you can efficiently fetch exactly the data you need for your application.