# Flatlayer SDK Advanced Filtering Guide

## Introduction

The Flatlayer SDK provides powerful filtering capabilities to retrieve precise data from your Flatlayer CMS. This guide demonstrates how to construct complex queries using the Filter Query Language (FQL) with correct JavaScript syntax. Mastering these filtering techniques will allow you to create efficient and tailored queries for your application needs.

## Basic Usage

To apply filters in your SDK queries, use the `filter` option in methods like `getEntryList` or `search`:

```javascript
flatlayer.getEntryList('post', {
  filter: {
    status: 'published',
    author: 'John Doe'
  }
})
  .then(response => console.log('Published posts by John Doe:', response.data))
  .catch(error => console.error('Error:', error));
```

For more information on retrieving entries, see the [Entry Retrieval Guide](./entry-retrieval.md).

## Field Filters

### Equality

To filter for an exact match on a field:

```javascript
const filter = {
  title: 'My First Blog Post'
};
```

### Comparison Operators

For numeric or date fields, use comparison operators:

```javascript
const filter = {
  views: { $gte: 1000, $lt: 5000 },
  published_at: { $gt: '2023-01-01' }
};
```

Available comparison operators:
- `$eq`: Equal to
- `$ne`: Not equal to
- `$gt`: Greater than
- `$gte`: Greater than or equal to
- `$lt`: Less than
- `$lte`: Less than or equal to

### String Operations

Use `$like` for pattern matching (similar to SQL LIKE):

```javascript
const filter = {
  title: { $like: '%JavaScript%' }
};
```

You can also use `$ilike` for case-insensitive matching:

```javascript
const filter = {
  title: { $ilike: '%javascript%' }
};
```

### Array Operations

```javascript
const filter = {
  category: { $in: ['technology', 'programming'] },
  status: { $notIn: ['draft', 'archived'] }
};
```

### Existence Checks

```javascript
const filter = {
  featured_image: { $exists: true },
  deleted_at: { $notExists: true }
};
```

### Null Checks

```javascript
const filter = {
  last_comment_at: { $notNull: true }
};
```

### Range Queries

```javascript
const filter = {
  word_count: { $between: [500, 1000] },
  rating: { $notBetween: [0, 3] }
};
```

## JSON Field Queries

For JSON fields (like `meta`), use dot notation:

```javascript
const filter = {
  'meta.author.name': 'Jane Smith',
  'meta.tags': { $contains: 'javascript' }
};
```

## Logical Operators

### AND

```javascript
const filter = {
  $and: [
    { status: 'published' },
    { category: 'technology' },
    { views: { $gte: 1000 } }
  ]
};
```

### OR

```javascript
const filter = {
  $or: [
    { category: 'technology' },
    { category: 'programming' },
    { tags: { $contains: 'coding' } }
  ]
};
```

## Full-Text Search

```javascript
const filter = {
  $search: 'machine learning algorithms'
};
```

For more advanced search capabilities, refer to the [Search Functionality Guide](./search.md).

## Tag Filtering

```javascript
const filter = {
  $tags: ['javascript', 'react']
};
```

## Result Ordering

```javascript
const filter = {
  $order: {
    published_at: 'desc',
    title: 'asc'
  }
};
```

## Combining Filters

Here's an example of a complex query combining various filters:

```javascript
const complexFilter = {
  status: 'published',
  'meta.category': { $in: ['technology', 'programming'] },
  $search: 'machine learning',
  $tags: ['AI', 'data-science'],
  $or: [
    { author: 'John Doe' },
    { author: 'Jane Smith' }
  ],
  views: { $gte: 1000 },
  $order: {
    published_at: 'desc',
    title: 'asc'
  }
};

flatlayer.getEntryList('post', { filter: complexFilter })
  .then(response => console.log('Filtered posts:', response.data))
  .catch(error => console.error('Error:', error));
```

This query will:
1. Retrieve published posts
2. In the technology or programming categories
3. Containing "machine learning" in searchable fields
4. Tagged with either 'AI' or 'data-science'
5. Authored by either John Doe or Jane Smith
6. With at least 1000 views
7. Ordered by publish date (descending) and then by title (ascending)

## Filter Application Order

Filters are applied in this order:
1. Non-search filters (field filters, logical operators, tag filters)
2. The `$search` operator
3. Result ordering (`$order` specification)

## Performance Tips

1. Use specific field filters to narrow down the dataset before applying complex operations.
2. Avoid using `$search` on large datasets without other filters.
3. For JSON field queries, consider creating indexes on frequently queried properties.
4. Use the `fields` parameter to limit the data returned for each entry, reducing response size and improving query performance.

For more performance optimization techniques, see the [Advanced Usage Guide](./advanced.md).

## Error Handling

Always use proper error handling:

```javascript
flatlayer.getEntryList('post', { filter: complexFilter })
  .then(response => console.log('Filtered posts:', response.data))
  .catch(error => {
    if (error instanceof FlatlayerError) {
      if (error.message.includes('Invalid filter syntax')) {
        console.error('Filter syntax error:', error.message);
      } else {
        console.error('API Error:', error.message);
      }
    } else {
      console.error('An unexpected error occurred:', error.message);
    }
  });
```

For more information on error handling, refer to the [Error Handling section](./advanced.md#error-handling) in the Advanced Usage Guide.

## Pagination

When working with large datasets, it's important to use pagination to retrieve data in manageable chunks. Here's an example of how to use pagination with filters:

```javascript
async function getAllFilteredPosts(filter) {
  let page = 1;
  let allPosts = [];
  let hasMorePages = true;

  while (hasMorePages) {
    const response = await flatlayer.getEntryList('post', { 
      filter, 
      page, 
      perPage: 100 
    });
    allPosts = allPosts.concat(response.data);
    hasMorePages = response.current_page < response.last_page;
    page++;
  }

  return allPosts;
}

const filter = { category: 'technology', views: { $gte: 1000 } };
getAllFilteredPosts(filter)
  .then(posts => console.log('All filtered posts:', posts))
  .catch(error => console.error('Error fetching posts:', error));
```

For more information on pagination, see the [Pagination section](./advanced.md#pagination) in the Advanced Usage Guide.

## Conclusion

The Flatlayer SDK's filtering capabilities allow for precise and flexible data querying. By mastering these techniques, you can create efficient queries tailored to your application's needs. Remember to balance filter complexity with performance considerations and implement proper error handling.

For more advanced topics and best practices, refer to the following guides:
- [Advanced Usage Guide](./advanced.md)
- [Entry Retrieval Guide](./entry-retrieval.md)
- [Search Functionality Guide](./search.md)
- [Image Handling Guide](./image-handling.md)