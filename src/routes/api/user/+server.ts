import { db } from '$lib/server/database';
import { json } from '@sveltejs/kit';

export async function GET({ url }) {
	let users = await db.userProfile.findMany({
		where: {
			id: String(url.searchParams.get('id'))
		},
		orderBy: {
			first_name: 'asc'
		},
		include: {
			team: true,
			title: true,
			role: true,
			directReport: true
		}
	});

	return json({ users });
}
