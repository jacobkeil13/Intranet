import { getUtcDate } from "$lib/helpers";
import { db } from "$lib/server/database";
import { redirect } from "@sveltejs/kit";
import moment from "moment";

export const load = async ({ locals }) => {
	if (locals.user) {
    let appointments = await db.appointment.findMany();
    return { appointments, user: locals.user }
	} else {
		throw redirect(302, '/dashboard');
	}
}

export const actions = {
	create: async ({ request }) => {
    const {
      type,
			visitorType,
			studentUid,
			studentEmail,
			studentName,
			appReason,
			rhacomm,
			callbackNumber,
			advisorRequested,
			date,
			time
     } = Object.fromEntries(await request.formData()) as {
			type: string
			visitorType: string
			studentUid: string
			studentEmail: string
			studentName: string
			reason: string
			appReason: string
			rhacomm: string
			callbackNumber: string
			advisorRequested: string
			date: string
			time: string
    }

    try {
      const newAppointment = await db.appointment.create({
        data: {
          type,
					visitorType,
					advisor: advisorRequested === "" ? null : advisorRequested,
					studentEmail: studentEmail === "" ? null : studentEmail,
					studentUid: studentUid === "" ? null : studentUid,
					studentName: studentName === "" ? null : studentName,
					dateTime: getUtcDate(date + "T" + time.replace("_", ":") + ":00.000"),
					reason: appReason,
					callbackNumber: callbackNumber === "" ? undefined : callbackNumber,
					rhacomm: rhacomm === 'true'
        }
      });

      return { success: true }
    } catch (error) {
      return { success: false }
    }
  },
	update: async ({ request }) => {
    const {
      id,
			timeIn,
			timeOut,
			complete
     } = Object.fromEntries(await request.formData()) as {
			id: string
			timeIn: string
			timeOut: string
			complete: string
    }

		console.log({id, timeIn, timeOut, complete});

    try {
      const updatedAppointment = await db.appointment.update({
				where: {
					id
				},
        data: {
          timeIn: timeIn === "" ? null : getUtcDate(moment().format("YYYY-MM-DD") + "T" + timeIn + ":00.000"),
					timeOut: timeOut === "" ? null : getUtcDate(moment().format("YYYY-MM-DD") + "T" + timeOut + ":00.000"),
					completed: complete === "on"
        }
      });
			
      return { success: true, message: "Appointment updated successfully!" }
    } catch (error) {
			console.log(error);
			
      return { success: false, message: "Appointment update failed." }
    }
  }
}