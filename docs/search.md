# Search Functionality in Flatlayer SDK

## Introduction

The Flatlayer SDK provides powerful search capabilities to help you find relevant content across your entries. This guide will walk you through the process of performing searches, using advanced filtering, and leveraging the AI-powered vector search capabilities of the Flatlayer backend.

## Basic Search

To perform a basic search, use the `search` method:

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
  .catch(error => {
    if (error instanceof FlatlayerError) {
      console.error('API Error:', error.message);
    } else {
      console.error('An unexpected error occurred:', error.message);
    }
  });
```

### Parameters

- `query` (string): The search query string.
- `type` (string, optional): The entry type to search within (e.g., 'post', 'page'). If omitted, searches across all types.
- `options` (object, optional): An object containing query parameters:
    - `page` (number): Page number for pagination (default: 1)
    - `perPage` (number): Number of results per page (default: 15)
    - `fields` (array): Fields to include in the response
    - `filter` (object): Additional filters to apply to the search

For more information on pagination and entry retrieval, see the [Entry Retrieval Guide](./entry-retrieval.md).

## Advanced Filtering

The Flatlayer SDK supports advanced filtering capabilities that can be used with both the `search` method and the `getEntryList` method. These filters allow you to create complex queries to retrieve precisely the content you need.

Here's an example of using advanced filters with a search:

```javascript
const filter = {
  status: "published",
  "meta.category": { "$in": ["technology", "programming"] },
  "$tags": ["web-development"],
  "$order": {
    "published_at": "desc"
  }
};

flatlayer.search('JavaScript', 'post', {
  filter,
  fields: ['title', 'excerpt', 'author', 'published_at']
})
  .then(results => {
    console.log('Filtered search results:', results.data);
    console.log('Total results:', results.total);
  })
  .catch(error => console.error('Error performing filtered search:', error));
```

This search will:
1. Find entries containing "JavaScript"
2. Only include published posts
3. Filter for posts in the "technology" or "programming" categories
4. Include only posts tagged with "web-development"
5. Order results by publish date in descending order

For a comprehensive guide on filtering, including all available operators and complex query structures, see the [Advanced Filtering Guide](./advanced-filtering.md).

## AI-Powered Vector Search

The search functionality in the Flatlayer SDK leverages the backend's AI-powered vector search capabilities. This provides intelligent and relevant results based on the semantic content of your entries, not just exact keyword matches.

To take full advantage of this feature:

1. Use natural language in your search queries.
2. Combine the search with filters for more precise results.
3. Experiment with different search terms to find the most effective queries for your content.

## Combining Search with Field Selection

You can combine the search functionality with field selection to optimize your API requests:

```javascript
flatlayer.search('machine learning', 'post', {
  fields: ['title', 'excerpt', 'author.name', 'published_at'],
  filter: {
    status: 'published',
    "$tags": ['AI', 'data-science']
  }
})
  .then(results => {
    console.log('Search results:', results.data);
  })
  .catch(error => console.error('Error performing search:', error));
```

This example searches for "machine learning" in published posts tagged with 'AI' or 'data-science', returning only the specified fields.

For more information on field selection, see the [Advanced Selection Guide](./advanced-selection.md).

## Handling Search Results

When working with search results, you might want to implement features like highlighting or summarization. Here's an example of how you might process search results:

```javascript
function highlightSearchTerm(text, term) {
  const regex = new RegExp(`(${term})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

flatlayer.search('JavaScript', 'post')
  .then(results => {
    const processedResults = results.data.map(post => ({
      ...post,
      title: highlightSearchTerm(post.title, 'JavaScript'),
      excerpt: highlightSearchTerm(post.excerpt, 'JavaScript')
    }));
    console.log('Processed results:', processedResults);
  })
  .catch(error => console.error('Error processing search results:', error));
```

## Implementing Pagination for Search Results

For large result sets, implement pagination to improve performance and user experience:

```javascript
async function searchAllPages(query, type, options = {}) {
  let allResults = [];
  let page = 1;
  let hasMorePages = true;

  while (hasMorePages) {
    try {
      const results = await flatlayer.search(query, type, { ...options, page });
      allResults = allResults.concat(results.data);
      hasMorePages = results.current_page < results.last_page;
      page++;
    } catch (error) {
      console.error('Error fetching search results:', error);
      break;
    }
  }

  return allResults;
}

searchAllPages('JavaScript', 'post', { perPage: 50 })
  .then(results => console.log('All search results:', results))
  .catch(error => console.error('Error searching all pages:', error));
```

For more information on handling large datasets, see the [Advanced Usage Guide](./advanced.md).

## Error Handling

When performing searches, it's important to handle potential errors:

```javascript
flatlayer.search('JavaScript', 'post')
  .then(results => {
    console.log('Search results:', results.data);
  })
  .catch(error => {
    if (error instanceof FlatlayerError) {
      if (error.status === 400) {
        console.error('Invalid search query:', error.message);
      } else {
        console.error('API Error:', error.message);
      }
    } else {
      console.error('An unexpected error occurred:', error.message);
    }
  });
```

For more information on error handling, refer to the [Error Handling section](./advanced.md#error-handling) in the Advanced Usage Guide.

## Performance Considerations

1. Use specific filters to narrow down the search scope and improve query performance.
2. Implement pagination to retrieve search results in manageable chunks.
3. Use field selection to limit the data returned for each entry, reducing response size.
4. Consider caching frequently used search results to reduce API calls.

For more performance optimization techniques, see the [Advanced Usage Guide](./advanced.md).

## Conclusion

The search functionality in the Flatlayer SDK provides a powerful tool for finding and retrieving relevant content from your Flatlayer CMS. By combining the AI-powered search capabilities with advanced filtering and field selection, you can create sophisticated and efficient search features in your applications.

For more information on related topics, check out these guides:
- [Entry Retrieval Guide](./entry-retrieval.md)
- [Advanced Filtering Guide](./advanced-filtering.md)
- [Advanced Selection Guide](./advanced-selection.md)
- [Advanced Usage Guide](./advanced.md)
- [Image Handling Guide](./image-handling.md) (for working with images in search results)