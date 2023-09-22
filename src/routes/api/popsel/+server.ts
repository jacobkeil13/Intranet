import { db } from "$lib/server/database";
import { json } from "@sveltejs/kit";

export async function GET({ url }) {
  let popsels = await db.populationSelection.findMany({
    where: {
      id: String(url.searchParams.get("id"))
    },
    include: {
      addressType: true,
      aidYear: true,
      application: true,
      letterCode: true,
      requestedBy: true,
      QueueItem: {
        include: {
          emailTo: true
        }
      }
    }
  });
  
  return json({ popsels });
}
