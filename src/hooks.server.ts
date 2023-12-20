import type { Handle } from '@sveltejs/kit';
import { db } from '$lib/server/database';

export const handle: Handle = async ({ event, resolve }) => {
	let session = event.platform?.req.session.account;

	// let session = {
	// 	username: 'test@usf.edu'
	// };

	const profile = await db.userProfile.findFirst({
		include: {
			role: true
		},
		where: { netid: String(session?.username.split('@')[0]) }
	});

	event.locals.user = {
		netid: String(profile?.netid),
		role: String(profile?.role.name),
		name: String(profile?.first_name + ' ' + profile?.last_name)
	};

	event.locals.constants = {
		users: await db.userProfile.findMany({ orderBy: { first_name: 'asc' } }),
		priorities: await db.priority.findMany(),
		titles: await db.title.findMany(),
		teams: await db.team.findMany({ include: { userProfile: true } }),
		roles: await db.role.findMany(),
		aidYears: await db.aidYear.findMany({ orderBy: { name: 'desc' } }),
		applications: await db.application.findMany({ orderBy: { name: 'asc' } }),
		letterCodes: await db.letterCode.findMany({ orderBy: { name: 'asc' } }),
		letterTypes: await db.letterType.findMany({ orderBy: { name: 'asc' } }),
		letterGroups: await db.letterGroup.findMany({ orderBy: { name: 'asc' } }),
		addressTypes: await db.addressType.findMany({ orderBy: { name: 'asc' } }),
		requestTypes: await db.requestType.findMany({ orderBy: { name: 'asc' } }),
		dataRequestTypes: await db.dataRequestType.findMany({ orderBy: { name: 'asc' } }),
		masterCalendarTypes: await db.masterCalendarType.findMany({ orderBy: { type: 'asc' } })
	};

	return await resolve(event);
};
