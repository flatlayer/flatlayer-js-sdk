<script>
    import { onMount } from 'svelte';
    import { decode } from 'thumbhash';
    import FlatlayerImage from '../flatlayer-image';

    export let baseUrl;
    export let imageData;
    export let defaultTransforms = {};
    export let breakpoints = {};
    export let imageEndpoint = null;
    export let sizes = ['100vw'];
    export let attributes = {};
    export let isFluid = true;
    export let displaySize = null;

    let flatlayerImage;
    let imgAttributes;
    let thumbhashUrl = '';

    $: {
        flatlayerImage = new FlatlayerImage(baseUrl, imageData, defaultTransforms, breakpoints, imageEndpoint);
        imgAttributes = flatlayerImage.generateImgAttributes(sizes, attributes, isFluid, displaySize);
    }

    onMount(() => {
        if (imageData.thumbhash) {
            const rgba = decode(imageData.thumbhash);
            const imageData = new ImageData(rgba, 32, 32);
            const canvas = document.createElement('canvas');
            canvas.width = 32;
            canvas.height = 32;
            const ctx = canvas.getContext('2d');
            ctx.putImageData(imageData, 0, 0);
            thumbhashUrl = canvas.toDataURL();
        }
    });
</script>

<div class="flatlayer-image-wrapper" style={imageData.thumbhash ? `background-image: url(${thumbhashUrl}); background-size: cover;` : ''}>
    <img {...imgAttributes} />
</div>

<style>
    .flatlayer-image-wrapper {
        position: relative;
        overflow: hidden;
    }

    .flatlayer-image-wrapper img {
        position: relative;
        z-index: 1;
        width: 100%;
        height: auto;
        display: block;
    }
</style>