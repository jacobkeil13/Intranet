import { db } from '$lib/server/database.js';
import { json } from '@sveltejs/kit';

export async function GET({ url }) {
  let appointments;
  let todaysDate = new Date().toISOString();
  
  if (String(url.searchParams.get("type")) === "Phone Appointment" || String(url.searchParams.get("type")) === "In-person Appointment") {
    appointments = await db.appointment.findMany({
      where: {
        OR: [
          {
            type: "Phone Appointment",
          },
          {
            type: "In-person Appointment",
          }
        ],
        dateTime: {
          gte: todaysDate.split("T")[0] + "T" + "00:00:00.000Z"
        }
      }
    });
  } else {
    appointments = await db.appointment.findMany({
      where: {
        type: String(url.searchParams.get("type")),
        dateTime: {
          gte: todaysDate.split("T")[0] + "T" + "00:00:00.000Z"
        }
      }
    });
  }
  
  return json({ appointments });
}