import { redirect } from '@sveltejs/kit'
import {
  db,
  getTeamByName,
  getUserProfileByNetId,
} from '$lib/server/database'
import { dateAddHours } from '$lib/helpers';
import type { AutocompleteOption } from '@skeletonlabs/skeleton';

export const load = async ({ locals }) => {
	if (locals.user) {
    let masterCalendarItems = await db.masterCalendarItem.findMany({
      include: {
        type: true,
        primaryOwner: true,
        secondaryOwners: true,
        comments: {
          include: {
            userProfile: true
          }
        }
      }
    });
    let masterCalendarTypes = await db.masterCalendarType.findMany();
    const managementTeam = await getTeamByName("Management");
    return { masterCalendarItems, managementTeam, masterCalendarTypes }
	} else {
		throw redirect(302, '/dashboard');
	}
}

export const actions = {
  create: async ({ locals, request }) => {
    const { 
      title,
      type,
      dueDate, 
      primaryOwner,
      description, 
      secondaryOwners
     } = Object.fromEntries(await request.formData()) as {
        title: string
        type: string
        dueDate: string
        primaryOwner: string
        description: string
        secondaryOwners: string
    }

    let secondaryOwnersArr = JSON.parse(secondaryOwners);

    try {
      let profile = await getUserProfileByNetId(locals.user.netid);
  
      const newMasterCalendarItem = await db.masterCalendarItem.create({
        data: {
          title,
          type: { connect: { type } },
          dueDate: new Date(dateAddHours(dueDate, "12")),
          primaryOwner: { connect: { id: primaryOwner } },
          secondaryOwners: { connect: secondaryOwnersArr.length !== 0 ? secondaryOwnersArr.map((user: AutocompleteOption) => { 
            return { id: user.meta.id} 
          }) : undefined },
        }
      })
  
      await db.masterCalendarComment.create({
        data: {
          content: description,
          userProfile: { connect: { id: profile?.id } },
          masterCalendar: { connect: { id: newMasterCalendarItem.id } }
        }
      })

      // await email("new_is_queue", {
      //   "subject": "New IS Queue Request",
      //   "name": profile?.first_name + " " + profile?.last_name,
      //   "date": getDateLocal(dateAddHours(dateNeeded, "12"), "MMMM Do, YYYY"),
      //   "title": title,
      //   "description": description,
      //   "to": ["jacobkeil@usf.edu"]
      // });

      return { success: true, message: "Calendar item created successfully!" }
    } catch (error) {
      console.log(error);
      return { success: false, message: "Calendar item creation failed." }
    }
  },
  update: async ({ locals, request }) => {
    const {
      id,
      title,
      type,
      dueDate, 
      primaryOwner,
      description,
     } = Object.fromEntries(await request.formData()) as {
        id: string
        title: string
        type: string
        dueDate: string
        primaryOwner: string
        description: string
    }

    try {
      let profile = await getUserProfileByNetId(locals.user.netid);
  
      const updatedMasterCalendarItem = await db.masterCalendarItem.update({
        where: {
          id
        },
        data: {
          title,
          type: { connect: { type } },
          dueDate: new Date(dateAddHours(dueDate, "12")),
          primaryOwner: { connect: { id: primaryOwner } },
        }
      })
  
      await db.masterCalendarComment.create({
        data: {
          content: description,
          userProfile: { connect: { id: profile?.id } },
          masterCalendar: { connect: { id: updatedMasterCalendarItem.id } }
        }
      })

      // await email("new_is_queue", {
      //   "subject": "New IS Queue Request",
      //   "name": profile?.first_name + " " + profile?.last_name,
      //   "date": getDateLocal(dateAddHours(dateNeeded, "12"), "MMMM Do, YYYY"),
      //   "title": title,
      //   "description": description,
      //   "to": ["jacobkeil@usf.edu"]
      // });

      return { success: true, message: "Calendar item updated successfully!" }
    } catch (error) {
      console.log(error);
      return { success: false, message: "Calendar item update failed." }
    }
  }
}