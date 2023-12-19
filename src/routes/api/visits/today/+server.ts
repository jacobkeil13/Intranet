import { getDateLocal } from '$lib/helpers';
import { db } from '$lib/server/database';
import { json } from '@sveltejs/kit';

export async function GET({ url, params }) {
	const counterVisits = await db.visitCounter.count({
		where: {
			createdAt: {
				gte: getDateLocal(new Date().toISOString(), 'YYYY-MM-DD') + 'T00:00:00.000Z'
			}
		}
	});

	return json({ counterVisits });
}
