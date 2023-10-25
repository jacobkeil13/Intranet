import { db, getUserProfileByNetId } from "$lib/server/database";
import { redirect } from "@sveltejs/kit";
import moment from "moment";

export const load = async ({ locals }) => {
	if (locals.user) {
    let profile = getUserProfileByNetId(locals.user.netid);
    let forms = await db.form.findMany({
      include: {
        aidYear: true,
        owner: true
      }
    });
    return { forms, profile }
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
      web,
      updatedAt
     } = Object.fromEntries(await request.formData()) as {
      fileName: string
        letterType: string
        aidYear: string
        owner: string
        rraareq: string
        bdms: string
        web: string
        updatedAt: string
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
          createdAt: updatedAt !== "" ? moment(updatedAt).add(12, "hours").format() : undefined,
          updatedAt: updatedAt !== "" ? moment(updatedAt).add(12, "hours").format() : undefined
        }
      });

      return { success: true, message: "Form created successfully!", data: newForm }
    } catch (error) {
      console.log({ timestamp: moment().format(), source: "Form_Create", error });
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
      web,
      updatedAt
     } = Object.fromEntries(await request.formData()) as {
      id: string
      fileName: string
      letterType: string
      aidYear: string
      owner: string
      rraareq: string
      bdms: string
      web: string
      updatedAt: string
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
          updatedAt: updatedAt !== "" ? moment(updatedAt).add(12, "hours").format() : undefined
        }
      });

      return { success: true, message: "Form updated successfully!", data: newForm }
    } catch (error) {
      console.log({ timestamp: moment().format(), source: "Form_Update", error });
      return { success: false, message: "Form update failed." }
    }
  }
}