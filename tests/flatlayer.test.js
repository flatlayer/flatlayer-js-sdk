import Flatlayer from '../src/flatlayer';
import FlatlayerImage from '../src/flatlayer-image';

// Mock fetch function
global.fetch = jest.fn();

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

            const result = await flatlayer.search('post', 'test query', {
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
            fetch.mockResolvedValueOnce({
                ok: false,
                json: () => Promise.resolve({ error: 'Not found' })
            });

            await expect(flatlayer.getEntry('post', 'non-existent')).rejects.toThrow('Not found');
        });
    });
});