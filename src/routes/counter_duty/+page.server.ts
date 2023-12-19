import { dateAddOffset, email, getUtcDate } from '$lib/helpers.js';
import { db, getTeamByName } from '$lib/server/database';
import type { AutocompleteOption } from '@skeletonlabs/skeleton';
import { redirect } from '@sveltejs/kit';
import moment from 'moment';
import moment_zone from 'moment-timezone';

const allUsers = await db.userProfile.findMany();

function removeDuplicates(arr: string[]) {
	return arr.filter((item, index) => arr.indexOf(item) === index);
}

export const load = async ({ locals }) => {
	if (locals.user) {
		if (locals.user.role === 'STUDENT') throw redirect(302, '/dashboard');
		const appointmentReasons = await db.appointmentReason.findMany();
		const visitCounterReasons = await db.visitCounterReason.findMany();
		const managementTeam = await getTeamByName('Management');
		return { constants: locals.constants, appointmentReasons, visitCounterReasons, managementTeam };
	} else {
		throw redirect(302, '/dashboard');
	}
};

export const actions = {
	createVisit: async ({ locals, request }) => {
		const { visitorType, studentUid, studentEmail, studentName, studentCampus, reason, submittedDocument } = Object.fromEntries(await request.formData()) as {
			visitorType: string;
			studentUid: string;
			studentEmail: string;
			studentName: string;
			studentCampus: string;
			reason: string;
			submittedDocument: string;
		};

		const counterUserInfo = await db.userProfile.findFirst({
			where: {
				netid: locals.user.netid
			}
		});

		try {
			const counterVisit = await db.visitCounter.create({
				data: {
					reason,
					visitorType,
					counterUser: counterUserInfo === undefined ? 'No User' : counterUserInfo?.first_name + ' ' + counterUserInfo?.last_name,
					studentEmail: studentEmail === '' ? null : studentEmail,
					studentUid: studentUid === '' ? null : studentUid,
					studentName: studentName === '' ? null : studentName,
					studentCampus: studentCampus === '' ? null : studentCampus,
					submittedDocument: submittedDocument === 'true'
				}
			});

			return { success: true };
		} catch (error) {
			console.log({ timestamp: moment().format(), source: 'Visit_Create', error });
			return { success: false };
		}
	},
	createAppointment: async ({ locals, request }) => {
		const { type, visitorType, studentUid, studentEmail, studentName, studentCampus, reason, appReason, rhacomm, callbackNumber, advisorRequested, date, time, submittedDocument } = Object.fromEntries(
			await request.formData()
		) as {
			type: string;
			visitorType: string;
			studentUid: string;
			studentEmail: string;
			studentName: string;
			studentCampus: string;
			reason: string;
			appReason: string;
			rhacomm: string;
			callbackNumber: string;
			advisorRequested: string;
			date: string;
			time: string;
			submittedDocument: string;
		};

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
					advisor: advisorRequested === '' ? null : advisorRequested,
					studentEmail: studentEmail === '' ? null : studentEmail,
					studentUid: studentUid === '' ? null : studentUid,
					studentName: studentName === '' ? null : studentName,
					studentCampus: studentCampus === '' ? null : studentCampus,
					dateTime: moment_zone.tz(date + 'T' + time.replace('_', ':') + ':00.000', 'America/New_York').format(),
					reason: appReason,
					callbackNumber: callbackNumber === '' ? undefined : callbackNumber,
					rhacomm: rhacomm === 'true',
					source: 'Counter Duty',
					scheduledBy: counterUserInfo?.first_name + ' ' + counterUserInfo?.last_name
				}
			});

			const counterVisit = await db.visitCounter.create({
				data: {
					reason,
					visitorType,
					counterUser: counterUserInfo === undefined ? 'No User' : counterUserInfo?.first_name + ' ' + counterUserInfo?.last_name,
					studentEmail: studentEmail === '' ? null : studentEmail,
					studentUid: studentUid === '' ? null : studentUid,
					studentName: studentName === '' ? null : studentName,
					studentCampus: studentCampus === '' ? null : studentCampus,
					submittedDocument: submittedDocument === 'true',
					appointment: { connect: { id: newAppointment.id } }
				}
			});

			let advisorInfo = await db.userProfile.findFirst({
				where: {
					AND: [{ first_name: { equals: advisorRequested.split(' ')[0] } }, { last_name: { equals: advisorRequested.split(' ')[1] } }]
				}
			});

			let newTime = Number(time.split('_')[0]) > 12 ? Number(time.split('_')[0]) - 12 : Number(time.split('_')[0]);
			let ordinal = Number(time.split('_')[0]) > 11 ? 'PM' : 'AM';

			await email('new_appt', {
				type: type + ' Scheduled',
				subject: 'Scheduled ' + type + ' ' + moment(date).format('M/D/YYYY') + ' ' + newTime + ':' + time.split('_')[1] + ' ' + ordinal,
				date: moment(date).format('M/D/YYYY') + ' ' + newTime + ':' + time.split('_')[1] + ' ' + ordinal,
				title: studentName + ' - ' + studentUid,
				sName: studentName,
				uid: studentUid,
				phone: callbackNumber === '' ? 'None' : callbackNumber,
				campus: studentCampus,
				reason: appReason,
				advisor: advisorRequested,
				from: 'financialaid@usf.edu',
				to: advisorInfo?.netid + '@usf.edu'
			});

			await email('new_appt_student', {
				type: type + ' Scheduled',
				reason: appReason,
				advisor: advisorRequested,
				subject: 'Scheduled ' + type + ' ' + moment(date).format('M/D/YYYY') + ' ' + newTime + ':' + time.split('_')[1] + ' ' + ordinal,
				date: moment(date).format('M/D/YYYY') + ' ' + newTime + ':' + time.split('_')[1] + ' ' + ordinal,
				from: 'financialaid@usf.edu',
				to: studentEmail
			});

			return { success: true };
		} catch (error) {
			console.log({ timestamp: moment().format(), source: 'Appointment_Create', error });
			return { success: false };
		}
	},
	createReferral: async ({ locals, request }) => {
		const {
			type,
			visitorType,
			studentUid,
			studentEmail,
			studentName,
			studentCampus,
			reason,
			appReason,
			referralDetails,
			callbackNumber,
			bestTimeCallback,
			preferredContactMethod,
			submittedDocument,
			referralType,
			collaborators,
			escalatedUser
		} = Object.fromEntries(await request.formData()) as {
			type: string;
			visitorType: string;
			studentUid: string;
			studentEmail: string;
			studentName: string;
			studentCampus: string;
			reason: string;
			appReason: string;
			referralDetails: string;
			callbackNumber: string;
			bestTimeCallback: string;
			preferredContactMethod: string;
			submittedDocument: string;
			referralType: string;
			collaborators: string;
			escalatedUser: string;
		};

		let collaboratorsArr: AutocompleteOption[] = JSON.parse(collaborators);
		const counterUserInfo = allUsers.filter((user) => locals.user.netid === user.netid)[0];

		let callbackDate = moment().add(2, 'days');
		if (callbackDate.weekday() === 6 || callbackDate.weekday() === 0) {
			callbackDate = moment(callbackDate).add(2, 'days');
		}

		try {
			const newReferral = await db.referral.create({
				data: {
					type,
					visitorType,
					counterUser: counterUserInfo === undefined ? 'No User' : counterUserInfo?.first_name + ' ' + counterUserInfo?.last_name,
					studentEmail: studentEmail === '' ? null : studentEmail,
					studentUid: studentUid === '' ? null : studentUid,
					studentName: studentName === '' ? null : studentName,
					studentCampus: studentCampus === '' ? null : studentCampus,
					bestTimeCallback: moment_zone.tz(callbackDate.format('YYYY-MM-DD') + 'T' + bestTimeCallback + ':00.000', 'America/New_York').format(),
					reason: appReason,
					details: referralDetails,
					callbackNumber: callbackNumber === '' ? undefined : callbackNumber,
					preferredContactMethod,
					referralType,
					escalationUser: referralType === 'Escalated Referral' ? escalatedUser : null,
					researchUser:
						type === 'Escalated Referral'
							? null
							: collaboratorsArr.length > 0
							? removeDuplicates(
									collaboratorsArr.map((user) => {
										return user.label;
									})
							  ).join(',')
							: null,
					source: 'Counter Duty'
				}
			});

			const counterVisit = await db.visitCounter.create({
				data: {
					reason,
					visitorType,
					counterUser: counterUserInfo === undefined ? 'No User' : counterUserInfo?.first_name + ' ' + counterUserInfo?.last_name,
					studentEmail: studentEmail === '' ? null : studentEmail,
					studentUid: studentUid === '' ? null : studentUid,
					studentName: studentName === '' ? null : studentName,
					studentCampus: studentCampus === '' ? null : studentCampus,
					submittedDocument: submittedDocument === 'true',
					referral: { connect: { id: newReferral.id } }
				}
			});

			await db.referralComment.create({
				data: {
					user: counterUserInfo?.first_name + ' ' + counterUserInfo?.last_name,
					content: referralDetails,
					Referral: { connect: { id: newReferral.id } }
				}
			});

			let updatedReferral = await db.referral.findFirst({
				where: {
					id: newReferral.id
				},
				include: {
					comments: {
						orderBy: {
							createdAt: 'desc'
						}
					}
				}
			});

			const ownerInfo = allUsers.filter((user) => user.first_name + ' ' + user.last_name === updatedReferral?.counterUser);
			const escalatedUserInfo = allUsers.filter((user) => user.first_name + ' ' + user.last_name === updatedReferral?.escalationUser);

			let allCollaborators: string[] = [];

			if (updatedReferral !== null && updatedReferral.researchUser !== null) {
				allCollaborators = updatedReferral.researchUser
					.split(',')
					.map((user) => {
						let foundUser = allUsers.filter((userAll) => userAll.first_name + ' ' + userAll.last_name === user);
						if (foundUser !== null && foundUser.length > 0) {
							return foundUser[0].netid + '@usf.edu';
						}
					})
					.filter((user): user is string => user !== undefined);
			}

			if (updatedReferral?.referralType === 'Escalated Referral') {
				allCollaborators.push(counterUserInfo.netid + '@usf.edu');
			}

			if (escalatedUserInfo.length > 0 && ownerInfo.length > 0) {
				if (ownerInfo[0].netid !== escalatedUserInfo[0].netid) {
					allCollaborators.push(ownerInfo[0].netid + '@usf.edu');
				}
			}

			let cc = [];

			cc = removeDuplicates(allCollaborators);

			await email('referral', {
				type: updatedReferral?.referralType + ' Created',
				name: 'Created by ' + counterUserInfo?.first_name + ' ' + counterUserInfo?.last_name,
				subject: 'Updated ' + updatedReferral?.referralType + ' for: ' + updatedReferral?.studentUid,
				date: moment(updatedReferral?.bestTimeCallback).format('MM/DD/YYYY'),
				title: updatedReferral?.studentName + ' - ' + updatedReferral?.studentUid,
				owner:
					updatedReferral?.escalationUser !== null && updatedReferral?.referralType === 'Escalated Referral'
						? updatedReferral?.escalationUser
						: counterUserInfo?.first_name + ' ' + counterUserInfo?.last_name,
				sName: updatedReferral?.studentName,
				uid: updatedReferral?.studentUid,
				phone: updatedReferral?.callbackNumber === '' ? 'None' : updatedReferral?.callbackNumber,
				reason: updatedReferral?.reason,
				referralType: updatedReferral?.referralType,
				lastCommentedUser: updatedReferral?.comments[0] ? updatedReferral?.comments[0].user : null,
				lastComment: updatedReferral?.comments[0] ? updatedReferral?.comments[0].content : null,
				lastCommentDate: updatedReferral?.comments[0] ? moment(updatedReferral?.comments[0].createdAt).format('YYYY-MM-DD h:mmA') : null,
				from: 'financialaid@usf.edu',
				to: escalatedUserInfo.length > 0 && updatedReferral?.referralType === 'Escalated Referral' ? escalatedUserInfo[0].netid + '@usf.edu' : counterUserInfo?.netid + '@usf.edu',
				cc: cc
			});

			return { success: true };
		} catch (error) {
			console.log({ timestamp: moment().format(), source: 'Referral_Create', error });
			return { success: false };
		}
	}
};
