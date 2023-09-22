import { redirect } from '@sveltejs/kit'
import { db, getTeamByName, getUserProfileByNetId } from '$lib/server/database'
import { getDateLocal } from '$lib/helpers.js';
import moment from 'moment';

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
		const forms = await db.form.findMany()
		const letters = await db.letter.findMany()
		const procedures = await db.procedure.findMany()

		const isQueue = await db.queueItem.findMany({
			where: {
				requestedById: profile?.id,
				complete: false
			}
		})
		
		const drQueue = await db.dataQueueItem.findMany({
			where: {
				requestedById: profile?.id,
				complete: false
			}
		})

		const masterCalendar = await db.masterCalendarItem.findMany({
			where: {
				primaryOwner: {
					id: profile?.id
				},
				completionDate: {
					equals: null
				}
			}
		})

		const counterVisits = await db.visitCounter.count({
			where: {
				createdAt: {
					gte: getDateLocal(new Date().toISOString(), "YYYY-MM-DD") + "T00:00:00.000Z"
				}
			}
		});

		let visits = await db.visitCounter.findMany({
      orderBy: {
        createdAt: "desc"
      },
			where: {
				createdAt: {
					gte: moment().subtract(3, "months").format()
				}
			},
      include: {
        appointment: true,
        referral: true
      },
    });

		let nextTraining = await db.trainingSchedule.findFirst({
      orderBy: {
        date: "asc"
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

		let counts = {
			is_queue: {
				total: isQueue.length,
				overdue_date: isQueue.filter(request => moment(request.dateNeeded).isBefore(moment(), "day")).length
			},
			dr_queue: {
				total: drQueue.length,
				overdue_date: drQueue.filter(request => moment(request.dateNeeded).isBefore(moment(), "day")).length
			},
			master_calendar: {
				total_week: masterCalendar.filter(item => moment(item.createdAt).week() === moment().week()).length,
				overdue_week: masterCalendar.filter(item => moment(item.createdAt).week() === moment().week() && moment(item.dueDate).isAfter(moment(), "day")).length
			},
			forms: {
				total: forms.filter(form => form.userProfileId === profile?.id).length,
				needs_update: forms.filter(form => moment(form.updatedAt).isBefore(moment().subtract(1, "year"))).length
			},
			letters: {
				total: letters.filter(letter => letter.userProfileId === profile?.id).length,
				needs_update: letters.filter(letter => moment(letter.updatedAt).isBefore(moment().subtract(1, "year"))).length
			},
			procedures: {
				total: procedures.filter(procedure => procedure.userProfileId === profile?.id).length,
				needs_update: procedures.filter(procedure => moment(procedure.updatedAt).isBefore(moment().subtract(1, "year"))).length
			},
			counter_visits: {
				total: counterVisits
			},
			phone_appt: {
				total_open: appointments.filter(appt => appt.type === "Phone Appointment" && !appt.completed).length,
				user_assigned: appointments.filter(appt => appt.type === "Phone Appointment" && appt.advisor === profile?.first_name + " " + profile?.last_name && !appt.completed).length,
				today: appointments.filter(appt => moment(appt.createdAt).isSameOrAfter(moment(), "day")).length
			},
			inperson_appt: {
				total_open: appointments.filter(appt => appt.type === "In-person Appointment" && !appt.completed).length,
				user_assigned: appointments.filter(appt => appt.type === "Phone Appointment" && appt.advisor === profile?.first_name + " " + profile?.last_name && !appt.completed).length,
				today: appointments.filter(appt => moment(appt.createdAt).isSameOrAfter(moment(), "day")).length
			},
			walkin_appt: {
				total_open: appointments.filter(appt => appt.type === "Walk-in Appointment" && !appt.completed).length,
				today: appointments.filter(appt => moment(appt.createdAt).isSameOrAfter(moment(), "day")).length
			},
			referral: {
				total_open: referrals.filter(referral => !referral.completed).length,
				user_assigned: referrals.filter(ref => {
					if (ref.counterUser === profile?.first_name + " " + profile?.last_name && ref.escalationUser === null) {
						return ref;
					} else if ( ref.escalationUser === profile?.first_name + " " + profile?.last_name) {
						return ref;
					}
				}).length,
				today: referrals.filter(referral => moment(referral.createdAt).isSameOrAfter(moment(), "day")).length
			}
		}

		return { profile, constants, managementTeam, isTeam, eptTeam, appointments, referrals,
			visits, appointmentReasons, visitCounterReasons, nextTraining, counts }
	} else {
		throw redirect(302, '/login')
	}
}