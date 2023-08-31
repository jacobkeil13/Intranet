import { redirect } from '@sveltejs/kit'
import { db, getTeamByName, getUserProfileByNetId } from '$lib/server/database'
import { getDateLocal } from '$lib/helpers.js';

export const load = async ({ locals }) => {
	if (locals.user) {
    const profile = await getUserProfileByNetId(locals.user.netid);
		const managementTeam = await getTeamByName("Management");
    const isTeam = await getTeamByName("Information Systems");
    const eptTeam = await getTeamByName("Electronic Processes");
    const constants = locals.constants;
		const appointments = await db.appointment.findMany();
    const referrals = await db.referral.findMany();
		const appointmentReasons = await db.appointmentReason.findMany();
		const visitCounterReasons = await db.visitCounterReason.findMany();

		const isQueueCount = await db.queueItem.count({
			where: {
				requestedById: profile?.id
			}
		})
		const drQueueCount = await db.dataQueueItem.count({
			where: {
				requestedById: profile?.id
			}
		})

		const formCount = await db.form.count({
			where: {
				userProfileId: profile?.id
			}
		})
		const letterCount = await db.letter.count({
			where: {
				userProfileId: profile?.id
			}
		})
		const procedureCount = await db.procedure.count({
			where: {
				userProfileId: profile?.id
			}
		})

		const counterVisits = await db.visitCounter.count({
			where: {
				createdAt: {
					gte: getDateLocal(new Date().toISOString(), "YYYY-MM-DD") + "T00:00:00.000Z"
				}
			}
		});

		return { profile, constants, managementTeam, isTeam, eptTeam, appointments, referrals, 
			isQueueCount, drQueueCount, formCount, letterCount, procedureCount, counterVisits,
			appointmentReasons, visitCounterReasons }
	} else {
		throw redirect(302, '/login')
	}
}