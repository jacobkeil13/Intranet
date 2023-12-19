import { redirect } from '@sveltejs/kit';
import { db, getTeamByName, getUserProfileByNetId } from '$lib/server/database';
import { dateAddHours, email, getDateLocal } from '$lib/helpers.js';
import type { AutocompleteOption } from '@skeletonlabs/skeleton';
import moment from 'moment';

const allUsers = await db.userProfile.findMany();

const assignedTypes = [
	'Prior Term Loan Private Request',
	'Prior Term Loan DL Request',
	'Update Population Selection',
	'Remove Rows From GURMAIL',
	'Response File Reload Request',
	'Suspense Set Up',
	'Private Loan Set',
	'PWRA Schedule Request'
];

export const load = async ({ locals }) => {
	if (locals.user) {
		let profile = await getUserProfileByNetId(locals.user.netid);
		const requests = await db.dataQueueItem.findMany({
			orderBy: {
				dateNeeded: 'asc'
			},
			include: {
				requestType: true,
				assignedTo: true,
				comments: {
					orderBy: {
						createdAt: 'desc'
					}
				},
				emailTo: true,
				priority: true,
				requestedBy: true
			}
		});
		const managementTeam = await getTeamByName('Management');
		const eptTeam = await getTeamByName('Electronic Processes');
		return { requests, eptTeam, managementTeam, profile };
	} else {
		throw redirect(302, '/dashboard');
	}
};

export const actions = {
	create: async ({ locals, request }) => {
		const { title, priority, requestType, dateNeeded, delayBatchPost, description, emailList, files } = Object.fromEntries(await request.formData()) as {
			title: string;
			priority: string;
			requestType: string;
			dateNeeded: string;
			delayBatchPost: string;
			description: string;
			emailList: string;
			files: string;
		};

		let assignUser = false;
		let emailListArr: AutocompleteOption[] = JSON.parse(emailList);
		let additionalUsers: AutocompleteOption[] = [...emailListArr];

		const eptTeam = await getTeamByName('Electronic Processes');
		const profile = await getUserProfileByNetId(locals.user.netid);

		eptTeam[0].userProfile.forEach((eptUser) => {
			let addUser: AutocompleteOption = {
				label: eptUser.first_name + ' ' + eptUser.last_name,
				value: eptUser.first_name + ' ' + eptUser.last_name,
				meta: {
					id: eptUser.id
				}
			};
			emailListArr.push(addUser);
		});

		if (profile) {
			emailListArr.push({
				label: profile.first_name + ' ' + profile.last_name,
				value: profile.first_name + ' ' + profile.last_name,
				meta: {
					id: profile.id
				}
			});
		}

		let eptTeamManager = eptTeam[0].userProfile.filter((eptUser) => {
			if (eptUser.title.name === 'Financial Aid Team Manager') {
				return eptUser;
			}
		});

		if (assignedTypes.includes(requestType)) {
			assignUser = true;
		}

		try {
			const newDataQueueItem = await db.dataQueueItem.create({
				data: {
					title,
					priority: { connect: priority !== '' && priority !== undefined ? { name: priority } : { name: 'Low' } },
					requestedBy: { connect: { id: profile?.id } },
					emailTo: {
						connect:
							emailListArr.length !== 0
								? emailListArr.map((user: AutocompleteOption) => {
										return { id: (user.meta as { id: string }).id };
								  })
								: undefined
					},
					assignedTo: { connect: assignUser ? { id: eptTeamManager[0].id } : undefined },
					requestType: { connect: { name: requestType } },
					dateNeeded: new Date(dateAddHours(dateNeeded, '12')),
					delayBatchPosting: delayBatchPost === undefined ? undefined : new Date(dateAddHours(delayBatchPost, '12')),
					complete: false
				}
			});

			await db.dataQueueComment.create({
				data: {
					content: description,
					user: profile?.first_name + ' ' + profile?.last_name,
					dataQueueItem: { connect: { id: newDataQueueItem.id } }
				}
			});

			const newQueueItemEmail = await db.dataQueueItem.findFirst({
				where: {
					id: newDataQueueItem.id
				},
				include: {
					requestType: true,
					assignedTo: true,
					comments: {
						orderBy: {
							createdAt: 'desc'
						}
					},
					emailTo: true,
					priority: true,
					requestedBy: true
				}
			});

			let eptUsers: string[] = eptTeam[0].userProfile.map((user) => user.netid + '@usf.edu');
			let cc: string[] = [];

			if (!eptTeam[0].userProfile.map((user) => user.id).includes(String(newQueueItemEmail?.requestedBy.id))) {
				cc.push(newQueueItemEmail?.requestedBy.netid + '@usf.edu');
			}
			additionalUsers.forEach((user) => {
				let userProfile = allUsers.filter((usr) => usr.id === (user.meta as { id: string }).id);
				cc.push(userProfile[0].netid + '@usf.edu');
			});

			eptUsers = eptUsers.filter((user) => !user.startsWith('tbd'));
			if (cc) {
				cc = cc.filter((user) => !user?.startsWith('tbd'));
			}

			await email('request', {
				name: 'Created by ' + profile?.first_name + ' ' + profile?.last_name,
				type: 'DR Queue Created',
				subject: 'DR Queue Created - ' + title,
				title: title,
				date: getDateLocal(dateAddHours(dateNeeded, '12'), 'YYYY-MM-DD'),
				requestType: newQueueItemEmail?.requestType.name,
				assignedUser: newQueueItemEmail?.assignedTo === null ? 'None' : newQueueItemEmail?.assignedTo?.first_name + ' ' + newQueueItemEmail?.assignedTo?.last_name,
				lastCommentedUser: newQueueItemEmail?.comments[0] ? newQueueItemEmail?.comments[0].user : null,
				lastComment: newQueueItemEmail?.comments[0] ? newQueueItemEmail?.comments[0].content : null,
				lastCommentDate: newQueueItemEmail?.comments[0] ? moment(newQueueItemEmail?.comments[0].createdAt).format('YYYY-MM-DD h:mmA') : null,
				from: profile?.netid + '@usf.edu',
				to: eptUsers,
				cc: cc,
				files: files
			});

			return { success: true, message: 'Request created successfully!' };
		} catch (error) {
			console.log({ timestamp: moment().format(), source: 'DRQueue_Create', error });
			return { success: false, message: 'Request creation failed.' };
		}
	},
	update: async ({ locals, request }) => {
		const { id, title, priority, requestType, dateNeeded, assignedToId, description, complete, emailList, requestedById, files } = Object.fromEntries(await request.formData()) as {
			id: string;
			title: string;
			priority: string;
			requestType: string;
			dateNeeded: string;
			assignedToId: string;
			description: string;
			complete: string;
			emailList: string;
			requestedById: string;
			files: string;
		};

		let emailListArr: AutocompleteOption[] = JSON.parse(emailList);
		let additionalUsers: AutocompleteOption[] = [...emailListArr];

		const eptTeam = await getTeamByName('Electronic Processes');

		eptTeam[0].userProfile.forEach((eptUser) => {
			let addUser: AutocompleteOption = {
				label: eptUser.first_name + ' ' + eptUser.last_name,
				value: eptUser.first_name + ' ' + eptUser.last_name,
				meta: {
					id: eptUser.id
				}
			};
			emailListArr.push(addUser);
		});

		if (requestedById) {
			emailListArr.push({
				label: '',
				value: '',
				meta: {
					id: requestedById
				}
			});
		}

		try {
			let profile = await getUserProfileByNetId(locals.user.netid);

			const updatedDataQueueItem = await db.dataQueueItem.update({
				where: {
					id
				},
				data: {
					title,
					priority: { connect: { name: priority } },
					requestType: { connect: { name: requestType } },
					assignedTo: { connect: { id: assignedToId } },
					emailTo: {
						set: emailListArr.length !== 0 ? emailListArr.map((user: AutocompleteOption) => ({ id: (user.meta as { id: string }).id })) : []
					},
					dateNeeded: new Date(dateAddHours(dateNeeded, '12')),
					complete: complete === 'on'
				}
			});

			if (description !== '') {
				await db.dataQueueComment.create({
					data: {
						content: description,
						user: profile?.first_name + ' ' + profile?.last_name,
						dataQueueItem: { connect: { id: updatedDataQueueItem.id } }
					}
				});
			}

			const updatedQueueItemEmail = await db.dataQueueItem.findFirst({
				where: {
					id: updatedDataQueueItem.id
				},
				include: {
					requestType: true,
					assignedTo: true,
					comments: {
						orderBy: {
							createdAt: 'desc'
						}
					},
					emailTo: true,
					priority: true,
					requestedBy: true
				}
			});

			let eptUsers: string[] = eptTeam[0].userProfile.map((user) => user.netid + '@usf.edu');
			let cc: string[] = [];

			if (!eptTeam[0].userProfile.map((user) => user.id).includes(String(updatedQueueItemEmail?.requestedBy.id))) {
				cc.push(updatedQueueItemEmail?.requestedBy.netid + '@usf.edu');
			}
			additionalUsers.forEach((user) => {
				let userProfile = allUsers.filter((usr) => usr.id === (user.meta as { id: string }).id);
				cc.push(userProfile[0].netid + '@usf.edu');
			});

			eptUsers = eptUsers.filter((user) => !user.startsWith('tbd'));
			if (cc) {
				cc = cc.filter((user) => !user?.startsWith('tbd'));
			}

			if (complete === 'on') {
				await email('request', {
					name: 'Completed by ' + profile?.first_name + ' ' + profile?.last_name,
					type: 'DR Queue Completed',
					subject: 'DR Queue Completed - ' + title,
					title: title,
					date: getDateLocal(dateAddHours(dateNeeded, '12'), 'YYYY-MM-DD'),
					requestType: updatedQueueItemEmail?.requestType.name,
					assignedUser: updatedQueueItemEmail?.assignedTo === null ? 'None' : updatedQueueItemEmail?.assignedTo?.first_name + ' ' + updatedQueueItemEmail?.assignedTo?.last_name,
					lastCommentedUser: updatedQueueItemEmail?.comments[0] ? updatedQueueItemEmail?.comments[0].user : null,
					lastComment: updatedQueueItemEmail?.comments[0] ? updatedQueueItemEmail?.comments[0].content : null,
					lastCommentDate: updatedQueueItemEmail?.comments[0] ? moment(updatedQueueItemEmail?.comments[0].createdAt).format('YYYY-MM-DD h:mmA') : null,
					from: profile?.netid + '@usf.edu',
					to: eptUsers,
					cc: cc,
					files: files
				});
			} else {
				await email('request', {
					name: 'Updated by ' + profile?.first_name + ' ' + profile?.last_name,
					type: 'DR Queue Updated',
					subject: 'DR Queue Updated - ' + title,
					title: title,
					date: getDateLocal(dateAddHours(dateNeeded, '12'), 'YYYY-MM-DD'),
					requestType: updatedQueueItemEmail?.requestType.name,
					assignedUser: updatedQueueItemEmail?.assignedTo === null ? 'None' : updatedQueueItemEmail?.assignedTo?.first_name + ' ' + updatedQueueItemEmail?.assignedTo?.last_name,
					lastCommentedUser: updatedQueueItemEmail?.comments[0] ? updatedQueueItemEmail?.comments[0].user : null,
					lastComment: updatedQueueItemEmail?.comments[0] ? updatedQueueItemEmail?.comments[0].content : null,
					lastCommentDate: updatedQueueItemEmail?.comments[0] ? moment(updatedQueueItemEmail?.comments[0].createdAt).format('YYYY-MM-DD h:mmA') : null,
					from: profile?.netid + '@usf.edu',
					to: eptUsers,
					cc: cc,
					files: files
				});
			}

			return { success: true, message: 'Request updated successfully!' };
		} catch (error) {
			console.log({ timestamp: moment().format(), source: 'DRQueue_Update', error });
			return { success: false, message: 'Request update failed.' };
		}
	}
};
