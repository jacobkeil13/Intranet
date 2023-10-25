export interface BannerUser {
  "uid": string
  "first_name": string
  "last_name": string
  "email": string
  "netid": string
  "campus": string
}

export interface PrivacyForm {
  "aidYear": string
  "treqCode": string
  "status": string
}

export interface Version {
  "version": string,
  "date": string,
  "notes": {
    "header": string,
    "items": string[]
  }[]
}