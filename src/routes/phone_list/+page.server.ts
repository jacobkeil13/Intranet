import { db } from "$lib/server/database";
import { redirect } from "@sveltejs/kit";

export const load = async ({ locals }) => {
	if (locals.user) {
    let users = await db.userProfile.findMany({
      orderBy: {
        first_name: "asc"
      },
      include: {
        team: true,
        title: true,
        role: true,
        directReport: true
      }
    });
    let teams = await db.team.findMany({
      orderBy: {
        name: "asc"
      },

    })
    return { users, teams, user: locals.user }
	} else {
		throw redirect(302, '/dashboard');
	}
}

export const actions = {
  create: async ({ locals, request }) => {
    const {
      firstName,
      lastName,
      netId,
      uidRange,
      directReport,
      userType
     } = Object.fromEntries(await request.formData()) as {
      firstName: string
      lastName: string
      netId: string
      uidRange: string
      directReport: string
      userType: string
    }

    const directReportUser = await db.userProfile.findFirst({
			where: {
				id: directReport
			},
      include: {
        team: true
      }
		});

    try {
      const tempUser = await db.userProfile.create({
        data: {
          first_name: firstName,
          last_name: lastName,
          netid: netId,
          uidRange: uidRange === '' ? undefined : uidRange,
          directReport: { connect: directReport !== "" ? { id: directReport } : undefined },
          role: { connect: userType === "Student" ? { name: "STUDENT" } : undefined },
          title: { connect: userType === "Student" ? { name: "Student Assistant" } : undefined },
          team: { connect: directReportUser?.team.length !== 0 ? directReportUser?.team.map((team) => { 
            return { name: team.name} 
          }) : undefined },
          phone: "-"
        }
      })

      return { success: true, message: "User created successfully!" }
    } catch (error) {      
      return { success: false, message: "User creation failed." }
    }
  },
  update: async ({ locals, request }) => {
    const {
      id,
      firstName,
      lastName,
      netId,
      uidRange,
      directReport
     } = Object.fromEntries(await request.formData()) as {
      id: string
      firstName: string
      lastName: string
      netId: string
      uidRange: string
      directReport: string
    }

    try {
      const updatedUser = await db.userProfile.update({
        where: {
          id
        },
        data: {
          first_name: firstName,
          last_name: lastName,
          netid: netId,
          uidRange: uidRange === '' ? undefined : uidRange,
          directReport: { connect: directReport !== "" ? { id: directReport } : undefined }
        }
      })

      return { success: true, message: "User updated successfully!" }
    } catch (error) {
      return { success: false, message: "User update failed." }
    }
  },
  delete: async ({ request }) => {
    const {
      id
     } = Object.fromEntries(await request.formData()) as {
      id: string
    }

    try {
      await db.userProfile.delete({
        where: {
          id
        }
      });

      return { success: true, message: "User deleted successfully!" }
    } catch (error) {
      return { success: false, message: "User deletion failed." }
    }
  },
}