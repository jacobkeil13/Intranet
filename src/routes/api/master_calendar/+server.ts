import { db } from '$lib/server/database';
import { json } from '@sveltejs/kit';

export async function GET({ url }) {
	let masterCalendarItems = await db.masterCalendarItem.findMany({
		where: {
			id: String(url.searchParams.get('id'))
		},
		orderBy: {
			dueDate: 'asc'
		},
		include: {
			type: true,
			primaryOwner: {
				include: {
					directReport: true
				}
			},
			secondaryOwners: true,
			comments: {
				orderBy: {
					createdAt: 'desc'
				}
			}
		}
	});

	return json({ masterCalendarItems });
}
