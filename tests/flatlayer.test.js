import Flatlayer from '../src/flatlayer';
import FlatlayerImage from '../src/flatlayer-image';


// Mock fetch globally
global.fetch = jest.fn();

let flatlayer;

beforeEach(() => {
    flatlayer = new Flatlayer('https://api.example.com');
    global.fetch.mockClear();
});

afterEach(() => {
    global.fetch.mockReset();
});

describe('Flatlayer SDK', () => {
    let flatlayer;

    beforeEach(() => {
        flatlayer = new Flatlayer('https://api.example.com');
        fetch.mockClear();
    });

    describe('Constructor', () => {
        test('should set baseUrl and imageEndpoint correctly', () => {
            expect(flatlayer.baseUrl).toBe('https://api.example.com');
            expect(flatlayer.imageEndpoint).toBe('https://api.example.com/image');
        });

        test('should remove trailing slash from baseUrl', () => {
            const flatlayerWithSlash = new Flatlayer('https://api.example.com/');
            expect(flatlayerWithSlash.baseUrl).toBe('https://api.example.com');
        });

        test('should use custom imageEndpoint if provided', () => {
            const customFlatlayer = new Flatlayer('https://api.example.com', 'https://images.example.com');
            expect(customFlatlayer.imageEndpoint).toBe('https://images.example.com');
        });
    });

    describe('getEntryList', () => {
        test('should fetch entries with correct parameters', async () => {
            const mockResponse = {
                data: [{ id: 1, title: 'Test Entry' }],
                total: 1,
                current_page: 1
            };
            fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockResponse)
            });

            const result = await flatlayer.getEntryList('post', {
                page: 1,
                perPage: 10,
                filter: { status: 'published' },
                fields: ['id', 'title'],
                search: 'test'
            });

            expect(fetch).toHaveBeenCalledWith(
                'https://api.example.com/entry/post?page=1&per_page=10&filter=%7B%22status%22%3A%22published%22%7D&fields=%5B%22id%22%2C%22title%22%5D&search=test',
                expect.any(Object)
            );
            expect(result).toEqual(mockResponse);
        });
    });

    describe('getEntry', () => {
        test('should fetch a single entry by slug', async () => {
            const mockEntry = { id: 1, title: 'Test Entry', slug: 'test-entry' };
            fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockEntry)
            });

            const result = await flatlayer.getEntry('post', 'test-entry', ['id', 'title', 'slug']);

            expect(fetch).toHaveBeenCalledWith(
                'https://api.example.com/entry/post/test-entry?fields=%5B%22id%22%2C%22title%22%2C%22slug%22%5D',
                expect.any(Object)
            );
            expect(result).toEqual(mockEntry);
        });
    });

    describe('search', () => {
        test('should perform a search with correct parameters', async () => {
            const mockResults = {
                data: [{ id: 1, title: 'Search Result' }],
                total: 1,
                current_page: 1
            };
            fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockResults)
            });

            const result = await flatlayer.search('test query', 'post', {
                page: 1,
                perPage: 10,
                filter: { status: 'published' },
                fields: ['id', 'title']
            });

            expect(fetch).toHaveBeenCalledWith(
                expect.stringMatching(/^https:\/\/api\.example\.com\/entry\/post\?page=1&per_page=10&filter=%7B%22status%22%3A%22published%22%2C%22%24search%22%3A%22test(\+|%20)query%22%7D&fields=%5B%22id%22%2C%22title%22%5D$/),
                expect.any(Object)
            );
            expect(result).toEqual(mockResults);
        });
    });

    describe('getImageUrl', () => {
        test('should return correct image URL with transformations', () => {
            const imageUrl = flatlayer.getImageUrl('test-image-id', {
                width: 300,
                height: 200,
                quality: 80,
                format: 'webp'
            });

            expect(imageUrl).toBe('https://api.example.com/image/test-image-id.webp?w=300&h=200&q=80');
        });
    });

    describe('createImage', () => {
        test('should create a FlatlayerImage instance', () => {
            const imageData = { id: 'test-image-id', dimensions: { width: 800, height: 600 } };
            const flatlayerImage = flatlayer.createImage(imageData);

            expect(flatlayerImage).toBeInstanceOf(FlatlayerImage);
            expect(flatlayerImage.imageData).toEqual(imageData);
            expect(flatlayerImage.imageEndpoint).toBe('https://api.example.com/image');
        });
    });

    describe('getResponsiveImageAttributes', () => {
        test('should generate responsive image attributes', () => {
            const imageData = { id: 'test-image-id', dimensions: { width: 800, height: 600 } };
            const sizes = ['100vw', 'md:50vw'];
            const attributes = flatlayer.getResponsiveImageAttributes(imageData, sizes, {
                displaySize: [400, 300]
            });

            expect(attributes).toHaveProperty('src');
            expect(attributes).toHaveProperty('srcset');
            expect(attributes).toHaveProperty('sizes');
            expect(attributes).toHaveProperty('width', 400);
            expect(attributes).toHaveProperty('height', 300);
        });
    });

    describe('Error handling', () => {
        test('should throw an error for non-OK responses', async () => {
            global.fetch = jest.fn().mockResolvedValue({
                ok: false,
                status: 404,
                json: async () => ({ error: 'Not found' })
            });

            await expect(flatlayer.getEntry('post', 'non-existent')).rejects.toThrow('Not found');
        });

        test('should handle network errors', async () => {
            global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

            await expect(flatlayer.getEntry('post', 'non-existent')).rejects.toThrow('Network error');
        });

        test('should handle API errors with custom error messages', async () => {
            global.fetch = jest.fn().mockResolvedValue({
                ok: false,
                status: 400,
                json: async () => ({ error: 'Custom API Error' })
            });

            await expect(flatlayer.getEntry('post', 'invalid')).rejects.toThrow('Custom API Error');
        });
    });

    describe('_request', () => {
        test('should handle network errors', async () => {
            const originalMaxRetries = flatlayer.options.maxRetries;
            flatlayer.options.maxRetries = 1; // Set to 1 for faster test execution

            fetch.mockRejectedValue(new Error('Network error'));

            await expect(flatlayer._request('https://api.example.com/test')).rejects.toThrow('Network error');

            expect(fetch).toHaveBeenCalledTimes(flatlayer.options.maxRetries);

            flatlayer.options.maxRetries = originalMaxRetries; // Restore original value
        });

        test('should handle API errors', async () => {
            fetch.mockResolvedValue({
                ok: false,
                status: 400,
                json: () => Promise.resolve({ error: 'API Error' })
            });

            await expect(flatlayer._request('https://api.example.com/test')).rejects.toThrow('API Error');
        });

        test('should return JSON data on successful request', async () => {
            const mockData = { id: 1, name: 'Test' };
            fetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve(mockData)
            });

            const result = await flatlayer._request('https://api.example.com/test');
            expect(result).toEqual(mockData);
        });
    });

    describe('_buildUrl', () => {
        test('should build URL with complex query parameters', () => {
            const url = flatlayer._buildUrl('/test', {
                array: [1, 2, 3],
                object: { key: 'value' },
                nullValue: null,
                undefinedValue: undefined
            });
            expect(url).toBe('https://api.example.com/test?array=%5B1%2C2%2C3%5D&object=%7B%22key%22%3A%22value%22%7D');
        });
    });

    describe('search', () => {
        test('should perform a search without specifying a type', async () => {
            const mockResults = {
                data: [{ id: 1, title: 'Search Result' }],
                total: 1,
                current_page: 1
            };
            fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockResults)
            });

            const result = await flatlayer.search('test query');

            expect(fetch).toHaveBeenCalledWith(
                expect.stringMatching(/^https:\/\/api\.example\.com\/entry\/\?page=1&per_page=15&filter=%7B%22%24search%22%3A%22test(\+|%20)query%22%7D&fields=%5B%5D$/),
                expect.any(Object)
            );
            expect(result).toEqual(mockResults);
        });

        test('should perform a search with a specific type', async () => {
            const mockResults = {
                data: [{ id: 1, title: 'Search Result' }],
                total: 1,
                current_page: 1
            };
            fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockResults)
            });

            const result = await flatlayer.search('test query', 'post', {
                page: 2,
                perPage: 20,
                fields: ['id', 'title']
            });

            expect(fetch).toHaveBeenCalledWith(
                expect.stringMatching(/^https:\/\/api\.example\.com\/entry\/post\?page=2&per_page=20&filter=%7B%22%24search%22%3A%22test(\+|%20)query%22%7D&fields=%5B%22id%22%2C%22title%22%5D$/),
                expect.any(Object)
            );
            expect(result).toEqual(mockResults);
        });

        test('should throw an error for empty search query', async () => {
            await expect(flatlayer.search('')).rejects.toThrow('Search query must be a non-empty string');
        });

        test('should throw an error for invalid type', async () => {
            await expect(flatlayer.search('query', '')).rejects.toThrow('Entry type must be a non-empty string');
        });
    });

    describe('getImageUrl', () => {
        test('should return correct image URL without transformations', () => {
            const imageUrl = flatlayer.getImageUrl('test-image-id');
            expect(imageUrl).toBe('https://api.example.com/image/test-image-id');
        });

        test('should handle numeric image IDs', () => {
            const imageUrl = flatlayer.getImageUrl(12345, { width: 300, height: 200 });
            expect(imageUrl).toBe('https://api.example.com/image/12345?w=300&h=200');
        });
    });

    describe('createImage', () => {
        test('should create a FlatlayerImage instance with custom parameters', () => {
            const imageData = { id: 'test-image-id', dimensions: { width: 800, height: 600 } };
            const defaultTransforms = { q: 90 };
            const breakpoints = { sm: 500, md: 700, lg: 900 };
            const customImageEndpoint = 'https://custom-images.example.com';

            const flatlayerImage = flatlayer.createImage(imageData, defaultTransforms, breakpoints, customImageEndpoint);

            expect(flatlayerImage).toBeInstanceOf(FlatlayerImage);
            expect(flatlayerImage.imageData).toEqual(imageData);
            expect(flatlayerImage.defaultTransforms).toEqual(defaultTransforms);
            expect(flatlayerImage.breakpoints).toEqual(breakpoints);
            expect(flatlayerImage.imageEndpoint).toBe(customImageEndpoint);
        });
    });

    describe('getResponsiveImageAttributes', () => {
        test('should generate responsive image attributes with custom options', () => {
            const imageData = {
                id: 'test-image-id',
                dimensions: { width: 800, height: 600 },
                filename: 'test-image.jpg',
                meta: { alt: 'Custom alt text' }
            };
            const sizes = ['100vw', 'md:50vw'];
            const options = {
                displaySize: [400, 300],
                breakpoints: { sm: 500, md: 700, lg: 900 },
                defaultImageParams: { q: 90 },
                isFluid: false
            };

            const attributes = flatlayer.getResponsiveImageAttributes(imageData, sizes, options);

            expect(attributes).toHaveProperty('src');
            expect(attributes).toHaveProperty('srcset');
            expect(attributes).toHaveProperty('sizes');
            expect(attributes).toHaveProperty('width', 400);
            expect(attributes).toHaveProperty('height', 300);
            expect(attributes.srcset).toContain('q=90');
            expect(attributes).toHaveProperty('alt', 'Custom alt text');
        });

        test('should handle missing alt and use filename for alt text', () => {
            const imageData = {
                id: 'test-image-id',
                dimensions: { width: 800, height: 600 },
                filename: 'test-image.jpg'
            };
            const sizes = ['100vw'];

            const attributes = flatlayer.getResponsiveImageAttributes(imageData, sizes);

            expect(attributes).toHaveProperty('alt', 'test-image');
        });

        test('should handle missing filename and alt in imageData', () => {
            const imageData = {
                id: 'test-image-id',
                dimensions: { width: 800, height: 600 }
            };
            const sizes = ['100vw'];

            const attributes = flatlayer.getResponsiveImageAttributes(imageData, sizes);

            expect(attributes).toHaveProperty('alt', 'Image test-image-id');
        });

        test('should handle completely empty imageData', () => {
            const imageData = {};
            const sizes = ['100vw'];

            const attributes = flatlayer.getResponsiveImageAttributes(imageData, sizes);

            expect(attributes).toHaveProperty('alt', 'Image');
        });
    });

    describe('getBatchEntries', () => {
        test('should fetch multiple entries by slugs', async () => {
            const mockEntries = {
                data: [
                    { id: 1, title: 'First Post', slug: 'first-post' },
                    { id: 2, title: 'Second Post', slug: 'second-post' }
                ]
            };
            fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockEntries)
            });

            const result = await flatlayer.getBatchEntries('post', ['first-post', 'second-post'], ['id', 'title', 'slug']);

            expect(fetch).toHaveBeenCalledWith(
                'https://api.example.com/entry/batch/post?slugs=first-post%2Csecond-post&fields=%5B%22id%22%2C%22title%22%2C%22slug%22%5D',
                expect.any(Object)
            );
            expect(result).toEqual(mockEntries);
        });

        test('should handle empty slugs array', async () => {
            await expect(flatlayer.getBatchEntries('post', [])).rejects.toThrow('Slugs must be a non-empty array of strings');
        });

        test('should handle null or undefined slugs', async () => {
            await expect(flatlayer.getBatchEntries('post', null)).rejects.toThrow('Slugs must be a non-empty array of strings');
            await expect(flatlayer.getBatchEntries('post', undefined)).rejects.toThrow('Slugs must be a non-empty array of strings');
        });

        test('should handle response with missing entries', async () => {
            const mockResponse = {
                data: [
                    { id: 1, title: 'First Post', slug: 'first-post' }
                ]
            };
            fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockResponse)
            });

            const result = await flatlayer.getBatchEntries('post', ['first-post', 'non-existent-post']);

            expect(result.data).toHaveLength(1);
            expect(result.data[0].slug).toBe('first-post');
        });

        test('should handle network errors', async () => {
            fetch.mockImplementation(() => {
                return Promise.reject(new Error('Network error'));
            });

            await expect(flatlayer.getBatchEntries('post', ['test-post'])).rejects.toThrow('Network error');
        });

        test('should handle API errors', async () => {
            fetch.mockImplementation(() => {
                return Promise.resolve({
                    ok: false,
                    status: 400,
                    json: () => Promise.resolve({ error: 'API Error' })
                });
            });

            await expect(flatlayer.getBatchEntries('post', ['test-post'])).rejects.toThrow('API Error');
        });
    });
});