import { redirect } from '@sveltejs/kit';
import { db, getTeamByName, getUserProfileByNetId } from '$lib/server/database';
import { getDateLocal } from '$lib/helpers.js';
import moment from 'moment';

export const load = async ({ locals }) => {
	if (locals.user) {
		const profile = await getUserProfileByNetId(locals.user.netid);
		const managementTeam = await getTeamByName('Management');
		const isTeam = await getTeamByName('Information Systems');
		const eptTeam = await getTeamByName('Electronic Processes');
		const constants = locals.constants;
		const appointments = await db.appointment.findMany();
		const referrals = await db.referral.findMany();
		const appointmentReasons = await db.appointmentReason.findMany();
		const visitCounterReasons = await db.visitCounterReason.findMany();
		const forms = await db.form.findMany({ include: { owner: true } });
		const letters = await db.letter.findMany({
			include: { owner: true },
			where: {
				NOT: {
					letterType: {
						name: 'Old Letters'
					}
				}
			}
		});
		const procedures = await db.procedure.findMany({ include: { owner: true } });

		const isQueue = await db.queueItem.findMany({
			where: {
				requestedById: profile?.id,
				complete: false
			}
		});

		const drQueue = await db.dataQueueItem.findMany({
			where: {
				requestedById: profile?.id,
				complete: false
			}
		});

		const masterCalendar = await db.masterCalendarItem.findMany({
			where: {
				primaryOwner: {
					id: profile?.id
				},
				completionDate: {
					equals: null
				}
			}
		});

		const counterVisits = await db.visitCounter.count({
			where: {
				createdAt: {
					gte: getDateLocal(new Date().toISOString(), 'YYYY-MM-DD') + 'T00:00:00.000Z'
				}
			}
		});

		let nextTraining = await db.trainingSchedule.findFirst({
			orderBy: {
				date: 'asc'
			},
			where: {
				date: {
					gte: new Date()
				}
			},
			include: {
				trainers: true
			}
		});

		const visitsWeekly = await db.visitCounter.findMany({
			where: { createdAt: { gte: moment().subtract(6, "months").format() }}
		})

		const appointmentsWeekly = await db.appointment.findMany({
			where: { createdAt: { gte: moment().subtract(3, "months").format() }}
		})

		const referralsWeekly = await db.referral.findMany({
			where: { createdAt: { gte: moment().subtract(3, "months").format() }}
		})

		const pastWeekVisits: { "date": Date, "value": number }[] = []
		const pastWeekAppt: { "date": Date, "value": number }[] = []
		const pastWeekRef: { "date": Date, "value": number }[] = []

		let visitsPerHour: { [key: string]: { visits: number; iso: string } } = {};
		let apptPerHour: { [key: string]: { visits: number; iso: string } } = {};
		let refPerHour: { [key: string]: { visits: number; iso: string } } = {};

		for (let visit of visitsWeekly) {
			let date = moment(visit.createdAt).format('YYYY-MM-DD');
			if (visitsPerHour[date] === undefined) {
				visitsPerHour[date] = { visits: 0, iso: '' };
			}
			visitsPerHour[date].visits++;
			visitsPerHour[date].iso = moment(visit.createdAt).format();
		}

		Object.keys(visitsPerHour).forEach((time) => {
			pastWeekVisits.push({
				date: new Date(visitsPerHour[time].iso),
				value: visitsPerHour[time].visits
			});
		});

		for (let appt of appointmentsWeekly) {
			let date = moment(appt.createdAt).format('YYYY-MM-DD');
			if (apptPerHour[date] === undefined) {
				apptPerHour[date] = { visits: 0, iso: '' };
			}
			apptPerHour[date].visits++;
			apptPerHour[date].iso = moment(appt.createdAt).format();
		}

		Object.keys(apptPerHour).forEach((time) => {
			pastWeekAppt.push({
				date: new Date(apptPerHour[time].iso),
				value: apptPerHour[time].visits
			});
		});

		for (let ref of referralsWeekly) {
			let date = moment(ref.createdAt).format('YYYY-MM-DD');
			if (refPerHour[date] === undefined) {
				refPerHour[date] = { visits: 0, iso: '' };
			}
			refPerHour[date].visits++;
			refPerHour[date].iso = moment(ref.createdAt).format();
		}

		Object.keys(refPerHour).forEach((time) => {
			pastWeekRef.push({
				date: new Date(refPerHour[time].iso),
				value: refPerHour[time].visits
			});
		});

		let counts = {
			is_queue: {
				total: isQueue.length,
				overdue_date: isQueue.filter((request) => moment(request.dateNeeded).isBefore(moment(), 'day')).length
			},
			dr_queue: {
				total: drQueue.length,
				overdue_date: drQueue.filter((request) => moment(request.dateNeeded).isBefore(moment(), 'day')).length
			},
			master_calendar: {
				total_week: masterCalendar.filter((item) => moment(item.dueDate).week() === moment().week()).length,
				overdue_week: masterCalendar.filter((item) => moment(item.dueDate).week() === moment().week() && moment(item.dueDate).isBefore(moment(), 'day')).length
			},
			forms: {
				total: forms.filter((form) => form.owner.id === profile?.id).length,
				needs_update: forms.filter((form) => moment(form.updatedAt).isBefore(moment().subtract(1, 'year')) && form.owner.id === profile?.id).length
			},
			letters: {
				total: letters.filter((letter) => letter.owner.id === profile?.id).length,
				needs_update: letters.filter((letter) => moment(letter.updatedAt).isBefore(moment().subtract(1, 'year')) && letter.owner.id === profile?.id).length
			},
			procedures: {
				total: procedures.filter((procedure) => procedure.owner.id === profile?.id).length,
				needs_update: procedures.filter((procedure) => moment(procedure.updatedAt).isBefore(moment().subtract(1, 'year')) && procedure.owner.id === profile?.id).length
			},
			counter_visits: {
				total: counterVisits,
				pastWeekVisits,
				pastWeekAppt,
				pastWeekRef
			},
			phone_appt: {
				total_open: appointments.filter((appt) => appt.type === 'Phone Appointment' && !appt.completed).length,
				user_assigned: appointments.filter((appt) => appt.type === 'Phone Appointment' && appt.advisor === profile?.first_name + ' ' + profile?.last_name && !appt.completed).length,
				today: appointments.filter((appt) => moment(appt.createdAt).isSameOrAfter(moment(), 'day') && appt.type === 'Phone Appointment').length
			},
			inperson_appt: {
				total_open: appointments.filter((appt) => appt.type === 'In-person Appointment' && !appt.completed).length,
				user_assigned: appointments.filter((appt) => appt.type === 'In-person Appointment' && appt.advisor === profile?.first_name + ' ' + profile?.last_name && !appt.completed).length,
				today: appointments.filter((appt) => moment(appt.createdAt).isSameOrAfter(moment(), 'day') && appt.type === 'In-person Appointment').length
			},
			walkin_appt: {
				total_open: appointments.filter((appt) => appt.type === 'Walk-in Appointment' && !appt.completed).length,
				today: appointments.filter((appt) => moment(appt.createdAt).isSameOrAfter(moment(), 'day') && appt.type === 'Walk-in Appointment').length
			},
			referral: {
				total_open: referrals.filter((referral) => !referral.completed).length,
				user_assigned: referrals.filter((ref) => {
					if (ref.completed) return false;
					if (ref.counterUser === profile?.first_name + ' ' + profile?.last_name && ref.escalationUser === null) {
						return ref;
					} else if (ref.escalationUser === profile?.first_name + ' ' + profile?.last_name) {
						return ref;
					} else if (ref.researchUser !== null && ref.researchUser === profile?.first_name + ' ' + profile?.last_name) {
						return ref;
					}
				}).length,
				today: referrals.filter((referral) => moment(referral.createdAt).isSameOrAfter(moment(), 'day')).length
			}
		};

		return { profile, constants, managementTeam, isTeam, eptTeam, appointments, referrals, appointmentReasons, visitCounterReasons, nextTraining, counts };
	} else {
		throw redirect(302, '/login');
	}
};
