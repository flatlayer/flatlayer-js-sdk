# Flatlayer SDK Advanced Selection Guide

## Introduction

The Flatlayer SDK provides powerful selection capabilities that allow you to retrieve specific data from your Flatlayer CMS. This guide will walk you through the various selection options available in the SDK, demonstrating how to construct complex queries using the Field Selection Language (FSL).

## Basic Usage

To apply field selection in your SDK queries, use the `fields` option in methods like `getEntryList` or `getEntry`. Here's a basic example:

```javascript
flatlayer.getEntryList('post', {
  fields: ['title', 'author', 'published_at']
})
  .then(response => console.log('Selected post fields:', response.data))
  .catch(error => console.error('Error:', error));
```

This will retrieve only the title, author, and publication date for each post.

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

## Performance Considerations

1. Select only the fields you need to reduce response size and improve query performance.
2. Be cautious with wildcard selections on large datasets or complex object structures.
3. When selecting nested fields, consider the depth of the nesting and its impact on query performance.

## Error Handling

Always implement error handling in your field selection operations:

```javascript
flatlayer.getEntryList('post', {
  fields: ['title', 'nonexistent_field']
})
  .then(response => console.log('Selected post fields:', response.data))
  .catch(error => {
    if (error.message.includes('Invalid field selection')) {
      console.error('Field selection error:', error.message);
    } else {
      console.error('An error occurred:', error.message);
    }
  });
```

## Conclusion

The Flatlayer SDK's field selection capabilities provide a flexible way to retrieve precisely the data you need from your CMS. By mastering these selection techniques, you can optimize your queries for both performance and specificity. Remember to balance the complexity of your selections with performance considerations, and always implement proper error handling in your code.