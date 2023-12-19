import { redirect } from '@sveltejs/kit';
import { db, getTeamByName, getUserProfileByNetId } from '$lib/server/database';
import { dateAddHours, getLocalISO } from '$lib/helpers';
import type { AutocompleteOption } from '@skeletonlabs/skeleton';
import moment from 'moment';

export const load = async ({ locals }) => {
	const profile = await getUserProfileByNetId(locals.user.netid);
	if (locals.user) {
		let masterCalendarItems = await db.masterCalendarItem.findMany({
			orderBy: {
				dueDate: 'asc'
			},
			include: {
				type: true,
				primaryOwner: {
					include: {
						directReport: true
					}
				},
				secondaryOwners: true,
				comments: {
					orderBy: {
						createdAt: 'desc'
					}
				}
			}
		});
		let masterCalendarTypes = await db.masterCalendarType.findMany({ orderBy: { type: 'asc' } });
		const managementTeam = await getTeamByName('Management');
		return { masterCalendarItems, managementTeam, masterCalendarTypes, profile };
	} else {
		throw redirect(302, '/dashboard');
	}
};

export const actions = {
	create: async ({ locals, request }) => {
		const { title, type, dueDate, primaryOwner, description, secondaryOwners } = Object.fromEntries(await request.formData()) as {
			title: string;
			type: string;
			dueDate: string;
			primaryOwner: string;
			description: string;
			secondaryOwners: string;
		};

		let secondaryOwnersArr = JSON.parse(secondaryOwners);

		try {
			let profile = await getUserProfileByNetId(locals.user.netid);

			const newMasterCalendarItem = await db.masterCalendarItem.create({
				data: {
					title,
					type: { connect: { type } },
					dueDate: new Date(dateAddHours(dueDate, '12')),
					primaryOwner: { connect: { id: primaryOwner } },
					secondaryOwners: {
						connect:
							secondaryOwnersArr.length !== 0
								? secondaryOwnersArr.map((user: AutocompleteOption) => {
										return { id: (user.meta as { id: string }).id };
								  })
								: undefined
					}
				}
			});

			await db.masterCalendarComment.create({
				data: {
					content: description,
					user: profile?.first_name + ' ' + profile?.last_name,
					masterCalendar: { connect: { id: newMasterCalendarItem.id } }
				}
			});

			return { success: true, message: 'Calendar item created successfully!' };
		} catch (error) {
			console.log({ timestamp: moment().format(), source: 'MasterCalendar_Create', error });
			return { success: false, message: 'Calendar item creation failed.' };
		}
	},
	update: async ({ locals, request }) => {
		const { id, title, type, dueDate, primaryOwner, description, completionDate, secondaryOwners } = Object.fromEntries(await request.formData()) as {
			id: string;
			title: string;
			type: string;
			dueDate: string;
			primaryOwner: string;
			description: string;
			completionDate: string;
			secondaryOwners: string;
		};

		const userInfo = await db.userProfile.findFirst({
			where: {
				netid: locals.user.netid
			}
		});

		let secondaryOwnersArr = JSON.parse(secondaryOwners);

		try {
			let profile = await getUserProfileByNetId(locals.user.netid);

			const updatedMasterCalendarItem = await db.masterCalendarItem.update({
				where: {
					id
				},
				data: {
					title,
					type: { connect: { type } },
					dueDate: new Date(dateAddHours(dueDate, '12')),
					primaryOwner: { connect: { id: primaryOwner } },
					secondaryOwners: {
						set: secondaryOwnersArr.length !== 0 ? secondaryOwnersArr.map((user: AutocompleteOption) => ({ id: (user.meta as { id: string }).id })) : []
					},
					completionDate: completionDate !== '' ? new Date(dateAddHours(completionDate, '12')) : undefined,
					lastUpdatedBy: userInfo?.first_name + ' ' + userInfo?.last_name
				}
			});

			if (description !== '') {
				await db.masterCalendarComment.create({
					data: {
						content: description,
						user: profile?.first_name + ' ' + profile?.last_name,
						masterCalendar: { connect: { id: updatedMasterCalendarItem.id } }
					}
				});
			}

			return { success: true, message: 'Calendar item updated successfully!' };
		} catch (error) {
			console.log({ timestamp: moment().format(), source: 'MasterCalendar_Update', error });
			return { success: false, message: 'Calendar item update failed.' };
		}
	},
	delete: async ({ locals, request }) => {
		const { id } = Object.fromEntries(await request.formData()) as {
			id: string;
		};

		try {
			await db.masterCalendarComment.deleteMany({
				where: {
					masterCalendarId: id
				}
			});

			await db.masterCalendarItem.delete({
				where: { id }
			});

			return { success: true, message: 'Calendar item updated successfully!' };
		} catch (error) {
			console.log({ timestamp: moment().format(), source: 'MasterCalendar_Delete', error });
			return { success: false, message: 'Calendar item update failed.' };
		}
	}
};
