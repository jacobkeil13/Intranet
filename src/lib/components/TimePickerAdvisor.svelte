<script lang="ts">
	import { counter_time_slots } from '$lib/stores/counter_duty';
	import moment from 'moment';
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
  export let currentDate: string;
  export let requestedAdvisor: string;
  export let timeChosen: string;

	interface Appointment {
		advisor: string;
		date: string;
	}

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

	let currentAppts: Appointment[] = [];

	$: currentDate, updateTimes();
	$: requestedAdvisor, updateTimes();
	$: currentAppts, updateTimes();
	// $: timeChosen, console.log(timeChosen);

	const takenTimes = writable<string[]>([]);

	onMount(async () => {
		let appointments = await fetch("/api/counter_duty?type=Phone Appointment");
		let res = await appointments.json();
		res.appointments.forEach((appt: any) => {
			currentAppts.push({
				advisor: appt.advisor,
				date: moment.utc(appt.dateTime).local().format("YYYY-MM-DDTHH:mm:ss") + ".000Z"
			});
		})
	})

	function updateTimes() {
		$takenTimes = [];
		currentAppts.forEach((appt) => {
			let date = appt.date.split('T')[0];
			let time = appt.date.split('T')[1].split('.')[0];
			if (date === currentDate && requestedAdvisor === appt.advisor) {
				$takenTimes.push(time);
			}
			if (requestedAdvisor === '') {
				$takenTimes = [];
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
    <label
      class="flex justify-center rounded-sm bg-[#D7DAE6] border border-accSlate/50 p-2"
      for={time.split(':')[0] + '_' + time.split(':')[1]}
      >{parseTime(time)}</label
    >
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
    background-color: #293A40;
	}

	input[type='radio']:disabled + label {
		opacity: 50%;
	}
</style>
