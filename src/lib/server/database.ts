import { PrismaClient } from '@prisma/client'
import type { AutocompleteOption } from '@skeletonlabs/skeleton';

export const db = new PrismaClient();

export async function getUserProfileByNetId(netid: string) {
  const userProfile = await db.userProfile.findFirst({
    where: { netid },
    include: {
      role: true,
      team: true,
      title: true,
      queueItemRequestedBy: {
        where: { complete: false },
        include: {
          priority: true,
          requestedBy: true,
          assignedTo: true,
          approvedBy: true,
          requestType: true,
          emailTo: true,
          comments: true
        }
      },
      queueItemAssignedTo: {
        where: { complete: false },
        include: {
          priority: true,
          requestedBy: true,
          assignedTo: true,
          approvedBy: true,
          requestType: true,
          emailTo: true,
          comments: true
        }
      },
      queueComment: {
        include: {
          queueItem: true,
          userProfile: true,
        }
      },
    }
  });

  return userProfile;
}

export async function createPopselQueueItem(data: any) {
  const profile = await getUserProfileByNetId(data.netid);
  const requestType = await getRequestTypeByName("Population Selection");
  const priority = await getPriorityByName("High");
  const newPopselQueueItem = await db.queueItem.create({
    data: {
      title: data.letterCode,
      requestedBy: { connect: { id: profile?.id } },
      priority: { connect: { name: priority?.name }},
      emailTo: { connect: data.emailList.length !== 0 ? data.emailList.map((user: AutocompleteOption) => { 
        return { id: user.meta.id} 
      }) : undefined },
      requestType: { connect: { name: requestType?.name } },
      dateNeeded: new Date().toISOString(),
      complete: false,
      populationSelection: { connect: { id: data.popselId } }
    }
  });

  await db.queueComment.create({
    data: {
      content: "Popsel Created",
      userProfile: { connect: { id: profile?.id } },
      queueItem: { connect: { id: newPopselQueueItem.id } }
    }
  })
}

export async function createPopulationSelection(data: any) {
  let paidDate = data.paidDate === "" ? undefined : new Date(new Date(data.paidDate).setUTCHours(12,0,0,0)).toISOString();
  let paidDateThirty = data.paidDateThirty === "" ? undefined : new Date(new Date(data.paidDateThirty).setUTCHours(12,0,0,0)).toISOString();
  let paidDateSixty = data.paidDateSixty === "" ? undefined : new Date(new Date(data.paidDateSixty).setUTCHours(12,0,0,0)).toISOString();
  const newPopsel = await db.populationSelection.create({
    data: {
      aidYear: { connect: { name: data.aidYear }},
      termCode: data.termCode,
      application: { connect: { name: data.application }},
      letterCode: { connect: { name: data.letterCode }},
      selectionId: data.selectionId,
      bannerCreatorId: data.bannerCreatorId,
      bannerUserId: data.bannerUserId,
      letterCount: Number(data.letterCount),
      addressType: { connect: { name: data.addressType === "1ML" ? "Local Address" : "Permanent Address" }},
      requestedBy: { connect: { id: data.requestor }},
      firstTerm: data.firstTerm,
      secondTerm: data.secondTerm,
      thirdTerm: data.thirdTerm,
      priorAidYear: data.priorAidYear,
      priorFallTerm: data.priorFallTerm,
      priorSpringTerm: data.priorSpringTerm,
      paidDate,
      paidDateThirty,
      paidDateSixty
    }
  });

  return newPopsel;
}

export async function updatePopulationSelection(data: any) {
  let paidDate = data.paidDate === "" ? undefined : new Date(new Date(data.paidDate).setUTCHours(12,0,0,0)).toISOString();
  let paidDateThirty = data.paidDateThirty === "" ? undefined : new Date(new Date(data.paidDateThirty).setUTCHours(12,0,0,0)).toISOString();
  let paidDateSixty = data.paidDateSixty === "" ? undefined : new Date(new Date(data.paidDateSixty).setUTCHours(12,0,0,0)).toISOString();
  const updatedPopsel = await db.populationSelection.update({
    where: {
      id: data.id
    },
    data: {
      aidYear: { connect: { name: data.aidYear }},
      termCode: data.termCode,
      application: { connect: { name: data.application }},
      letterCode: { connect: { name: data.letterCode }},
      selectionId: data.selectionId,
      bannerCreatorId: data.bannerCreatorId,
      bannerUserId: data.bannerUserId,
      letterCount: Number(data.letterCount),
      addressType: { connect: { name: data.addressType === "1ML" ? "Local Address" : "Permanent Address" }},
      requestedBy: { connect: { id: data.requestor }},
      firstTerm: data.firstTerm,
      secondTerm: data.secondTerm,
      thirdTerm: data.thirdTerm,
      priorAidYear: data.priorAidYear,
      priorFallTerm: data.priorFallTerm,
      priorSpringTerm: data.priorSpringTerm,
      paidDate,
      paidDateThirty,
      paidDateSixty
    }
  });

  return updatedPopsel;
}

export async function getTeamByName(teamName: string) {
  const team = await db.team.findMany({
    where: { name: teamName },
    include: { userProfile: true }
  });
  return team;
}

export async function getPriorityByName(priority: string) {
  const priorityByName = await db.priority.findUnique({
    where: {
      name: priority
    }
  });
  return priorityByName;
}

export async function getRequestTypeByName(requestType: string) {
  const requestTypeByName = await db.requestType.findUnique({
    where: {
      name: requestType
    }
  });
  return requestTypeByName;
}