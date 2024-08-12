import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

export default {
    input: 'src/flatlayer.js',
    output: [
        {
            file: 'dist/flatlayer.js',
            format: 'umd',
            name: 'Flatlayer',
        },
        {
            file: 'dist/flatlayer.mjs',
            format: 'es',
        },
        {
            file: 'dist/flatlayer.min.js',
            format: 'umd',
            name: 'Flatlayer',
            plugins: [terser()],
        },
    ],
    plugins: [
        babel({ babelHelpers: 'bundled' }),
        resolve(),
        commonjs(),
    ],
};