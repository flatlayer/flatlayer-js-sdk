import FlatlayerImage from '../src/flatlayer-image';

describe('FlatlayerImage', () => {
    let flatlayerImage;
    const baseUrl = 'https://api.example.com';
    const imageData = {
        id: 'test-image-id',
        width: 1600,
        height: 900,
        meta: { alt: 'Test image' }
    };

    beforeEach(() => {
        flatlayerImage = new FlatlayerImage(baseUrl, imageData, { q: 80 });
    });

    describe('constructor', () => {
        it('should initialize with correct properties', () => {
            expect(flatlayerImage.baseUrl).toBe(baseUrl);
            expect(flatlayerImage.imageData).toEqual(imageData);
            expect(flatlayerImage.defaultTransforms).toEqual({});
            expect(flatlayerImage.defaultQuality).toBe(80);
            expect(flatlayerImage.imageEndpoint).toBe(`${baseUrl}/image`);
        });

        it('should handle custom imageEndpoint', () => {
            const customEndpoint = 'https://custom.example.com/img';
            const customFlatlayerImage = new FlatlayerImage(baseUrl, imageData, { q: 80 }, customEndpoint);
            expect(customFlatlayerImage.imageEndpoint).toBe(customEndpoint);
        });

        it('should set default quality when not provided', () => {
            const noQualityImage = new FlatlayerImage(baseUrl, imageData);
            expect(noQualityImage.defaultQuality).toBe(80);
        });
    });

    describe('generateImgAttributes', () => {
        it('should generate correct attributes for fluid sizing', () => {
            const result = flatlayerImage.generateImgAttributes({ class: 'my-image' });

            expect(result.src).toContain('https://api.example.com/image/test-image-id');
            expect(result.alt).toBe('Test image');
            expect(result.srcset).toContain('1600w');
            expect(result.class).toBe('my-image');
        });

        it('should generate correct attributes with display size', () => {
            const result = flatlayerImage.generateImgAttributes({ class: 'my-thumbnail' }, [300, 300]);

            expect(result.src).toContain('https://api.example.com/image/test-image-id');
            expect(result.alt).toBe('Test image');
            expect(result.srcset).toContain('300w');
            expect(result.class).toBe('my-thumbnail');
            expect(result.width).toBe(300);
            expect(result.height).toBe(300);
        });
    });

    describe('getAlt', () => {
        it('should return the correct alt text', () => {
            expect(flatlayerImage.getAlt()).toBe('Test image');
        });

        it('should return "Image {id}" if no alt text is provided', () => {
            const imageWithoutAlt = new FlatlayerImage(baseUrl, { ...imageData, meta: {} });
            expect(imageWithoutAlt.getAlt()).toBe('Image test-image-id');
        });
    });

    describe('getMediaWidth', () => {
        it('should return the correct width from dimensions', () => {
            expect(flatlayerImage.getMediaWidth()).toBe(1600);
        });

        it('should handle string dimensions', () => {
            const stringDimensionsImage = new FlatlayerImage(baseUrl, {
                ...imageData,
                width: '800',
                height: '600'
            });
            expect(stringDimensionsImage.getMediaWidth()).toBe(800);
        });

        it('should return 0 if dimensions are not available', () => {
            const noDimensionsImage = new FlatlayerImage(baseUrl, { ...imageData, width: undefined, height: undefined });
            expect(noDimensionsImage.getMediaWidth()).toBe(0);
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

    describe('generateFluidSrcset', () => {
        it('should generate correct fluid srcset entries', () => {
            const result = flatlayerImage.generateFluidSrcset(800, 1600, 0.75);

            expect(result.some(entry => entry.match(/1600w$/))).toBe(true);
            expect(result.some(entry => entry.match(/1440w$/))).toBe(true);
            expect(result.some(entry => entry.match(/800w$/))).toBe(true);

            expect(result.every(entry => !entry.match(/(\d+)w$/) || parseInt(entry.match(/(\d+)w$/)[1]) <= 1600)).toBe(true);

            result.forEach(entry => {
                expect(entry).toMatch(/^https:\/\/api\.example\.com\/image\/test-image-id(\.\w+)?\?(w=\d+&h=\d+&q=80|h=\d+&w=\d+&q=80|q=80&w=\d+&h=\d+) \d+w$/);
            });

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

            expect(result.length).toBe(2);

            expect(result.some(entry => entry.match(/400w$/))).toBe(true);
            expect(result.some(entry => entry.match(/800w$/))).toBe(true);

            expect(result.every(entry => !entry.match(/1600w$/))).toBe(true);

            result.forEach(entry => {
                expect(entry).toMatch(/^https:\/\/api\.example\.com\/image\/test-image-id\.jpg\?(q=80&w=\d+&h=\d+|w=\d+&h=\d+&q=80|h=\d+&w=\d+&q=80) \d+w$/);
            });

            result.forEach(entry => {
                const match = entry.match(/w=(\d+)&h=(\d+)/);
                if (match) {
                    const width = parseInt(match[1]);
                    const height = parseInt(match[2]);
                    expect(height / width).toBeCloseTo(0.75, 2);
                }
            });

            expect(result[0]).toMatch(/w=400&h=300.*400w$/);
            expect(result[1]).toMatch(/w=800&h=600.*800w$/);
        });
    });

    describe('getUrl', () => {
        it('should generate correct URL with transforms', () => {
            const url = flatlayerImage.getUrl({ w: 300, h: 200, q: 90 });
            expect(url).toBe('https://api.example.com/image/test-image-id.jpg?w=300&h=200&q=90');
        });

        it('should generate correct URL without transforms', () => {
            const url = flatlayerImage.getUrl();
            expect(url).toBe('https://api.example.com/image/test-image-id.jpg');
        });
    });

    describe('getThumbhashDataUrl', () => {
        it('should return an empty string if no thumbhash is available', () => {
            expect(flatlayerImage.getThumbhashDataUrl()).toBe('');
        });

        it('should return a data URL if thumbhash is available', () => {
            const imageWithThumbhash = new FlatlayerImage(baseUrl, {
                ...imageData,
                thumbhash: 'c3VwZXJzZWNyZXQ=' // Base64 encoded dummy data
            });
            expect(imageWithThumbhash.getThumbhashDataUrl()).toMatch(/^data:image\/png;base64,/);
        });
    });
});