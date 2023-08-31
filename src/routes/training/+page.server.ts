import { db } from "$lib/server/database";
import { redirect } from "@sveltejs/kit";
import moment from "moment";
import type { AutocompleteOption } from "@skeletonlabs/skeleton";

export const load = async ({ locals }) => {
	if (locals.user) {
    let trainings = await db.trainingSchedule.findMany({
      orderBy: {
        date: "asc"
      },
      include: {
        trainers: true
      }
    });
    let library = await db.generalLibrary.findMany({
      orderBy: {
        date: "asc"
      },
      include: {
        trainers: true
      }
    });
    return { trainings, library, constants: locals.constants, user: locals.user }
	} else {
		throw redirect(302, '/dashboard');
	}
}

export const actions = {
  createTraining: async ({ request }) => {
    const { 
      title, 
      date,
      trainerList
     } = Object.fromEntries(await request.formData()) as {
      title: string
      date: string
      trainerList: string
    }

    let trainerListArr = JSON.parse(trainerList);
    console.log(moment.utc(new Date(date)));
    console.log(moment.utc(new Date(date)).format('dddd'));
    
    try {
      let dateDueConvert = moment.utc(new Date(date)).toISOString(false);
      let weekday = moment.utc(new Date(date)).format('dddd');
      console.log(moment.utc(new Date(date)).local().day());
  
      const newTrainingSechedule = await db.trainingSchedule.create({
        data: {
          name: title,
          date: dateDueConvert,
          weekday,
          trainers: { connect: trainerListArr.length !== 0 ? trainerListArr.map((user: AutocompleteOption) => { 
            return { id: user.meta.id} 
          }) : undefined },
        }
      })

      return { success: true, message: "Training created successfully!" }
    } catch (error) {
      return { success: false, message: "Training creation failed." }
    }
  },
  updateTraining: async ({ request }) => {
    const {
      id,
      title, 
      date
     } = Object.fromEntries(await request.formData()) as {
      id: string
      title: string
      date: string
    }
    
    try {
      let dateDueConvert = moment.utc(new Date(date)).toISOString(false);
      let weekday = moment.utc(new Date(date)).format('dddd');
  
      const updatedTraining = await db.trainingSchedule.update({
        where: {
          id
        },
        data: {
          name: title,
          date: dateDueConvert,
          weekday,
        }
      })

      return { success: true, message: "Training updated successfully!" }      
    } catch (error) {
      console.log(error);
      return { success: false, message: "Training update failed." }
    }
  },
  createLibrary: async ({ request }) => {
    const { 
      title, 
      date,
      url,
      trainerList
     } = Object.fromEntries(await request.formData()) as {
      title: string
      date: string
      url: string
      trainerList: string
    }

    let trainerListArr = JSON.parse(trainerList);
    console.log(moment.utc(new Date(date)));
    console.log(moment.utc(new Date(date)).format('dddd'));
    
    try {
      let dateDueConvert = moment.utc(new Date(date)).toISOString(false);
      let weekday = moment.utc(new Date(date)).format('dddd');
      console.log(moment.utc(new Date(date)).local().day());
  
      const newLibrary = await db.generalLibrary.create({
        data: {
          name: title,
          date: dateDueConvert,
          weekday,
          url,
          trainers: { connect: trainerListArr.length !== 0 ? trainerListArr.map((user: AutocompleteOption) => { 
            return { id: user.meta.id} 
          }) : undefined },
        }
      })

      return { success: true, message: "Library video created successfully!" }
    } catch (error) {
      return { success: false, message: "Library video creation failed." }
    }
  },
  updateLibrary: async ({ request }) => {
    const {
      id,
      title, 
      date,
      url
     } = Object.fromEntries(await request.formData()) as {
      id: string
      title: string
      date: string
      url: string
    }
    
    try {
      let dateDueConvert = moment.utc(new Date(date)).toISOString(false);
      let weekday = moment.utc(new Date(date)).format('dddd');
  
      const updatedLibrary = await db.generalLibrary.update({
        where: {
          id
        },
        data: {
          name: title,
          date: dateDueConvert,
          weekday,
          url
        }
      })

      return { success: true, message: "Library video updated successfully!" }      
    } catch (error) {
      console.log(error);
      return { success: false, message: "Library video update failed." }
    }
  }
}