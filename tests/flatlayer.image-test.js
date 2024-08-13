import FlatlayerImage from '../src/flatlayer-image';

describe('FlatlayerImage', () => {
    let flatlayerImage;
    const baseUrl = 'https://api.example.com';
    const imageData = {
        id: 'test-image-id',
        dimensions: { width: 1600, height: 900 },
        custom_properties: { alt: 'Test image' }
    };

    beforeEach(() => {
        flatlayerImage = new FlatlayerImage(baseUrl, imageData, { q: 80 }, {
            sm: 640,
            md: 768,
            lg: 1024,
            xl: 1280,
            '2xl': 1536,
        });
    });

    describe('parseSizes', () => {
        it('should parse size descriptors correctly', () => {
            const sizes = ['100vw', 'md:75vw', 'lg:50vw', 'xl:calc(33vw - 64px)'];
            const result = flatlayerImage.parseSizes(sizes);

            const expected = {
                0: { type: 'vw', value: 100 },
                768: { type: 'vw', value: 75 },
                1024: { type: 'vw', value: 50 },
                1280: { type: 'calc', vw: 33, px: 64 },
            };

            expect(result).toEqual(expected);
        });
    });

    describe('parseSize', () => {
        it('should parse different size formats correctly', () => {
            expect(flatlayerImage.parseSize('500px')).toEqual({ type: 'px', value: 500 });
            expect(flatlayerImage.parseSize('75vw')).toEqual({ type: 'vw', value: 75 });
            expect(flatlayerImage.parseSize('100vw - 64px')).toEqual({ type: 'calc', vw: 100, px: 64 });
        });

        it('should throw an error for invalid size format', () => {
            expect(() => flatlayerImage.parseSize('invalid-size')).toThrow('Invalid size format');
        });
    });

    describe('generateSrcset', () => {
        it('should generate correct srcset for fluid image', () => {
            const result = flatlayerImage.generateSrcset(true);

            expect(result).toContain('1600w');
            expect(result).toContain('1440w');
            expect(result).toContain('1296w');
            expect(result).toContain('110w');
            expect(result).not.toContain('1601w');
            expect(result).toMatch(/1600w.*1440w.*1296w.*110w/);
        });

        it('should generate correct srcset for fixed image', () => {
            const result = flatlayerImage.generateSrcset(false, [300, 300]);

            expect(result).toContain('300w');
            expect(result).toContain('600w');

            const srcsetEntries = result.split(', ');
            expect(srcsetEntries).toHaveLength(2);

            srcsetEntries.forEach(entry => {
                expect(entry).toMatch(/^https:\/\/.*\s\d+w$/);
            });
        });
    });

    describe('generateSizesAttribute', () => {
        it('should generate correct sizes attribute', () => {
            const parsedSizes = {
                0: { type: 'vw', value: 100 },
                768: { type: 'vw', value: 75 },
                1024: { type: 'vw', value: 50 },
            };

            const result = flatlayerImage.generateSizesAttribute(parsedSizes);

            const expected = '(min-width: 1024px) 50vw, (min-width: 768px) 75vw, 100vw';
            expect(result).toBe(expected);
        });
    });

    describe('generateImgAttributes', () => {
        it('should generate correct attributes for fluid sizing', () => {
            const sizes = ['100vw', 'md:75vw', 'lg:50vw'];
            const result = flatlayerImage.generateImgAttributes(sizes, { class: 'my-image' }, true);

            expect(result.src).toContain('https://api.example.com/image/test-image-id');
            expect(result.alt).toBe('Test image');
            expect(result.sizes).toBe('(min-width: 1024px) 50vw, (min-width: 768px) 75vw, 100vw');
            expect(result.srcset).toContain('1600w');
            expect(result.srcset).toContain('110w');
            expect(result.class).toBe('my-image');
        });

        it('should generate correct attributes for fixed sizing', () => {
            const sizes = ['100vw'];
            const result = flatlayerImage.generateImgAttributes(sizes, { class: 'my-thumbnail' }, false, [300, 300]);

            expect(result.src).toContain('https://api.example.com/image/test-image-id');
            expect(result.alt).toBe('Test image');
            expect(result.sizes).toBe('100vw');
            expect(result.srcset).toContain('300w');
            expect(result.srcset).toContain('600w');
            expect(result.class).toBe('my-thumbnail');
            expect(result.width).toBe(300);
            expect(result.height).toBe(300);
        });
    });

    describe('formatSize', () => {
        it('should format sizes correctly', () => {
            expect(flatlayerImage.formatSize({ type: 'px', value: 500 })).toBe('500px');
            expect(flatlayerImage.formatSize({ type: 'vw', value: 75 })).toBe('75vw');
            expect(flatlayerImage.formatSize({ type: 'calc', vw: 100, px: 64 })).toBe('calc(100vw - 64px)');
        });

        it('should throw an error for invalid size type', () => {
            expect(() => flatlayerImage.formatSize({ type: 'invalid', value: 100 })).toThrow('Invalid size type');
        });
    });

    describe('_request', () => {
        test('should handle network errors', async () => {
            fetch.mockRejectedValueOnce(new Error('Network error'));
            await expect(flatlayer._request('https://api.example.com/test')).rejects.toThrow('Network error');
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

            const result = await flatlayer.search(null, 'test query');

            expect(fetch).toHaveBeenCalledWith(
                expect.stringMatching(/^https:\/\/api\.example\.com\/entry\?/),
                expect.any(Object)
            );
            expect(result).toEqual(mockResults);
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
            const imageData = { id: 'test-image-id', dimensions: { width: 800, height: 600 } };
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
        });
    });
});