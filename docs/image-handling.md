## Image Handling

The Flatlayer SDK provides robust image handling capabilities through the `FlatlayerImage` class and related methods.

### Creating a FlatlayerImage Instance

To work with images, first create a `FlatlayerImage` instance:

```javascript
const imageData = {
    id: '12345',
    dimensions: { width: 1200, height: 800 },
    meta: { alt: 'A beautiful landscape' }
};

const flatlayerImage = flatlayer.createImage(imageData, { quality: 80 });
```

### Generating Responsive Image Attributes

You can generate responsive image attributes for use in an `<img>` tag:

```javascript
const imgAttributes = flatlayerImage.generateImgAttributes(
  ['100vw', 'md:50vw', 'lg:33vw'],
  { class: 'my-image' },
  true,
  [800, 600]
);

console.log('Responsive image attributes:', imgAttributes);
```

This method returns an object with attributes like `src`, `srcset`, `sizes`, and more, optimized for responsive design.

### Using in Frameworks

Here's an example of how to use the Flatlayer SDK's image handling in a Svelte component:

```svelte
<script>
import Flatlayer from 'flatlayer-sdk';

const flatlayer = new Flatlayer('https://api.yourflatlayerinstance.com');

export let imageData;
let imgAttributes;

$: {
  const flatlayerImage = flatlayer.createImage(imageData, { quality: 80 });
  imgAttributes = flatlayerImage.generateImgAttributes(
    ['100vw', 'md:50vw', 'lg:33vw'],
    { class: 'my-image' },
    true,
    [800, 600]
  );
}
</script>

<img {...imgAttributes} />
```

This creates a responsive image that adapts to different viewport sizes and device pixel ratios.

### Getting Image URLs

You can also get URLs for transformed images:

```javascript
const imageUrl = flatlayer.getImageUrl('image-id', {
  width: 800,
  height: 600,
  quality: 80,
  format: 'webp'
});

console.log('Transformed image URL:', imageUrl);
```

### FlatlayerImage Class Methods

The `FlatlayerImage` class includes several methods for handling responsive image sizes. Here's a detailed look at some key methods:

#### parseSizes(sizes: Array<string>): Object

This method parses an array of size descriptors into a structured format.

```javascript
const sizes = ['100vw', 'md:50vw', 'lg:33vw'];
const parsedSizes = flatlayerImage.parseSizes(sizes);
console.log(parsedSizes);
// Output:
// {
//   0: { type: 'vw', value: 100 },
//   768: { type: 'vw', value: 50 },
//   1024: { type: 'vw', value: 33 }
// }
```

#### parseSize(size: string): Object

This method parses a single size descriptor.

```javascript
console.log(flatlayerImage.parseSize('100vw'));
// Output: { type: 'vw', value: 100 }

console.log(flatlayerImage.parseSize('500px'));
// Output: { type: 'px', value: 500 }

console.log(flatlayerImage.parseSize('calc(100vw - 20px)'));
// Output: { type: 'calc', vw: 100, px: 20 }
```

#### formatSize(size: Object): string

This method formats a size object into a string representation.

```javascript
console.log(flatlayerImage.formatSize({ type: 'vw', value: 100 }));
// Output: '100vw'

console.log(flatlayerImage.formatSize({ type: 'px', value: 500 }));
// Output: '500px'

console.log(flatlayerImage.formatSize({ type: 'calc', vw: 100, px: 20 }));
// Output: 'calc(100vw - 20px)'
```

These methods are used internally by the `generateImgAttributes` method to handle responsive image sizing, but they can also be useful for advanced customization scenarios.

For example, you could use these methods to create custom size parsing logic:

```javascript
const customSizes = ['small:300px', 'medium:50vw', 'large:calc(100vw - 40px)'];
const parsedSizes = customSizes.map(size => {
  const [breakpoint, value] = size.split(':');
  return { breakpoint, size: flatlayerImage.parseSize(value) };
});
```

These image handling features allow you to easily work with responsive and optimized images in your Flatlayer-powered applications, providing fine-grained control over image sizing and responsiveness.