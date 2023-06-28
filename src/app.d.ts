import type { Priority, UserProfile, RequestType, QueueComment } from "@prisma/client";

declare global {
	namespace App {
		interface Locals {
			user: {
				netid: string
				role: string
			}
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