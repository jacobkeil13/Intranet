import { db } from '$lib/server/database';
import { redirect } from '@sveltejs/kit';
import moment from 'moment';
import type { AutocompleteOption } from '@skeletonlabs/skeleton';
import { dateAddHours } from '$lib/helpers';

export const load = async ({ locals }) => {
	if (locals.user) {
		let trackSheets = await db.trackSheet.findMany({
			orderBy: {
				reqCode: 'asc'
			},
			include: {
				approved: true,
				cancelled: true,
				declined: true,
				defaultStatus: true,
				incompleteHeld: true,
				processingStatus: true,
				processMailed: true,
				reviewedNoChange: true
			}
		});
		let trackCodes = await db.trackCode.findMany({
			include: {
				tsApproved: {
					include: {
						_count: true
					}
				},
				tsCancelled: {
					include: {
						_count: true
					}
				},
				tsDeclined: {
					include: {
						_count: true
					}
				},
				tsDefaultStatus: {
					include: {
						_count: true
					}
				},
				tsIncompleteHeld: {
					include: {
						_count: true
					}
				},
				tsProcessingStatus: {
					include: {
						_count: true
					}
				},
				tsProcessMailed: {
					include: {
						_count: true
					}
				},
				tsReviewedNoChange: {
					include: {
						_count: true
					}
				}
			}
		});
		return { trackSheets, trackCodes, constants: locals.constants, user: locals.user };
	} else {
		throw redirect(302, '/dashboard');
	}
};

export const actions = {
	createReq: async ({ request }) => {
		const { id, reqCode, description, defaultStatus, processingStatus, incompleteHeld, processMailed, approved, reviewedNoChange, declined, cancelled, requiredAdvisor, formType, uploadable } =
			Object.fromEntries(await request.formData()) as {
				id: string;
				reqCode: string;
				description: string;
				defaultStatus: string;
				processingStatus: string;
				incompleteHeld: string;
				processMailed: string;
				approved: string;
				reviewedNoChange: string;
				declined: string;
				cancelled: string;
				requiredAdvisor: string;
				formType: string;
				uploadable: string;
			};

		try {
			let newReqCode = await db.trackSheet.create({
				data: {
					reqCode,
					description,
					defaultStatus: {
						connect: defaultStatus !== '' ? defaultStatus.split(',').map((id) => ({ id })) : []
					},
					processingStatus: {
						connect: processingStatus !== '' ? processingStatus.split(',').map((id) => ({ id })) : []
					},
					incompleteHeld: {
						connect: incompleteHeld !== '' ? incompleteHeld.split(',').map((id) => ({ id })) : []
					},
					processMailed: {
						connect: processMailed !== '' ? processMailed.split(',').map((id) => ({ id })) : []
					},
					approved: {
						connect: approved !== '' ? approved.split(',').map((id) => ({ id })) : []
					},
					reviewedNoChange: {
						connect: reviewedNoChange !== '' ? reviewedNoChange.split(',').map((id) => ({ id })) : []
					},
					declined: {
						connect: declined !== '' ? declined.split(',').map((id) => ({ id })) : []
					},
					cancelled: {
						connect: cancelled !== '' ? cancelled.split(',').map((id) => ({ id })) : []
					},
					formType,
					requiresAdvisor: requiredAdvisor === 'on',
					uploadable: uploadable === 'on'
				}
			});

			return { success: true, message: 'Track sheet created successfully!' };
		} catch (error) {
			console.log({ timestamp: moment().format(), source: 'Sheet_Create', error });
			return { success: false, message: 'Track sheet creation failed.' };
		}
	},
	updateReq: async ({ request }) => {
		const { id, reqCode, description, defaultStatus, processingStatus, incompleteHeld, processMailed, approved, reviewedNoChange, declined, cancelled, requiredAdvisor, formType, uploadable } =
			Object.fromEntries(await request.formData()) as {
				id: string;
				reqCode: string;
				description: string;
				defaultStatus: string;
				processingStatus: string;
				incompleteHeld: string;
				processMailed: string;
				approved: string;
				reviewedNoChange: string;
				declined: string;
				cancelled: string;
				requiredAdvisor: string;
				formType: string;
				uploadable: string;
			};

		try {
			let updatedReqCode = await db.trackSheet.update({
				where: {
					id
				},
				data: {
					reqCode,
					description,
					defaultStatus: {
						set: defaultStatus !== '' ? defaultStatus.split(',').map((id) => ({ id })) : []
					},
					processingStatus: {
						set: processingStatus !== '' ? processingStatus.split(',').map((id) => ({ id })) : []
					},
					incompleteHeld: {
						set: incompleteHeld !== '' ? incompleteHeld.split(',').map((id) => ({ id })) : []
					},
					processMailed: {
						set: processMailed !== '' ? processMailed.split(',').map((id) => ({ id })) : []
					},
					approved: {
						set: approved !== '' ? approved.split(',').map((id) => ({ id })) : []
					},
					reviewedNoChange: {
						set: reviewedNoChange !== '' ? reviewedNoChange.split(',').map((id) => ({ id })) : []
					},
					declined: {
						set: declined !== '' ? declined.split(',').map((id) => ({ id })) : []
					},
					cancelled: {
						set: cancelled !== '' ? cancelled.split(',').map((id) => ({ id })) : []
					},
					formType,
					requiresAdvisor: requiredAdvisor === 'on',
					uploadable: uploadable === 'on'
				}
			});

			return { success: true, message: 'Track sheet updated successfully!' };
		} catch (error) {
			console.log({ timestamp: moment().format(), source: 'Sheet_Update', error });
			return { success: false, message: 'Track sheet update failed.' };
		}
	},
	createReqCode: async ({ request }) => {
		const { statusIndicator, description, satisfied } = Object.fromEntries(await request.formData()) as {
			statusIndicator: string;
			description: string;
			satisfied: string;
		};

		try {
			const newCode = await db.trackCode.create({
				data: {
					statusIndicator,
					description,
					satisfied: satisfied === 'on',
					used: true
				}
			});

			return { success: true, message: 'Track code created successfully!' };
		} catch (error) {
			console.log({ timestamp: moment().format(), source: 'ReqCode_Create', error });
			return { success: false, message: 'Track code creation failed.' };
		}
	},
	updateReqCode: async ({ request }) => {
		const { id, statusIndicator, description, satisfied } = Object.fromEntries(await request.formData()) as {
			id: string;
			statusIndicator: string;
			description: string;
			satisfied: string;
		};

		try {
			const updatedCode = await db.trackCode.update({
				where: {
					id
				},
				data: {
					statusIndicator,
					description,
					satisfied: satisfied === 'on',
					used: true
				}
			});

			return { success: true, message: 'Track code created successfully!' };
		} catch (error) {
			console.log({ timestamp: moment().format(), source: 'ReqCode_Update', error });
			return { success: false, message: 'Track code creation failed.' };
		}
	},
	deleteReq: async ({ request }) => {
		const { id } = Object.fromEntries(await request.formData()) as {
			id: string;
		};

		try {
			const deletedReq = await db.trackCode.delete({
				where: {
					id
				}
			});

			return { success: true, message: 'Track code deleted successfully!' };
		} catch (error) {
			console.log({ timestamp: moment().format(), source: 'Req_Delete', error });
			return { success: false, message: 'Track sheet deletion failed.' };
		}
	}
};
