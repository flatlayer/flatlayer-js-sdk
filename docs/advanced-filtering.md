# Flatlayer SDK Advanced Filtering Guide

## Introduction

The Flatlayer SDK offers powerful filtering capabilities to retrieve precise data from your Flatlayer CMS. This guide demonstrates how to construct complex queries using the Filter Query Language (FQL) with correct JavaScript syntax.

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

### String Operations

Use `$like` for pattern matching (similar to SQL LIKE):

```javascript
const filter = {
  title: { $like: '%JavaScript%' }
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

## Error Handling

Always use proper error handling:

```javascript
flatlayer.getEntryList('post', { filter: complexFilter })
  .then(response => console.log('Filtered posts:', response.data))
  .catch(error => {
    if (error.message.includes('Invalid filter syntax')) {
      console.error('Filter syntax error:', error.message);
    } else {
      console.error('An error occurred:', error.message);
    }
  });
```

## Conclusion

The Flatlayer SDK's filtering capabilities allow for precise and flexible data querying. By mastering these techniques, you can create efficient queries tailored to your application's needs. Remember to balance filter complexity with performance considerations and implement proper error handling.