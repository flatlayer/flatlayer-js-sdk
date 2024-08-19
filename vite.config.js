import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    build: {
        lib: {
            entry: resolve(__dirname, 'src/index.js'),
            name: 'FlatlayerSDK',
            fileName: (format) => `flatlayer.${format}.js`
        },
        rollupOptions: {
            external: ['thumbhash'],
            output: {
                globals: {
                    'thumbhash': 'thumbhash'
                }
            }
        }
    }
});