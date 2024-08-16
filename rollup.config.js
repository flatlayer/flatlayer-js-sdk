import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

export default {
    input: 'src/index.js',
    output: [
        {
            file: 'dist/flatlayer.js',
            format: 'umd',
            name: 'FlatlayerSDK',
            exports: 'named',
        },
        {
            file: 'dist/flatlayer.mjs',
            format: 'es',
        },
        {
            file: 'dist/flatlayer.min.js',
            format: 'umd',
            name: 'FlatlayerSDK',
            exports: 'named',
            plugins: [terser()],
        },
    ],
    plugins: [
        babel({ babelHelpers: 'bundled' }),
        resolve(),
        commonjs(),
    ],
};