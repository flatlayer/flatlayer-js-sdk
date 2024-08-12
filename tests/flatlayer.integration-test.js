import Flatlayer from '../src/flatlayer';

describe('Flatlayer SDK Integration Tests', () => {
    let flatlayer;

    beforeAll(() => {
        flatlayer = new Flatlayer('http://127.0.0.1:8000');
    });

    describe('Entry Retrieval', () => {
        test('getEntryList should fetch docs entries', async () => {
            const response = await flatlayer.getEntryList('docs');
            expect(response).toBeDefined();
            expect(Array.isArray(response.data)).toBe(true);
            expect(response.total).toBeDefined();
            expect(response.current_page).toBeDefined();
        });

        test('getEntry should fetch a single doc entry', async () => {
            // Assuming there's a doc with slug 'test-doc'
            const entry = await flatlayer.getEntry('docs', 'getting-started');
            expect(entry).toBeDefined();
            expect(entry.slug).toBe('getting-started');
        });
    });

    describe('Search', () => {
        test('search should return results for docs', async () => {
            const results = await flatlayer.search('docs', 'what are some of the core concepts?');
            expect(results).toBeDefined();
            expect(Array.isArray(results.data)).toBe(true);
            expect(results.total).toBeDefined();
            expect(results.data[0].slug).toBe('core-concepts');
        });
    });

    describe('Image Handling', () => {
        test('getImageUrl should return a valid URL', () => {
            const imageUrl = flatlayer.getImageUrl('test-image-id', { width: 300, height: 200 });
            expect(imageUrl).toMatch(/^http:\/\/127\.0\.0\.1:8000\/image\/test-image-id\?w=300&h=200$/);
        });
    });
});