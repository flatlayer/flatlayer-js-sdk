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
    let imageLoaded = false;
    let shouldAnimate = false;
    let willAnimate = false;
    let imageElement;

    function getThumbhashUrl(thumbhash) {
        if (!thumbhash) return '';
        const thumbhashBytes = atob(thumbhash).split('').map(c => c.charCodeAt(0));
        return thumbHashToDataURL(new Uint8Array(thumbhashBytes));
    }

    $: thumbhashUrl = getThumbhashUrl(imageData.thumbhash);

    $: {
        flatlayerImage = new FlatlayerImage(baseUrl, imageData, defaultTransforms, breakpoints, imageEndpoint);
        imgAttributes = flatlayerImage.generateImgAttributes(sizes, {
            ...attributes,
            loading: lazyLoad ? 'lazy' : 'eager',
        }, isFluid, displaySize);
    }

    onMount(() => {
        if (imageElement.complete) {
            imageLoaded = true;
        } else {
            const loadTimeout = setTimeout(() => {
                if (!imageLoaded) {
                    shouldAnimate = true;
                    willAnimate = true;
                }
            }, 75);

            imageElement.onload = () => {
                clearTimeout(loadTimeout);
                imageLoaded = true;
                if (shouldAnimate) {
                    willAnimate = false;
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
            class:will-animate={willAnimate}
            class:animate={imageLoaded && shouldAnimate}
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

    .will-animate {
        opacity: 0;
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