import { dateAddOffset, getUtcDate } from "$lib/helpers";
import { db, getTeamByName } from "$lib/server/database";
import { redirect } from "@sveltejs/kit";
import moment from "moment";

export const load = async ({ locals }) => {
	if (locals.user) {
    let appointments = await db.appointment.findMany();
		const appointmentReasons = await db.appointmentReason.findMany();
		const visitCounterReasons = await db.visitCounterReason.findMany();
		const managementTeam = await getTeamByName("Management");
    return { appointments, user: locals.user, appointmentReasons, visitCounterReasons, managementTeam }
	} else {
		throw redirect(302, '/dashboard');
	}
}

export const actions = {
	create: async ({ locals, request }) => {
    const {
      type,
			visitorType,
			studentUid,
			studentEmail,
			studentName,
			studentCampus,
			appReason,
			rhacomm,
			callbackNumber,
			advisorRequested,
			date,
			time,
			source
     } = Object.fromEntries(await request.formData()) as {
			type: string
			visitorType: string
			studentUid: string
			studentEmail: string
			studentName: string
			studentCampus: string
			reason: string
			appReason: string
			rhacomm: string
			callbackNumber: string
			advisorRequested: string
			date: string
			time: string
			source: string
    }

		const counterUserInfo = await db.userProfile.findFirst({
			where: {
				netid: locals.user.netid
			}
		});

    try {
      const newAppointment = await db.appointment.create({
        data: {
          type,
					visitorType,
					advisor: advisorRequested === "" ? null : advisorRequested,
					studentEmail: studentEmail === "" ? null : studentEmail,
					studentUid: studentUid === "" ? null : studentUid,
					studentName: studentName === "" ? null : studentName,
					studentCampus: studentCampus === "" ? null : studentCampus,
					dateTime: dateAddOffset(getUtcDate(date + "T" + time.replace("_", ":") + ":00.000Z")),
					reason: appReason,
					callbackNumber: callbackNumber === "" ? undefined : callbackNumber,
					rhacomm: rhacomm === 'true',
					source,
					scheduledBy: counterUserInfo?.first_name + " " + counterUserInfo?.last_name
        }
      });

      return { success: true }
    } catch (error) {
      return { success: false }
    }
  },
	update: async ({ locals, request }) => {
    const {
      id,
			timeIn,
			timeOut,
			complete,
			advisor
     } = Object.fromEntries(await request.formData()) as {
			id: string
			timeIn: string
			timeOut: string
			complete: string
			advisor: string
    }

		const counterUserInfo = await db.userProfile.findFirst({
			where: {
				netid: locals.user.netid
			}
		});

    try {
      const updatedAppointment = await db.appointment.update({
				where: {
					id
				},
        data: {
          timeIn: timeIn === "" ? null : getUtcDate(moment().format("YYYY-MM-DD") + "T" + timeIn + ":00.000"),
					timeOut: timeOut === "" ? null : getUtcDate(moment().format("YYYY-MM-DD") + "T" + timeOut + ":00.000"),
					completed: complete === "on",
					lastUpdatedBy: counterUserInfo?.first_name + " " + counterUserInfo?.last_name,
					advisor
        }
      });
			
      return { success: true, message: "Appointment updated successfully!" }
    } catch (error) {			
      return { success: false, message: "Appointment update failed." }
    }
  }
}