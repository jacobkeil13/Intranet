import moment from "moment";
import type { PrivacyForm } from "./types";
import { modalStore } from "@skeletonlabs/skeleton";

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
  console.log(data);
  
  await fetch(`http://localhost:3000/${template}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })
}

export function getCampusName(campusCode: string | undefined): string {
  if (campusCode === "T") {
    return "Tampa"
  } else if (campusCode === "P") {
    return "St. Pete"
  } else if (campusCode === "S") {
    return "Sarasota"
  } else {
    return "Not Specified"
  }
}

export function checkPrivacyForms(forms: PrivacyForm[]) {
  let parentHasAccess = false;

  let currentAidYear = moment().format("YYYY").slice(-2) + moment().add(1, 'year').format("YYYY").slice(-2);

  forms.forEach(form => {
    if (form.aidYear === currentAidYear) {
      parentHasAccess = true;
    }
  })
  return parentHasAccess;
}

export function openModal(modal: string, meta: object) {
  modalStore.trigger({
    type: 'component',
    component: modal,
    meta
  })
}