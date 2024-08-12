# Flatlayer

A comprehensive JavaScript library for interacting with the Flatlayer CMS API.

## Installation

```bash
npm install flatlayer
```

## Usage

```javascript
import Flatlayer from 'flatlayer';

const cms = new Flatlayer('https://api.flatlayer.com');

// Use the cms object to interact with the API
cms.getContentList('post').then(posts => {
  console.log(posts);
});
```

For more detailed usage instructions, please refer to the [documentation](link-to-your-documentation).

## License

MIT
