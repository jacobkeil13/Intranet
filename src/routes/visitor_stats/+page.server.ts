import { db } from "$lib/server/database";
import { redirect } from "@sveltejs/kit";
import moment from "moment";

export const load = async ({ locals }) => {
	if (locals.user) {
    if (locals.user.role === "STUDENT") throw redirect(302, '/dashboard');
    let visits = await db.visitCounter.findMany({
      where: {
        createdAt: {
          gte: moment().subtract(1, 'months').format()
        }
      },
      orderBy: {
        createdAt: "desc"
      },
      include: {
        appointment: true,
        referral: true
      }
    });
    return { visits, user: locals.user }
	} else {
		throw redirect(302, '/dashboard');
	}
}