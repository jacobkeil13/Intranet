import { getUtcDate } from "$lib/helpers";
import { db } from "$lib/server/database";
import { redirect } from "@sveltejs/kit";
import moment from "moment";

export const load = async ({ locals }) => {
	if (locals.user) {
    let referrals = await db.referral.findMany();
    return { referrals, user: locals.user }
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
			preferredContactMethod
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
					bestTimeCallback: getUtcDate(callbackDate.format("YYYY-MM-DD") + "T" + bestTimeCallback + ":00.000"),
					reason: appReason,
					details: referralDetails,
					callbackNumber: callbackNumber === "" ? undefined : callbackNumber,
					preferredContactMethod
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
			complete
     } = Object.fromEntries(await request.formData()) as {
			id: string
			complete: string
    }

		console.log({id, complete});

    try {
      const updatedReferral = await db.referral.update({
				where: {
					id
				},
        data: {
					completed: complete === "on"
        }
      });
			
      return { success: true, message: "Referral updated successfully!" }
    } catch (error) {
			console.log(error);
			
      return { success: false, message: "Referral update failed." }
    }
	}
}