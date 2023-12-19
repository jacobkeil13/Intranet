import { email, getTerm } from '$lib/helpers';
import { createPopselQueueItem, createPopulationSelection, db, getTeamByName, getUserProfileByNetId, updatePopulationSelection } from '$lib/server/database';
import type { AutocompleteOption } from '@skeletonlabs/skeleton';
import { redirect } from '@sveltejs/kit';
import moment from 'moment';

const allUsers = await db.userProfile.findMany();

export const load = async ({ locals }) => {
	if (locals.user) {
		let popsels = await db.populationSelection.findMany({
			include: {
				addressType: true,
				aidYear: true,
				application: true,
				letterCode: true,
				requestedBy: true,
				QueueItem: {
					include: {
						emailTo: true
					}
				}
			}
		});
		const isTeam = await getTeamByName('Information Systems');
		return { popsels, isTeam, constants: locals.constants, user: locals.user };
	} else {
		throw redirect(302, '/dashboard');
	}
};

export const actions = {
	create: async ({ locals, request }) => {
		const {
			date,
			aidYear,
			termCodeFull,
			application,
			letterCode,
			letterCount,
			requestedBy,
			addressTypeFull,
			paidDate,
			paidDateThirty,
			paidDateSixty,
			selectionId,
			bannerCreatorId,
			bannerUserId,
			firstTermFull,
			secondTermFull,
			thirdTermFull,
			priorAidYearFull,
			priorFallTermFull,
			priorSpringTermFull,
			emailList
		} = Object.fromEntries(await request.formData()) as {
			date: string;
			aidYear: string;
			termCodeFull: string;
			application: string;
			letterCode: string;
			letterCount: string;
			requestedBy: string;
			addressTypeFull: string;
			paidDate: string;
			paidDateThirty: string;
			paidDateSixty: string;
			selectionId: string;
			bannerCreatorId: string;
			bannerUserId: string;
			firstTermFull: string;
			secondTermFull: string;
			thirdTermFull: string;
			priorAidYearFull: string;
			priorFallTermFull: string;
			priorSpringTermFull: string;
			emailList: string;
		};

		let addressType: string = addressTypeFull;
		let termCode: string = String(getTerm(termCodeFull));
		let firstTerm: string = String(getTerm(firstTermFull));
		let secondTerm: string = String(getTerm(secondTermFull));
		let thirdTerm: string = String(getTerm(thirdTermFull));
		let priorAidYear: string = String(priorAidYearFull.split('-')[0].slice(-2) + priorAidYearFull.split('-')[1].slice(-2));
		let priorFallTerm: string = String(getTerm(priorFallTermFull));
		let priorSpringTerm: string = String(getTerm(priorSpringTermFull));

		if (addressType === 'Local Address') {
			addressType = '1ML';
		} else {
			addressType = 'Requestor';
		}

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
			let data = {
				date,
				aidYear,
				termCode: termCodeFull,
				application,
				letterCode,
				selectionId,
				bannerCreatorId,
				bannerUserId,
				letterCount,
				addressType,
				requestor: requestedBy,
				firstTerm: firstTermFull,
				secondTerm: secondTermFull,
				thirdTerm: thirdTermFull,
				priorAidYear: priorAidYearFull,
				priorFallTerm: priorFallTermFull,
				priorSpringTerm: priorSpringTermFull,
				paidDate,
				paidDateThirty,
				paidDateSixty
			};

			const newPopsel = await createPopulationSelection(data);

			let requestData = {
				netid: locals.user.netid,
				emailList: emailListArr,
				letterCode,
				popselId: newPopsel.id
			};

			let newQueueItemID = await createPopselQueueItem(requestData);

			const newQueueItemEmail = await db.queueItem.findFirst({
				where: {
					id: newQueueItemID
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

			await email('popsel', {
				type: 'Population Selection Created',
				name: 'Created by ' + profile?.first_name + ' ' + profile?.last_name,
				subject: 'Population Selection Created - ' + letterCode,
				date: moment().format('YYYY-MM-DD'),
				title: letterCode,
				popsel: {
					aidYear: aidYear,
					letterCount: letterCount,
					selectionId: selectionId,
					termCode: termCode
				},
				from: profile?.netid + '@usf.edu',
				to: isTeam[0].userProfile.map((user) => user.netid + '@usf.edu'),
				cc: cc
			});

			return { success: true, message: 'Popsel created successfully!' };
		} catch (error) {
			console.log({ timestamp: moment().format(), source: 'Popsel_Create', error });
			return { success: false, message: 'Popsel creation failed.' };
		}
	},
	update: async ({ locals, request }) => {
		const {
			id,
			date,
			aidYear,
			termCodeFull,
			application,
			letterCode,
			letterCount,
			requestedBy,
			addressTypeFull,
			paidDate,
			paidDateThirty,
			paidDateSixty,
			selectionId,
			bannerCreatorId,
			bannerUserId,
			firstTermFull,
			secondTermFull,
			thirdTermFull,
			priorAidYearFull,
			priorFallTermFull,
			priorSpringTermFull
		} = Object.fromEntries(await request.formData()) as {
			id: string;
			date: string;
			aidYear: string;
			termCodeFull: string;
			application: string;
			letterCode: string;
			letterCount: string;
			requestedBy: string;
			addressTypeFull: string;
			paidDate: string;
			paidDateThirty: string;
			paidDateSixty: string;
			selectionId: string;
			bannerCreatorId: string;
			bannerUserId: string;
			firstTermFull: string;
			secondTermFull: string;
			thirdTermFull: string;
			priorAidYearFull: string;
			priorFallTermFull: string;
			priorSpringTermFull: string;
		};

		let addressType: string = addressTypeFull;
		let termCode: string = String(getTerm(termCodeFull));
		let firstTerm: string = String(getTerm(firstTermFull));
		let secondTerm: string = String(getTerm(secondTermFull));
		let thirdTerm: string = String(getTerm(thirdTermFull));
		let priorAidYear: string = String(priorAidYearFull.split('-')[0].slice(-2) + priorAidYearFull.split('-')[1].slice(-2));
		let priorFallTerm: string = String(getTerm(priorFallTermFull));
		let priorSpringTerm: string = String(getTerm(priorSpringTermFull));

		if (addressType === 'Local Address') {
			addressType = '1ML';
		} else {
			addressType = 'Requestor';
		}

		const isTeam = await getTeamByName('Information Systems');

		try {
			let profile = await getUserProfileByNetId(locals.user.netid);
			let data = {
				id,
				date,
				aidYear,
				termCode: termCodeFull,
				application,
				letterCode,
				selectionId,
				bannerCreatorId,
				bannerUserId,
				letterCount,
				addressType,
				requestor: requestedBy,
				firstTerm: firstTermFull,
				secondTerm: secondTermFull,
				thirdTerm: thirdTermFull,
				priorAidYear: priorAidYearFull,
				priorFallTerm: priorFallTermFull,
				priorSpringTerm: priorSpringTermFull,
				paidDate,
				paidDateThirty,
				paidDateSixty
			};

			await updatePopulationSelection(data);

			let updatedPopsel = await db.populationSelection.findFirst({
				where: {
					id
				},
				include: {
					QueueItem: true,
					letterCode: true
				}
			});

			if (updatedPopsel) {
				await db.queueItem.update({
					where: {
						id: updatedPopsel.QueueItem[0].id
					},
					data: {
						title: updatedPopsel.letterCode.name
					}
				});

				await db.queueComment.create({
					data: {
						content: 'Popsel updated',
						user: profile?.first_name + ' ' + profile?.last_name,
						queueItem: { connect: { id: updatedPopsel.QueueItem[0].id } }
					}
				});
			}

			return { success: true, message: 'Popsel updated successfully!' };
		} catch (error) {
			console.log({ timestamp: moment().format(), source: 'Popsel_Update', error });
			return { success: false, message: 'Popsel update failed.' };
		}
	},
	delete: async ({ request }) => {
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

			return { success: true, message: 'Popsel deleted successfully!' };
		} catch (error) {
			console.log({ timestamp: moment().format(), source: 'Popsel_Delete', error });
			return { success: false, message: 'Popsel deletion failed.' };
		}
	}
};
