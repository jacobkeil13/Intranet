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
  
    let emailListArr: AutocompleteOption[] = JSON.parse(emailList);
    const isTeam = await getTeamByName("Information Systems");

    isTeam[0].userProfile.forEach(isUser => {
      if (!emailListArr.map(user => user.meta.id).includes(isUser.id)) {
        let addUser: AutocompleteOption = {
          label: isUser.first_name + ' ' + isUser.last_name,
          value: isUser.first_name + ' ' + isUser.last_name,
          meta: {
            id: isUser.id
          }
        }
        emailListArr.push(addUser);
      }
    });
  
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
      description,
      complete,
      locked,
      emailList
     } = Object.fromEntries(await request.formData()) as {
        id: string
        title: string
        priority: string
        requestType: string
        dateNeeded: string
        assignedToId: string
        description: string
        complete: string
        locked: string
        emailList: string
    }

    let emailListArr: AutocompleteOption[] = JSON.parse(emailList);
    const isTeam = await getTeamByName("Information Systems");

    isTeam[0].userProfile.forEach(isUser => {
      if (!emailListArr.map(user => user.meta.id).includes(isUser.id)) {
        let addUser: AutocompleteOption = {
          label: isUser.first_name + ' ' + isUser.last_name,
          value: isUser.first_name + ' ' + isUser.last_name,
          meta: {
            id: isUser.id
          }
        }
        emailListArr.push(addUser);
      }
    });

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
          emailTo: {
            set: emailListArr.length !== 0 ? emailListArr.map((user: AutocompleteOption) => ({ id: user.meta.id })) : [] 
          },
          complete: complete === "on",
          locked: locked === "on"
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
      return { success: false, message: "Request update failed." }
    }
  },
  delete: async ({ request }) => {
    const {
      id
     } = Object.fromEntries(await request.formData()) as {
      id: string
    }

    try {
      await db.queueComment.deleteMany({
        where: {
          id
        }
      });

      await db.queueItem.delete({
        where: {
          id
        }
      });

      return { success: true, message: "Request deleted successfully!" }
    } catch (error) {
      return { success: false, message: "Request deletion failed." }
    }
  },
  deletePopsel: async ({ request }) => {
    const {
      id
     } = Object.fromEntries(await request.formData()) as {
      id: string
    }

    try {
      let popsel = await db.populationSelection.findFirst({
        where: {
          id
        },
        include: {
          QueueItem: true
        }
      });

      await db.queueComment.deleteMany({
        where: {
          id: popsel?.QueueItem[0].id
        }
      });

      await db.populationSelection.delete({
        where: {
          id
        }
      });

      return { success: true, message: "Request deleted successfully!" }
    } catch (error) {
      return { success: false, message: "Request deletion failed." }
    }
  }
}