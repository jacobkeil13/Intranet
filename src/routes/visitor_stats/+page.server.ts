import { db } from "$lib/server/database";
import { redirect } from "@sveltejs/kit";
import moment from "moment";

export const load = async ({ locals }) => {
	if (locals.user) {
    let visits = await db.visitCounter.findMany({
      orderBy: {
        createdAt: "desc"
      },
      where: {
        createdAt: {
          gte: moment().subtract(1, "month").format()
        }
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