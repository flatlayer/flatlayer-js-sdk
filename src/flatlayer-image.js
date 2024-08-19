import { thumbHashToDataURL } from 'thumbhash';

/**
 * FlatlayerImage class
 * Handles the generation of image attributes and URLs.
 * @class
 */
class FlatlayerImage {
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
        const defaultAttributes = {
            src: this.getUrl(this.getBaseTransforms(displaySize)),
            alt: this.getAlt(),
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