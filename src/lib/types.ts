export interface BannerUser {
	uid: string;
	first_name: string;
	last_name: string;
	email: string;
	netid: string;
	campus: string;
}

export interface PrivacyForm {
	aidYear: string;
	treqCode: string;
	status: string;
}

export interface Version {
	version: string;
	date: string;
	notes: {
		header: string;
		items: string[];
	}[];
}

export interface UploadedFile {
	fileName: string;
	content: string;
}

export interface FileErrors {
	messages: string[];
	size: {
		total: number;
		limit: number;
	};
	number: {
		limit: number;
	};
}

export interface TableItem {
	[key: string]: any;
}

export interface HierarchyUser {
	id: string;
	managerId?: string;
	name: string;
	title: string;
	phone: string;
	directReports: HierarchyUser[];
}
