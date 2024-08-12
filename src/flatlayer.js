import FlatlayerImage from './flatlayer-image.js';

/**
 * flatlayer.js
 * A JavaScript SDK for interacting with the Flatlayer CMS API.
 * Focused on content retrieval, searching, and image handling.
 */
class Flatlayer {
    /**
     * Create a new Flatlayer instance.
     * @param {string} baseUrl - The base URL of the Flatlayer CMS API.
     * @param {string} [imageEndpoint] - The base URL for image endpoints. If not provided, it defaults to `${baseUrl}/image`.
     */
    constructor(baseUrl, imageEndpoint = null) {
        this.baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
        this.imageEndpoint = imageEndpoint || `${this.baseUrl}/image`;
    }

    /**
     * Send a request to the API with error handling.
     * @param {string} url - The full URL to fetch from.
     * @param {Object} options - Fetch options.
     * @returns {Promise<Object>} The JSON response from the API.
     * @throws {Error} If the response is not ok.
     * @private
     */
    async _request(url, options = {}) {
        const response = await fetch(url, options);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        return response.json();
    }

    /**
     * Build a URL with query parameters.
     * @param {string} path - The API endpoint path.
     * @param {Object} params - The query parameters to include.
     * @returns {string} The complete URL with query parameters.
     * @private
     */
    _buildUrl(path, params = {}) {
        const url = new URL(`${this.baseUrl}${path}`);
        Object.entries(params).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                if (typeof value === 'object') {
                    url.searchParams.append(key, JSON.stringify(value));
                } else {
                    url.searchParams.append(key, value.toString());
                }
            }
        });
        return url.toString();
    }

    /**
     * Get a list of entries.
     * @param {string} type - The type of entry to retrieve (e.g., 'post', 'page').
     * @param {Object} options - Options for the request.
     * @param {number} [options.page=1] - The page number to retrieve.
     * @param {number} [options.perPage=15] - The number of entries per page.
     * @param {Object} [options.filter={}] - Filters to apply to the query.
     * @param {Array} [options.fields=[]] - Fields to include in the response.
     * @param {string} [options.search=null] - Search query to apply.
     * @returns {Promise<Object>} The paginated list of entries.
     */
    async getEntryList(type, options = {}) {
        const {
            page = 1,
            perPage = 15,
            filter = {},
            fields = [],
            search = null,
        } = options;

        const params = {
            page,
            per_page: perPage,
            filter: { ...filter },
            fields,
            search,
        };

        const url = this._buildUrl(`/content/${type}`, params);
        return this._request(url);
    }

    /**
     * Get a single entry by its slug.
     * @param {string} type - The type of entry to retrieve.
     * @param {string} slug - The slug of the entry.
     * @param {Array} [fields=[]] - Fields to include in the response.
     * @returns {Promise<Object>} The requested entry.
     */
    async getEntry(type, slug, fields = []) {
        const url = this._buildUrl(`/content/${type}/${slug}`, { fields });
        return this._request(url);
    }

    /**
     * Perform a search across entry types or within a specific type.
     * @param {string} query - The search query.
     * @param {string} [type=null] - The entry type to search within (optional).
     * @param {Object} options - Options for the search request.
     * @param {number} [options.page=1] - The page number to retrieve.
     * @param {number} [options.perPage=15] - The number of entries per page.
     * @param {Object} [options.filter={}] - Additional filters to apply.
     * @param {Array} [options.fields=[]] - Fields to include in the response.
     * @returns {Promise<Object>} The search results.
     */
    async search(query, type = null, options = {}) {
        const {
            page = 1,
            perPage = 15,
            filter = {},
            fields = [],
        } = options;

        const params = {
            page,
            per_page: perPage,
            filter: { ...filter, $search: query },
            fields,
        };

        const url = this._buildUrl(`/content/${type || ''}`, params);
        return this._request(url);
    }

    /**
     * Get the URL for an image with optional transformations.
     * @param {string|number} id - The ID of the image.
     * @param {Object} options - Image transformation options.
     * @param {number} [options.width] - The desired width of the image.
     * @param {number} [options.height] - The desired height of the image.
     * @param {number} [options.quality] - The quality of the image (1-100).
     * @param {string} [options.format] - The desired image format (e.g., 'jpg', 'webp').
     * @returns {string} The URL for the transformed image.
     */
    getImageUrl(id, options = {}) {
        const { width, height, quality, format } = options;
        let path = `/${id}`;

        if (format) {
            path += `.${format}`;
        }

        const params = {};
        if (width) params.w = width;
        if (height) params.h = height;
        if (quality) params.q = quality;

        const queryParams = new URLSearchParams(params).toString();
        return `${this.imageEndpoint}${path}${queryParams ? `?${queryParams}` : ''}`;
    }

    /**
     * Create a new FlatlayerImage instance.
     * @param {Object} imageData - The image data object from the API.
     * @param {Object} [defaultTransforms={}] - Default transformation parameters.
     * @param {Object} [breakpoints={}] - Custom breakpoints for responsive sizes.
     * @param {string} [imageEndpoint=null] - Custom image endpoint URL. If not provided, it uses the Flatlayer instance's imageEndpoint.
     * @returns {FlatlayerImage} A new FlatlayerImage instance.
     */
    createImage(imageData, defaultTransforms = {}, breakpoints = {}, imageEndpoint = null) {
        return new FlatlayerImage(
            this.baseUrl,
            imageData,
            defaultTransforms,
            breakpoints,
            imageEndpoint || this.imageEndpoint
        );
    }

    /**
     * Generate responsive image properties for use in an <img> tag.
     * @param {Object} image - The image object from the API.
     * @param {Array} sizes - An array of size descriptors (e.g., ['100vw', 'md:50vw']).
     * @param {Object} options - Additional options for image generation.
     * @param {Object} [options.breakpoints] - Custom breakpoints for responsive sizes.
     * @param {Object} [options.defaultImageParams] - Default parameters for image URLs.
     * @param {Array} [options.displaySize] - The intended display size [width, height].
     * @returns {string} An HTML img tag with responsive attributes.
     */
    getResponsiveImageProps(image, sizes, options = {}) {
        const flatlayerImage = this.createImage(
            image,
            options.defaultImageParams,
            options.breakpoints,
            options.imageEndpoint
        );
        return flatlayerImage.generateImgTag(sizes, {}, true, options.displaySize);
    }
}

export default Flatlayer;