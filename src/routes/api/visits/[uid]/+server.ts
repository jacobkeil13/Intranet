import { db } from '$lib/server/database';
import { json } from '@sveltejs/kit';

export async function GET({ url, params }) {
	let visits = await db.visitCounter.findMany({
		where: {
			studentUid: params.uid
		},
		include: {
			appointment: true,
			referral: true
		}
	});

	let appts = await db.appointment.findMany({
		where: {
			studentUid: params.uid
		}
	});

	let referrals = await db.referral.findMany({
		where: {
			studentUid: params.uid
		},
		include: {
			comments: true
		}
	});

	let dr_queue = await db.dataQueueItem.findMany({
		where: {
			title: {
				contains: params.uid
			}
		},
		include: {
			assignedTo: true,
			priority: true,
			requestedBy: true,
			requestType: true,
			comments: {
				orderBy: {
					createdAt: 'desc'
				}
			}
		}
	});

	return json({ visits, appts, referrals, dr_queue });
}
