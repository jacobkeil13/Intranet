import { db } from "$lib/server/database";
import { json } from "@sveltejs/kit";

export async function GET({ url }) {
  const requests = await db.queueItem.findMany({
    include: {
      assignedTo: true,
      comments: {
        orderBy: {
          createdAt: "desc"
        },
        include: {
          userProfile: true
        }
      },
      emailTo: true,
      priority: true,
      requestedBy: true,
      requestType: true,
      populationSelection: {
        include: {
          addressType: true,
          aidYear: true,
          application: true,
          letterCode: true,
          requestedBy: true
        }
      }
    }
  });
  
  return json({ requests });
}
