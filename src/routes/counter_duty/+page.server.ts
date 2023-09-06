import { getUtcDate } from "$lib/helpers.js";
import { db } from "$lib/server/database";
import { redirect } from "@sveltejs/kit";
import moment from "moment";

export const load = async ({ locals }) => {
	if (locals.user) {
		const appointmentReasons = await db.appointmentReason.findMany();
		const visitCounterReasons = await db.visitCounterReason.findMany();
    return { constants: locals.constants, appointmentReasons, visitCounterReasons }
	} else {
		throw redirect(302, '/dashboard');
	}
}

export const actions = {
	createVisit: async ({ locals, request }) => {
    const {
			visitorType,
			studentUid,
			studentEmail,
			studentName,
			reason,
			submittedDocument
     } = Object.fromEntries(await request.formData()) as {
			visitorType: string
			studentUid: string
			studentEmail: string
			studentName: string
			reason: string
			submittedDocument: string
    }

		const counterUserInfo = await db.userProfile.findFirst({
			where: {
				netid: locals.user.netid
			}
		});

		console.log({ studentUid, studentEmail, submittedDocument });

    try {
			const counterVisit = await db.visitCounter.create({
				data: {
					reason,
					visitorType,
					counterUser: counterUserInfo === undefined ? "No User" : counterUserInfo?.first_name + " " + counterUserInfo?.last_name,
					studentEmail: studentEmail === "" ? null : studentEmail,
					studentUid: studentUid === "" ? null : studentUid,
					studentName: studentName === "" ? null : studentName,
					submittedDocument: submittedDocument === 'true',
				}
			});

      return { success: true }
    } catch (error) {
      return { success: false }
    }
  },
  createAppointment: async ({ locals, request }) => {
    const {
      type,
			visitorType,
			studentUid,
			studentEmail,
			studentName,
			reason,
			appReason,
			rhacomm,
			callbackNumber,
			advisorRequested,
			date,
			time,
			submittedDocument
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
			submittedDocument: string
    }

		const counterUserInfo = await db.userProfile.findFirst({
			where: {
				netid: locals.user.netid
			}
		});

		console.log({ type, visitorType, studentUid, studentEmail, reason, appReason, rhacomm, callbackNumber, advisorRequested, dateTime: date + "T" + time.replace("_", ":") + ":00.000Z", submittedDocument });

    try {
      const newAppointment = await db.appointment.create({
        data: {
          type,
					visitorType,
					advisor: advisorRequested === "" ? null : advisorRequested,
					studentEmail: studentEmail === "" ? null : studentEmail,
					studentUid: studentUid === "" ? null : studentUid,
					studentName: studentName === "" ? null : studentName,
					dateTime: getUtcDate(date + "T" + time.replace("_", ":") + ":00.000Z"),
					reason: appReason,
					callbackNumber: callbackNumber === "" ? undefined : callbackNumber,
					rhacomm: rhacomm === 'true',
					source: "Counter Duty"
        }
      });

			const counterVisit = await db.visitCounter.create({
				data: {
					reason,
					visitorType,
					counterUser: counterUserInfo === undefined ? "No User" : counterUserInfo?.first_name + " " + counterUserInfo?.last_name,
					studentEmail: studentEmail === "" ? null : studentEmail,
					studentUid: studentUid === "" ? null : studentUid,
					studentName: studentName === "" ? null : studentName,
					submittedDocument: submittedDocument === 'true',
					appointment: { connect: { id: newAppointment.id } }
				}
			});

      return { success: true }
    } catch (error) {
      return { success: false }
    }
  },
	createReferral: async ({ locals, request }) => {
    const {
      type,
			visitorType,
			studentUid,
			studentEmail,
			studentName,
			reason,
			appReason,
			referralDetails,
			callbackNumber,
			bestTimeCallback,
			preferredContactMethod,
			submittedDocument,
			referralType,
			researchUser,
			escalatedUser
     } = Object.fromEntries(await request.formData()) as {
			type: string
			visitorType: string
			studentUid: string
			studentEmail: string
			studentName: string
			reason: string
			appReason: string
			referralDetails: string
			callbackNumber: string
			bestTimeCallback: string
			preferredContactMethod: string
			submittedDocument: string
			referralType: string
			researchUser: string
			escalatedUser: string
    }

		const counterUserInfo = await db.userProfile.findFirst({
			where: {
				netid: locals.user.netid
			}
		});

		let callbackDate = moment().add(2, 'days');
		if (callbackDate.weekday() === 6 || callbackDate.weekday() === 0) {
			callbackDate = moment(callbackDate).add(2, "days");
		}

		console.log(bestTimeCallback);
		

    try {
      const newReferral = await db.referral.create({
        data: {
          type,
					visitorType,
					counterUser: counterUserInfo === undefined ? "No User" : counterUserInfo?.first_name + " " + counterUserInfo?.last_name,
					studentEmail: studentEmail === "" ? null : studentEmail,
					studentUid: studentUid === "" ? null : studentUid,
					studentName: studentName === "" ? null : studentName,
					bestTimeCallback: getUtcDate(callbackDate.format("YYYY-MM-DD") + "T" + bestTimeCallback + ":00.000Z"),
					reason: appReason,
					details: referralDetails,
					callbackNumber: callbackNumber === "" ? undefined : callbackNumber,
					preferredContactMethod,
					referralType,
					escalationUser: referralType === "Escalated Referral" ? escalatedUser : null,
					researchUser: referralType === "Research Referral" ? researchUser : null,
					source: "Counter Duty"
        }
      });

			const counterVisit = await db.visitCounter.create({
				data: {
					reason,
					visitorType,
					counterUser: counterUserInfo === undefined ? "No User" : counterUserInfo?.first_name + " " + counterUserInfo?.last_name,
					studentEmail: studentEmail === "" ? null : studentEmail,
					studentUid: studentUid === "" ? null : studentUid,
					studentName: studentName === "" ? null : studentName,
					submittedDocument: submittedDocument === 'true',
					referral: { connect: { id: newReferral.id } }
				}
			});

			const newComment = await db.referralComment.create({
				data: {
					user: counterUserInfo?.first_name + " " + counterUserInfo?.last_name,
					content: referralDetails,
					Referral: { connect: { id: newReferral.id } }
				}
			})

      return { success: true }
    } catch (error) {
      return { success: false }
    }
  }
}