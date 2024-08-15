import FlatlayerImage from './flatlayer-image.js';

/**
 * Flatlayer class
 * A JavaScript SDK for interacting with the Flatlayer CMS API.
 * Focused on content retrieval, searching, and image handling.
 * @class
 */
class Flatlayer {
    /**
     * Create a new Flatlayer instance.
     * @param {string} baseUrl - The base URL of the Flatlayer CMS API.
     * @param {string} [imageEndpoint=null] - The base URL for image endpoints. If not provided, it defaults to `${baseUrl}/image`.
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
        const defaultOptions = {
            headers: {
                'Accept': 'application/json',
                ...options.headers
            }
        };
        const mergedOptions = { ...defaultOptions, ...options };

        const response = await fetch(url, mergedOptions);
        if (!response.ok) {
            const errorData = await response.json();
            const errorMessage = errorData.error || `HTTP error! status: ${response.status}`;
            const error = new Error(errorMessage);
            error.status = response.status;
            throw error;
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
     * @param {Object} [options] - Options for the request.
     * @param {number} [options.page=1] - The page number to retrieve.
     * @param {number} [options.perPage=15] - The number of entries per page.
     * @param {Object} [options.filter={}] - Filters to apply to the query.
     * @param {Array<string>} [options.fields=[]] - Fields to include in the response.
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

        const url = this._buildUrl(`/entry/${type}`, params);
        return this._request(url);
    }

    /**
     * Get a single entry by its slug.
     * @param {string} type - The type of entry to retrieve.
     * @param {string} slug - The slug of the entry.
     * @param {Array<string>} [fields=[]] - Fields to include in the response.
     * @returns {Promise<Object>} The requested entry.
     */
    async getEntry(type, slug, fields = []) {
        const url = this._buildUrl(`/entry/${type}/${slug}`, { fields });
        return this._request(url);
    }

    /**
     * Get multiple entries by their slugs.
     * @param {string} type - The type of entries to retrieve.
     * @param {Array<string>} slugs - An array of slugs to retrieve.
     * @param {Array<string>} [fields=[]] - Fields to include in the response.
     * @returns {Promise<Object>} The requested entries.
     */
    async getBatchEntries(type, slugs, fields = []) {
        if (!slugs || slugs.length === 0) {
            throw new Error('No valid slugs provided');
        }
        const params = {
            slugs: slugs.join(','),
            fields: fields
        };
        const url = this._buildUrl(`/entry/batch/${type}`, params);
        return this._request(url);
    }

    /**
     * Perform a search across entry types or within a specific type.
     * @param {string|null} type - The entry type to search within, or null to search all types.
     * @param {string} query - The search query.
     * @param {Object} [options] - Options for the search request.
     * @param {number} [options.page=1] - The page number to retrieve.
     * @param {number} [options.perPage=15] - The number of entries per page.
     * @param {Object} [options.filter={}] - Additional filters to apply.
     * @param {Array<string>} [options.fields=[]] - Fields to include in the response.
     * @returns {Promise<Object>} The search results.
     */
    async search(type, query, options = {}) {
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

        const url = this._buildUrl(`/entry/${type || ''}`, params);
        return this._request(url);
    }

    /**
     * Get the URL for an image with optional transformations.
     * @param {string|number} id - The ID of the image.
     * @param {Object} [options] - Image transformation options.
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
     * Generate responsive image attributes for use in an <img> tag.
     * @param {Object} image - The image object from the API.
     * @param {Array<string>} sizes - An array of size descriptors (e.g., ['100vw', 'md:50vw']).
     * @param {Object} [options] - Additional options for image generation.
     * @param {Object} [options.breakpoints] - Custom breakpoints for responsive sizes.
     * @param {Object} [options.defaultImageParams] - Default parameters for image URLs.
     * @param {Array<number>} [options.displaySize] - The intended display size [width, height].
     * @param {boolean} [options.isFluid=true] - Whether to use fluid sizing.
     * @returns {Object} An object with responsive image attributes.
     */
    getResponsiveImageAttributes(image, sizes, options = {}) {
        const flatlayerImage = this.createImage(
            image,
            options.defaultImageParams,
            options.breakpoints,
            options.imageEndpoint
        );
        return flatlayerImage.generateImgAttributes(sizes, {}, options.isFluid !== false, options.displaySize);
    }
}

export default Flatlayer;