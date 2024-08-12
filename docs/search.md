## Search Functionality

The Flatlayer SDK provides a powerful search method to help you find relevant content across your entries.

### Performing a Search

To perform a search, use the `search` method:

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

Parameters:
- `query`: The search query string.
- `type`: (Optional) The entry type to search within.
- `options`: (Optional) An object containing query parameters (same as `getEntryList`).

### Advanced Filtering

The Flatlayer SDK supports advanced filtering capabilities. You can use these filters in both the `getEntryList` and `search` methods:

```javascript
const filter = {
  status: "published",
  "meta.category": { "$in": ["technology", "programming"] },
  "$tags": ["web-development"],
  "$order": {
    "published_at": "desc"
  }
};

flatlayer.getEntryList('post', { filter })
  .then(response => {
    console.log('Filtered posts:', response.data);
  })
  .catch(error => console.error('Error fetching filtered posts:', error));
```

This powerful filtering system allows you to create complex queries to retrieve exactly the content you need.

The search functionality in the Flatlayer SDK leverages the backend's AI-powered vector search capabilities, providing intelligent and relevant results based on the content of your entries.