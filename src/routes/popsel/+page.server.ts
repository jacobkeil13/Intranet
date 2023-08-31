import { db } from "$lib/server/database";
import { redirect } from "@sveltejs/kit";

export const load = async ({ locals }) => {
	if (locals.user) {
    let popsels = await db.populationSelection.findMany({
      include: {
        addressType: true,
        aidYear: true,
        application: true,
        letterCode: true,
        requestedBy: true
      }
    });
    return { popsels, constants: locals.constants, user: locals.user }
	} else {
		throw redirect(302, '/dashboard');
	}
}

export const actions = {
  delete: async ({ request }) => {
    const { 
      id,
     } = Object.fromEntries(await request.formData()) as {
      id: string
    }
  
    try {
      console.log({id});
      let deletedPopsel = await db.populationSelection.delete({
        where: {
          id
        }
      });
      return { success: true, message: "Popsel deleted successfully!" }
    } catch (error) {
      console.log(error);
      return { success: false, message: "Popsel deletion failed." }
    }
  }
}