import FlatlayerImage from './flatlayer-image.js';

/**
 * Custom error class for Flatlayer-specific errors
 * @class
 * @extends Error
 */
class FlatlayerError extends Error {
    /**
     * Create a new FlatlayerError
     * @param {number} status - The HTTP status code
     * @param {Object} data - The error data from the API
     */
    constructor(status, data) {
        super(data.error || `HTTP error! status: ${status}`);
        this.name = 'FlatlayerError';
        this.status = status;
        this.data = data;
    }
}

/**
 * Flatlayer class
 * A JavaScript SDK for interacting with the Flatlayer CMS API.
 * Focused on content retrieval and image handling.
 * @class
 */
class Flatlayer {
    /**
     * Create a new Flatlayer instance.
     * @param {string} baseUrl - The base URL of the Flatlayer CMS API.
     * @param {string} [imageEndpoint=null] - The base URL for image endpoints. If not provided, it defaults to `${baseUrl}/image`.
     * @param {Object} [options={}] - Additional options for the Flatlayer instance.
     * @param {number} [options.maxRetries=3] - Maximum number of retries for failed requests.
     * @param {number} [options.retryDelay=1000] - Delay between retries in milliseconds.
     */
    constructor(baseUrl, imageEndpoint = null, options = {}) {
        this.baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
        this.imageEndpoint = imageEndpoint || `${this.baseUrl}/image`;
        this.options = {
            maxRetries: 3,
            retryDelay: 1000,
            ...options
        };
    }

    /**
     * Send a request to the API with error handling and retry logic.
     * @param {string} url - The full URL to fetch from.
     * @param {Object} options - Fetch options.
     * @returns {Promise<Object>} The JSON response from the API.
     * @throws {FlatlayerError} If the response is not ok after retries.
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

        let retries = 0;
        while (retries < this.options.maxRetries) {
            try {
                const response = await fetch(url, mergedOptions);
                // Check if response is undefined
                if (!response) {
                    throw new Error('Fetch response is undefined');
                }
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new FlatlayerError(response.status, errorData);
                }
                return response.json();
            } catch (error) {
                if (retries === this.options.maxRetries - 1) {
                    throw error;
                }
                await new Promise(resolve => setTimeout(resolve, this.options.retryDelay));
                retries++;
            }
        }
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
     * Validate the entry type.
     * @param {string} type - The entry type to validate.
     * @throws {Error} If the entry type is invalid.
     * @private
     */
    _validateEntryType(type) {
        if (typeof type !== 'string' || type.trim() === '') {
            throw new Error('Entry type must be a non-empty string');
        }
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
        this._validateEntryType(type);
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
     * Perform a search across entry types or within a specific type.
     * @param {string} query - The search query.
     * @param {string|null} [type=null] - The entry type to search within, or null to search all types.
     * @param {Object} [options] - Options for the search request.
     * @param {number} [options.page=1] - The page number to retrieve.
     * @param {number} [options.perPage=15] - The number of entries per page.
     * @param {Object} [options.filter={}] - Additional filters to apply.
     * @param {Array<string>} [options.fields=[]] - Fields to include in the response.
     * @returns {Promise<Object>} The search results.
     */
    async search(query, type = null, options = {}) {
        if (typeof query !== 'string' || query.trim() === '') {
            throw new Error('Search query must be a non-empty string');
        }
        if (type !== null) {
            this._validateEntryType(type);
        }
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
     * Get a single entry by its slug.
     * @param {string} type - The type of entry to retrieve.
     * @param {string} slug - The slug of the entry.
     * @param {Array<string>} [fields=[]] - Fields to include in the response.
     * @returns {Promise<Object>} The requested entry.
     */
    async getEntry(type, slug, fields = []) {
        this._validateEntryType(type);
        if (typeof slug !== 'string' || slug.trim() === '') {
            throw new Error('Slug must be a non-empty string');
        }
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
        this._validateEntryType(type);
        if (!Array.isArray(slugs) || slugs.length === 0) {
            throw new Error('Slugs must be a non-empty array of strings');
        }
        const params = {
            slugs: slugs.join(','),
            fields: fields
        };
        const url = this._buildUrl(`/entry/batch/${type}`, params);
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
        if (typeof id !== 'string' && typeof id !== 'number') {
            throw new Error('Image ID must be a string or number');
        }
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
     * Get metadata for an image.
     * @param {string|number} id - The ID of the image.
     * @returns {Promise<Object>} The image metadata.
     */
    async getImageMetadata(id) {
        if (typeof id !== 'string' && typeof id !== 'number') {
            throw new Error('Image ID must be a string or number');
        }
        const url = this._buildUrl(`/image/${id}/metadata`);
        return this._request(url);
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