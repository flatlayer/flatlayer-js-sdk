/**
 * FlatlayerImage class
 * Handles the generation of responsive image attributes and URLs.
 */
class FlatlayerImage {
    static DECREMENT = 0.9; // 10% decrement
    static MIN_SIZE = 100;
    static MAX_SIZE = 8192;

    /**
     * Create a new FlatlayerImage instance.
     * @param {string} baseUrl - The base URL of the Flatlayer CMS API.
     * @param {Object} imageData - The image data object from the API.
     * @param {Object} [defaultTransforms={}] - Default transformation parameters.
     * @param {Object} [breakpoints={}] - Custom breakpoints for responsive sizes.
     * @param {string} [imageEndpoint=null] - Custom image endpoint URL.
     */
    constructor(baseUrl, imageData, defaultTransforms = {}, breakpoints = {}, imageEndpoint = null) {
        this.baseUrl = baseUrl;
        this.imageData = imageData;
        this.defaultTransforms = defaultTransforms;
        this.breakpoints = breakpoints || {
            sm: 640,
            md: 768,
            lg: 1024,
            xl: 1280,
            '2xl': 1536,
        };
        this.imageEndpoint = imageEndpoint || `${this.baseUrl}/image`;
    }

    /**
     * Generate an img tag with responsive attributes.
     * @param {Array} sizes - An array of size descriptors.
     * @param {Object} [attributes={}] - Additional HTML attributes for the img tag.
     * @param {boolean} [isFluid=true] - Whether to use fluid sizing.
     * @param {Array} [displaySize=null] - The intended display size [width, height].
     * @returns {Object} An object with responsive image attributes.
     */
    generateImgAttributes(sizes, attributes = {}, isFluid = true, displaySize = null) {
        const parsedSizes = this.parseSizes(sizes);
        const srcset = this.generateSrcset(isFluid, displaySize);
        const sizesAttribute = this.generateSizesAttribute(parsedSizes);

        const defaultAttributes = {
            src: this.getUrl(this.getBaseTransforms(displaySize)),
            alt: this.getAlt(),
            sizes: sizesAttribute,
            srcset: srcset,
            ...(displaySize ? { width: displaySize[0], height: displaySize[1] } : {}),
        };

        return { ...defaultAttributes, ...attributes };
    }

    /**
     * Get the alt text for the image.
     * @returns {string} The alt text.
     */
    getAlt() {
        return this.imageData.custom_properties?.alt || '';
    }

    /**
     * Parse size descriptors into a structured format.
     * @param {Array} sizes - An array of size descriptors.
     * @returns {Object} Parsed sizes object.
     */
    parseSizes(sizes) {
        return sizes.reduce((acc, size) => {
            if (size.includes(':')) {
                const [breakpoint, value] = size.split(':').map(s => s.trim());
                if (this.breakpoints[breakpoint]) {
                    acc[this.breakpoints[breakpoint]] = this.parseSize(value);
                }
            } else {
                acc[0] = this.parseSize(size);
            }
            return acc;
        }, {});
    }

    /**
     * Parse a single size descriptor.
     * @param {string} size - A size descriptor.
     * @returns {Object} Parsed size object.
     */
    parseSize(size) {
        if (size.includes('calc') || size.includes('-')) {
            const match = size.match(/(?:calc\()?(\d+)vw\s*-\s*(\d+)px(?:\))?/);
            if (match) {
                return { type: 'calc', vw: parseInt(match[1]), px: parseInt(match[2]) };
            }
        }

        if (size.endsWith('vw')) {
            return { type: 'vw', value: parseInt(size) };
        }

        if (size.endsWith('px')) {
            return { type: 'px', value: parseInt(size) };
        }

        throw new Error(`Invalid size format: ${size}`);
    }

    /**
     * Generate the srcset attribute.
     * @param {boolean} isFluid - Whether to use fluid sizing.
     * @param {Array} [displaySize=null] - The intended display size [width, height].
     * @returns {string} The srcset attribute value.
     */
    generateSrcset(isFluid, displaySize = null) {
        const maxWidth = this.getMediaWidth();
        let srcset = [];

        if (displaySize) {
            const [baseWidth, baseHeight] = displaySize;
            const aspectRatio = baseHeight / baseWidth;

            if (isFluid) {
                srcset = this.generateFluidSrcset(baseWidth, maxWidth, aspectRatio);
            } else {
                srcset = this.generateFixedSrcset(baseWidth, baseHeight, maxWidth);
            }
        } else {
            srcset = isFluid
                ? this.generateFluidSrcset(maxWidth, maxWidth)
                : [this.formatSrcsetEntry(maxWidth)];
        }

        return srcset.filter((v, i, a) => a.indexOf(v) === i).join(', ');
    }

    /**
     * Generate srcset entries for fluid sizing.
     * @param {number} baseWidth - The base width for fluid sizing.
     * @param {number} maxWidth - The maximum allowed width.
     * @param {number} [aspectRatio=null] - The aspect ratio to maintain.
     * @returns {Array} Array of srcset entries.
     */
    generateFluidSrcset(baseWidth, maxWidth, aspectRatio = null) {
        const srcset = [];
        let currentWidth = Math.min(baseWidth * 2, maxWidth);

        while (currentWidth > FlatlayerImage.MIN_SIZE) {
            const currentHeight = aspectRatio ? Math.round(currentWidth * aspectRatio) : null;
            srcset.push(this.formatSrcsetEntry(currentWidth, currentHeight));
            currentWidth = Math.max(FlatlayerImage.MIN_SIZE, Math.floor(currentWidth * FlatlayerImage.DECREMENT));
        }

        if (aspectRatio && !srcset.some(entry => entry.startsWith(`${baseWidth}w`))) {
            srcset.push(this.formatSrcsetEntry(baseWidth, Math.round(baseWidth * aspectRatio)));
        }

        return srcset;
    }

    /**
     * Generate srcset entries for fixed sizing.
     * @param {number} baseWidth - The base width for fixed sizing.
     * @param {number} baseHeight - The base height for fixed sizing.
     * @param {number} maxWidth - The maximum allowed width.
     * @returns {Array} Array of srcset entries.
     */
    generateFixedSrcset(baseWidth, baseHeight, maxWidth) {
        const srcset = [this.formatSrcsetEntry(baseWidth, baseHeight)];
        const retinaWidth = Math.min(baseWidth * 2, maxWidth);

        if (retinaWidth > baseWidth) {
            const retinaHeight = Math.round(retinaWidth * (baseHeight / baseWidth));
            srcset.push(this.formatSrcsetEntry(retinaWidth, retinaHeight));
        }

        return srcset;
    }

    /**
     * Get the width of the media.
     * @returns {number} The width of the media.
     */
    getMediaWidth() {
        const dimensions = typeof this.imageData.dimensions === 'string'
            ? JSON.parse(this.imageData.dimensions)
            : this.imageData.dimensions;

        return dimensions?.width || 0;
    }

    /**
     * Format a single srcset entry.
     * @param {number} width - The width for the srcset entry.
     * @param {number} [height=null] - The height for the srcset entry.
     * @returns {string} A formatted srcset entry.
     */
    formatSrcsetEntry(width, height = null) {
        const transforms = { ...this.defaultTransforms, w: width, ...(height ? { h: height } : {}) };
        return `${this.getUrl(transforms)} ${width}w`;
    }

    /**
     * Generate the sizes attribute.
     * @param {Object} parsedSizes - The parsed sizes object.
     * @returns {string} The sizes attribute value.
     */
    generateSizesAttribute(parsedSizes) {
        return Object.entries(parsedSizes)
            .sort(([a], [b]) => Number(b) - Number(a))
            .map(([breakpoint, size]) =>
                breakpoint === '0'
                    ? this.formatSize(size)
                    : `(min-width: ${breakpoint}px) ${this.formatSize(size)}`
            )
            .join(', ');
    }

    /**
     * Format a single size for the sizes attribute.
     * @param {Object} size - The size object to format.
     * @returns {string} A formatted size string.
     */
    formatSize(size) {
        switch (size.type) {
            case 'px': return `${size.value}px`;
            case 'vw': return `${size.value}vw`;
            case 'calc': return `calc(${size.vw}vw - ${size.px}px)`;
            default: throw new Error(`Invalid size type: ${size.type}`);
        }
    }

    /**
     * Get the base transforms for the image.
     * @param {Array} [displaySize=null] - The intended display size [width, height].
     * @returns {Object} The base transforms object.
     */
    getBaseTransforms(displaySize) {
        return displaySize ? { w: displaySize[0], h: displaySize[1] } : {};
    }

    /**
     * Get the URL for the image with applied transforms.
     * @param {Object} [transforms={}] - The transforms to apply to the image.
     * @returns {string} The URL for the transformed image.
     */
    getUrl(transforms = {}) {
        const queryParams = new URLSearchParams(transforms).toString();
        return `${this.imageEndpoint}/${this.imageData.id}${queryParams ? `?${queryParams}` : ''}`;
    }
}

export default FlatlayerImage;