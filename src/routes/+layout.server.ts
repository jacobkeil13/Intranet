import { redirect } from '@sveltejs/kit'
import { getUserProfileByNetId } from '$lib/server/database'

export const load = async ({ locals }) => {
	if (locals.user) {
    const profile = await getUserProfileByNetId(locals.user.netid);
    const constants = locals.constants;
		return { profile, constants }
	} else {
		throw redirect(302, '/login')
	}
}