<script lang="ts">
	import { PageWrapper } from '$lib/components';
	import { writable } from 'svelte/store';
	import { fly } from 'svelte/transition';
	import moment from 'moment';
	export let data;

	interface Day {
		weekday: string;
		times: {
			timeStart: string | null;
			timeEnd: string | null;
		}[];
		total: number;
	}

	interface Week {
		days: Day[];
		total: number;
	}

	let schedule = writable<Week>({
		days: [
			{
				weekday: 'Monday',
				times: [{ timeStart: null, timeEnd: null }],
				total: 0
			},
			{
				weekday: 'Tuesday',
				times: [{ timeStart: null, timeEnd: null }],
				total: 0
			},
			{
				weekday: 'Wednesday',
				times: [{ timeStart: null, timeEnd: null }],
				total: 0
			},
			{
				weekday: 'Thursday',
				times: [{ timeStart: null, timeEnd: null }],
				total: 0
			},
			{
				weekday: 'Friday',
				times: [{ timeStart: null, timeEnd: null }],
				total: 0
			}
		],
		total: 0
	});

	$: {
		let weekTempTotal = 0;
		if ($schedule) {
			$schedule.days.forEach((day) => {
				let tempTotal: number = 0;
				day.times.forEach((time) => {
					if (time.timeStart !== null && time.timeEnd !== null) {
						let isoStart = moment().format('YYYY-MM-DD') + 'T' + time.timeStart + ':00.000';
						let isoEnd = moment().format('YYYY-MM-DD') + 'T' + time.timeEnd + ':00.000';

						if (moment(isoStart).isBefore(isoEnd)) {
							tempTotal += parseFloat(moment(isoEnd).diff(isoStart, 'hours', true).toFixed(1));
						}
					}
				});
				day.total = tempTotal;
				weekTempTotal += day.total;
			});
		}

		$schedule.total = weekTempTotal;
		$schedule = $schedule;
	}

	function updateSchedule() {
		$schedule = $schedule;
	}

	function addTime(idx: number) {
		$schedule.days[idx].times.push({
			timeStart: null,
			timeEnd: null
		});

		$schedule = $schedule;
	}

	function removeTime(day: number, time: number) {
		$schedule.days[day].times.splice(time, 1);
		$schedule = $schedule;
	}
</script>

<section class="page" in:fly={{ y: -10, duration: 200 }}>
	<PageWrapper>
		<svelte:fragment slot="title">
			<h1 class="text-2xl text-usfGreen font-semibold">Alternative Work Schedule Request</h1>
		</svelte:fragment>
		<svelte:fragment slot="content">
			<div>
				<h1 class="text-2xl font-medium mb-2">Requestor</h1>
				<div class="flex gap-2">
					<span class="flex flex-col w-auto space-y-1">
						<label for="fileName" class="font-medium">Current Date</label>
						<input type="date" name="fileName" class="input rounded-md" value={moment().format('YYYY-MM-DD')} />
					</span>
					<span class="flex flex-col w-fit space-y-1">
						<label for="fileName" class="font-medium">To</label>
						<select required class="input rounded-md max-w-[500px]" name="owner">
							<option disabled selected value="">Select one...</option>
							{#each data.users as user}
								<option value={user.id}>{user.first_name} {user.last_name}</option>
							{/each}
						</select>
					</span>
					<span class="flex flex-col w-fit space-y-1">
						<label for="fileName" class="font-medium">From</label>
						<select required class="input rounded-md max-w-[500px]" name="owner">
							<option disabled selected value="">Select one...</option>
							{#each data.users as user}
								<option value={user.id}>{user.first_name} {user.last_name}</option>
							{/each}
						</select>
					</span>
				</div>
			</div>
			<hr class="my-6" />
			<section class="flex flex-col gap-4">
				<div>
					<h1 class="text-2xl font-medium mb-2">Schedule</h1>
					<div class="flex gap-2">
						<span class="flex flex-col w-fit space-y-1">
							<label for="fileName" class="font-medium">Reason</label>
							<select required class="input rounded-md max-w-[500px]" name="owner">
								<option disabled selected value="">Select one...</option>
								<option value="">Child Care</option>
								<option value="">Class</option>
								<option value="">Commute</option>
								<option value="">Other</option>
							</select>
						</span>
						<span class="flex flex-col w-fit space-y-1">
							<label for="fileName" class="font-medium">Effective Date</label>
							<input type="date" name="fileName" class="input rounded-md" />
						</span>
						<span class="flex flex-col w-fit space-y-1">
							<label for="fileName" class="font-medium">End Date</label>
							<input type="date" name="fileName" class="input rounded-md" />
						</span>
					</div>
				</div>
				<div class="grid grid-cols-2 gap-4">
					{#each $schedule.days as day, i}
						<div class="border border-[#3e4c7a8a] w-full p-2 rounded-md">
							<div class="flex justify-between items-center">
								<h1 class="text-lg font-medium">{day.weekday}</h1>
								<!-- svelte-ignore a11y-click-events-have-key-events -->
								<i class="fa-solid fa-plus fa-lg text-black cursor-pointer no-print" on:click={() => addTime(i)} />
							</div>
							<hr class="my-2" />
							{#each day.times as time, j}
								<div class="flex gap-2 items-center">
									<span class="flex flex-col space-y-1">
										<label for="timeOut" class="font-medium">Start</label>
										<input class="input rounded-md w-fit block" type="time" name="timeOut" id="timeOut" on:change={updateSchedule} bind:value={time.timeStart} />
									</span>
									<span class="flex flex-col space-y-1">
										<label for="timeOut" class="font-medium">End</label>
										<input class="input rounded-md w-fit block" type="time" name="timeOut" id="timeOut" on:change={updateSchedule} bind:value={time.timeEnd} />
									</span>
									<span class="flex flex-col space-y-1">
										<label for="" class="opacity-0 items-end">Delete</label>
										<!-- svelte-ignore a11y-click-events-have-key-events -->
										<i class="fa-solid fa-xmark fa-lg text-red-700 cursor-pointer no-print" on:click={() => removeTime(i, j)} />
									</span>
								</div>
							{/each}
							<h1 class="mt-2">Total Hours: <span class="font-medium">{day.total}</span></h1>
						</div>
					{/each}
				</div>
				<div class="border border-red-700 p-2 rounded-md w-fit" class:border-usfGreen={$schedule.total === 40}>
					<h1>Total for the week - <span class="font-medium">{$schedule.total} hrs.</span></h1>
				</div>
			</section>
			<hr class="my-6" />
			<section>
				<div>
					<h1 class="text-2xl font-medium mb-2">Immediate Supervisor</h1>
					<div class="flex gap-8 items-center mb-2">
						<div class="flex gap-2 items-center">
							<input type="checkbox" />
							<h1>Approved</h1>
						</div>
						<div class="flex gap-2 items-center">
							<input type="checkbox" />
							<h1>Not Approved</h1>
						</div>
					</div>
					<br />
					<div class="flex flex-col w-full space-y-1">
						<label for="description" class="font-medium">Special Conditions </label>
						<textarea required class="input rounded-md max-w-[800px]" name="description" cols="20" rows="4" placeholder="Comments..." />
					</div>
					<br />
					<span class="flex flex-col w-fit space-y-1">
						<label for="fileName" class="font-medium">Supervisor</label>
						<select required class="input rounded-md max-w-[500px]" name="owner">
							<option disabled selected value="">Select one...</option>
							{#each data.supervisors as user}
								<option value={user.id}>{user.first_name} {user.last_name}</option>
							{/each}
						</select>
					</span>
					<br />
					<div class="flex gap-16">
						<h1>Signature: ____________________________________________________</h1>
						<h1>Date: _______/_______/_______</h1>
					</div>
				</div>
				<hr class="my-6" />
				<div>
					<h1 class="text-2xl font-medium mb-2">Manager</h1>
					<div class="flex gap-8 items-center mb-2">
						<div class="flex gap-2 items-center">
							<input type="checkbox" />
							<h1>Approved</h1>
						</div>
						<div class="flex gap-2 items-center">
							<input type="checkbox" />
							<h1>Not Approved</h1>
						</div>
					</div>
					<span class="flex flex-col w-fit space-y-1">
						<label for="fileName" class="font-medium">Supervisor</label>
						<select required class="input rounded-md max-w-[500px]" name="owner">
							<option disabled selected value="">Select one...</option>
							{#each data.supervisors as user}
								<option value={user.id}>{user.first_name} {user.last_name}</option>
							{/each}
						</select>
					</span>
					<br />
					<div class="flex gap-16">
						<h1>Signature: ____________________________________________________</h1>
						<h1>Date: _______/_______/_______</h1>
					</div>
				</div>
			</section>
			<hr class="my-6" />
			<button
				class="bg-accSlate text-white/90 py-2 rounded-md w-[150px] text-lg no-print"
				on:click={() => {
					window.print();
				}}>Print</button
			>
		</svelte:fragment>
	</PageWrapper>
</section>

<style>
	option:hover {
		background-color: white;
	}

	input {
		background-color: transparent;
		color: black;
		border-color: #3e4c7a8a;
	}

	select {
		color: black;
		background-color: transparent;
	}

	textarea {
		background-color: transparent;
		border-color: #3e4c7a8a;
	}

	@media print {
		.page {
			overflow: visible !important;
		}
		.no-print {
			display: none;
		}
	}
</style>
