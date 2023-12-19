import { redirect } from '@sveltejs/kit';

export const load = async ({ locals }) => {
	throw redirect(302, '/dashboard');
	// if (locals.user) {
	// 	throw redirect(302, '/dashboard')
	// } else {
	// 	throw redirect(302, '/login')
	// }
};
