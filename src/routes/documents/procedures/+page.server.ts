import { db } from "$lib/server/database";
import { redirect } from "@sveltejs/kit";

export const load = async ({ locals }) => {
	if (locals.user) {
    let procedures = await db.procedure.findMany({
      include: {
        aidYear: true,
        owner: true
      }
    });
    return { procedures }
	} else {
		throw redirect(302, '/dashboard');
	}
}

export const actions = {
  create: async ({ request }) => {
    const {
      fileName,
      aidYear,
      owner,
      extension
     } = Object.fromEntries(await request.formData()) as {
      fileName: string
      aidYear: string
      owner: string
      extension: string
    }

    try {
      const newForm = await db.procedure.create({
        data: {
          owner: { connect: { id: owner } },
          aidYear: { connect: { name: aidYear } },    
          fileName,
          extension,
        }
      });

      return { success: true, message: "Procedure created successfully!", data: newForm }
    } catch (error) {
      return { success: false, message: "Procedure creation failed." }
    }
  },
  update: async ({ request }) => {
    const {
      id,
      fileName,
      aidYear,
      owner,
      extension
     } = Object.fromEntries(await request.formData()) as {
      id: string
      fileName: string
      aidYear: string
      owner: string
      extension: string
    }

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
        }
      });

      return { success: true, message: "Procedure updated successfully!" }
    } catch (error) {
      return { success: false, message: "Procedure update failed." }
    }
  }
}