## Advanced Usage and Error Handling

### Using Filters

The Flatlayer SDK supports complex filtering operations. Here's an example of using advanced filters:

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

### Pagination

To retrieve all pages of a large dataset, you can use a recursive function:

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

### Error Handling

The SDK uses native Promises, so you can use `.catch()` to handle errors:

```javascript
flatlayer.getEntry('post', 'non-existent-post')
  .then(post => console.log('Post:', post))
  .catch(error => {
    if (error.message.includes('404')) {
      console.error('Post not found');
    } else {
      console.error('An error occurred:', error.message);
    }
  });
```

### TypeScript Support

The Flatlayer SDK includes TypeScript definitions. You can import and use the SDK in your TypeScript projects without any additional setup:

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

By leveraging these advanced features and proper error handling, you can create robust and efficient applications with the Flatlayer SDK.