// import nodeResolve from '@rollup/plugin-node-resolve';
// import commonjs from '@rollup/plugin-commonjs';
// import terser from '@rollup/plugin-terser';

// const LIB_DIR = 'lib';
// const INPUT = LIB_DIR + '/index.js';
// const PLUGINS = [nodeResolve({ preferBuiltins: false, browser: true }), commonjs()];
// const MINIFIER = terser({ keep_classnames: true, keep_fnames: true });
// const OUTPUT_PREFIX = LIB_DIR + '/browser/index';

// const COMMON_CONFIG = {
//     input: INPUT,
//     plugins: PLUGINS,
// };

// const IIFE_CONFIG = {
//     ...COMMON_CONFIG,
//     output: {
//         file: `${OUTPUT_PREFIX}.js`,
//         format: 'iife',
//         sourcemap: false,
//         name: 'MillenniumDB',
//     },
// };

// const ESM_CONFIG = {
//     ...COMMON_CONFIG,
//     output: {
//         file: `${OUTPUT_PREFIX}.esm.js`,
//         format: 'es',
//         sourcemap: false,
//         name: 'MillenniumDB',
//     },
// };

// const IIFE_MIN_CONFIG = {
//     ...IIFE_CONFIG,
//     output: {
//         ...IIFE_CONFIG.output,
//         file: `${OUTPUT_PREFIX}.min.js`,
//     },
//     plugins: [...IIFE_CONFIG.plugins, MINIFIER],
// };

// const ESM_MIN_CONFIG = {
//     ...ESM_CONFIG,
//     output: {
//         ...ESM_CONFIG.output,
//         file: `${OUTPUT_PREFIX}.esm.min.js`,
//     },
//     plugins: [...ESM_CONFIG.plugins, MINIFIER],
// };

// export default [IIFE_CONFIG, ESM_CONFIG, IIFE_MIN_CONFIG, ESM_MIN_CONFIG];

import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import dts from 'rollup-plugin-dts';
import polyfillNode from 'rollup-plugin-polyfill-node';

export default [
    // ESM
    {
        input: 'src/index.ts',
        output: [
            {
                file: 'lib/index.esm.js',
                format: 'es',
                sourcemap: true,
            },
            {
                file: 'lib/index.esm.min.js',
                format: 'es',
                sourcemap: true,
                plugins: [terser()],
            },
        ],
        plugins: [polyfillNode(), typescript({ tsconfig: './tsconfig.json' })],
    },
    // CJS
    {
        input: 'src/index.ts',
        output: [
            {
                file: 'lib/index.cjs.js',
                format: 'cjs',
                sourcemap: true,
                exports: 'named',
            },
            {
                file: 'lib/index.cjs.min.js',
                format: 'cjs',
                sourcemap: true,
                exports: 'named',
                plugins: [terser()],
            },
        ],
        plugins: [typescript({ tsconfig: './tsconfig.json' })],
    },
    // types
    {
        input: 'lib/types/index.d.ts',
        output: {
            file: 'lib/index.d.ts',
            format: 'es',
        },
        plugins: [dts()],
    },
];
