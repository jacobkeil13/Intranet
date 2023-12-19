import { api_key } from '$lib/helpers';
import { readable } from 'svelte/store';

export const actions = readable([
	{
		name: 'Referral',
		radio_name: 'referral'
	},
	{
		name: 'Phone Appointment',
		radio_name: 'phone'
	},
	{
		name: 'Walk-in Appointment',
		radio_name: 'walkin'
	},
	{
		name: 'In-person Appointment',
		radio_name: 'inperson'
	}
]);

export const counter_time_slots = readable([
	'09:00:00',
	'09:30:00',
	'10:00:00',
	'10:30:00',
	'11:00:00',
	'11:30:00',
	'12:00:00',
	'12:30:00',
	'13:00:00',
	'13:30:00',
	'14:00:00',
	'14:30:00',
	'15:00:00',
	'15:30:00',
	'16:00:00'
]);

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
