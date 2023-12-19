import { db } from '$lib/server/database';
import type { HierarchyUser } from '$lib/types';
import { redirect } from '@sveltejs/kit';

export const load = async ({ locals }) => {
	if (locals.user) {
		let allUsers = await db.userProfile.findMany({
			orderBy: {
				first_name: 'asc'
			},
			include: {
				team: true,
				title: true,
				role: true,
				directReport: true
			}
		});

		// function buildHierarchy(users: HierarchyUser[], manager: HierarchyUser): void {
		//   for (const user of users) {
		//     if (user.managerId === manager.id) {
		//       manager.directReports.push(user);
		//       buildHierarchy(users, user);
		//     }
		//   }
		// }

		const users: HierarchyUser[] = allUsers.map((user) => ({
			id: user.id,
			managerId: user.directReport?.id === user.id ? undefined : user.directReport?.id,
			name: user.first_name + ' ' + user.last_name,
			title: user.title.name,
			phone: user.phone,
			directReports: []
		}));

		const topLevelPersons = users.filter((user) => !user.managerId);
		// topLevelPersons.forEach(topLevelPerson => {
		//   buildHierarchy(users, topLevelPerson);
		// });

		let topPeople = {
			director: topLevelPersons[0],
			associateDirectors: users.filter((usr) => usr.title.includes('Associate Director')),
			assistantDirectors: users.filter((usr) => usr.title.includes('Assistant Director')),
			managers: users.filter((usr) => usr.title.includes('Manager'))
		};

		return { topLevelPersons, allUsers };
	} else {
		throw redirect(302, '/dashboard');
	}
};
