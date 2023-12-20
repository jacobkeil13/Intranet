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
