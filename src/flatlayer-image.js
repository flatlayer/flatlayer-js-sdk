class FlatlayerImage {
    static DECREMENT = 0.9; // 10% decrement
    static MIN_SIZE = 100;
    static MAX_SIZE = 8192;

    constructor(baseUrl, imageData, defaultTransforms = {}, breakpoints = {}, imageEndpoint = null) {
        this.baseUrl = baseUrl;
        this.imageData = imageData;
        this.defaultTransforms = defaultTransforms;
        this.breakpoints = breakpoints || {
            sm: 640,
            md: 768,
            lg: 1024,
            xl: 1280,
            '2xl': 1536,
        };
        this.imageEndpoint = imageEndpoint || `${this.baseUrl}/image`;
    }

    generateImgTag(sizes, attributes = {}, isFluid = true, displaySize = null) {
        const parsedSizes = this.parseSizes(sizes);
        const srcset = this.generateSrcset(isFluid, displaySize);
        const sizesAttribute = this.generateSizesAttribute(parsedSizes);

        const defaultAttributes = {
            src: this.getUrl(this.getBaseTransforms(displaySize)),
            alt: this.getAlt(),
            sizes: sizesAttribute,
            srcset: srcset,
            ...(displaySize ? { width: displaySize[0], height: displaySize[1] } : {}),
        };

        return this.buildImgTag({ ...defaultAttributes, ...attributes });
    }

    getAlt() {
        return this.imageData.custom_properties?.alt || '';
    }

    parseSizes(sizes) {
        return sizes.reduce((acc, size) => {
            if (size.includes(':')) {
                const [breakpoint, value] = size.split(':').map(s => s.trim());
                if (this.breakpoints[breakpoint]) {
                    acc[this.breakpoints[breakpoint]] = this.parseSize(value);
                }
            } else {
                acc[0] = this.parseSize(size);
            }
            return acc;
        }, {});
    }

    parseSize(size) {
        if (size.includes('calc') || size.includes('-')) {
            const match = size.match(/(?:calc\()?(\d+)vw\s*-\s*(\d+)px(?:\))?/);
            if (match) {
                return { type: 'calc', vw: parseInt(match[1]), px: parseInt(match[2]) };
            }
        }

        if (size.endsWith('vw')) {
            return { type: 'vw', value: parseInt(size) };
        }

        if (size.endsWith('px')) {
            return { type: 'px', value: parseInt(size) };
        }

        throw new Error(`Invalid size format: ${size}`);
    }

    generateSrcset(isFluid, displaySize = null) {
        const maxWidth = this.getMediaWidth();
        let srcset = [];

        if (displaySize) {
            const [baseWidth, baseHeight] = displaySize;
            const aspectRatio = baseHeight / baseWidth;

            if (isFluid) {
                srcset = this.generateFluidSrcset(baseWidth, maxWidth, aspectRatio);
            } else {
                srcset = this.generateFixedSrcset(baseWidth, baseHeight, maxWidth);
            }
        } else {
            srcset = isFluid
                ? this.generateFluidSrcset(maxWidth, maxWidth)
                : [this.formatSrcsetEntry(maxWidth)];
        }

        return srcset.filter((v, i, a) => a.indexOf(v) === i).join(', ');
    }

    generateFluidSrcset(baseWidth, maxWidth, aspectRatio = null) {
        const srcset = [];
        let currentWidth = Math.min(baseWidth * 2, maxWidth);

        while (currentWidth > FlatlayerImage.MIN_SIZE) {
            const currentHeight = aspectRatio ? Math.round(currentWidth * aspectRatio) : null;
            srcset.push(this.formatSrcsetEntry(currentWidth, currentHeight));
            currentWidth = Math.max(FlatlayerImage.MIN_SIZE, Math.floor(currentWidth * FlatlayerImage.DECREMENT));
        }

        if (aspectRatio && !srcset.some(entry => entry.startsWith(`${baseWidth}w`))) {
            srcset.push(this.formatSrcsetEntry(baseWidth, Math.round(baseWidth * aspectRatio)));
        }

        return srcset;
    }

    generateFixedSrcset(baseWidth, baseHeight, maxWidth) {
        const srcset = [this.formatSrcsetEntry(baseWidth, baseHeight)];
        const retinaWidth = Math.min(baseWidth * 2, maxWidth);

        if (retinaWidth > baseWidth) {
            const retinaHeight = Math.round(retinaWidth * (baseHeight / baseWidth));
            srcset.push(this.formatSrcsetEntry(retinaWidth, retinaHeight));
        }

        return srcset;
    }

    getMediaWidth() {
        const dimensions = typeof this.imageData.dimensions === 'string'
            ? JSON.parse(this.imageData.dimensions)
            : this.imageData.dimensions;

        return dimensions?.width || 0;
    }

    formatSrcsetEntry(width, height = null) {
        const transforms = { ...this.defaultTransforms, w: width, ...(height ? { h: height } : {}) };
        return `${this.getUrl(transforms)} ${width}w`;
    }

    generateSizesAttribute(parsedSizes) {
        return Object.entries(parsedSizes)
            .sort(([a], [b]) => b - a)
            .map(([breakpoint, size]) =>
                breakpoint === '0'
                    ? this.formatSize(size)
                    : `(min-width: ${breakpoint}px) ${this.formatSize(size)}`
            )
            .join(', ');
    }

    formatSize(size) {
        switch (size.type) {
            case 'px': return `${size.value}px`;
            case 'vw': return `${size.value}vw`;
            case 'calc': return `calc(${size.vw}vw - ${size.px}px)`;
            default: throw new Error(`Invalid size type: ${size.type}`);
        }
    }

    buildImgTag(attributes) {
        const attributeString = Object.entries(attributes)
            .map(([key, value]) => `${key}="${this.escapeHtml(value)}"`)
            .join(' ');

        return `<img ${attributeString}>`;
    }

    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    getBaseTransforms(displaySize) {
        return displaySize ? { w: displaySize[0], h: displaySize[1] } : {};
    }

    getUrl(transforms = {}) {
        const queryParams = new URLSearchParams(transforms).toString();
        return `${this.imageEndpoint}/${this.imageData.id}${queryParams ? `?${queryParams}` : ''}`;
    }
}

export default FlatlayerImage;