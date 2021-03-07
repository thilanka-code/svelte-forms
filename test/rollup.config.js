import { sveltePreprocess } from 'svelte-preprocess/dist/autoProcess';
import svelte from 'rollup-plugin-svelte';
import livereload from 'rollup-plugin-livereload';
import {terser} from 'rollup-plugin-terser';
import resolve from 'rollup-plugin-node-resolve';

const production = !process.env.ROLLUP_WATCH;

function serve() {
	let server;
	
	function toExit() {
		if (server) server.kill(0);
	}

	return {
		writeBundle() {
			if (server) return;
			server = require('child_process').spawn('npm', ['run', 'start', '--', '--dev'], {
				stdio: ['ignore', 'inherit', 'inherit'],
				shell: true
			});

			process.on('SIGTERM', toExit);
			process.on('exit', toExit);
		}
	};
}

export default {
    input: './test/index.js',
	output: {
		sourcemap: true,
		format: 'iife',
		file: './test/public/build/bundle.js'
	},
	plugins: [
		svelte({
			preprocess: sveltePreprocess(),
			dev: !production,
            css: css => {
                css.write('./test/public/build/bundle.css');
            },

		}),

		resolve(),
		// In dev mode, call `npm run start` once
		// the bundle has been generated
		!production && serve(),

		// Watch the `public` directory and refresh the
		// browser on changes when not in production
		!production && livereload('test'),

		// If we're building for production (npm run build
		// instead of npm run dev), minify
		production && terser()
	],
	watch: {
		clearScreen: false
	}
}