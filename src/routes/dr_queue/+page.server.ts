import { redirect } from '@sveltejs/kit'
import { db, 
  getTeamByName,
  getUserProfileByNetId
} from '$lib/server/database'
import { dateAddHours, getUtcDate } from '$lib/helpers.js';
import type { AutocompleteOption } from '@skeletonlabs/skeleton';

export const load = async ({ locals }) => {
	if (locals.user) {
    const requests = await db.dataQueueItem.findMany({
      include: {
        requestType: true,
        assignedTo: true,
        comments: {
          include: {
            userProfile: true
          }
        },
        emailTo: true,
        priority: true,
        requestedBy: true
      }
    });
    const managementTeam = await getTeamByName("Management");
    const eptTeam = await getTeamByName("Electronic Processes");
    return { requests, eptTeam, managementTeam }
	} else {
		throw redirect(302, '/dashboard');
	}
}

export const actions = {
  create: async ({ locals, request }) => {
    const { 
      title, 
      priority, 
      requestType, 
      dateNeeded, 
      delayBatchPost, 
      description, 
      emailList
    } = Object.fromEntries(await request.formData()) as {
        title: string
        priority: string
        requestType: string
        dateNeeded: string
        delayBatchPost: string
        description: string
        emailList: string
    }

    let emailListArr = JSON.parse(emailList);
    
    try {
      let profile = await getUserProfileByNetId(locals.user.netid);
  
      const newDataQueueItem = await db.dataQueueItem.create({
        data: {
          title,
          priority: { connect: priority !== "" ? { name: priority } : undefined},
          requestedBy: { connect: { id: profile?.id } },
          emailTo: { connect: emailListArr.length !== 0 ? emailListArr.map((user: AutocompleteOption) => { 
            return { id: user.meta.id} 
          }) : undefined },
          requestType: { connect: { name: requestType } },
          dateNeeded: new Date(dateAddHours(dateNeeded, "12")),
          delayBatchPosting: delayBatchPost === undefined ? undefined :  new Date(dateAddHours(delayBatchPost, "12")),
          complete: false,
        }
      })
  
      await db.dataQueueComment.create({
        data: {
          content: description,
          userProfile: { connect: { id: profile?.id } },
          dataQueueItem: { connect: { id: newDataQueueItem.id } }
        }
      })

      return { success: true, message: "Request created successfully!" }
    } catch (error) {
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

      const updatedDataQueueItem = await db.dataQueueItem.update({
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

      await db.dataQueueComment.create({
        data: {
          content: description,
          userProfile: { connect: { id: profile?.id } },
          dataQueueItem: { connect: { id: updatedDataQueueItem.id } }
        }
      })

      return { success: true, message: "Request updated successfully!" }
    } catch (error) {
      return { success: false, message: "Request update failed." }
    }
  }
}