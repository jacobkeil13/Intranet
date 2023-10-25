import type { Handle } from '@sveltejs/kit'
import { db } from '$lib/server/database'

export const handle: Handle = async ({ event, resolve }) => {
  // let session = event.platform?.req.session.account;

  let session = {
    username: "jacobkeil@usf.edu"
  }

	const profile = await db.userProfile.findFirst({
		include: {
			role: true
		},
		where: { netid: String(session?.username.split("@")[0]) }
	})

  event.locals.user = {
    netid: String(profile?.netid),
    role: String(profile?.role.name)
  }

  event.locals.constants = {
    users: await db.userProfile.findMany({
      orderBy: {
        first_name: "asc"
      }
    }),
    priorities: await db.priority.findMany(),
    titles: await db.title.findMany(),
    teams: await db.team.findMany({
      include: {
        userProfile: true
      }
    }),
    roles: await db.role.findMany(),
    aidYears: await db.aidYear.findMany({
      orderBy: {
        name: "desc"
      }
    }),
    applications: await db.application.findMany(),
    letterCodes: await db.letterCode.findMany({
      orderBy: {
        name: "asc"
      },
    }),
    letterTypes: await db.letterType.findMany(),
    letterGroups: await db.letterGroup.findMany(),
    addressTypes: await db.addressType.findMany(),
    requestTypes: await db.requestType.findMany(),
    dataRequestTypes: await db.dataRequestType.findMany(),
    masterCalendarTypes: await db.masterCalendarType.findMany({ orderBy: { type: "asc" } }),
  }

	return await resolve(event)
}