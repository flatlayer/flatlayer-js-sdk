import FlatlayerImage from '../src/flatlayer-image';

describe('FlatlayerImage', () => {
    let flatlayerImage;
    const baseUrl = 'https://api.example.com';
    const imageData = {
        id: 'test-image-id',
        dimensions: { width: 1600, height: 900 },
        meta: { alt: 'Test image' }
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

    describe('getAlt', () => {
        it('should return the correct alt text', () => {
            expect(flatlayerImage.getAlt()).toBe('Test image');
        });

        it('should return an empty string if no alt text is provided', () => {
            const imageWithoutAlt = new FlatlayerImage(baseUrl, { ...imageData, meta: {} });
            expect(imageWithoutAlt.getAlt()).toBe('');
        });
    });

    describe('getMediaWidth', () => {
        it('should return the correct width from dimensions', () => {
            expect(flatlayerImage.getMediaWidth()).toBe(1600);
        });

        it('should handle string dimensions', () => {
            const stringDimensionsImage = new FlatlayerImage(baseUrl, {
                ...imageData,
                dimensions: JSON.stringify({ width: 800, height: 600 })
            });
            expect(stringDimensionsImage.getMediaWidth()).toBe(800);
        });

        it('should return 0 if dimensions are not available', () => {
            const noDimensionsImage = new FlatlayerImage(baseUrl, { ...imageData, dimensions: undefined });
            expect(noDimensionsImage.getMediaWidth()).toBe(0);
        });
    });

    describe('generateFluidSrcset', () => {
        it('should generate correct fluid srcset entries', () => {
            const result = flatlayerImage.generateFluidSrcset(800, 1600, 0.75);

            // Check for the presence of specific width entries
            expect(result.some(entry => entry.match(/1600w$/))).toBe(true);
            expect(result.some(entry => entry.match(/1440w$/))).toBe(true);
            expect(result.some(entry => entry.match(/800w$/))).toBe(true);

            // Check that there's no entry larger than 1600w
            expect(result.every(entry => !entry.match(/(\d+)w$/) || parseInt(entry.match(/(\d+)w$/)[1]) <= 1600)).toBe(true);

            // Check the format of the entries
            result.forEach(entry => {
                expect(entry).toMatch(/^https:\/\/api\.example\.com\/image\/test-image-id\?q=80&w=\d+&h=\d+ \d+w$/);
            });

            // Check that the aspect ratio is maintained (0.75)
            result.forEach(entry => {
                const match = entry.match(/w=(\d+)&h=(\d+)/);
                if (match) {
                    const width = parseInt(match[1]);
                    const height = parseInt(match[2]);
                    expect(height / width).toBeCloseTo(0.75, 2);
                }
            });
        });
    });

    describe('generateFixedSrcset', () => {
        it('should generate correct fixed srcset entries', () => {
            const result = flatlayerImage.generateFixedSrcset(400, 300, 1600);

            // Check that we have exactly two entries
            expect(result.length).toBe(2);

            // Check for the presence of 400w and 800w entries
            expect(result.some(entry => entry.match(/400w$/))).toBe(true);
            expect(result.some(entry => entry.match(/800w$/))).toBe(true);

            // Check that there's no 1600w entry
            expect(result.every(entry => !entry.match(/1600w$/))).toBe(true);

            // Check the format of the entries
            result.forEach(entry => {
                expect(entry).toMatch(/^https:\/\/api\.example\.com\/image\/test-image-id\?q=80&w=\d+&h=\d+ \d+w$/);
            });

            // Check that the aspect ratio is maintained (4:3)
            result.forEach(entry => {
                const match = entry.match(/w=(\d+)&h=(\d+)/);
                if (match) {
                    const width = parseInt(match[1]);
                    const height = parseInt(match[2]);
                    expect(height / width).toBeCloseTo(0.75, 2); // 300/400 = 0.75
                }
            });

            // Check specific dimensions
            expect(result[0]).toMatch(/w=400&h=300 400w$/);
            expect(result[1]).toMatch(/w=800&h=600 800w$/);
        });
    });

    describe('getUrl', () => {
        it('should generate correct URL with transforms', () => {
            const url = flatlayerImage.getUrl({ w: 300, h: 200, q: 90 });
            expect(url).toBe('https://api.example.com/image/test-image-id?w=300&h=200&q=90');
        });

        it('should generate correct URL without transforms', () => {
            const url = flatlayerImage.getUrl();
            expect(url).toBe('https://api.example.com/image/test-image-id');
        });
    });
});