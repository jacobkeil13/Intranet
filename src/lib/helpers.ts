import moment from 'moment';
import type { PrivacyForm } from './types';
export const api_key = 'API_KEY';

export function dateAddOffset(dateNeeded: string): string {
	const date = moment(new Date(dateNeeded)).add(4, 'hours').toISOString();
	return date;
}

export function getUtcDate(wantedDate: string): string {
	const date = new Date(wantedDate).toISOString();
	return date;
}

export function getDateLocal(iso: string, format: string): string {
	const date = moment(new Date(iso)).format(format);
	return date;
}

export function getLocalISO(iso: string) {
	const date = moment(new Date(iso)).toISOString();
	return date;
}

export function dateAddHours(date: string, hours: string) {
	return date + `T${hours}:00:00.000Z`;
}

export async function email(template: string, data: any) {
	await fetch(`http://localhost:8000/${template}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(data)
	});
}

export function getCampusName(campusCode: string | undefined): string {
	if (campusCode === 'T') {
		return 'Tampa';
	} else if (campusCode === 'P') {
		return 'St. Pete';
	} else if (campusCode === 'S') {
		return 'Sarasota';
	} else {
		return 'Not Specified';
	}
}

export function getTerm(str: string) {
	let semester = str.split(' ')[0];
	let aidYear = str.split(' ')[1];
	if (semester === 'Spring') {
		return aidYear + '01';
	} else if (semester === 'Summer') {
		return aidYear + '05';
	} else if (semester === 'Fall') {
		return aidYear + '08';
	}
}

export function checkPrivacyForms(forms: PrivacyForm[]) {
	let parentHasAccess = false;

	let currentAidYear = moment().format('YYYY').slice(-2) + moment().add(1, 'year').format('YYYY').slice(-2);

	forms.forEach((form) => {
		if (form.aidYear === currentAidYear) {
			parentHasAccess = true;
		}
	});
	return parentHasAccess;
}

export function timeout(ms: number) {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			reject(new Error('Timeout'));
		}, ms);
	});
}

export function getFormURL(form: any) {
	if (form?.aidYear.name !== 'Non-Year') {
		if (form?.web) {
			return `https://tup-ofa.forest.usf.edu/finaid/internet/${form?.aidYear.name}/${form?.aidYear.name}_${form?.rraareqCode}.pdf`;
		} else {
			return `https://tup-ofa.forest.usf.edu/files/forms/intranet/${form?.aidYear.name}/${form?.aidYear.name}_${form?.rraareqCode}.pdf?apiKey=${api_key}`;
		}
	}
	return `https://tup-ofa.forest.usf.edu/files/forms/${form?.web ? 'internet' : 'intranet'}/non-year/${form?.rraareqCode}.pdf?apiKey=${api_key}`;
}

export function getLetterURL(letter: any) {
	if (letter?.letterType.name === 'Paper Letters' || letter?.letterType.name === 'Email Letters') {
		return `https://tup-ofa.forest.usf.edu/files/letters/${letter?.letterType.name.replace(' ', '')}/${letter.letterGroup?.name}/${letter.letterCode.name}.pdf?apiKey=${api_key}`;
	}
	return `https://tup-ofa.forest.usf.edu/files/letters/${letter?.letterType.name.replace(' ', '')}/${letter?.letterCode.name}.pdf?apiKey=${api_key}`;
}

export function getProcedureURL(proc: any) {
	if (proc?.aidYear.name === 'Non-Year') {
		return `https://tup-ofa.forest.usf.edu/files/procedures/non-year/${proc?.fileName}.${proc?.extension}?apiKey=${api_key}`;
	} else if (proc?.aidYear.name === 'Administrative') {
		return `https://tup-ofa.forest.usf.edu/files/procedures/administrative/${proc?.fileName}.${proc?.extension}?apiKey=${api_key}`;
	} else {
		return `https://tup-ofa.forest.usf.edu/files/procedures/${proc?.aidYear.name}/${proc?.aidYear.name} ${proc?.fileName}.${proc?.extension}?apiKey=${api_key}`;
	}
}

export async function getUidInfo(uid: string) {
	let parsedUID = uid.includes('U') ? uid : 'U' + uid;
	let res = await fetch('/banner/get_user?uid=' + parsedUID, {
		method: 'GET',
		headers: {
			'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Headers': '*'
		}
	});
	let response = await res.json();
	return response;
}

export async function getPrivacyInfo(uid: string) {
	let parsedUID = uid.includes('U') ? uid : 'U' + uid;
	let res = await fetch('/banner/get_privacy?uid=' + parsedUID, {
		method: 'GET',
		headers: {
			'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Headers': '*'
		}
	});
	let response = await res.json();
	return response;
}

export async function getFiveNineDirs() {
	let res = await fetch(`/finaid/fivenine?apiKey=${api_key}`, {
		method: 'GET',
		headers: {
			'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Headers': '*'
		}
	});
	let response = await res.json();
	return response;
}

export async function getFiveNineDir(dirName: string) {
	let res = await fetch(`/finaid/fivenine/" + dirName + "?apiKey=${api_key}`, {
		method: 'GET',
		headers: {
			'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Headers': '*'
		}
	});
	let response = await res.json();
	return response;
}

export async function getProcedureArchives() {
	let res = await fetch(`/archive/procedures?apiKey=${api_key}`, {
		method: 'GET',
		headers: {
			'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Headers': '*'
		}
	});
	let response = await res.json();
	return response;
}

export async function getFormArchives() {
	let res = await fetch(`/archive/forms?apiKey=${api_key}`, {
		method: 'GET',
		headers: {
			'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Headers': '*'
		}
	});
	let response = await res.json();
	return response;
}

// export async function getUidInfo(uid: string) {
//   let parsedUID = uid.includes('U') ? uid : "U" + uid;
//   let res = await fetch("/api/banner?uid=" + parsedUID, {
//     method: "GET"
//   });
//   let response = await res.json();
//   return response;
// }

// export async function getPrivacyInfo(uid: string) {
//   let parsedUID = uid.includes('U') ? uid : "U" + uid;
//   let res = await fetch("/api/banner/privacy?uid=" + parsedUID, {
//     method: "GET"
//   });
//   let response = await res.json();
//   return response;
// }

// export async function getFiveNineDirs() {
//   // let date = moment().format();
//   let res = await fetch("/api/five_nine", {
//     method: "GET"
//   });
//   let response = await res.json();
//   return response;
// }

// export async function getFiveNineDir(dirName: string) {
//   // let date = moment().format();
//   let res = await fetch("/api/five_nine/" + dirName, {
//     method: "GET"
//   });
//   let response = await res.json();
//   return response;
// }

// export async function getProcedureArchives() {
//   let res = await fetch("/api/procedures", {
//     method: "GET",
//     headers: {
//       "Content-Type": "application/json"
//     }
//   });

//   let response = await res.json();
//   return response;
// }

// export async function getFormArchives() {
//   let res = await fetch("/api/forms", {
//     method: "GET",
//     headers: {
//       "Content-Type": "application/json"
//     }
//   });

//   let response = await res.json();
//   return response;
// }

export async function getCurrentAppts(uid: string) {
	let parsedUID = uid.includes('U') ? uid : 'U' + uid;
	let res = await fetch('/api/current_appt?uid=' + parsedUID, {
		method: 'GET'
	});
	let response = await res.json();
	return response;
}