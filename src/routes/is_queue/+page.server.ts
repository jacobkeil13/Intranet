import { redirect } from '@sveltejs/kit';
import { db, getTeamByName, getUserProfileByNetId } from '$lib/server/database';
import type { AutocompleteOption } from '@skeletonlabs/skeleton';
import { dateAddHours, email, getDateLocal } from '$lib/helpers.js';
import moment from 'moment';

const allUsers = await db.userProfile.findMany();

export const load = async ({ locals }) => {
	if (locals.user) {
		let profile = await getUserProfileByNetId(locals.user.netid);
		const requests = await db.queueItem.findMany({
			orderBy: {
				createdAt: 'asc'
			},
			include: {
				assignedTo: true,
				comments: {
					orderBy: {
						createdAt: 'desc'
					}
				},
				emailTo: true,
				priority: true,
				requestedBy: true,
				requestType: true,
				populationSelection: {
					include: {
						addressType: true,
						aidYear: true,
						application: true,
						letterCode: true,
						requestedBy: true
					}
				}
			}
		});
		const managementTeam = await getTeamByName('Management');
		const isTeam = await getTeamByName('Information Systems');
		return { requests, isTeam, managementTeam, constants: locals.constants, profile };
	} else {
		throw redirect(302, '/dashboard');
	}
};

export const actions = {
	create: async ({ locals, request }) => {
		const { title, priority, requestType, dateNeeded, delayPostDate, postTo, description, emailList, files } = Object.fromEntries(await request.formData()) as {
			title: string;
			priority: string;
			requestType: string;
			dateNeeded: string;
			delayPostDate: string;
			postTo: string;
			description: string;
			emailList: string;
			files: string;
		};

		let emailListArr: AutocompleteOption[] = JSON.parse(emailList);
		let additionalUsers: AutocompleteOption[] = [...emailListArr];
		let profile = await getUserProfileByNetId(locals.user.netid);
		const isTeam = await getTeamByName('Information Systems');

		isTeam[0].userProfile.forEach((isUser) => {
			let addUser: AutocompleteOption = {
				label: isUser.first_name + ' ' + isUser.last_name,
				value: isUser.first_name + ' ' + isUser.last_name,
				meta: {
					id: isUser.id
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

		try {
			const newQueueItem = await db.queueItem.create({
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
					requestType: { connect: { name: requestType } },
					dateNeeded: new Date(dateAddHours(dateNeeded, '12')),
					delayPosting: delayPostDate === undefined ? undefined : new Date(dateAddHours(delayPostDate, '12')),
					postTo: postTo === '' ? undefined : postTo,
					complete: false
				}
			});

			await db.queueComment.create({
				data: {
					content: description,
					user: profile?.first_name + ' ' + profile?.last_name,
					queueItem: { connect: { id: newQueueItem.id } }
				}
			});

			const newQueueItemEmail = await db.queueItem.findFirst({
				where: {
					id: newQueueItem.id
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

			let isUsers: string[] = isTeam[0].userProfile.map((user) => user.netid + '@usf.edu');
			let cc: string[] = [];

			if (!isTeam[0].userProfile.map((user) => user.id).includes(String(newQueueItemEmail?.requestedBy.id))) {
				cc.push(newQueueItemEmail?.requestedBy.netid + '@usf.edu');
			}
			additionalUsers.forEach((user) => {
				let userProfile = allUsers.filter((usr) => usr.id === (user.meta as { id: string }).id);
				cc.push(userProfile[0].netid + '@usf.edu');
			});

			isUsers = isUsers.filter((user) => !user.startsWith('tbd'));
			if (cc) {
				cc = cc.filter((user) => !user?.startsWith('tbd'));
			}

			await email('request', {
				name: 'Created by ' + profile?.first_name + ' ' + profile?.last_name,
				type: 'IS Queue Created',
				subject: 'IS Queue Created - ' + title,
				title: title,
				date: getDateLocal(dateAddHours(dateNeeded, '12'), 'YYYY-MM-DD'),
				requestType: newQueueItemEmail?.requestType.name,
				assignedUser: newQueueItemEmail?.assignedTo === null ? 'None' : newQueueItemEmail?.assignedTo?.first_name + ' ' + newQueueItemEmail?.assignedTo?.last_name,
				lastCommentedUser: newQueueItemEmail?.comments[0] ? newQueueItemEmail?.comments[0].user : null,
				lastComment: newQueueItemEmail?.comments[0] ? newQueueItemEmail?.comments[0].content : null,
				lastCommentDate: newQueueItemEmail?.comments[0] ? moment(newQueueItemEmail?.comments[0].createdAt).format('YYYY-MM-DD h:mmA') : null,
				from: profile?.netid + '@usf.edu',
				to: isUsers,
				cc: cc,
				files: files
			});

			return { success: true, message: 'Request created successfully!' };
		} catch (error) {
			console.log({ timestamp: moment().format(), source: 'ISQueue_Create', error });
			return { success: false, message: 'Request creation failed.' };
		}
	},
	update: async ({ locals, request }) => {
		const { id, title, priority, requestType, dateNeeded, assignedToId, description, complete, locked, emailList, requestedById, files } = Object.fromEntries(await request.formData()) as {
			id: string;
			title: string;
			priority: string;
			requestType: string;
			dateNeeded: string;
			assignedToId: string;
			description: string;
			complete: string;
			locked: string;
			emailList: string;
			requestedById: string;
			files: string;
		};

		let emailListArr: AutocompleteOption[] = JSON.parse(emailList);
		let additionalUsers: AutocompleteOption[] = [...emailListArr];

		const isTeam = await getTeamByName('Information Systems');

		isTeam[0].userProfile.forEach((isUser) => {
			let addUser: AutocompleteOption = {
				label: isUser.first_name + ' ' + isUser.last_name,
				value: isUser.first_name + ' ' + isUser.last_name,
				meta: {
					id: isUser.id
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

			const updatedQueueItem = await db.queueItem.update({
				where: {
					id
				},
				data: {
					title,
					priority: { connect: { name: priority } },
					requestType: { connect: { name: requestType } },
					assignedTo: { connect: { id: assignedToId } },
					dateNeeded: new Date(dateAddHours(dateNeeded, '12')),
					emailTo: {
						set: emailListArr.length !== 0 ? emailListArr.map((user: AutocompleteOption) => ({ id: (user.meta as { id: string }).id })) : []
					},
					complete: complete === 'on',
					locked: locked === 'on'
				}
			});

			if (description !== '') {
				await db.queueComment.create({
					data: {
						content: description,
						user: profile?.first_name + ' ' + profile?.last_name,
						queueItem: { connect: { id: updatedQueueItem.id } }
					}
				});
			}

			const updatedQueueItemEmail = await db.queueItem.findFirst({
				where: {
					id: updatedQueueItem.id
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
					requestedBy: true,
					populationSelection: {
						include: {
							letterCode: true
						}
					}
				}
			});

			let isUsers: string[] = isTeam[0].userProfile.map((user) => user.netid + '@usf.edu');
			let cc: string[] = [];

			if (!isTeam[0].userProfile.map((user) => user.id).includes(String(updatedQueueItemEmail?.requestedBy.id))) {
				cc.push(updatedQueueItemEmail?.requestedBy.netid + '@usf.edu');
			}
			additionalUsers.forEach((user) => {
				let userProfile = allUsers.filter((usr) => usr.id === (user.meta as { id: string }).id);
				cc.push(userProfile[0].netid + '@usf.edu');
			});

			isUsers = isUsers.filter((user) => !user.startsWith('tbd'));
			if (cc) {
				cc = cc.filter((user) => !user?.startsWith('tbd'));
			}

			if (complete === 'on') {
				if (updatedQueueItem.populationSelectionId !== null) {
					await email('request', {
						name: 'Completed by ' + profile?.first_name + ' ' + profile?.last_name,
						type: 'Population Selection Completed',
						subject: 'Population Selection Completed - ' + title,
						title: title,
						date: getDateLocal(dateAddHours(dateNeeded, '12'), 'YYYY-MM-DD'),
						requestType: updatedQueueItemEmail?.requestType.name,
						assignedUser: updatedQueueItemEmail?.assignedTo === null ? 'None' : updatedQueueItemEmail?.assignedTo?.first_name + ' ' + updatedQueueItemEmail?.assignedTo?.last_name,
						lastCommentedUser: updatedQueueItemEmail?.comments[0] ? updatedQueueItemEmail?.comments[0].user : null,
						lastComment: updatedQueueItemEmail?.comments[0] ? updatedQueueItemEmail?.comments[0].content : null,
						lastCommentDate: updatedQueueItemEmail?.comments[0] ? moment(updatedQueueItemEmail?.comments[0].createdAt).format('YYYY-MM-DD h:mmA') : null,
						popsel: updatedQueueItemEmail?.populationSelection,
						from: profile?.netid + '@usf.edu',
						to: isUsers,
						cc: cc,
						files: files
					});
				} else {
					await email('request', {
						name: 'Completed by ' + profile?.first_name + ' ' + profile?.last_name,
						type: 'IS Queue Completed',
						subject: 'IS Queue Completed - ' + title,
						title: title,
						date: getDateLocal(dateAddHours(dateNeeded, '12'), 'YYYY-MM-DD'),
						requestType: updatedQueueItemEmail?.requestType.name,
						assignedUser: updatedQueueItemEmail?.assignedTo === null ? 'None' : updatedQueueItemEmail?.assignedTo?.first_name + ' ' + updatedQueueItemEmail?.assignedTo?.last_name,
						lastCommentedUser: updatedQueueItemEmail?.comments[0] ? updatedQueueItemEmail?.comments[0].user : null,
						lastComment: updatedQueueItemEmail?.comments[0] ? updatedQueueItemEmail?.comments[0].content : null,
						lastCommentDate: updatedQueueItemEmail?.comments[0] ? moment(updatedQueueItemEmail?.comments[0].createdAt).format('YYYY-MM-DD h:mmA') : null,
						from: profile?.netid + '@usf.edu',
						to: isUsers,
						cc: cc,
						files: files
					});
				}
			} else {
				await email('request', {
					name: 'Updated by ' + profile?.first_name + ' ' + profile?.last_name,
					type: 'IS Queue Updated',
					subject: 'IS Queue Updated - ' + title,
					title: title,
					date: getDateLocal(dateAddHours(dateNeeded, '12'), 'YYYY-MM-DD'),
					requestType: updatedQueueItemEmail?.requestType.name,
					assignedUser: updatedQueueItemEmail?.assignedTo === null ? 'None' : updatedQueueItemEmail?.assignedTo?.first_name + ' ' + updatedQueueItemEmail?.assignedTo?.last_name,
					lastCommentedUser: updatedQueueItemEmail?.comments[0] ? updatedQueueItemEmail?.comments[0].user : null,
					lastComment: updatedQueueItemEmail?.comments[0] ? updatedQueueItemEmail?.comments[0].content : null,
					lastCommentDate: updatedQueueItemEmail?.comments[0] ? moment(updatedQueueItemEmail?.comments[0].createdAt).format('YYYY-MM-DD h:mmA') : null,
					from: profile?.netid + '@usf.edu',
					to: isUsers,
					cc: cc,
					files: files
				});
			}

			return { success: true, message: 'Request updated successfully!' };
		} catch (error) {
			console.log({ timestamp: moment().format(), source: 'ISQueue_Update', error });
			return { success: false, message: 'Request update failed.' };
		}
	},
	delete: async ({ request }) => {
		const { id } = Object.fromEntries(await request.formData()) as {
			id: string;
		};

		try {
			await db.queueComment.deleteMany({
				where: {
					id
				}
			});

			await db.queueItem.delete({
				where: {
					id
				}
			});

			return { success: true, message: 'Request deleted successfully!' };
		} catch (error) {
			console.log({ timestamp: moment().format(), source: 'ISQueue_Delete', error });
			return { success: false, message: 'Request deletion failed.' };
		}
	},
	deletePopsel: async ({ request }) => {
		const { id } = Object.fromEntries(await request.formData()) as {
			id: string;
		};

		try {
			let popsel = await db.populationSelection.findFirst({
				where: {
					id
				},
				include: {
					QueueItem: true
				}
			});

			await db.queueComment.deleteMany({
				where: {
					id: popsel?.QueueItem[0].id
				}
			});

			await db.populationSelection.delete({
				where: {
					id
				}
			});

			return { success: true, message: 'Request deleted successfully!' };
		} catch (error) {
			console.log({ timestamp: moment().format(), source: 'Popsel_Delete', error });
			return { success: false, message: 'Request deletion failed.' };
		}
	}
};
