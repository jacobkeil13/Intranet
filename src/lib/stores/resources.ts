import { writable } from "svelte/store";
import type { SidebarLinks } from "../../app";

export const resources = writable<SidebarLinks[]>([
  {
    "header": "Budget (CoA)",
    "links": [
      {
        "label": "2324 Budgets COA",
        "link": "http://usfas.forest.usf.edu/intranet/PP/2324/2324%20Budgets%20Cost%20of%20Attendance.xlsx",
        "target": "_self"
      },
      {
        "label": "Budgets Modified Programs",
        "link": "http://usfas.forest.usf.edu/intranet/PP/2324/2324%20Budgets%20Modified%20Programs.xlsx",
        "target": "_self"
      },
      {
        "label": "2022-2023",
        "link": "http://usfas.forest.usf.edu/intranet/PP/2223/2223%20Budgets.xlsx",
        "target": "_self"
      },
      {
        "label": "SSS Summer Budget",
        "link": "http://usfas.forest.usf.edu/intranet/PP/2223/2223%20SSS%20Summer%20Budget.xlsx",
        "target": "_self"
      },
      {
        "label": "CoA with Equity Cap",
        "link": "http://usfas.forest.usf.edu/intranet/PP/2223/2223%20COA%20with%20Equity%20Cap.xlsx",
        "target": "_self"
      },
      {
        "label": "Budgets Summer 2023",
        "link": "http://usfas.forest.usf.edu/intranet/PP/2223/2223%20Budgets%20Summer%202023.xlsx",
        "target": "_self"
      },
      {
        "label": "Budgets Modified",
        "link": "http://usfas.forest.usf.edu/intranet/PP/2223/2223%20Budgets%20Modified%20Programs.xlsx",
        "target": "_self"
      }
    ]
  },
  {
    "header": "Verification",
    "links": [
      {
        "label": "2324 Tax Document Review for Verification",
        "link": "http://usfas.forest.usf.edu/intranet/PP/2324/2324%20Tax%20Document%20Review%20For%20Verification.docx",
        "target": "_self"
      },
      {
        "label": "2223 Tax Document Review for Verification",
        "link": "http://usfas.forest.usf.edu/intranet/PP/2223/2223%20Tax%20Document%20Review%20For%20Verification.docx",
        "target": "_self"
      },
      {
        "label": "Tax Document for Front Counter",
        "link": "http://usfas.forest.usf.edu/intranet/PP/nonyear/Tax%20Documents%20for%20Front%20Counter.docx",
        "target": "_self"
      },
      {
        "label": "2324 Tax Transcript Decoder",
        "link": "http://usfas.forest.usf.edu/intranet/PP/2324/2324%20Tax%20Transcript%20Decoder.pdf",
        "target": "_self"
      },
      {
        "label": "2324 IRS Tax Return Transcript Matrix",
        "link": "http://usfas.forest.usf.edu/intranet/PP/2324/2324%20IRS%20Tax%20Return%20Transcript%20Matrix.xlsx",
        "target": "_self"
      }
    ]
  },
  {
    "header": "IRS Tax Table",
    "links": [
      {
        "label": "IRS Publication - 17 - 2020",
        "link": "http://usfas.forest.usf.edu/intranet/IRS/IRS%20Publication%2017%20-%202020.pdf",
        "target": "_self"
      },
      {
        "label": "IRS Publication - 17 - 2021",
        "link": "http://usfas.forest.usf.edu/intranet/IRS/IRS%20Publication%2017%20-%202021.pdf",
        "target": "_self"
      },
      {
        "label": "IRS Publication - 17 - 2022",
        "link": "http://usfas.forest.usf.edu/intranet/IRS/IRS%20Publication%2017%20-%202022.pdf",
        "target": "_self"
      },
      {
        "label": "Puerto Rico - Tax Return (English) - 2019",
        "link": "http://usfas.forest.usf.edu/intranet/IRS/Puerto%20Rico%20-%20Tax%20Return%20(English)%20-%202019.pdf",
        "target": "_self"
      },
      {
        "label": "Puerto Rico - Tax Return (English) - 2020",
        "link": "http://usfas.forest.usf.edu/intranet/IRS/Puerto%20Rico%20-%20Tax%20Return%20(English)%20-%202020.pdf",
        "target": "_self"
      },
      {
        "label": "Puerto Rico - Tax Return (English) - 2021",
        "link": "http://usfas.forest.usf.edu/intranet/IRS/Puerto%20Rico%20-%20Tax%20Return%20(English)%20-%202021.pdf",
        "target": "_self"
      }
    ]
  },
  {
    "header": "Loans",
    "links": [
      {
        "label": "Direct Loan Disbursement Cheat Sheet",
        "link": "http://usfas.forest.usf.edu/intranet/loans/Direct%20Loan%20Disbursement%20Cheat%20Sheet.rtf",
        "target": "_self"
      },
      {
        "label": "Direct Loan Origination Checklist",
        "link": "http://usfas.forest.usf.edu/intranet/loans/Direct%20Loan%20Origination%20Checklist.docx",
        "target": "_self"
      },
      {
        "label": "EXAGG Cheat Sheet",
        "link": "http://usfas.forest.usf.edu/intranet/loans/EXAGG%20Cheat%20Sheet.docx",
        "target": "_self"
      },
      {
        "label": "Loan Calculator",
        "link": "http://usfas.forest.usf.edu/intranet/loans/Loan%20Calculator.xlsx",
        "target": "_blank"
      }
    ]
  },
  {
    "header": "UG Scholarship Renewal Info",
    "links": [
      {
        "label": "USF Foundation Scholarship Renewal Criteria Spreadsheet",
        "link": "http://usfas.forest.usf.edu/intranet/PP/2223/2223%20USF%20Foundation%20Scholarship%20Renewal%20Fund%20Codes.pdf",
        "target": "_self"
      },
      {
        "label": "OUA Renewal Criteria Spreadsheet",
        "link": "http://usfas.forest.usf.edu/intranet/PP/2324/2324%20UG%20Scholarship%20Renewal%20Criteria%20Spreadsheet.pdf",
        "target": "_self"
      },
      {
        "label": "UG, BF, and Custodial Scholarship Cheat Sheet",
        "link": "http://usfas.forest.usf.edu/intranet/PP/nonyear/UG,%20BF,%20and%20Custodial%20Scholarship%20Cheat%20Sheet%20.pdf",
        "target": "_self"
      },
      {
        "label": "2022-2023 OUA FTIC Terms and Conditions",
        "link": "https://www.usf.edu/financial-aid/scholarships/2223-tc-fsa.aspx",
        "target": "_self"
      },
      {
        "label": "2022-2023 OUA Transfer Terms and Conditions",
        "link": "https://www.usf.edu/financial-aid/scholarships/2223-tc-tsa.aspx",
        "target": "_self"
      },
      {
        "label": "2021-2022 OUA FTIC Terms and Conditions",
        "link": "https://www.usf.edu/financial-aid/scholarships/2122-tc-fsa.aspx",
        "target": "_self"
      },
      {
        "label": "2021-2022 OUA Transfer Terms and Conditions",
        "link": "https://www.usf.edu/financial-aid/scholarships/2122-tc-tsa.aspx",
        "target": "_self"
      },
      {
        "label": "Bright Futures Summer Funding FAQ",
        "link": "http://usfas.forest.usf.edu/intranet/PP/2021/2021%20Summer%20BF%20Question%20and%20Answer.pdf",
        "target": "_self"
      },
      {
        "label": "Bright Futures Credit Hours Renewal Table",
        "link": "http://usfas.forest.usf.edu/intranet/PP/nonyear/Bright%20Futures%20Credit%20Hours%20Renewal%20Table.pdf",
        "target": "_self"
      },
      {
        "label": "OSFA Bright Futures Credit Hour Renewal Requirement Interactive Tool",
        "link": "https://www.floridastudentfinancialaidsg.org/PDF/BFCreditHourTool.xlsx",
        "target": "_self"
      },
      {
        "label": "USFAS Bright Futures Renewal Predictor",
        "link": "http://usfas.forest.usf.edu/scholarships/bright-futures/bf-renewal-predictor.aspx",
        "target": "_self"
      }
    ]
  },
  {
    "header": "BANNER",
    "links": [
      {
        "label": "General Banner 9 Intro Video",
        "link": "https://usf.app.box.com/v/b9tour",
        "target": "_blank"
      },
      {
        "label": "Financial Aid Banner 9 Intro Video",
        "link": "http://event.on24.com/wcc/r/1370107/F1938FAEA071B40D7C7B1C02C48DC00A",
        "target": "_blank"
      },
      {
        "label": "Banner 9 Upgrade (Training)",
        "link": "http://usfas.forest.usf.edu/intranet/PP/nonyear/Banner%209%20Upgrade.pptx",
        "target": "_blank"
      },
      {
        "label": "Banner 8 vs Banner 9 Shortcut Keys",
        "link": "http://usfas.forest.usf.edu/intranet/PP/nonyear/Banner%208%20vs%20Banner%209%20Shortcut%20Keys.pdf",
        "target": "_blank"
      },
      {
        "label": "Banner 9 Keyboard Shortcuts",
        "link": "http://usfas.forest.usf.edu/intranet/PP/nonyear/Banner%209%20Keyboard%20Shortcuts.pdf",
        "target": "_blank"
      }
    ]
  },
  {
    "header": "PELL",
    "links": [
      {
        "label": "2324 Pell Chart",
        "link": "https://fsapartners.ed.gov/sites/default/files/2023-01/2023-24PaymentSchedule.pdf",
        "target": "_blank"
      }
    ]
  },
  {
    "header": "Technology Help",
    "links": [
      {
        "label": "Remote Desktop Help",
        "link": "https://usfjira.atlassian.net/wiki/spaces/UHID/pages/10934682845/Remote+Desktop+Access+Instructions",
        "target": "_blank"
      },
      {
        "label": "VPN Help",
        "link": "",
        "target": "_self"
      },
      {
        "label": "Default Sign-in Change",
        "link": "",
        "target": "_self"
      },
      {
        "label": "Internet Explorer Compatibility in Edge",
        "link": "",
        "target": "_self"
      },
      {
        "label": "Share Your Calendar",
        "link": "",
        "target": "_self"
      }
    ]
  },
  {
    "header": "Office Chart",
    "links": [
      {
        "label": "Office Organization Chart",
        "link": "",
        "target": "_self"
      },
      {
        "label": "Office Floor Plan - Tampa",
        "link": "",
        "target": "_self"
      }
    ]
  }
]);