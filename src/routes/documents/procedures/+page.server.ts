import { db, getUserProfileByNetId } from '$lib/server/database';
import { redirect } from '@sveltejs/kit';
import moment from 'moment';

export const load = async ({ locals }) => {
	let profile = getUserProfileByNetId(locals.user.netid);
	if (locals.user) {
		let procedures = await db.procedure.findMany({
			include: {
				aidYear: true,
				owner: true
			},
			orderBy: {
				fileName: 'asc'
			}
		});
		return { procedures, profile };
	} else {
		throw redirect(302, '/dashboard');
	}
};

export const actions = {
	create: async ({ request }) => {
		const { fileName, aidYear, owner, extension, updatedAt } = Object.fromEntries(await request.formData()) as {
			fileName: string;
			aidYear: string;
			owner: string;
			extension: string;
			updatedAt: string;
		};

		try {
			const newForm = await db.procedure.create({
				data: {
					owner: { connect: { id: owner } },
					aidYear: { connect: { name: aidYear } },
					fileName,
					extension,
					createdAt: updatedAt !== '' ? moment(updatedAt).add(12, 'hours').format() : undefined,
					updatedAt: updatedAt !== '' ? moment(updatedAt).add(12, 'hours').format() : undefined
				}
			});

			return { success: true, message: 'Procedure created successfully!', data: newForm };
		} catch (error) {
			console.log({ timestamp: moment().format(), source: 'Procedure_Create', error });
			return { success: false, message: 'Procedure creation failed.' };
		}
	},
	update: async ({ request }) => {
		const { id, fileName, aidYear, owner, extension, updatedAt } = Object.fromEntries(await request.formData()) as {
			id: string;
			fileName: string;
			aidYear: string;
			owner: string;
			extension: string;
			updatedAt: string;
		};

		try {
			const updatedForm = await db.procedure.update({
				where: {
					id
				},
				data: {
					owner: { connect: { id: owner } },
					aidYear: { connect: { name: aidYear } },
					fileName,
					extension,
					updatedAt: updatedAt !== '' ? moment(updatedAt).add(12, 'hours').format() : undefined
				}
			});

			return { success: true, message: 'Procedure updated successfully!' };
		} catch (error) {
			console.log({ timestamp: moment().format(), source: 'Procedure_Update', error });
			return { success: false, message: 'Procedure update failed.' };
		}
	}
};
