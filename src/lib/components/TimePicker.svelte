<script lang="ts">
	import { counter_time_slots } from '$lib/stores/counter_duty';
	import moment from 'moment';
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	export let currentDate: string;
	export let timeChosen: string;

	function parseTime(time: string) {
		let num;
		let tod;

		if (parseInt(time.split(':')[0]) > 11) {
			tod = 'PM';
		} else {
			tod = 'AM';
		}

		if (parseInt(time.split(':')[0]) < 10) {
			num = parseInt(time.split(':')[0].charAt(1));
		} else if (parseInt(time.split(':')[0]) > 12) {
			num = parseInt(time.split(':')[0]) - 12;
		} else {
			num = parseInt(time.split(':')[0]);
		}

		return `${num}:${time.split(':')[1]} ${tod}`;
	}

	let currentAppts: string[] = [];

	onMount(async () => {
		let appointments = await fetch('/api/counter_duty?type=Walk-in Appointment');
		let res = await appointments.json();
		res.appointments.forEach((appt: any) => {
			currentAppts.push(moment.utc(appt.dateTime).local().format('YYYY-MM-DDTHH:mm:ss') + '.000Z');
		});
	});

	$: currentDate, updateTimes();
	$: currentAppts, updateTimes();

	const takenTimes = writable<string[]>([]);

	function updateTimes() {
		$takenTimes = [];
		currentAppts.forEach((appt) => {
			let date = appt.split('T')[0];
			let time = appt.split('T')[1].split('.')[0];
			if (date === currentDate) {
				$takenTimes.push(time);
			}
		});
		timeChosen = '';
	}
</script>

<div class="grid w-[500px] grid-cols-5 gap-2">
	{#each $counter_time_slots as time}
		<input
			required={!$takenTimes.includes(time)}
			disabled={$takenTimes.includes(time) || moment(currentDate).weekday() === 6 || moment(currentDate).weekday() === 0}
			type="radio"
			name="time"
			id={time.split(':')[0] + '_' + time.split(':')[1]}
			value={time.split(':')[0] + '_' + time.split(':')[1]}
			bind:group={timeChosen}
		/>
		<label class="flex justify-center rounded-sm bg-transparent border border-accSlate/50 p-2" for={time.split(':')[0] + '_' + time.split(':')[1]}>{parseTime(time)}</label>
	{/each}
</div>

<style>
	input[type='radio'] {
		display: none;
	}

	input[type='radio'] + label {
		cursor: pointer;
	}

	input[type='radio']:checked + label {
		color: #f3f3f3;
		background-color: #293a40;
	}

	input[type='radio']:disabled + label {
		opacity: 50%;
	}
</style>
