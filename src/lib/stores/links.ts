import { writable } from "svelte/store";
import type { SidebarLinks } from "../../app";

export const links = writable([ 
  {
    "label": "MyUSF",
    "link": "https://mysites.usf.edu/default.aspx",
    "target": "_blank"
  },
  {
    "label": "SAVE Login",
    "link": "https://idp.uscis.gov/",
    "target": "_blank"
  }
]);