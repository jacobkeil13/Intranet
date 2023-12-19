import { writable } from 'svelte/store';
import type { SidebarLinks } from '../../app';

export const resources = writable<SidebarLinks[]>([
	{
		header: 'Budget (CoA)',
		links: [
			{
				label: '2324 Budgets COA',
				link: 'https://tup-ofa.forest.usf.edu/files/procedures/2324/2324%20Budgets%20Cost%20of%20Attendance.xlsx',
				target: '_self'
			},
			{
				label: 'Budgets Modified Programs',
				link: 'https://tup-ofa.forest.usf.edu/files/procedures/2324/2324%20Budgets%20Modified%20Programs.xlsx',
				target: '_self'
			},
			{
				label: '2022-2023',
				link: 'https://tup-ofa.forest.usf.edu/files/procedures/2223/2223%20Budgets.xlsx',
				target: '_self'
			},
			{
				label: 'SSS Summer Budget',
				link: 'https://tup-ofa.forest.usf.edu/files/procedures/2223/2223%20SSS%20Summer%20Budget.xlsx',
				target: '_self'
			},
			{
				label: 'CoA with Equity Cap',
				link: 'https://tup-ofa.forest.usf.edu/files/procedures/2223/2223%20COA%20with%20Equity%20Cap.xlsx',
				target: '_self'
			},
			{
				label: 'Budgets Summer 2023',
				link: 'https://tup-ofa.forest.usf.edu/files/procedures/2223/2223%20Budgets%20Summer%202023.xlsx',
				target: '_self'
			},
			{
				label: 'Budgets Modified',
				link: 'https://tup-ofa.forest.usf.edu/files/procedures/2223/2223%20Budgets%20Modified%20Programs.xlsx',
				target: '_self'
			}
		]
	},
	{
		header: 'Verification',
		links: [
			{
				label: '2324 Tax Document Review for Verification',
				link: 'https://tup-ofa.forest.usf.edu/files/procedures/2324/2324%20Tax%20Document%20Review%20For%20Verification.docx',
				target: '_self'
			},
			{
				label: '2223 Tax Document Review for Verification',
				link: 'https://tup-ofa.forest.usf.edu/files/procedures/2223/2223%20Tax%20Document%20Review%20For%20Verification.docx',
				target: '_self'
			},
			{
				label: 'Tax Document for Front Counter',
				link: 'https://tup-ofa.forest.usf.edu/files/procedures/non-year/Tax%20Documents%20for%20Front%20Counter.docx',
				target: '_self'
			},
			{
				label: '2324 Tax Transcript Decoder',
				link: 'https://tup-ofa.forest.usf.edu/files/procedures/2324/2324%20Tax%20Transcript%20Decoder.pdf',
				target: '_blank'
			},
			{
				label: '2324 IRS Tax Return Transcript Matrix',
				link: 'https://tup-ofa.forest.usf.edu/files/procedures/2324/2324%20IRS%20Tax%20Return%20Transcript%20Matrix.xlsx',
				target: '_self'
			}
		]
	},
	{
		header: 'IRS Tax Table',
		links: [
			{
				label: 'IRS Publication - 17 - 2020',
				link: 'https://tup-ofa.forest.usf.edu/files/resources/IRS%20Publication%2017%20-%202020.pdf',
				target: '_blank'
			},
			{
				label: 'IRS Publication - 17 - 2021',
				link: 'https://tup-ofa.forest.usf.edu/files/resources/IRS%20Publication%2017%20-%202021.pdf',
				target: '_blank'
			},
			{
				label: 'IRS Publication - 17 - 2022',
				link: 'https://tup-ofa.forest.usf.edu/files/resources/IRS%20Publication%2017%20-%202022.pdf',
				target: '_blank'
			},
			{
				label: 'Puerto Rico - Tax Return (English) - 2019',
				link: 'https://tup-ofa.forest.usf.edu/files/resources/Puerto%20Rico%20-%20Tax%20Return%20(English)%20-%202019.pdf',
				target: '_blank'
			},
			{
				label: 'Puerto Rico - Tax Return (English) - 2020',
				link: 'https://tup-ofa.forest.usf.edu/files/resources/Puerto%20Rico%20-%20Tax%20Return%20(English)%20-%202020.pdf',
				target: '_blank'
			},
			{
				label: 'Puerto Rico - Tax Return (English) - 2021',
				link: 'https://tup-ofa.forest.usf.edu/files/resources/Puerto%20Rico%20-%20Tax%20Return%20(English)%20-%202021.pdf',
				target: '_blank'
			}
		]
	},
	{
		header: 'Loans',
		links: [
			{
				label: 'Direct Loan Disbursement Cheat Sheet',
				link: 'https://tup-ofa.forest.usf.edu/files/resources/Direct%20Loan%20Disbursement%20Cheat%20Sheet.rtf',
				target: '_self'
			},
			{
				label: 'Direct Loan Origination Checklist',
				link: 'https://tup-ofa.forest.usf.edu/files/resources/Direct%20Loan%20Origination%20Checklist.docx',
				target: '_self'
			},
			{
				label: 'EXAGG Cheat Sheet',
				link: 'https://tup-ofa.forest.usf.edu/files/resources/EXAGG%20Cheat%20Sheet.docx',
				target: '_self'
			},
			{
				label: 'Loan Calculator',
				link: 'https://tup-ofa.forest.usf.edu/files/resources/Loan%20Calculator.xlsx',
				target: '_self'
			}
		]
	},
	{
		header: 'UG Scholarship Renewal Info',
		links: [
			{
				label: 'USF Foundation Scholarship Renewal Criteria Spreadsheet',
				link: 'https://tup-ofa.forest.usf.edu/files/procedures/2223/2223%20USF%20Foundation%20Scholarship%20Renewal%20Fund%20Codes.pdf',
				target: '_blank'
			},
			{
				label: 'OUA Renewal Criteria Spreadsheet',
				link: 'https://tup-ofa.forest.usf.edu/files/procedures/2324/2324%20UG%20Scholarship%20Renewal%20Criteria%20Spreadsheet.pdf',
				target: '_blank'
			},
			{
				label: 'UG, BF, and Custodial Scholarship Cheat Sheet',
				link: 'https://tup-ofa.forest.usf.edu/files/procedures/non-year/UG,%20BF,%20and%20Custodial%20Scholarship%20Cheat%20Sheet%20.pdf',
				target: '_blank'
			},
			{
				label: 'Bright Futures Summer Funding FAQ',
				link: 'https://tup-ofa.forest.usf.edu/files/procedures/2021/2021%20Summer%20BF%20Question%20and%20Answer.pdf',
				target: '_blank'
			},
			{
				label: 'Bright Futures Credit Hours Renewal Table',
				link: 'https://tup-ofa.forest.usf.edu/files/procedures/non-year/Bright%20Futures%20Credit%20Hours%20Renewal%20Table.pdf',
				target: '_blank'
			},
			{
				label: 'OSFA Bright Futures Credit Hour Renewal Requirement Interactive Tool',
				link: 'https://www.floridastudentfinancialaidsg.org/PDF/BFCreditHourTool.xlsx',
				target: '_self'
			},
			{
				label: '2024-2025 OUA FTIC Terms and Conditions',
				link: 'https://www.usf.edu/financial-aid/scholarships/2425-tc-fsa.aspx',
				target: '_blank'
			},
			{
				label: '2024-2025 OUA Transfer Terms and Conditions',
				link: 'https://www.usf.edu/financial-aid/scholarships/2425-tc-tsa.aspx',
				target: '_blank'
			}
		]
	},
	{
		header: 'PELL',
		links: [
			{
				label: '2324 Pell Grant Payment Chart',
				link: 'https://tup-ofa.forest.usf.edu/files/resources/2324%20Pell%20Grant%20Payment%20Schedule.xlsx',
				target: '_self'
			}
		]
	},
	{
		header: 'BANNER',
		links: [
			{
				label: 'General Banner 9 Intro Video',
				link: 'https://usf.app.box.com/v/b9tour',
				target: '_blank'
			},
			{
				label: 'Financial Aid Banner 9 Intro Video',
				link: 'http://event.on24.com/wcc/r/1370107/F1938FAEA071B40D7C7B1C02C48DC00A',
				target: '_blank'
			},
			{
				label: 'Banner 9 Upgrade (Training)',
				link: 'https://tup-ofa.forest.usf.edu/files/procedures/non-year/Banner%209%20Upgrade.pptx',
				target: '_self'
			},
			{
				label: 'Banner 8 vs Banner 9 Shortcut Keys',
				link: 'https://tup-ofa.forest.usf.edu/files/procedures/non-year/Banner%208%20vs%20Banner%209%20Shortcut%20Keys.pdf',
				target: '_blank'
			},
			{
				label: 'Banner 9 Keyboard Shortcuts',
				link: 'https://tup-ofa.forest.usf.edu/files/procedures/non-year/Banner%209%20Keyboard%20Shortcuts.pdf',
				target: '_blank'
			}
		]
	},
	{
		header: 'Technology Help',
		links: [
			{
				label: 'Remote Desktop Help',
				link: 'https://usfjira.atlassian.net/wiki/spaces/UHID/pages/10934682845/Remote+Desktop+Access+Instructions',
				target: '_blank'
			},
			{
				label: 'VPN Help',
				link: 'https://usfjira.atlassian.net/wiki/spaces/UHID/pages/10934682250/VPN+-+Palo+Alto+GlobalProtect',
				target: '_blank'
			},
			{
				label: 'Default Sign-in Change',
				link: 'https://mysignins.microsoft.com/security-info',
				target: '_blank'
			},
			{
				label: 'Share Your Calendar',
				link: 'https://tup-ofa.forest.usf.edu/files/procedures/non-year/Share%20Calendar.docx',
				target: '_self'
			}
		]
	},
	{
		header: 'Office Chart',
		links: [
			{
				label: 'Office Organization Chart',
				link: 'https://tup-ofa.forest.usf.edu/files/procedures/non-year/OFA%20Org%20Chart-All%20Campuses.pdf',
				target: '_blank'
			},
			{
				label: 'Office Floor Plan - Tampa',
				link: 'https://tup-ofa.forest.usf.edu/files/procedures/non-year/OFA%20Floor%20Plan.pdf',
				target: '_blank'
			}
		]
	}
]);
