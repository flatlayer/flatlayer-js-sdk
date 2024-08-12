import FlatlayerImage from '../src/flatlayer-image';

describe('FlatlayerImage', () => {
    let flatlayerImage;
    const baseUrl = 'https://api.example.com';
    const imageData = {
        id: 'test-image-id',
        dimensions: { width: 1200, height: 800 },
        custom_properties: { alt: 'Test image' }
    };

    beforeEach(() => {
        flatlayerImage = new FlatlayerImage(baseUrl, imageData);
    });

    describe('Constructor', () => {
        test('should set properties correctly', () => {
            expect(flatlayerImage.baseUrl).toBe(baseUrl);
            expect(flatlayerImage.imageData).toEqual(imageData);
            expect(flatlayerImage.imageEndpoint).toBe(`${baseUrl}/image`);
        });

        test('should use custom breakpoints if provided', () => {
            const customBreakpoints = { sm: 500, md: 750, lg: 1000 };
            const customImage = new FlatlayerImage(baseUrl, imageData, {}, customBreakpoints);
            expect(customImage.breakpoints).toEqual(customBreakpoints);
        });
    });

    describe('generateImgAttributes', () => {
        test('should generate correct attributes for fluid sizing with multiple breakpoints', () => {
            const sizes = ['100vw', 'sm:75vw', 'md:50vw', 'lg:33vw'];
            const attributes = flatlayerImage.generateImgAttributes(sizes);

            expect(attributes).toHaveProperty('src');
            expect(attributes).toHaveProperty('srcset');
            expect(attributes).toHaveProperty('sizes');
            expect(attributes.sizes).toBe('(min-width: 1024px) 33vw, (min-width: 768px) 50vw, (min-width: 640px) 75vw, 100vw');
            expect(attributes.alt).toBe('Test image');
        });

        test('should generate correct attributes for fluid sizing with calc values', () => {
            const sizes = ['100vw', 'md:calc(50vw - 20px)'];
            const attributes = flatlayerImage.generateImgAttributes(sizes);

            expect(attributes).toHaveProperty('sizes');
            expect(attributes.sizes).toBe('(min-width: 768px) calc(50vw - 20px), 100vw');
        });

        test('should generate correct attributes for fixed sizing', () => {
            const sizes = ['100vw', 'md:50vw'];
            const attributes = flatlayerImage.generateImgAttributes(sizes, {}, false, [600, 400]);

            expect(attributes).toHaveProperty('src');
            expect(attributes).toHaveProperty('srcset');
            expect(attributes).toHaveProperty('sizes');
            expect(attributes).toHaveProperty('width', 600);
            expect(attributes).toHaveProperty('height', 400);
        });
    });

    describe('parseSizes', () => {
        test('should parse size descriptors correctly', () => {
            const sizes = ['100vw', 'md:50vw', 'lg:33vw'];
            const parsedSizes = flatlayerImage.parseSizes(sizes);

            expect(parsedSizes).toEqual({
                0: { type: 'vw', value: 100 },
                768: { type: 'vw', value: 50 },
                1024: { type: 'vw', value: 33 }
            });
        });

        test('should handle calc expressions', () => {
            const sizes = ['calc(100vw - 20px)', 'md:calc(50vw - 10px)'];
            const parsedSizes = flatlayerImage.parseSizes(sizes);

            expect(parsedSizes).toEqual({
                0: { type: 'calc', vw: 100, px: 20 },
                768: { type: 'calc', vw: 50, px: 10 }
            });
        });
    });

    describe('generateSrcset', () => {
        test('should generate correct srcset for fluid sizing', () => {
            const srcset = flatlayerImage.generateSrcset(true, [800, 600]);
            const srcsetEntries = srcset.split(', ');

            expect(srcsetEntries.length).toBeGreaterThan(1);
            srcsetEntries.forEach(entry => {
                expect(entry).toMatch(/^https:\/\/api\.example\.com\/image\/test-image-id\?w=\d+&h=\d+ \d+w$/);
            });
        });

        test('should generate correct srcset for fixed sizing', () => {
            const srcset = flatlayerImage.generateSrcset(false, [800, 600]);
            const srcsetEntries = srcset.split(', ');

            expect(srcsetEntries.length).toBe(2);
            expect(srcsetEntries[0]).toMatch(/^https:\/\/api\.example\.com\/image\/test-image-id\?w=800&h=600 800w$/);
            expect(srcsetEntries[1]).toMatch(/^https:\/\/api\.example\.com\/image\/test-image-id\?w=1600&h=1200 1600w$/);
        });
    });

    describe('generateSizesAttribute', () => {
        test('should generate correct sizes attribute', () => {
            const parsedSizes = {
                0: { type: 'vw', value: 100 },
                768: { type: 'vw', value: 50 },
                1024: { type: 'calc', vw: 33, px: 20 }
            };
            const sizesAttribute = flatlayerImage.generateSizesAttribute(parsedSizes);

            expect(sizesAttribute).toBe('(min-width: 1024px) calc(33vw - 20px), (min-width: 768px) 50vw, 100vw');
        });
    });

    describe('getUrl', () => {
        test('should generate correct image URL with transformations', () => {
            const url = flatlayerImage.getUrl({ w: 300, h: 200, q: 80 });
            expect(url).toBe('https://api.example.com/image/test-image-id?w=300&h=200&q=80');
        });
    });
});