import { writable } from "svelte/store";
import type { SidebarLinks } from "../../app";

export const sidebar_links = writable<SidebarLinks[]>([
  {
    header: "Technology Help",
    links: [
      {
        label: "Remote Desktop Help",
        link: "https://usfjira.atlassian.net/wiki/spaces/UHID/pages/10934682845/Remote+Desktop+Access+Instructions",
        target: "_blank"
      },
      {
        label: "VPN Help",
        link: "",
        target: "_self"
      },
      {
        label: "Default Sign-in Change",
        link: "",
        target: "_self"
      },
      {
        label: "Internet Explorer Compatibility in Edge",
        link: "",
        target: "_self"
      },
      {
        label: "Share Your Calendar",
        link: "",
        target: "_self"
      }
    ]
  },
  {
    header: "Office Chart",
    links: [
      {
        label: "Office Organization Chart",
        link: "",
        target: "_self"
      },
      {
        label: "Office Floor Plan - Tampa",
        link: "",
        target: "_self"
      }
    ]
  },
  {
    header: "Call Center and Five9",
    links: [
      {
        label: "Five9 Login",
        link: "",
        target: "_self"
      },
      {
        label: "Station Ids",
        link: "",
        target: "_self"
      },
      {
        label: "Script",
        link: "",
        target: "_self"
      },
      {
        label: "Internal Referral PDF (Fillable)",
        link: "",
        target: "_self"
      },
      {
        label: "Q&A on Five9 Phone System",
        link: "",
        target: "_self"
      },
      {
        label: "Q&A Five9 - Supervisor",
        link: "",
        target: "_self"
      }
    ]
  },
  {
    header: "Confidentiality & Privacy",
    links: [
      {
        label: "Confidentiality & Privacy",
        link: "",
        target: "_self"
      }
    ]
  },
  {
    header: "Readability Checker",
    links: [
      {
        label: "Readability Checker",
        link: "",
        target: "_self"
      }
    ]
  },
  {
    header: "OFA PowerBi (NEW CHRONS)",
    links: [
      {
        label: "OFA PowerBi Dashboard",
        link: "",
        target: "_self"
      },
      {
        label: "New Chrons (PowerBi) Intro Training",
        link: "",
        target: "_self"
      }
    ]
  },
  {
    header: "BANNER",
    links: [
      {
        label: "Banner 9 (PROD)",
        link: "https://oasisappnav.usf.edu:8443/applicationNavigator",
        target: "_blank"
      },
      {
        label: "BDMS",
        link: "https://edocs.usf.edu/appxtender/login.aspx?sso=true",
        target: "_blank"
      },
      {
        label: "Banner 9 (PPRD)",
        link: "https://bannertest.it.usf.edu:8443/applicationNavigator/seamless",
        target: "_blank"
      },
      {
        label: "OASIS (PROD SSB)",
        link: "https://bannersso.usf.edu/ssomanager/c/SSB",
        target: "_blank"
      },
      {
        label: "OASIS (SSB PPRD)",
        link: "https://bannerssonpa.it.usf.edu/sso_pprd/c/SSB",
        target: "_blank"
      },
      {
        label: "General Banner 9 Intro Video",
        link: "https://usf.app.box.com/v/b9tour",
        target: "_blank"
      },
      {
        label: "Financial Aid Banner 9 Intro Video",
        link: "http://event.on24.com/wcc/r/1370107/F1938FAEA071B40D7C7B1C02C48DC00A",
        target: "_blank"
      },
      {
        label: "Banner 9 Upgrade (Training)",
        link: "http://usfas.forest.usf.edu/intranet/PP/nonyear/Banner%209%20Upgrade.pptx",
        target: "_blank"
      },
      {
        label: "Banner 8 vs Banner 9 Shortcut Keys",
        link: "http://usfas.forest.usf.edu/intranet/PP/nonyear/Banner%208%20vs%20Banner%209%20Shortcut%20Keys.pdf",
        target: "_blank"
      },
      {
        label: "Banner 9 Keyboard Shortcuts",
        link: "http://usfas.forest.usf.edu/intranet/PP/nonyear/Banner%209%20Keyboard%20Shortcuts.pdf",
        target: "_blank"
      }
    ]
  }
]);