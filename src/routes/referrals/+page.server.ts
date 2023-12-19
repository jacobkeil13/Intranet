import { email } from '$lib/helpers';
import { db, getTeamByName, getUserProfileByNetId } from '$lib/server/database';
import type { AutocompleteOption } from '@skeletonlabs/skeleton';
import { redirect } from '@sveltejs/kit';
import moment from 'moment';
import moment_zone from 'moment-timezone';

const allUsers = await db.userProfile.findMany();

function removeDuplicates(arr: string[]) {
	return arr.filter((item, index) => arr.indexOf(item) === index);
}

export const load = async ({ locals }) => {
	let profile = getUserProfileByNetId(locals.user.netid);
	if (locals.user) {
		let referrals = await db.referral.findMany({
			orderBy: {
				bestTimeCallback: 'asc'
			},
			include: {
				comments: {
					orderBy: {
						createdAt: 'desc'
					}
				}
			}
		});
		const appointmentReasons = await db.appointmentReason.findMany();
		const visitCounterReasons = await db.visitCounterReason.findMany();
		const managementTeam = await getTeamByName('Management');

		return { referrals, constants: locals.constants, user: locals.user, appointmentReasons, visitCounterReasons, managementTeam, profile };
	} else {
		throw redirect(302, '/dashboard');
	}
};

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
			collaborators,
			escalatedUser
		} = Object.fromEntries(await request.formData()) as {
			type: string;
			visitorType: string;
			studentUid: string;
			studentEmail: string;
			studentName: string;
			reason: string;
			appReason: string;
			referralDetails: string;
			callbackNumber: string;
			bestTimeCallback: string;
			preferredContactMethod: string;
			submittedDocument: string;
			source: string;
			referralType: string;
			collaborators: string;
			escalatedUser: string;
		};

		let collaboratorsArr: AutocompleteOption[] = JSON.parse(collaborators);

		const counterUserInfo = allUsers.filter((user) => locals.user.netid === user.netid)[0];
		const escalatedUserInfo = allUsers.filter((user) => user.first_name + ' ' + user.last_name === escalatedUser);

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
					bestTimeCallback: moment_zone.tz(callbackDate.format('YYYY-MM-DD') + 'T' + bestTimeCallback + ':00.000', 'America/New_York').format(),
					reason: appReason,
					details: referralDetails,
					callbackNumber: callbackNumber === '' ? undefined : callbackNumber,
					preferredContactMethod,
					source,
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
							: null
				}
			});

			await db.referralComment.create({
				data: {
					user: counterUserInfo?.first_name + ' ' + counterUserInfo?.last_name,
					content: referralDetails,
					Referral: { connect: { id: newReferral.id } }
				}
			});

			const newReferralData = await db.referral.findFirst({
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

			const ownerInfo = allUsers.filter((user) => user.first_name + ' ' + user.last_name === newReferralData?.counterUser);
			const escalatedUserInfo = allUsers.filter((user) => user.first_name + ' ' + user.last_name === newReferralData?.escalationUser);

			let allCollaborators: string[] = [];

			if (newReferralData !== null && newReferralData.researchUser !== null) {
				allCollaborators = newReferralData.researchUser
					.split(',')
					.map((user) => {
						let foundUser = allUsers.filter((userAll) => userAll.first_name + ' ' + userAll.last_name === user);
						if (foundUser !== null && foundUser.length > 0) {
							return foundUser[0].netid + '@usf.edu';
						}
					})
					.filter((user): user is string => user !== undefined);
			}

			if (newReferralData?.referralType === 'Escalated Referral') {
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
				type: referralType + ' Created',
				name: 'Created by ' + counterUserInfo?.first_name + ' ' + counterUserInfo?.last_name,
				subject: 'New ' + referralType + ' for: ' + studentUid,
				date: moment(callbackDate).format('MM/DD/YYYY'),
				title: studentName + ' - ' + studentUid,
				owner: escalatedUser !== null && referralType === 'Escalated Referral' ? escalatedUser : counterUserInfo?.first_name + ' ' + counterUserInfo?.last_name,
				sName: studentName,
				uid: studentUid,
				phone: callbackNumber === '' ? 'None' : callbackNumber,
				reason: appReason,
				referralType: referralType,
				lastCommentedUser: newReferralData?.comments[0] ? newReferralData?.comments[0].user : null,
				lastComment: newReferralData?.comments[0] ? newReferralData?.comments[0].content : null,
				lastCommentDate: newReferralData?.comments[0] ? moment(newReferralData?.comments[0].createdAt).format('YYYY-MM-DD h:mmA') : null,
				from: 'financialaid@usf.edu',
				to: escalatedUserInfo.length > 0 && referralType === 'Escalated Referral' ? escalatedUserInfo[0].netid + '@usf.edu' : counterUserInfo.netid + '@usf.edu',
				cc: cc
			});

			return { success: true };
		} catch (error) {
			console.log({ timestamp: moment().format(), source: 'Referral_Create', error });
			return { success: false };
		}
	},
	update: async ({ locals, request }) => {
		const { id, type, complete, description, responseMethod, counterUser, collaborators } = Object.fromEntries(await request.formData()) as {
			id: string;
			type: string;
			complete: string;
			description: string;
			responseMethod: string;
			counterUser: string;
			collaborators: string;
		};

		let collaboratorsArr: AutocompleteOption[] = JSON.parse(collaborators);
		const counterUserInfo = allUsers.filter((user) => locals.user.netid === user.netid)[0];

		if (!collaborators.split(',').includes(counterUserInfo.first_name + ' ' + counterUserInfo.last_name) && counterUser !== counterUserInfo.first_name + ' ' + counterUserInfo.last_name) {
			collaboratorsArr.push({
				label: counterUserInfo.first_name + ' ' + counterUserInfo.last_name,
				value: counterUserInfo.first_name + ' ' + counterUserInfo.last_name,
				meta: {
					id: counterUserInfo.id
				}
			});
		}

		try {
			await db.referral.update({
				where: {
					id
				},
				data: {
					completed: complete === 'on',
					referralType: type === 'Escalated Referral' ? 'Escalated Referral' : collaboratorsArr.length > 0 ? 'Collaboration Referral' : 'Self Referral',
					responseMethod: responseMethod === '' ? undefined : responseMethod,
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
					lastUpdatedBy: counterUserInfo?.first_name + ' ' + counterUserInfo?.last_name
				}
			});

			await db.referralComment.create({
				data: {
					user: counterUserInfo?.first_name + ' ' + counterUserInfo?.last_name,
					content: description,
					Referral: { connect: { id } }
				}
			});

			let updatedReferral = await db.referral.findFirst({
				where: {
					id
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

			if (complete === 'on') {
				await email('referral', {
					type: updatedReferral?.referralType + ' Completed',
					name: 'Completed by ' + updatedReferral?.lastUpdatedBy,
					subject: 'Completed ' + updatedReferral?.referralType + ' for: ' + updatedReferral?.studentUid,
					date: moment(updatedReferral?.bestTimeCallback).format('MM/DD/YYYY'),
					title: updatedReferral?.studentName + ' - ' + updatedReferral?.studentUid,
					owner:
						updatedReferral?.escalationUser !== null && updatedReferral?.referralType === 'Escalated Referral'
							? updatedReferral?.escalationUser
							: ownerInfo[0].first_name + ' ' + ownerInfo[0].last_name,
					sName: updatedReferral?.studentName,
					uid: updatedReferral?.studentUid,
					phone: updatedReferral?.callbackNumber === '' ? 'None' : updatedReferral?.callbackNumber,
					reason: updatedReferral?.reason,
					referralType: updatedReferral?.referralType,
					lastCommentedUser: updatedReferral?.comments[0] ? updatedReferral?.comments[0].user : null,
					lastComment: updatedReferral?.comments[0] ? updatedReferral?.comments[0].content : null,
					lastCommentDate: updatedReferral?.comments[0] ? moment(updatedReferral?.comments[0].createdAt).format('YYYY-MM-DD h:mmA') : null,
					from: 'financialaid@usf.edu',
					to: escalatedUserInfo.length > 0 && updatedReferral?.referralType === 'Escalated Referral' ? escalatedUserInfo[0].netid + '@usf.edu' : ownerInfo[0].netid + '@usf.edu',
					cc: cc
				});
			} else {
				await email('referral', {
					type: updatedReferral?.referralType + ' Updated',
					name: 'Updated by ' + updatedReferral?.lastUpdatedBy,
					subject: 'Updated ' + updatedReferral?.referralType + ' for: ' + updatedReferral?.studentUid,
					date: moment(updatedReferral?.bestTimeCallback).format('MM/DD/YYYY'),
					title: updatedReferral?.studentName + ' - ' + updatedReferral?.studentUid,
					owner:
						updatedReferral?.escalationUser !== null && updatedReferral?.referralType === 'Escalated Referral'
							? updatedReferral?.escalationUser
							: ownerInfo[0].first_name + ' ' + ownerInfo[0].last_name,
					sName: updatedReferral?.studentName,
					uid: updatedReferral?.studentUid,
					phone: updatedReferral?.callbackNumber === '' ? 'None' : updatedReferral?.callbackNumber,
					reason: updatedReferral?.reason,
					referralType: updatedReferral?.referralType,
					lastCommentedUser: updatedReferral?.comments[0] ? updatedReferral?.comments[0].user : null,
					lastComment: updatedReferral?.comments[0] ? updatedReferral?.comments[0].content : null,
					lastCommentDate: updatedReferral?.comments[0] ? moment(updatedReferral?.comments[0].createdAt).format('YYYY-MM-DD h:mmA') : null,
					from: 'financialaid@usf.edu',
					to: escalatedUserInfo.length > 0 && updatedReferral?.referralType === 'Escalated Referral' ? escalatedUserInfo[0].netid + '@usf.edu' : ownerInfo[0].netid + '@usf.edu',
					cc: cc
				});
			}

			return { success: true, message: 'Referral updated successfully!' };
		} catch (error) {
			console.log({ timestamp: moment().format(), source: 'Referral_Update', error });
			return { success: false, message: 'Referral update failed.' };
		}
	}
};
