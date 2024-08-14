<script>
    import { onMount } from 'svelte';
    import { thumbHashToDataURL } from 'thumbhash';
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
    let shouldAnimate = false;
    let imageElement;

    $: {
        flatlayerImage = new FlatlayerImage(baseUrl, imageData, defaultTransforms, breakpoints, imageEndpoint);
        imgAttributes = flatlayerImage.generateImgAttributes(sizes, {
            ...attributes,
            loading: lazyLoad ? 'lazy' : 'eager',
        }, isFluid, displaySize);
    }

    onMount(() => {
        if (imageData.thumbhash) {
            const thumbhashBytes = atob(imageData.thumbhash).split('').map(c => c.charCodeAt(0));
            thumbhashUrl = thumbHashToDataURL(new Uint8Array(thumbhashBytes));
        }

        // Check if the image is already cached
        if (imageElement.complete && false) {
            imageLoaded = true;
        } else {
            // If not cached, set up the load event and timeout
            const loadTimeout = setTimeout(() => {
                if (!imageLoaded) {
                    shouldAnimate = true;
                }
            }, 75);

            imageElement.onload = () => {
                clearTimeout(loadTimeout);
                imageLoaded = true;
                if (shouldAnimate) {
                    // Only animate if the timeout has already passed
                    imageElement.classList.add('animate');
                }
            };
        }
    });
</script>

<div class="flatlayer-image-wrapper {$$restProps.class || ''}"
     style="--blur-radius: {blurRadius}px; background-image: url({thumbhashUrl}); background-size: cover;">
    <img
            {...imgAttributes}
            alt={flatlayerImage.getAlt()}
            class:imageLoaded
            bind:this={imageElement}
    />
</div>

<style>
    .flatlayer-image-wrapper {
        position: relative;
        overflow: hidden;
        background-position: center center;
        background-size: cover;
        background-color: #f0f0f0;
    }

    img {
        position: relative;
        z-index: 1;
        width: 100%;
        height: auto;
        display: block;
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