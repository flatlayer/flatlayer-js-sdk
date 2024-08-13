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
            const entry = await flatlayer.getEntry('docs', 'getting-started');
            expect(entry).toBeDefined();
            expect(entry.slug).toBe('getting-started');
        });

        test('getBatchEntries should fetch multiple doc entries', async () => {
            const docFiles = [
                'getting-started',
                'core-concepts',
                'features',
                'api-reference',
                'integrations'
            ];
            const response = await flatlayer.getBatchEntries('docs', docFiles);
            expect(response).toBeDefined();
            expect(Array.isArray(response.data)).toBe(true);
            expect(response.data.length).toBe(docFiles.length);
            response.data.forEach(entry => {
                expect(docFiles).toContain(entry.slug);
            });
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

    describe('Error Handling', () => {
        test('getEntry should handle non-existent entry gracefully', async () => {
            try {
                await flatlayer.getEntry('docs', 'non-existent-doc');
                // If the above line doesn't throw, the test should fail
                fail('Expected an error to be thrown');
            } catch (error) {
                expect(error.status).toBe(404);
                expect(error.message).toEqual("No item found for the specified type and slug" );
            }
        });

        test('getBatchEntries should handle non-existent entries gracefully', async () => {
            const docFiles = ['getting-started', 'non-existent-doc'];
            const response = await flatlayer.getBatchEntries('docs', docFiles);
            expect(response).toBeDefined();
            expect(Array.isArray(response.data)).toBe(true);
            expect(response.data.length).toBe(1);
            expect(response.data[0].slug).toBe('getting-started');
        });
    });

    describe('Advanced Usage', () => {
        test('getEntryList should support advanced filtering', async () => {
            const response = await flatlayer.getEntryList('docs', {
                filter: {
                    $or: [
                        { slug: 'getting-started' },
                        { slug: 'core-concepts' }
                    ]
                }
            });
            expect(response).toBeDefined();
            expect(Array.isArray(response.data)).toBe(true);
            expect(response.data.length).toBe(2);
            expect(response.data.map(entry => entry.slug)).toEqual(expect.arrayContaining(['getting-started', 'core-concepts']));
        });

        test('search should support advanced options', async () => {
            const results = await flatlayer.search('docs', 'concepts', {
                fields: ['title', 'slug'],
                filter: {
                    slug: { $ne: 'getting-started' }
                }
            });
            expect(results).toBeDefined();
            expect(Array.isArray(results.data)).toBe(true);
            expect(results.data.every(entry => entry.slug !== 'getting-started')).toBe(true);
            expect(Object.keys(results.data[0])).toEqual(expect.arrayContaining(['title', 'slug']));
        });
    });
});