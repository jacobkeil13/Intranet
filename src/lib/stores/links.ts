import { writable } from 'svelte/store';
import type { SidebarLinks } from '../../app';

export const links = writable([
	{
		label: 'MyUSF',
		link: 'https://my.usf.edu/',
		target: '_blank'
	},
	{
		label: 'SAVE Login',
		link: 'https://save.uscis.gov/web/vislogin.aspx?JS=YES',
		target: '_blank'
	}
]);
