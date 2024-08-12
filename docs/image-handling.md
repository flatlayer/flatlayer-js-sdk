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

These image handling features allow you to easily work with responsive and optimized images in your Flatlayer-powered applications.