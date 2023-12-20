import adapter from '@sveltejs/adapter-node';
import sveltePreprocess from 'svelte-preprocess';
/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: [sveltePreprocess()],
	onwarn: (warning, handler) => {
    if (warning.code.startsWith('a11y-') || warning.code.startsWith('A11y:')) {
      return;
    }
    handler(warning);
  },
	
	vitePlugin: {
		inspector: true,
	},
	kit: {
		adapter: adapter(),
	},
};
export default config;