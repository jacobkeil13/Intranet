import { dateAddOffset, email, getUtcDate } from "$lib/helpers";
import { db, getTeamByName } from "$lib/server/database";
import { redirect } from "@sveltejs/kit";
import moment from "moment";

export const load = async ({ locals }) => {
	if (locals.user) {
    let appointments = await db.appointment.findMany({
			orderBy: {
				createdAt: "desc"
			}
		});
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

			let advisorInfo = await db.userProfile.findFirst({
				where: {
					AND: [
						{ first_name: { equals: advisorRequested.split(" ")[0] } },
						{ last_name: { equals: advisorRequested.split(" ")[1] } }
					]
				},
			})

			let newTime = Number(time.split("_")[0]) > 12 ? Number(time.split("_")[0]) - 12 : Number(time.split("_")[0]);
			let ordinal = Number(time.split("_")[0]) > 11 ? "PM" : "AM";

			await email("new_appt", {
				"type": type + " Scheduled",
        "subject": "Scheduled " + type + " " + moment(date).format("M/D/YYYY") + " " + newTime + ":" + time.split("_")[1] + " " + ordinal,
				"date": moment(date).format("M/D/YYYY") + " " + newTime + ":" + time.split("_")[1] + " " + ordinal,
        "title": studentName + " - " + studentUid,
        "sName": studentName,
        "uid": studentUid,
        "phone": callbackNumber === "" ? "None" : callbackNumber,
        "campus": studentCampus,
				"reason": appReason,
				"advisor": advisorRequested,
        "from": "financialaid@usf.edu",
        "to": advisorInfo?.netid + "@usf.edu"
      });

			await email("new_appt_student", {
				"type": type + " Scheduled",
				"reason": appReason,
				"advisor": advisorRequested,
        "subject": "Scheduled " + type + " " + moment(date).format("M/D/YYYY") + " " + newTime + ":" + time.split("_")[1] + " " + ordinal,
				"date": moment(date).format("M/D/YYYY") + " " + newTime + ":" + time.split("_")[1] + " " + ordinal,
				"from": "financialaid@usf.edu",
        "to": studentEmail
      });

      return { success: true }
    } catch (error) {
			console.log({ timestamp: moment().format(), source: "Appointment_Create", error });
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
			console.log({ timestamp: moment().format(), source: "Appointment_Update", error });
      return { success: false, message: "Appointment update failed." }
    }
  }
}