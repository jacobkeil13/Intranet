import { db } from "$lib/server/database";
import { redirect } from "@sveltejs/kit";

export const load = async ({ locals }) => {
	if (locals.user) {
    let forms = await db.form.findMany({
      include: {
        aidYear: true,
        owner: true
      }
    });
    return { forms }
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
      rraareq, 
      bdms, 
      web
     } = Object.fromEntries(await request.formData()) as {
      fileName: string
        letterType: string
        aidYear: string
        owner: string
        rraareq: string
        bdms: string
        web: string
    }

    try {
      const newForm = await db.form.create({
        data: {
          owner: { connect: { id: owner } },
          aidYear: { connect: { name: aidYear } },    
          name: fileName,
          rraareqCode: rraareq,
          bdms: bdms === 'on',
          web: web === 'on',
        }
      });

      return { success: true, message: "Form created successfully!", data: newForm }
    } catch (error) {
      console.log(error);
      return { success: false, message: "Form creation failed." }
    }
  },
  update: async ({ request }) => {
    const {
      id,
      fileName,
      aidYear,
      owner,
      rraareq, 
      bdms, 
      web
     } = Object.fromEntries(await request.formData()) as {
      id: string
      fileName: string
      letterType: string
      aidYear: string
      owner: string
      rraareq: string
      bdms: string
      web: string
    }

    try {
      const newForm = await db.form.update({
        where: {
          id
        },
        data: {
          owner: { connect: { id: owner } },
          aidYear: { connect: { name: aidYear } },    
          name: fileName,
          rraareqCode: rraareq,
          bdms: bdms === 'on',
          web: web === 'on',
        }
      });

      return { success: true, message: "Form updated successfully!", data: newForm }
    } catch (error) {
      console.log(error);
      return { success: false, message: "Form update failed." }
    }
  }
}