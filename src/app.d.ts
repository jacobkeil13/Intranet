import type { Priority, Title, Team, Role, AidYear, Application, LetterCode, AddressType, 
	RequestType, DataRequestType, MasterCalendarType, UserProfile, QueueComment, LetterType, LetterGroup } from "@prisma/client";

declare global {
	namespace App {
		interface Locals {
			user: {
				netid: string
				role: string
			},
			constants: {
				users: UserProfile[]
				priorities: Priority[]
				titles: Title[]
				teams: Team[]
				roles: Role[]
				aidYears: AidYear[]
				applications: Application[]
				letterCodes: LetterCode[]
				letterTypes: LetterType[]
				letterGroups: LetterGroup[]
				addressTypes: AddressType[]
				requestTypes: RequestType[]
				dataRequestTypes: DataRequestType[]
				masterCalendarTypes: MasterCalendarType[]
			}
		}
		export interface Platform {
			req: import('http').IncomingMessage & {
				session: {
					account: {
						username: string
					}
				}
			};
		}
	}
}

export interface KeySignature {
	[key: string]: string
}

export interface SidebarLink {
	label: string
	link: string
	target: string
}

export interface SidebarLinks {
	header: string
	links: SidebarLink[]
}

export interface Email {
	from: string
	to: string[]
	cc: string[]
	subject: string
	text: string
}

export type CompleteQueueItem = QueueItem & {
	priority: Priority;
	requestedBy: UserProfile;
	assignedTo: UserProfile | null;
	approvedBy: UserProfile | null;
	requestType: RequestType;
	emailTo: UserProfile[];
	comments: QueueComment[];
};

export {};