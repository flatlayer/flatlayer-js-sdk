# Advanced Usage and Error Handling

This guide covers advanced features of the Flatlayer SDK, including complex filtering, pagination, error handling, and TypeScript support.

## Using Filters

The Flatlayer SDK supports complex filtering operations to retrieve precise data sets. Here's an example of using advanced filters:

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

This filter will retrieve electronic products priced between $100 and $500, tagged as bestsellers, and made by either Apple or Samsung.

For more detailed information on filtering capabilities, refer to the [Advanced Filtering Guide](./advanced-filtering.md).

## Pagination

When dealing with large datasets, it's often necessary to retrieve data in pages. Here's an example of how to fetch all pages of a dataset using a recursive function:

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

Note: Be cautious when using this approach with very large datasets, as it may impact performance or exceed API rate limits.

## Error Handling

The Flatlayer SDK uses native Promises, allowing you to use `.catch()` for error handling. Here's an example:

```javascript
flatlayer.getEntry('post', 'non-existent-post')
  .then(post => console.log('Post:', post))
  .catch(error => {
    if (error instanceof FlatlayerError) {
      if (error.status === 404) {
        console.error('Post not found');
      } else {
        console.error(`API Error: ${error.message}`);
      }
    } else if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      console.error('Network error. Please check your internet connection.');
    } else {
      console.error('An unexpected error occurred:', error.message);
    }
  });
```

This example demonstrates how to handle different types of errors, including API-specific errors (using the `FlatlayerError` class), network errors, and unexpected errors.

## TypeScript Support

The Flatlayer SDK includes TypeScript definitions, allowing you to use it in TypeScript projects without additional setup. Here's an example:

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
  })
  .catch(error => {
    if (error instanceof FlatlayerError) {
      console.error(`API Error: ${error.message}`);
    } else {
      console.error('An unexpected error occurred:', error.message);
    }
  });
```

This example demonstrates type-safe usage of the SDK, including error handling with the `FlatlayerError` type.

## Performance Considerations

When working with large datasets or complex queries:

1. Use specific filters to narrow down the dataset before applying complex operations.
2. Implement pagination to retrieve data in manageable chunks.
3. Consider using the `fields` parameter to limit the data returned for each entry, reducing response size and improving query performance.

## Conclusion

By leveraging these advanced features and implementing proper error handling, you can create robust and efficient applications with the Flatlayer SDK. Remember to refer to the specific documentation for [Entry Retrieval](./entry-retrieval.md), [Search Functionality](./search.md), and [Image Handling](./image-handling.md) for more detailed information on these topics.