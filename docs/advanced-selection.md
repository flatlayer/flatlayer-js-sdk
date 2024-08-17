# Flatlayer SDK Advanced Selection Guide

## Introduction

The Flatlayer SDK offers powerful selection capabilities that allow you to retrieve specific data from your Flatlayer CMS efficiently. This guide will walk you through the various selection options available in the SDK, demonstrating how to construct complex queries using the Field Selection Language (FSL). Mastering these selection techniques will help you optimize your API requests and improve your application's performance.

## Basic Usage

To apply field selection in your SDK queries, use the `fields` option in methods like `getEntryList` or `getEntry`. Here's a basic example:

```javascript
flatlayer.getEntryList('post', {
  fields: ['title', 'author', 'published_at']
})
  .then(response => console.log('Selected post fields:', response.data))
  .catch(error => console.error('Error:', error));
```

This will retrieve only the title, author, and publication date for each post. For more information on retrieving entries, see the [Entry Retrieval Guide](./entry-retrieval.md).

## Field Selection Techniques

### Simple Field Selection

To select specific fields:

```javascript
const fields = ['title', 'content', 'author'];

flatlayer.getEntry('post', 'my-first-post', fields)
  .then(post => console.log('Selected post data:', post))
  .catch(error => console.error('Error:', error));
```

### Nested Field Selection

For nested objects, use dot notation:

```javascript
const fields = ['title', 'author.name', 'author.email'];

flatlayer.getEntry('post', 'my-first-post', fields)
  .then(post => console.log('Post with author details:', post))
  .catch(error => console.error('Error:', error));
```

### Array Field Selection

To select specific fields from array items:

```javascript
const fields = ['title', 'comments.*.author', 'comments.*.content'];

flatlayer.getEntry('post', 'my-first-post', fields)
  .then(post => console.log('Post with comment details:', post))
  .catch(error => console.error('Error:', error));
```

### Wildcard Selection

Use `*` to select all fields at a certain level:

```javascript
const fields = ['title', 'author.*'];

flatlayer.getEntry('post', 'my-first-post', fields)
  .then(post => console.log('Post with all author fields:', post))
  .catch(error => console.error('Error:', error));
```

### Exclusion

To exclude specific fields, prefix them with a minus sign:

```javascript
const fields = ['*', '-content', '-comments'];

flatlayer.getEntry('post', 'my-first-post', fields)
  .then(post => console.log('Post without content and comments:', post))
  .catch(error => console.error('Error:', error));
```

## Advanced Selection Techniques

### Conditional Selection

Some APIs support conditional selection. Check your Flatlayer API documentation for support:

```javascript
const fields = ['title', 'content@length>100'];

flatlayer.getEntryList('post', { fields })
  .then(response => console.log('Posts with long content:', response.data))
  .catch(error => console.error('Error:', error));
```

### Aliasing

To rename fields in the response:

```javascript
const fields = ['title', 'author.name as authorName'];

flatlayer.getEntry('post', 'my-first-post', fields)
  .then(post => console.log('Post with aliased author name:', post))
  .catch(error => console.error('Error:', error));
```

### Combining with Filters

You can combine field selection with filters for more precise queries:

```javascript
const query = {
  fields: ['title', 'author', 'published_at'],
  filter: {
    status: 'published',
    'author.name': 'John Doe'
  }
};

flatlayer.getEntryList('post', query)
  .then(response => console.log('Filtered and selected posts:', response.data))
  .catch(error => console.error('Error:', error));
```

For more information on filtering, see the [Advanced Filtering Guide](./advanced-filtering.md).

## Performance Optimization

1. Select only the fields you need to reduce response size and improve query performance.
2. Be cautious with wildcard selections on large datasets or complex object structures.
3. When selecting nested fields, consider the depth of the nesting and its impact on query performance.
4. Use field selection in combination with pagination for large datasets:

```javascript
async function getAllPostTitles() {
  let page = 1;
  let allTitles = [];
  let hasMorePages = true;

  while (hasMorePages) {
    const response = await flatlayer.getEntryList('post', {
      fields: ['title'],
      page,
      perPage: 100
    });
    allTitles = allTitles.concat(response.data.map(post => post.title));
    hasMorePages = response.current_page < response.last_page;
    page++;
  }

  return allTitles;
}

getAllPostTitles()
  .then(titles => console.log('All post titles:', titles))
  .catch(error => console.error('Error fetching post titles:', error));
```

For more performance optimization techniques, see the [Advanced Usage Guide](./advanced.md).

## Error Handling

Always implement error handling in your field selection operations:

```javascript
flatlayer.getEntryList('post', {
  fields: ['title', 'nonexistent_field']
})
  .then(response => console.log('Selected post fields:', response.data))
  .catch(error => {
    if (error instanceof FlatlayerError) {
      if (error.message.includes('Invalid field selection')) {
        console.error('Field selection error:', error.message);
      } else {
        console.error('API Error:', error.message);
      }
    } else {
      console.error('An unexpected error occurred:', error.message);
    }
  });
```

For more information on error handling, refer to the [Error Handling section](./advanced.md#error-handling) in the Advanced Usage Guide.

## Combining Selection with Search

You can use field selection in combination with search functionality:

```javascript
flatlayer.search('JavaScript', 'post', {
  fields: ['title', 'excerpt', 'author.name'],
  page: 1,
  perPage: 20
})
  .then(results => {
    console.log('Search results:', results.data);
    console.log('Total results:', results.total);
  })
  .catch(error => console.error('Error performing search:', error));
```

For more information on search functionality, see the [Search Functionality Guide](./search.md).

## Field Selection with Image Handling

When working with image fields, you can select specific image attributes:

```javascript
const fields = ['title', 'featured_image.url', 'featured_image.alt'];

flatlayer.getEntry('post', 'my-image-post', fields)
  .then(post => {
    console.log('Post title:', post.title);
    console.log('Featured image URL:', post.featured_image.url);
    console.log('Featured image alt text:', post.featured_image.alt);
  })
  .catch(error => console.error('Error:', error));
```

For more information on image handling, refer to the [Image Handling Guide](./image-handling.md).

## Conclusion

The Flatlayer SDK's field selection capabilities provide a flexible and powerful way to retrieve precisely the data you need from your CMS. By mastering these selection techniques, you can optimize your queries for both performance and specificity. Remember to balance the complexity of your selections with performance considerations, and always implement proper error handling in your code.

For more advanced topics and best practices, refer to the following guides:
- [Advanced Usage Guide](./advanced.md)
- [Entry Retrieval Guide](./entry-retrieval.md)
- [Advanced Filtering Guide](./advanced-filtering.md)
- [Search Functionality Guide](./search.md)
- [Image Handling Guide](./image-handling.md)