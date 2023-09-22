import { db } from "$lib/server/database";
import { json } from "@sveltejs/kit";

export async function GET({ url }) {
  let appointments = await db.appointment.findMany({
    where: {
      studentUid: String(url.searchParams.get("uid")),
      completed: false
    }
  });

  let referrals = await db.referral.findMany({
    where: {
      studentUid: String(url.searchParams.get("uid")),
      completed: false
    }
  });
  
  return json({ appointments, referrals });
}