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
    export let lazyLoad = true;
    export let blurRadius = 40;

    let flatlayerImage;
    let imgAttributes;
    let thumbhashUrl = '';
    let imageLoaded = false;
    let animate = false;

    $: {
        flatlayerImage = new FlatlayerImage(baseUrl, imageData, defaultTransforms, breakpoints, imageEndpoint);
        imgAttributes = flatlayerImage.generateImgAttributes(sizes, {
            ...attributes,
            loading: lazyLoad ? 'lazy' : 'eager',
            onload: () => handleImageLoad()
        }, isFluid, displaySize);
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

        // Give a short leeway for the image to load from memory
        setTimeout(() => {
            if (!imageLoaded) {
                animate = true;
            }
        }, 75);
    });

    function handleImageLoad() {
        imageLoaded = true;
    }
</script>

<div class="flatlayer-image-wrapper" style="--blur-radius: {blurRadius}px; background-image: url({thumbhashUrl}); background-size: cover;">
    <img
            {...imgAttributes}
            alt={flatlayerImage.getAlt()}
            class:animate
            class:imageLoaded
    />
</div>

<style>
    .flatlayer-image-wrapper {
        position: relative;
        overflow: hidden;
        background-color: #f0f0f0; /* Light grey placeholder */
    }

    img {
        position: relative;
        z-index: 1;
        width: 100%;
        height: auto;
        display: block;
        opacity: 0;
        transition: opacity 0.3s ease-in;
    }

    .imageLoaded {
        opacity: 1;
    }

    .animate {
        animation: fadeInBlurOut 0.3s ease-in-out forwards;
    }

    @keyframes fadeInBlurOut {
        0% {
            opacity: 0;
            filter: blur(var(--blur-radius));
        }
        100% {
            opacity: 1;
            filter: blur(0);
        }
    }
</style>