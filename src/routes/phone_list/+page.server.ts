import { db } from "$lib/server/database";
import { redirect } from "@sveltejs/kit";

export const load = async ({ locals }) => {
	if (locals.user) {
    let users = await db.userProfile.findMany({
      orderBy: {
        first_name: "asc"
      },
      include: {
        team: true,
        title: true
      }
    });
    let teams = await db.team.findMany({
      orderBy: {
        name: "asc"
      },

    })
    return { users, teams, user: locals.user }
	} else {
		throw redirect(302, '/dashboard');
	}
}

export const actions = {
  update: async ({ locals, request }) => {
    const {
      id,
      firstName,
      lastName,
      netId,
      uidRange,
     } = Object.fromEntries(await request.formData()) as {
        id: string
        firstName: string
        lastName: string
        netId: string
        uidRange: string
    }

    try {
      const updatedUser = await db.userProfile.update({
        where: {
          id
        },
        data: {
          first_name: firstName,
          last_name: lastName,
          netid: netId,
          uidRange: uidRange === '' ? undefined : uidRange 
        }
      })

      return { success: true, message: "User updated successfully!" }
    } catch (error) {
      return { success: false, message: "User update failed." }
    }
  }
}