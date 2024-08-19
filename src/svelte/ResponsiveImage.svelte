<script>
    import FlatlayerImage from '../flatlayer-image';
    import { onMount, createEventDispatcher } from 'svelte';
    import { PUBLIC_FLATLAYER_ENDPOINT } from "$env/static/public";

    // Props
    export let baseUrl = PUBLIC_FLATLAYER_ENDPOINT;
    export let imageData = undefined;
    export let defaultTransforms = {};
    export let imageEndpoint = null;
    export let sizes = '100vw'; // Changed to string
    export let attributes = {};
    export const isFluid = true;
    export let displaySize = false;
    export let lazyLoad = true;
    export let blurRadius = 40;
    export let alt = undefined;
    export let title = undefined;
    export let fallbackSrc = undefined;

    // Local state
    let flatlayerImage;
    let imgAttributes;
    let imageLoaded = false;
    let shouldAnimate = false;
    let willAnimate = false;
    let imageElement;
    let thumbhashUrl = '';
    let error = false;

    const dispatch = createEventDispatcher();

    $: {
        if (imageData) {
            flatlayerImage = new FlatlayerImage(
                baseUrl,
                imageData,
                defaultTransforms,
                imageEndpoint
            );
            thumbhashUrl = flatlayerImage.getThumbhashDataUrl();
        }
    }

    $: if (flatlayerImage) {
        imgAttributes = flatlayerImage.generateImgAttributes(
            {
                ...attributes,
                loading: lazyLoad ? 'lazy' : 'eager',
                sizes, // Add sizes attribute here
            },
            displaySize
        );
    }

    function handleImageLoad() {
        imageLoaded = true;
        if (shouldAnimate) {
            willAnimate = false;
        }
        dispatch('load');
    }

    function handleImageError() {
        error = true;
        dispatch('error');
    }

    onMount(() => {
        if (imageElement.complete) {
            handleImageLoad();
        } else {
            const loadTimeout = setTimeout(() => {
                if (!imageLoaded) {
                    shouldAnimate = true;
                    willAnimate = true;
                }
            }, 75);

            imageElement.onload = () => {
                clearTimeout(loadTimeout);
                handleImageLoad();
            };

            imageElement.onerror = handleImageError;
        }

        return () => {
            if (imageElement) {
                imageElement.onload = null;
                imageElement.onerror = null;
            }
        };
    });
</script>

{#if imageData}
    <div class="flatlayer-image-wrapper {$$restProps.class || ''}"
         style="--blur-radius: {blurRadius}px; background-image: url({thumbhashUrl}); background-size: cover;">
        <img
                {...imgAttributes}
                alt={alt || flatlayerImage.getAlt()}
                {title}
                class:imageLoaded
                class:will-animate={willAnimate}
                class:animate={imageLoaded && shouldAnimate}
                on:load={handleImageLoad}
                on:error={handleImageError}
                bind:this={imageElement}
        />
        {#if error && fallbackSrc}
            <img
                    src={fallbackSrc}
                    alt={alt || "Fallback image"}
                    class="fallback-image"
            />
        {/if}
    </div>
{/if}

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
        margin: 0 !important;
    }

    .will-animate {
        opacity: 0;
    }

    .animate {
        animation: fadeInBlurOut 0.3s ease-in-out forwards;
    }

    .fallback-image {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
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