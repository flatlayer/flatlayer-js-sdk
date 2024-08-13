# Flatlayer JS SDK

The Flatlayer JS SDK is a lightweight, easy-to-use JavaScript library for interacting with the Flatlayer CMS API. It provides a simple interface for retrieving entries, performing searches, and handling responsive images in your Flatlayer-powered applications.

## Table of Contents

- [Installation](#installation)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
  - [Constructor](#constructor)
  - [Entry Retrieval](#entry-retrieval)
  - [Search](#search)
  - [Image Handling](#image-handling)
- [Examples](#examples)
  - [Basic Usage](#basic-usage)
  - [Using FlatlayerImage](#using-flatlayerimage)
- [Advanced Usage](#advanced-usage)
- [Error Handling](#error-handling)
- [TypeScript Support](#typescript-support)
- [Contributing](#contributing)
- [License](#license)

## Installation

You can install the Flatlayer JS SDK using npm:

```bash
npm install flatlayer-sdk
```

Or using yarn:

```bash
yarn add flatlayer-sdk
```

## Getting Started

To start using the Flatlayer JS SDK, create an instance of the `Flatlayer` class with the base URL of your Flatlayer CMS API:

```javascript
import Flatlayer from 'flatlayer-sdk';

const flatlayer = new Flatlayer('https://api.yourflatlayerinstance.com');
```

Now you're ready to interact with your Flatlayer CMS!

## API Reference

### Constructor

```javascript
new Flatlayer(baseUrl: string, imageEndpoint?: string)
```

Creates a new instance of the Flatlayer SDK.

- `baseUrl`: The base URL of your Flatlayer CMS API.
- `imageEndpoint`: (Optional) The base URL for image endpoints. If not provided, it defaults to `${baseUrl}/image`.

### Entry Retrieval

#### getEntryList(type: string, options?: Object): Promise<Object>

Retrieves a list of entries.

- `type`: The type of entries to retrieve (e.g., 'post', 'page').
- `options`: (Optional) An object containing query parameters:
  - `page`: Page number (default: 1)
  - `perPage`: Number of entries per page (default: 15)
  - `filter`: Filter object
  - `fields`: Array of fields to include in the response
  - `search`: Search query string

#### getEntry(type: string, slug: string, fields?: Array<string>): Promise<Object>

Retrieves a single entry by its slug.

- `type`: The type of entry to retrieve.
- `slug`: The slug of the entry.
- `fields`: (Optional) Array of fields to include in the response.

#### getBatchEntries(type: string, slugs: Array<string>, fields?: Array<string>): Promise<Object>

Retrieves multiple entries by their slugs.

- `type`: The type of entries to retrieve.
- `slugs`: An array of slugs to retrieve.
- `fields`: (Optional) Array of fields to include in the response.

### Search

#### search(query: string, type?: string, options?: Object): Promise<Object>

Performs a search across entry types or within a specific type.

- `query`: The search query string.
- `type`: (Optional) The entry type to search within.
- `options`: (Optional) An object containing query parameters (same as `getEntryList`).

### Image Handling

#### getImageUrl(id: string|number, options?: Object): string

Gets the URL for an image with optional transformations.

- `id`: The ID of the image.
- `options`: (Optional) An object containing transformation options:
  - `width`: The desired width of the image.
  - `height`: The desired height of the image.
  - `quality`: The quality of the image (1-100).
  - `format`: The desired image format (e.g., 'jpg', 'webp').

#### createImage(imageData: Object, defaultTransforms?: Object, breakpoints?: Object, imageEndpoint?: string): FlatlayerImage

Creates a new FlatlayerImage instance for advanced image handling.

- `imageData`: The image data object from the API.
- `defaultTransforms`: (Optional) Default transformation parameters.
- `breakpoints`: (Optional) Custom breakpoints for responsive sizes.
- `imageEndpoint`: (Optional) Custom image endpoint URL.

#### getResponsiveImageAttributes(image: Object, sizes: Array<string>, options?: Object): Object

Generates responsive image attributes for use in an `<img>` tag.

- `image`: The image object from the API.
- `sizes`: An array of size descriptors (e.g., ['100vw', 'md:50vw']).
- `options`: (Optional) Additional options for image generation:
  - `breakpoints`: Custom breakpoints for responsive sizes.
  - `defaultImageParams`: Default parameters for image URLs.
  - `displaySize`: The intended display size [width, height].
  - `isFluid`: Whether to use fluid sizing (default: true).

## Examples

### Basic Usage

#### Fetching a list of blog posts

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

#### Retrieving a single page by slug

```javascript
flatlayer.getEntry('page', 'about-us', ['title', 'content', 'meta'])
  .then(page => {
    console.log('Page title:', page.title);
    console.log('Page content:', page.content);
    console.log('Page meta:', page.meta);
  })
  .catch(error => console.error('Error fetching page:', error));
```

#### Retrieving multiple entries by slug

```javascript
flatlayer.getBatchEntries('post', ['first-post', 'second-post'], ['title', 'content', 'author'])
  .then(response => {
    console.log('Retrieved posts:', response.data);
  })
  .catch(error => console.error('Error fetching posts:', error));
```

#### Performing a search

```javascript
flatlayer.search('JavaScript', 'post', {
  page: 1,
  perPage: 20,
  fields: ['title', 'excerpt', 'author']
})
  .then(results => {
    console.log('Search results:', results.data);
    console.log('Total results:', results.total);
  })
  .catch(error => console.error('Error performing search:', error));
```

### Using FlatlayerImage

The `FlatlayerImage` class provides advanced image handling capabilities, including generating responsive image attributes.

#### Creating a FlatlayerImage instance

```javascript
const imageData = {
  id: '12345',
  dimensions: { width: 1200, height: 800 },
  meta: { alt: 'A beautiful landscape' }
};

const flatlayerImage = flatlayer.createImage(imageData, { quality: 80 });
```

#### Generating responsive image attributes

```javascript
const imgAttributes = flatlayerImage.generateImgAttributes(
  ['100vw', 'md:50vw', 'lg:33vw'],
  { class: 'my-image' },
  true,
  [800, 600]
);

console.log('Responsive image attributes:', imgAttributes);
```

#### Using in Sveltekit

In a Svelte component:

```svelte
<script>
import Flatlayer from 'flatlayer-sdk';

const flatlayer = new Flatlayer('https://api.yourflatlayerinstance.com');

export let imageData;
let imgAttributes;

$: {
  const flatlayerImage = flatlayer.createImage(imageData, { quality: 80 });
  imgAttributes = flatlayerImage.generateImgAttributes(
    ['100vw', 'md:50vw', 'lg:33vw'],
    { class: 'my-image' },
    true,
    [800, 600]
  );
}
</script>

<img {...imgAttributes} />
```

This example creates a responsive image that adapts to different viewport sizes and device pixel ratios.

## Advanced Usage

### Using filters

```javascript
flatlayer.getEntryList('product', {
  filter: {
    category: 'electronics',
    price: { $gte: 100, $lte: 500 },
    tags: { $contains: 'bestseller' },
    $or: [
      { brand: 'Apple' },
      { brand: 'Samsung' }
    ]
  }
})
  .then(response => console.log('Filtered products:', response.data))
  .catch(error => console.error('Error fetching products:', error));
```

### Pagination

```javascript
async function getAllPosts() {
  let page = 1;
  let allPosts = [];
  let hasMorePages = true;

  while (hasMorePages) {
    const response = await flatlayer.getEntryList('post', { page, perPage: 100 });
    allPosts = allPosts.concat(response.data);
    hasMorePages = response.current_page < response.last_page;
    page++;
  }

  return allPosts;
}

getAllPosts()
  .then(posts => console.log('All posts:', posts))
  .catch(error => console.error('Error fetching all posts:', error));
```

## Error Handling

The SDK uses native Promises, so you can use `.catch()` to handle errors:

```javascript
flatlayer.getEntry('post', 'non-existent-post')
  .then(post => console.log('Post:', post))
  .catch(error => {
    if (error.message.includes('404')) {
      console.error('Post not found');
    } else if (error.message.includes('401')) {
      console.error('Authentication error. Please check your API credentials.');
    } else if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      console.error('Network error. Please check your internet connection.');
    } else {
      console.error('An error occurred:', error.message);
    }
  });
```

## TypeScript Support

The Flatlayer JS SDK includes TypeScript definitions. You can import and use the SDK in your TypeScript projects without any additional setup.

```typescript
import Flatlayer from 'flatlayer-sdk';

const flatlayer: Flatlayer = new Flatlayer('https://api.yourflatlayerinstance.com');

interface BlogPost {
  title: string;
  content: string;
  author: string;
}

flatlayer.getEntry<BlogPost>('post', 'my-first-post')
        .then(post => {
          console.log(post.title);  // TypeScript knows this exists
          console.log(post.content);
          console.log(post.author);
        });
```

## Contributing

We welcome contributions to the Flatlayer JS SDK! Please see our [Contributing Guide](CONTRIBUTING.md) for more details on how to get started.

## License

The Flatlayer JS SDK is open-source software licensed under the [MIT license](LICENSE).