import { thumbHashToDataURL } from 'thumbhash';

/**
 * FlatlayerImage class
 * Handles the generation of image attributes and URLs.
 * @class
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
     * @param {string|null} [imageEndpoint=null] - Custom image endpoint URL.
     */
    constructor(baseUrl, imageData, defaultTransforms = {}, imageEndpoint = null) {
        this.baseUrl = baseUrl;
        this.imageData = imageData;
        this.defaultTransforms = defaultTransforms;
        this.defaultQuality = defaultTransforms.q || 80;
        delete this.defaultTransforms.q;
        this.imageEndpoint = imageEndpoint || `${this.baseUrl}/image`;
    }

    /**
     * Generate an img tag with attributes.
     * @param {Object} [attributes={}] - Additional HTML attributes for the img tag.
     * @param {Array<number>|null} [displaySize=null] - The intended display size [width, height].
     * @returns {Object} An object with image attributes.
     */
    generateImgAttributes(attributes = {}, displaySize = null) {
        const srcset = this.generateSrcset(true, displaySize);

        const defaultAttributes = {
            src: this.getUrl(this.getBaseTransforms(displaySize)),
            alt: this.getAlt(),
            srcset: srcset,
            ...this.getDimensions(displaySize)
        };

        return { ...defaultAttributes, ...attributes };
    }

    /**
     * Get the dimensions of the image.
     * @param {Array<number>|null} displaySize - The intended display size [width, height].
     * @returns {Object} An object containing width and height, or an empty object if dimensions are not available.
     */
    getDimensions(displaySize) {
        if (displaySize) {
            return { width: displaySize[0], height: displaySize[1] };
        } else if (this.imageData.width && this.imageData.height) {
            return { width: this.imageData.width, height: this.imageData.height };
        }
        return {};
    }

    /**
     * Get the alt text for the image.
     * @returns {string} The alt text.
     */
    getAlt() {
        if (this.imageData.meta?.alt) {
            return this.imageData.meta.alt;
        }
        if (typeof this.imageData.filename === 'string') {
            const parts = this.imageData.filename.split('.');
            return parts.length > 1 ? parts.slice(0, -1).join('.') : this.imageData.filename;
        }
        if (this.imageData.id) {
            return `Image ${this.imageData.id}`;
        }
        return 'Image';
    }

    /**
     * Generate the srcset attribute.
     * @param {boolean} isFluid - Whether to use fluid sizing.
     * @param {Array<number>|null} [displaySize=null] - The intended display size [width, height].
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
        } else if (maxWidth > 0) {
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
     * @param {number|null} [aspectRatio=null] - The aspect ratio to maintain.
     * @returns {Array<string>} Array of srcset entries.
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
     * @returns {Array<string>} Array of srcset entries.
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
     * Get the width of the image.
     * @returns {number} The width of the image.
     */
    getMediaWidth() {
        return parseInt(this.imageData.width, 10) || 0;
    }

    /**
     * Get the height of the image.
     * @returns {number} The height of the image.
     */
    getMediaHeight() {
        return parseInt(this.imageData.height, 10) || 0;
    }

    /**
     * Format a single srcset entry.
     * @param {number} width - The width for the srcset entry.
     * @param {number|null} [height=null] - The height for the srcset entry.
     * @returns {string} A formatted srcset entry.
     */
    formatSrcsetEntry(width, height = null) {
        const transforms = { ...this.defaultTransforms, w: width, ...(height ? { h: height } : {}) };
        return `${this.getUrl(transforms)} ${width}w`;
    }

    /**
     * Get the base transforms for the image.
     * @param {Array<number>|null} [displaySize=null] - The intended display size [width, height].
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
        const allTransforms = { ...this.defaultTransforms, ...transforms };

        // Only add quality if there are other transforms or if it's explicitly set
        if (Object.keys(allTransforms).length > 0 || transforms.q) {
            allTransforms.q = transforms.q || this.defaultQuality;
        }

        // Determine the file extension
        let extension = allTransforms.fm || this.imageData.extension || 'jpg';

        const queryParams = new URLSearchParams(allTransforms).toString();
        return `${this.imageEndpoint}/${this.imageData.id}.${extension}${queryParams ? `?${queryParams}` : ''}`;
    }

    /**
     * Get the thumbhash data URL for the image.
     * @returns {string} The data URL for the thumbhash, or an empty string if no thumbhash is available.
     */
    getThumbhashDataUrl() {
        if (!this._thumbhashDataUrl) {
            if (this.imageData.thumbhash) {
                const thumbhashBytes = atob(this.imageData.thumbhash).split('').map(c => c.charCodeAt(0));
                this._thumbhashDataUrl = thumbHashToDataURL(new Uint8Array(thumbhashBytes));
            } else {
                this._thumbhashDataUrl = '';
            }
        }
        return this._thumbhashDataUrl;
    }
}

export default FlatlayerImage;