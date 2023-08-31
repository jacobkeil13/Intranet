import { redirect } from '@sveltejs/kit'
import { db, 
  getTeamByName,
  getUserProfileByNetId
} from '$lib/server/database'
import type { AutocompleteOption } from '@skeletonlabs/skeleton';
import { dateAddHours, email, getDateLocal, getUtcDate } from '$lib/helpers.js';

export const load = async ({ locals }) => {
	if (locals.user) {
    const requests = await db.queueItem.findMany({
      include: {
        assignedTo: true,
        comments: {
          include: {
            userProfile: true
          }
        },
        emailTo: true,
        priority: true,
        requestedBy: true,
        requestType: true
      }
    });
    const managementTeam = await getTeamByName("Management");
    const isTeam = await getTeamByName("Information Systems");
    return { requests, isTeam, managementTeam, constants: locals.constants }
	} else {
		throw redirect(302, '/dashboard');
	}
}

export const actions = {
  create: async ({ locals, request }) => {
    const { 
      title, 
      priority, 
      approvingManagerId, 
      requestType, 
      dateNeeded, 
      delayPostDate, 
      postTo, 
      description,
      emailList
     } = Object.fromEntries(await request.formData()) as {
        title: string
        priority: string
        approvingManagerId: string
        requestType: string
        dateNeeded: string
        delayPostDate: string
        postTo: string
        description: string
        emailList: string
    }
  
    let emailListArr = JSON.parse(emailList);
  
    try {
      let profile = await getUserProfileByNetId(locals.user.netid);
  
      const newQueueItem = await db.queueItem.create({
        data: {
          title,
          priority: { connect: priority !== "" ? { name: priority } : undefined},
          requestedBy: { connect: { id: profile?.id } },
          approvedBy: { connect: approvingManagerId !== "" ? { id: approvingManagerId } : undefined },
          emailTo: { connect: emailListArr.length !== 0 ? emailListArr.map((user: AutocompleteOption) => { 
            return { id: user.meta.id} 
          }) : undefined },
          requestType: { connect: { name: requestType } },
          dateNeeded: new Date(dateAddHours(dateNeeded, "12")),
          delayPosting: delayPostDate === undefined ? undefined :  new Date(dateAddHours(delayPostDate, "12")),
          postTo: postTo === '' ? undefined : postTo,
          complete: false,
        }
      })
  
      await db.queueComment.create({
        data: {
          content: description,
          userProfile: { connect: { id: profile?.id } },
          queueItem: { connect: { id: newQueueItem.id } }
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

      return { success: true, message: "Request created successfully!" }
    } catch (error) {
      console.log(error);
      return { success: false, message: "Request creation failed." }
    }
  },
  update: async ({ locals, request }) => {
    const {
      id,
      title, 
      priority,
      requestType, 
      dateNeeded,
      assignedToId,
      description
     } = Object.fromEntries(await request.formData()) as {
        id: string
        title: string
        priority: string
        requestType: string
        dateNeeded: string
        assignedToId: string
        description: string
    }

    try {
      let profile = await getUserProfileByNetId(locals.user.netid);

      const updatedQueueItem = await db.queueItem.update({
        where: {
          id
        },
        data: {
          title,
          priority: { connect: { name: priority } },
          requestType: { connect: { name: requestType } },
          assignedTo: { connect: { id: assignedToId } },
          dateNeeded: new Date(dateAddHours(dateNeeded, "12")),
        }
      })

      await db.queueComment.create({
        data: {
          content: description,
          userProfile: { connect: { id: profile?.id } },
          queueItem: { connect: { id: updatedQueueItem.id } }
        }
      })

      // await email("update_is_queue", {
      //   "subject": "Updated IS Queue Request",
      //   "name": profile?.first_name + " " + profile?.last_name,
      //   "title": title,
      //   "description": description,
      //   "to": ["jacobkeil@usf.edu"]
      // });

      return { success: true, message: "Request updated successfully!" }
    } catch (error) {
      console.log(error);
      return { success: false, message: "Request update failed." }
    }
  }
}