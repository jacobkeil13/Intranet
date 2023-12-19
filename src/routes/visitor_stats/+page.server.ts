import { getDateLocal } from '$lib/helpers';
import { db } from '$lib/server/database';
import { redirect } from '@sveltejs/kit';
import moment, { months } from 'moment';

export const load = async ({ locals }) => {
	if (locals.user) {
		if (locals.user.role === 'STUDENT') throw redirect(302, '/dashboard');
		let visits = await db.visitCounter.findMany({
			where: {
				createdAt: {
					gte: moment().subtract(2, 'months').format()
				}
			},
			orderBy: {
				createdAt: 'desc'
			},
			include: {
				appointment: true,
				referral: true
			}
		});

		let parsedVists: any[] = [];
		const visitsPerDay: { [key: string]: { visits: number; phone: number; inperson: number; walkin: number; refs: number } } = {};

		for (let visit of visits) {
			let date = getDateLocal(visit.createdAt.toISOString(), 'YYYY-MM-DD');

			if (visitsPerDay[date] === undefined) {
				visitsPerDay[date] = { visits: 0, phone: 0, inperson: 0, walkin: 0, refs: 0 };
			}

			visitsPerDay[date].visits++;

			if (visit.appointment !== null) {
				if (visit.appointment.type === 'Phone Appointment') {
					visitsPerDay[date].phone++;
				}
				if (visit.appointment.type === 'In-person Appointment') {
					visitsPerDay[date].inperson++;
				}
				if (visit.appointment.type === 'Walk-in Appointment') {
					visitsPerDay[date].walkin++;
				}
			}
			if (visit.referral !== null) {
				visitsPerDay[date].refs++;
			}
		}

		Object.keys(visitsPerDay).forEach((date) => {
			let tr = {
				date,
				totalVisits: visitsPerDay[date].visits,
				phoneAppts: visitsPerDay[date].phone,
				inPersonAppts: visitsPerDay[date].inperson,
				walkinAppts: visitsPerDay[date].walkin,
				referralsCreated: visitsPerDay[date].refs
			};
			parsedVists.push(tr);
		});

		return { parsedVists, user: locals.user };
	} else {
		throw redirect(302, '/dashboard');
	}
};
