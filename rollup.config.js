import pkg from './package.json';
import { terser } from 'rollup-plugin-terser';

const name = pkg.name
    .replace(/^(@\S+\/)?(svelte-)?(\S+)/, '$3')
    .replace(/^\w/, m => m.toUpperCase())
    .replace(/-\w/g, m => m[1].toUpperCase());

export default {
    input: './src/index.js',
    output: [
        {
            dir: './dist/',
            format: 'es',
            name,
            plugins: [terser()]
        }
    ],
    external: [ 'svelte/store' ] 
}