import { readable } from "svelte/store";

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
])

export const counter_time_slots = readable([
  "09:00:00", "09:30:00", "10:00:00", "10:30:00", "11:00:00", 
  "11:30:00", "12:00:00", "12:30:00", "13:00:00", "13:30:00", 
  "14:00:00", "14:30:00", "15:00:00", "15:30:00", "16:00:00"
])

// export async function getUidInfo(uid: string) {
//   let parsedUID = uid.includes('U') ? uid : "U" + uid
//   let res = await fetch("/banner/get_user?uid=" + parsedUID, {
//     method: "GET",
//     headers: {
//       'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
//       'Access-Control-Allow-Origin': '*',
//       'Access-Control-Allow-Headers': '*',
//     }
//   });
//   let response = await res.json();
//   // console.log(response);
//   return response;
// }

// export async function getPrivacyInfo(uid: string) {
//   let parsedUID = uid.includes('U') ? uid : "U" + uid
//   let res = await fetch("/banner/get_privacy?uid=" + parsedUID, {
//     method: "GET",
//     headers: {
//       'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
//       'Access-Control-Allow-Origin': '*',
//       'Access-Control-Allow-Headers': '*',
//     }
//   });
//   let response = await res.json();
//   // console.log(response);
//   return response;
// }

export async function getUidInfo(uid: string) {
  let parsedUID = uid.includes('U') ? uid : "U" + uid
  let res = await fetch("/api/banner?uid=" + parsedUID, {
    method: "GET"
  });
  let response = await res.json();
  return response;
}

export async function getPrivacyInfo(uid: string) {
  let parsedUID = uid.includes('U') ? uid : "U" + uid
  let res = await fetch("/api/banner/privacy?uid=" + parsedUID, {
    method: "GET"
  });
  let response = await res.json();
  return response;
}

export async function getAppointmentsByType(type: string) {
  console.log("GOT APPOINTMENTS: " + type);
}