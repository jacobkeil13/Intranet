import { db } from '$lib/server/database';
import { json } from '@sveltejs/kit';

export async function GET({ url, params }) {
	let visits = await db.visitCounter.findMany({
		where: {
			AND: [
				{
					createdAt: {
						gte: params.date + 'T00:00:00.000Z'
					}
				},
				{
					createdAt: {
						lte: params.date + 'T23:59:59.000Z'
					}
				}
			]
		},
		include: {
			appointment: true,
			referral: true
		}
	});

	return json({ count: visits.length, visits });
}
