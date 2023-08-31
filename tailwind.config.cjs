import { join } from 'path';
import skeleton from '@skeletonlabs/skeleton/tailwind/skeleton.cjs';

/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: 'class',
	content: ['./src/**/*.{html,js,svelte,ts}', join(require.resolve('@skeletonlabs/skeleton'), '../**/*.{html,js,svelte,ts}')],
	theme: {
		extend: {
			screens: {
				mobile: '480px',
				tablet: '960px',
				desktop: '1248px'
			},
			colors: {
				usfGreen: '#006747',
				usfGold: '#CFC493',
				usfWhite: '#FFFFFF',
				secSand: '#EDEBD1',
				secEvergreen: '#005432',
				accLemongrass: '#DBE442',
				accApple: '#9CCB3B',
				accTeal: '#009374',
				accSeaglass: '#80B0A6',
				accStorm: '#006484',
				accSilver: '#CAD2D8',
				accGray: '#7E96A0',
				accSlate: '#293a40'
			}
		}
	},
	plugins: [require('@tailwindcss/forms'), ...skeleton()]
};
