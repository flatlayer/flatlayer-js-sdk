# Flatlayer JS SDK

The Flatlayer JS SDK is a lightweight, easy-to-use JavaScript library for interacting with the Flatlayer CMS API. It provides a simple interface for retrieving entries, performing searches, and handling images in your Flatlayer-powered applications.

## Table of Contents

- [Installation](#installation)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
  - [Constructor](#constructor)
  - [Entry Retrieval](#entry-retrieval)
  - [Search](#search)
  - [Image Handling](#image-handling)
- [Examples](#examples)
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

To start using the Flatlayer JS SDK, you need to create an instance of the `Flatlayer` class with the base URL of your Flatlayer CMS API:

```javascript
import Flatlayer from 'flatlayer-sdk';

const flatlayer = new Flatlayer('https://api.yourflatlayerinstance.com');
```

Now you're ready to start interacting with your Flatlayer CMS!

## API Reference

### Constructor

```javascript
new Flatlayer(baseUrl: string)
```

Creates a new instance of the Flatlayer SDK.

- `baseUrl`: The base URL of your Flatlayer CMS API.

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

### Search

#### search(query: string, type?: string, options?: Object): Promise<Object>

Performs a search across entry types or within a specific type.

- `query`: The search query string.
- `type`: (Optional) The entry type to search within.
- `options`: (Optional) An object containing query parameters (same as `getEntryList`).

### Image Handling

(Image handling methods remain the same)

## Examples

### Fetching a list of blog posts

```javascript
const flatlayer = new Flatlayer('https://api.yourflatlayerinstance.com');

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

### Retrieving a single page by slug

```javascript
flatlayer.getEntry('page', 'about-us', ['title', 'content', 'meta'])
  .then(page => {
    console.log('Page title:', page.title);
    console.log('Page content:', page.content);
    console.log('Page meta:', page.meta);
  })
  .catch(error => console.error('Error fetching page:', error));
```

### Performing a search

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

### Generating a responsive image

```javascript
const image = {
  id: '12345',
  alt: 'A beautiful landscape'
};

const responsiveProps = flatlayer.getResponsiveImageProps(image, 
  ['100vw', 'md:50vw', 'lg:33vw'],
  {
    breakpoints: { md: 768, lg: 1024 },
    defaultImageParams: { quality: 80 },
    displaySize: [800, 600]
  }
);

console.log('Responsive image props:', responsiveProps);

// Use the props in your HTML
const imgTag = `<img src="${responsiveProps.src}" 
                     srcset="${responsiveProps.srcset}" 
                     sizes="${responsiveProps.sizes}" 
                     alt="${responsiveProps.alt}" 
                     width="${responsiveProps.width}" 
                     height="${responsiveProps.height}">`;
```

## Advanced Usage

### Using filters

The Flatlayer CMS supports advanced filtering options. Here's an example of using complex filters:

```javascript
flatlayer.getContentList('product', {
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

The SDK automatically handles pagination. You can easily navigate through pages:

```javascript
async function getAllPosts() {
  let page = 1;
  let allPosts = [];
  let hasMorePages = true;

  while (hasMorePages) {
    const response = await flatlayer.getContentList('post', { page, perPage: 100 });
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
flatlayer.getContentItem('post', 'non-existent-post')
  .then(post => console.log('Post:', post))
  .catch(error => {
    if (error.message.includes('404')) {
      console.error('Post not found');
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

flatlayer.getContentItem<BlogPost>('post', 'my-first-post')
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