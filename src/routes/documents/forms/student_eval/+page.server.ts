import { db } from "$lib/server/database";
import { redirect } from "@sveltejs/kit";

export const load = async ({ locals }) => {
	if (locals.user) {
    let users = await db.userProfile.findMany({
      where: {
        title: {
          OR: [
            {
              name: {
                contains: "Manage"
              }
            },
            {
              name: {
                contains: "Director"
              }
            }
          ]
        }
      },
      orderBy: {
        first_name: "asc"
      }
    });
    return { users }
	} else {
		throw redirect(302, '/dashboard');
	}
}