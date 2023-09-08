import { getTerm } from "$lib/helpers";
import { createPopselQueueItem, createPopulationSelection, db, getTeamByName } from "$lib/server/database";
import { redirect } from "@sveltejs/kit";

export const load = async ({ locals }) => {
	if (locals.user) {
    let popsels = await db.populationSelection.findMany({
      include: {
        addressType: true,
        aidYear: true,
        application: true,
        letterCode: true,
        requestedBy: true
      }
    });
    const isTeam = await getTeamByName("Information Systems");
    return { popsels, isTeam, constants: locals.constants, user: locals.user }
	} else {
		throw redirect(302, '/dashboard');
	}
}

export const actions = {
  create: async ({ locals, request }) => {
    const { 
      date,
      aidYear,
      termCodeFull,
      application,
      letterCode,
      letterCount,
      requestedBy,
      addressTypeFull,
      paidDate,
      paidDateThirty,
      paidDateSixty,
      selectionId,
      bannerCreatorId,
      bannerUserId,
      firstTermFull,
      secondTermFull,
      thirdTermFull,
      priorAidYearFull,
      priorFallTermFull,
      priorSpringTermFull,
      emailList
     } = Object.fromEntries(await request.formData()) as {
      date: string
      aidYear: string
      termCodeFull: string
      application: string
      letterCode: string
      letterCount: string
      requestedBy: string
      addressTypeFull: string
      paidDate: string
      paidDateThirty: string
      paidDateSixty: string
      selectionId: string
      bannerCreatorId: string
      bannerUserId: string
      firstTermFull: string
      secondTermFull: string
      thirdTermFull: string
      priorAidYearFull: string
      priorFallTermFull: string
      priorSpringTermFull: string
      emailList: string
    }

    let emailListArr = JSON.parse(emailList);

    console.log({ date, aidYear, termCodeFull, application, letterCode, letterCount, requestedBy, 
      addressTypeFull, paidDate, paidDateThirty, paidDateSixty, selectionId, bannerCreatorId, 
      bannerUserId, firstTermFull, secondTermFull, thirdTermFull, priorAidYearFull, 
      priorFallTermFull, priorSpringTermFull, emailListArr });

    let addressType: string = addressTypeFull;
    let termCode: string = String(getTerm(termCodeFull));
    let firstTerm: string = String(getTerm(firstTermFull));
    let secondTerm: string = String(getTerm(secondTermFull));
    let thirdTerm: string = String(getTerm(thirdTermFull));
    let priorAidYear: string = String(priorAidYearFull.split("-")[0].slice(-2) + priorAidYearFull.split("-")[1].slice(-2));
    let priorFallTerm: string = String(getTerm(priorFallTermFull));
    let priorSpringTerm: string = String(getTerm(priorSpringTermFull));
        
    if (addressType === 'Local Address') {
      addressType = "1ML"
    } else {
      addressType = "Requestor"
    }

    console.log({ addressType, termCode, firstTerm, secondTerm, thirdTerm, priorAidYear, priorFallTerm, priorSpringTerm });
    
    try {
      let data = {
        date, aidYear, termCode: termCodeFull, application, letterCode, selectionId, bannerCreatorId,
        bannerUserId, letterCount, addressType, requestor: requestedBy, firstTerm: firstTermFull,
        secondTerm: secondTermFull, thirdTerm: thirdTermFull, priorAidYear: priorAidYearFull, 
        priorFallTerm: priorFallTermFull, priorSpringTerm: priorSpringTermFull, paidDate,
        paidDateThirty, paidDateSixty
      }

      const newPopsel = await createPopulationSelection(data);

      let requestData = {
        netid: locals.user.netid,
        emailList: emailListArr,
        letterCode,
        popselId: newPopsel.id
      }

      await createPopselQueueItem(requestData);

      return { success: true, message: "Popsel created successfully!" }
    } catch (error) {
      return { success: false, message: "Popsel creation failed." }
    }
  },
  delete: async ({ request }) => {
    const { 
      id,
     } = Object.fromEntries(await request.formData()) as {
      id: string
    }
  
    try {
      console.log({id});
      let deletedPopsel = await db.populationSelection.delete({
        where: {
          id
        }
      });
      return { success: true, message: "Popsel deleted successfully!" }
    } catch (error) {
      console.log(error);
      return { success: false, message: "Popsel deletion failed." }
    }
  }
}