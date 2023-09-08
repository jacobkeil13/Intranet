import { dateAddOffset, getUtcDate } from "$lib/helpers";
import { db } from "$lib/server/database";
import { redirect } from "@sveltejs/kit";
import moment from "moment";

export const load = async ({ locals }) => {
	if (locals.user) {
    let referrals = await db.referral.findMany({
			include: {
				comments: true
			}
		});
		const appointmentReasons = await db.appointmentReason.findMany();
		const visitCounterReasons = await db.visitCounterReason.findMany();

    return { referrals, constants: locals.constants, user: locals.user, appointmentReasons, visitCounterReasons }
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
			appReason,
			referralDetails,
			callbackNumber,
			bestTimeCallback,
			preferredContactMethod,
			source,
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
			source: string
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

    try {
      const newReferral = await db.referral.create({
        data: {
          type,
					visitorType,
					counterUser: counterUserInfo === undefined ? "No User" : counterUserInfo?.first_name + " " + counterUserInfo?.last_name,
					studentEmail: studentEmail === "" ? null : studentEmail,
					studentUid: studentUid === "" ? null : studentUid,
					studentName: studentName === "" ? null : studentName,
					bestTimeCallback: dateAddOffset(getUtcDate(callbackDate.format("YYYY-MM-DD") + "T" + bestTimeCallback + ":00.000Z")),
					reason: appReason,
					details: referralDetails,
					callbackNumber: callbackNumber === "" ? undefined : callbackNumber,
					preferredContactMethod,
					source,
					referralType,
					escalationUser: referralType === "Escalated Referral" ? escalatedUser : null,
					researchUser: referralType === "Research Referral" ? researchUser : null
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
	},
  update: async ({ locals, request }) => {
		const {
      id,
			complete,
			description,
			responseMethod
     } = Object.fromEntries(await request.formData()) as {
			id: string
			complete: string
			description: string
			responseMethod: string
    }

		const counterUserInfo = await db.userProfile.findFirst({
			where: {
				netid: locals.user.netid
			}
		});

    try {
      await db.referral.update({
				where: {
					id
				},
        data: {
					completed: complete === "on",
					responseMethod: responseMethod === "" ? undefined : responseMethod,
					lastUpdatedBy: counterUserInfo?.first_name + " " + counterUserInfo?.last_name
        }
      });

			await db.referralComment.create({
				data: {
					user: counterUserInfo?.first_name + " " + counterUserInfo?.last_name,
					content: description,
					Referral: { connect: { id } }
				}
			})
			
      return { success: true, message: "Referral updated successfully!" }
    } catch (error) {
			console.log(error);
			
      return { success: false, message: "Referral update failed." }
    }
	}
}