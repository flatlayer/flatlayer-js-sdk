## Entry Retrieval

The Flatlayer SDK provides two main methods for retrieving entries: `getEntryList` for fetching multiple entries, and `getEntry` for retrieving a single entry by its slug.

### Fetching Multiple Entries

To retrieve a list of entries, use the `getEntryList` method:

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

Parameters:
- `type`: The type of entries to retrieve (e.g., 'post', 'page').
- `options`: (Optional) An object containing query parameters:
    - `page`: Page number (default: 1)
    - `perPage`: Number of entries per page (default: 15)
    - `filter`: Filter object
    - `fields`: Array of fields to include in the response
    - `search`: Search query string

### Retrieving a Single Entry

To fetch a single entry by its slug, use the `getEntry` method:

```javascript
flatlayer.getEntry('page', 'about-us', ['title', 'content', 'meta'])
  .then(page => {
    console.log('Page title:', page.title);
    console.log('Page content:', page.content);
    console.log('Page meta:', page.meta);
  })
  .catch(error => console.error('Error fetching page:', error));
```

Parameters:
- `type`: The type of entry to retrieve.
- `slug`: The slug of the entry.
- `fields`: (Optional) Array of fields to include in the response.

These methods allow you to efficiently retrieve the content you need from your Flatlayer CMS.