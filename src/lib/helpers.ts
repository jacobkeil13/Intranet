import moment from "moment";
import type { PrivacyForm } from "./types";

export function dateAddOffset(dateNeeded: string): string {
  const date = moment(new Date(dateNeeded)).add(4, "hours").toISOString();
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

export function getTerm(str: string) {
  let semester = str.split(' ')[0];
  let aidYear = str.split(' ')[1]
  if (semester === "Spring") {
    return aidYear + "01";
  } else if (semester === "Summer") {
    return aidYear + "05";
  } else if (semester === "Fall") {
    return aidYear + "08";
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