/**
 * flatlayer-cms.js
 * A comprehensive JavaScript library for interacting with the Flatlayer CMS API.
 * This library provides methods for content retrieval, filtering, searching,
 * and image handling.
 */

class FlatlayerCMS {
    /**
     * Create a new FlatlayerCMS instance.
     * @param {string} baseUrl - The base URL of the Flatlayer CMS API.
     */
    constructor(baseUrl) {
        // Ensure the base URL doesn't end with a slash
        this.baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    }

    /**
     * Fetch data from the API with error handling.
     * @param {string} url - The URL to fetch from.
     * @param {Object} options - Fetch options.
     * @returns {Promise<Object>} The JSON response from the API.
     * @throws {Error} If the response is not ok.
     * @private
     */
    async fetchWithErrorHandling(url, options = {}) {
        const response = await fetch(url, options);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'An error occurred');
        }
        return response.json();
    }

    /**
     * Build a URL with query parameters.
     * @param {string} path - The API endpoint path.
     * @param {Object} queryParams - The query parameters to include.
     * @returns {string} The complete URL with query parameters.
     * @private
     */
    buildUrl(path, queryParams = {}) {
        const url = new URL(`${this.baseUrl}${path}`);
        Object.entries(queryParams).forEach(([key, value]) => {
            if (typeof value === 'object') {
                // Stringify objects (like filters) before adding to URL
                url.searchParams.append(key, JSON.stringify(value));
            } else {
                url.searchParams.append(key, value);
            }
        });
        return url.toString();
    }

    /**
     * Get a list of content items.
     * @param {string} type - The type of content to retrieve (e.g., 'post', 'page').
     * @param {Object} options - Options for the request.
     * @param {number} [options.page=1] - The page number to retrieve.
     * @param {number} [options.perPage=15] - The number of items per page.
     * @param {Object} [options.filter={}] - Filters to apply to the query.
     * @param {Array} [options.fields=[]] - Fields to include in the response.
     * @param {string} [options.search=null] - Search query to apply.
     * @returns {Promise<Object>} The paginated list of content items.
     */
    async getContentList(type, options = {}) {
        const {
            page = 1,
            perPage = 15,
            filter = {},
            fields = [],
            search = null,
        } = options;

        const queryParams = {
            page,
            per_page: perPage,
            filter: { ...filter },
            fields,
        };

        // Add search query to filter if provided
        if (search) {
            queryParams.filter.$search = search;
        }

        const url = this.buildUrl(`/content/${type}`, queryParams);
        return this.fetchWithErrorHandling(url);
    }

    /**
     * Get a single content item by its slug.
     * @param {string} type - The type of content to retrieve.
     * @param {string} slug - The slug of the content item.
     * @param {Array} [fields=[]] - Fields to include in the response.
     * @returns {Promise<Object>} The requested content item.
     */
    async getContentItem(type, slug, fields = []) {
        const url = this.buildUrl(`/content/${type}/${slug}`, { fields });
        return this.fetchWithErrorHandling(url);
    }

    /**
     * Perform a search across content types or within a specific type.
     * @param {string} query - The search query.
     * @param {string} [type=null] - The content type to search within (optional).
     * @param {Object} options - Options for the search request.
     * @param {number} [options.page=1] - The page number to retrieve.
     * @param {number} [options.perPage=15] - The number of items per page.
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

        const queryParams = {
            page,
            per_page: perPage,
            filter: { ...filter, $search: query },
            fields,
        };

        const url = this.buildUrl(`/content/${type || ''}`, queryParams);
        return this.fetchWithErrorHandling(url);
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
        let path = `/image/${id}`;

        if (format) {
            path += `.${format}`;
        }

        const queryParams = {};
        if (width) queryParams.w = width;
        if (height) queryParams.h = height;
        if (quality) queryParams.q = quality;

        return this.buildUrl(path, queryParams);
    }

    /**
     * Generate responsive image properties for use in an <img> tag.
     * @param {Object} image - The image object from the API.
     * @param {Array} sizes - An array of size descriptors (e.g., ['100vw', 'md:50vw']).
     * @param {Object} options - Additional options for image generation.
     * @param {Object} [options.breakpoints] - Custom breakpoints for responsive sizes.
     * @param {Object} [options.defaultImageParams] - Default parameters for image URLs.
     * @param {Array} [options.displaySize] - The intended display size [width, height].
     * @returns {Object} An object with src, srcset, sizes, and other relevant properties.
     */
    getResponsiveImageProps(image, sizes, options = {}) {
        const {
            breakpoints = { sm: 640, md: 768, lg: 1024, xl: 1280, '2xl': 1536 },
            defaultImageParams = { quality: 80 },
            displaySize,
        } = options;

        const srcset = [];
        const parsedSizes = [];

        // Parse size descriptors
        sizes.forEach(size => {
            const [breakpoint, value] = size.split(':');
            if (value) {
                const width = breakpoints[breakpoint];
                parsedSizes.push(`(min-width: ${width}px) ${value}`);
            } else {
                parsedSizes.push(breakpoint);
            }
        });

        // Calculate the maximum width based on breakpoints and display size
        const maxWidth = Math.max(...Object.values(breakpoints),
            displaySize ? displaySize[0] : 0);

        // Generate srcset for various widths
        for (let width = 100; width <= maxWidth; width = Math.min(width * 2, maxWidth)) {
            const url = this.getImageUrl(image.id, { ...defaultImageParams, width });
            srcset.push(`${url} ${width}w`);
        }

        // Return an object with all necessary properties for a responsive image
        return {
            src: this.getImageUrl(image.id, defaultImageParams),
            srcset: srcset.join(', '),
            sizes: parsedSizes.join(', '),
            alt: image.alt || '',
            width: displaySize ? displaySize[0] : undefined,
            height: displaySize ? displaySize[1] : undefined,
        };
    }
}

// Export for CommonJS environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FlatlayerCMS;
}

// Export for ES6 environments
export default FlatlayerCMS;