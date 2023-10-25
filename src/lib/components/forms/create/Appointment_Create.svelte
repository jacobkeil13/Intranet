<script lang="ts">
	import { fly } from 'svelte/transition';
	import { RadioGroup, RadioItem, SlideToggle, Step, Stepper, getModalStore, getToastStore } from '@skeletonlabs/skeleton';
	import { getCampusName, getDateLocal, timeout } from '$lib/helpers';
	import type { BannerUser, PrivacyForm } from '$lib/types';
	import Spinner from '$lib/components/animation/Spinner.svelte';
	import { actions, getCurrentAppts, getPrivacyInfo, getUidInfo } from '$lib/stores/counter_duty';
	import moment from 'moment';
	import TimePickerAdvisor from '$lib/components/TimePickerAdvisor.svelte';
	import TimePicker from '$lib/components/TimePicker.svelte';
	import { writable } from 'svelte/store';
	import * as devalue from 'devalue';
	import SuccessCheck from '$lib/components/animation/SuccessCheck.svelte';
	import type { Appointment, Referral } from '@prisma/client';
	import TextareaCopy from '$lib/components/TextareaCopy.svelte';
	import Popup from '$lib/components/Popup.svelte';
	import UserPicker from '$lib/components/UserPicker.svelte';

	let modalStore = getModalStore();
	let toastStore = getToastStore();
	let data = $modalStore[0].meta;

	enum Actions {
		Referral = 'Referral',
		Phone = 'Phone Appointment',
		InPerson = 'In-person Appointment',
		Walkin = 'Walk-in Appointment'
	}

	let visitError = false;
	let completed = false;
	let isLoading = false;
	let showError = false;
	let currentUser: BannerUser | undefined;
	let currentUserForms: PrivacyForm[] | undefined;
	let hasUID: boolean = true;
	let action: string = '';
	let errorMessage = '';
	let stringEmailList = '[]';

	function errorToast(msg: string) {
		showError = true;
		errorMessage = msg;
		var errorToast = document.getElementById('error-toast');
		if (errorToast?.scrollTop !== undefined) {
			errorToast.scrollTop = errorToast?.scrollHeight;
		}
	}

	let currentAppts: Appointment[] = [];
	let currentReferrals: Referral[] = [];

	let appointmentForm = writable({
		type: '',
		referralType: '',
		escalatedUser: '',
		researchUser: '',
		visitorType: 'Student',
		studentUid: '',
		studentEmail: '',
		studentName: '',
		studentCampus: '',
		appReason: '',
		referralDetails: '',
		rhacomm: false,
		callbackNumber: '',
		advisorRequested: '',
		date: '',
		time: '',
		bestTimeCallback: '12:00',
		preferredContactMethod: 'ROAMESG',
		source: ''
	});

	$: $appointmentForm.studentUid, ($appointmentForm.studentUid = $appointmentForm.studentUid.trim());
	$: matchesUIDForm = /^U?\d{8}$/.test($appointmentForm.studentUid.trim());
	$: action, ($appointmentForm.type = action);
	$: action, ($appointmentForm.date = '');
	$: minDate = moment()
		.add(action === Actions.Walkin ? 0 : 1, 'days')
		.format('YYYY-MM-DD');
	$: maxDate = moment()
		.add(action === Actions.Walkin ? 0 : 1, 'years')
		.format('YYYY-MM-DD');

	$: {
		if (matchesUIDForm) {
			isLoading = true;
			let uidInfo = getUidInfo($appointmentForm.studentUid).then((res) => {
				currentUser = res;
			});
			let privacyInfo = getPrivacyInfo($appointmentForm.studentUid).then((res) => {
				currentUserForms = res;
			});
			let apptInfo = getCurrentAppts($appointmentForm.studentUid).then((res) => {
				currentAppts = res.appointments;
				currentReferrals = res.referrals;
			});

			const promises = [uidInfo, privacyInfo, apptInfo];

			Promise.race([Promise.all(promises), timeout(5000)])
				.then((results) => {
					isLoading = false;
				})
				.catch((error) => {
					isLoading = false;
				});
		} else {
			currentUser = undefined;
		}
	}

	async function complete() {
		let timeTaken = false;
		$appointmentForm.studentEmail = String(currentUser?.email);
		$appointmentForm.studentName = String(currentUser?.first_name + ' ' + currentUser?.last_name);
		$appointmentForm.studentCampus = String(getCampusName(currentUser?.campus));

		if (!$appointmentForm.studentUid.includes('U') && $appointmentForm.studentUid.length > 7) {
			$appointmentForm.studentUid = 'U' + $appointmentForm.studentUid;
		} else if ($appointmentForm.studentUid.length < 8) {
			$appointmentForm.studentUid = '';
			$appointmentForm.studentName = '';
			$appointmentForm.studentEmail = '';
			$appointmentForm.studentCampus = '';
		}

		if (action === Actions.Walkin) {
			$appointmentForm.advisorRequested = '';
		}

		if (action !== '' && action !== Actions.Referral && action !== Actions.Walkin && $appointmentForm.advisorRequested === '') {
			errorToast('Please pick an advisor!');
			return;
		}
		if (action === Actions.Referral && $appointmentForm.bestTimeCallback === '') {
			errorToast('Please pick a preferred callback time!');
			return;
		}
		if (action === Actions.Referral && $appointmentForm.referralDetails === '') {
			errorToast('Please provide a referral description!');
			return;
		}
		if (($appointmentForm.date === '' || $appointmentForm.time === '') && action !== Actions.Referral) {
			if ($appointmentForm.date === '') {
				errorToast('Please pick a date!');
				return;
			}
			if ($appointmentForm.time === '') {
				errorToast('Please pick a time!');
				return;
			}
		}
		if (action !== '' && $appointmentForm.callbackNumber === '' && action !== Actions.Walkin) {
			errorToast('Please provide a callback number!');
			return;
		}
		if ($appointmentForm.appReason === '') {
			errorToast('Please pick a reason!');
			return;
		}
		if ($appointmentForm.source === '') {
			errorToast('Please pick the source of this request!');
			return;
		}
		if (action === Actions.Referral && $appointmentForm.referralType === '') {
			errorToast('Please pick a referral type!');
			return;
		}
		if (action === Actions.Referral && $appointmentForm.referralType === 'Escalated Referral' && $appointmentForm.escalatedUser === '') {
			errorToast('Please pick an escalated user!');
			return;
		}
		if (action === Actions.Referral && $appointmentForm.referralType === 'Collaboration Referral' && stringEmailList === '[]') {
			errorToast('Please pick a collaborator!');
			return;
		}
		if (!$appointmentForm.rhacomm) {
			errorToast('Please annotate RHACOMM!');
			return;
		}

		await fetch(`/api/counter_duty?type=${action}`).then(async (res) => {
			let response = await res.json();
			response.appointments.forEach((appt: Appointment) => {
				let existingApptDate = moment(appt.dateTime).local().format('YYYY-MM-DDThh:mm:ss') + '.000';
				if (action === Actions.Phone || action === Actions.InPerson) {
					if (appt.advisor === $appointmentForm.advisorRequested && existingApptDate === $appointmentForm.date + 'T' + $appointmentForm.time.replace('_', ':') + ':00.000') {
						timeTaken = true;
						return;
					}
				}
				if (action === Actions.Walkin) {
					if (existingApptDate === $appointmentForm.date + 'T' + $appointmentForm.time.replace('_', ':') + ':00.000') {
						timeTaken = true;
						return;
					}
				}
			});
		});

		if (timeTaken) {
			errorToast('Time is already taken. Please pick another!');
			return;
		}

		const formData = new FormData();
		formData.append('type', $appointmentForm.type);
		formData.append('source', $appointmentForm.source);
		formData.append('referralType', $appointmentForm.referralType);
		formData.append('escalatedUser', $appointmentForm.escalatedUser);
		formData.append('collaborators', stringEmailList);
		formData.append('visitorType', $appointmentForm.visitorType);
		formData.append('studentUid', $appointmentForm.studentUid);
		formData.append('studentEmail', $appointmentForm.studentEmail);
		formData.append('studentName', $appointmentForm.studentName);
		formData.append('studentCampus', $appointmentForm.studentCampus);
		formData.append('appReason', $appointmentForm.appReason);
		formData.append('referralDetails', $appointmentForm.referralDetails);
		formData.append('rhacomm', String($appointmentForm.rhacomm));
		formData.append('callbackNumber', $appointmentForm.callbackNumber);
		formData.append('advisorRequested', $appointmentForm.advisorRequested);
		formData.append('date', $appointmentForm.date);
		formData.append('time', $appointmentForm.time);
		formData.append('bestTimeCallback', $appointmentForm.bestTimeCallback);
		formData.append('preferredContactMethod', $appointmentForm.preferredContactMethod);

		fetch(`/${action !== Actions.Referral ? 'appointments?/create' : 'referrals?/create'}`, {
			method: 'POST',
			body: formData
		}).then(async (res) => {
			let response = await res.json();
			let parsedRes = devalue.parse(response.data);
			completed = true;
			if (!parsedRes.success) {
				visitError = true;
			}
		});
	}

	function closeForm(): void {
		modalStore.close();
	}

	function toUpperCase(event: Event) {
		const inputElement = event.target as HTMLInputElement;
		inputElement.value = inputElement.value.toUpperCase();
	}
</script>

<section in:fly={{ y: -10, duration: 200 }} class="w-[40rem] max-h-[calc(100%_-_5rem)] overflow-y-auto bg-usfWhite p-6 rounded-md">
	<div class="flex justify-between items-center">
		<h1 class="text-xl text-usfGreen font-medium">Create Appointment / Referral</h1>
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<i class="fa-light fa-xmark fa-lg text-black cursor-pointer" on:click={closeForm} />
	</div>
	<br />
	<section>
		{#if !completed}
			<Stepper
				on:complete={complete}
				active="rounded-sm bg-accSlate text-white"
				badge="rounded-sm bg-[#8E98BA] text-white"
				buttonComplete="rounded-md bg-accTeal text-white/90 font-medium"
				buttonNext="rounded-md bg-accSlate text-white"
				buttonBack="rounded-md bg-[#D1D4DD] border border-accSlate/50"
			>
				<section class="rounded-md">
					<Step locked={isLoading || (!matchesUIDForm && hasUID) || (currentUser === undefined && hasUID)}>
						<svelte:fragment slot="header">Identification</svelte:fragment>
						<section class="space-x-2">
							<RadioGroup background="bg-white" active="bg-accSlate text-white/90" class="mt-0 bg-white" rounded="rounded-md">
								<RadioItem bind:group={$appointmentForm.visitorType} name="visitorType" value="Student">Student</RadioItem>
								<RadioItem bind:group={$appointmentForm.visitorType} name="visitorType" value="Parent">Parent</RadioItem>
							</RadioGroup>
						</section>
						{#if hasUID}
							<section class="flex items-center space-x-3">
								<div class="relative w-fit">
									<div class="input-group input-group-divider rounded-md grid-cols-[auto_1fr_auto]">
										<div class="input-group-shim font-semibold bg-white">UID</div>
										<input
											autocomplete="off"
											type="text"
											class="w-fit font-semibold"
											name="uid"
											placeholder="Student UID..."
											minlength="8"
											maxlength="9"
											bind:value={$appointmentForm.studentUid}
											on:input={toUpperCase}
										/>
										{#if !isLoading}
											<div class="input-group-shim bg-white">
												{#if matchesUIDForm && currentUser != undefined}
													<i class="fa-solid fa-check fa-lg text-usfGreen cursor-pointer" />
												{:else if matchesUIDForm && currentUser === undefined}
													<i class="fa-solid fa-xmark fa-lg text-red-700 cursor-pointer" />
												{:else}
													<i class="fa-solid fa-circle-xmark fa-lg text-black/50 cursor-pointer" />
												{/if}
											</div>
										{:else}
											<div class="input-group-shim bg-white">
												<Spinner />
											</div>
										{/if}
									</div>
								</div>
								{#if !isLoading && $appointmentForm.visitorType === 'Parent' && currentUser !== undefined}
									<p class="flex items-center bg-red-700 h-[42px] px-4 font-semibold text-white/90 rounded-md">Privacy form is required</p>
								{/if}
							</section>
						{/if}
						{#if hasUID && currentUser !== undefined && !isLoading}
							<section class="flex space-x-4">
								<section class="card flex flex-col justify-center p-4 w-fit border bg-white border-accSlate/50">
									<h1><span class="pr-2 font-semibold">Name:</span> {currentUser.first_name} {currentUser.last_name}</h1>
									<h1><span class="pr-2 font-semibold">Email:</span> {currentUser.email}</h1>
									<h1><span class="pr-2 font-semibold">Campus:</span> {getCampusName(currentUser?.campus)}</h1>
								</section>
								{#if currentUserForms !== undefined}
									{#if currentUserForms.length !== 0}
										<table class="rounded-md border-collapse overflow-hidden">
											<tr>
												<th>Aid Year</th>
												<th>TREQ Code</th>
												<th>Status</th>
											</tr>
											{#each currentUserForms as form}
												<tr>
													<td>{form.aidYear}</td>
													<td>{form.treqCode}</td>
													<td class:text-red-700={form.status === 'N'} class="font-semibold">{form.status}</td>
												</tr>
											{/each}
										</table>
									{:else}
										<section class="card bg-white flex items-center p-4 w-fit border border-red-700">
											<h1 class="font-semibold">No privacy forms were found.</h1>
										</section>
									{/if}
								{/if}
							</section>
						{/if}
						{#if getCampusName(currentUser?.campus) === 'St. Pete' && !isLoading}
							<!-- svelte-ignore a11y-click-events-have-key-events -->
							<div
								class="card bg-transparent hover:bg-usfGreen hover:text-white/90 hover:font-medium flex items-center space-x-3 p-4 w-fit border border-accSlate/50 cursor-pointer"
								on:click={() => {
									window.open('https://outlook.office365.com/owa/calendar/USFSPFinancialAid@usfedu.onmicrosoft.com/bookings/', '_newtab');
								}}
							>
								Book St. Pete Appointment
							</div>
						{/if}
					</Step>
					<Step locked={action === ''}>
						<svelte:fragment slot="header">Pick Action</svelte:fragment>
						<section class="flex flex-col gap-2">
							{#if currentAppts.length > 0}
								{#each currentAppts as appt}
									<Popup bgColor="bg-accSlate" placement="right">
										<svelte:fragment slot="content">
											<section class="card bg-transparent flex items-center p-3 w-fit border border-red-700">
												<h1 class="font-medium">{currentUser?.first_name} has a pending appointment: <span class="font-bold">{appt.reason}</span>.</h1>
											</section>
										</svelte:fragment>
										<svelte:fragment slot="popup">
											<p class="text-white/80 font-semibold">{appt.advisor ?? 'No Advisor'}</p>
											<p class="flex items-center font-semibold {appt.completed ? 'text-green-500' : 'text-orange-300'}">
												{appt.completed ? 'Completed' : 'Pending'}
											</p>
											<p class="text-white/80 font-semibold">{moment(appt.createdAt).format('MMMM Do, YYYY')}</p>
											<hr class="!border-dashed my-2" />
											<p class="text-white/80 font-semibold">{appt.type}</p>
										</svelte:fragment>
									</Popup>
								{/each}
							{/if}
							{#if currentReferrals.length > 0}
								{#each currentReferrals as ref}
									<Popup bgColor="bg-accSlate" placement="right">
										<svelte:fragment slot="content">
											<section class="card bg-transparent flex items-center p-3 border border-red-700">
												<h1 class="font-medium">{currentUser?.first_name} has a referral: <span class="font-bold">{ref.reason}</span></h1>
											</section>
										</svelte:fragment>
										<svelte:fragment slot="popup">
											<p class="text-white/80 font-semibold">{ref.counterUser}</p>
											<p class="flex items-center font-semibold {ref.completed ? 'text-green-400' : 'text-orange-300'}">
												{ref.completed ? 'Completed' : 'Pending'}
											</p>
											<p class="text-white/80 font-semibold">{moment(ref.bestTimeCallback).format('MMMM Do, YYYY')}</p>
											<hr class="!border-dashed my-2" />
											<p class="text-white/80 font-semibold">{ref.referralType}</p>
										</svelte:fragment>
									</Popup>
								{/each}
							{/if}
						</section>
						<br />
						<ul class="grid w-full gap-2 grid-cols-2">
							{#each $actions as act}
								<li>
									<input type="radio" id={act.name} name="appointmentType" value={act.name} class="hidden peer" bind:group={action} required />
									<label
										for={act.name}
										class="inline-flex items-center justify-between w-full p-5 text-accSlate bg-white border border-accSlate/50 rounded-lg cursor-pointer peer-checked:bg-accSlate peer-checked:border-accSlate peer-checked:text-usfWhite/90"
									>
										<div class="block">
											<div class="w-full text-lg font-semibold">{act.name}</div>
										</div>
									</label>
								</li>
							{/each}
						</ul>
					</Step>
					{#if action !== ''}
						<Step>
							<svelte:fragment slot="header">Create {action}</svelte:fragment>
							{#if currentUser !== undefined}
								<section class="flex space-x-2">
									<div class="input-group input-group-divider grid-cols-[auto_1fr] rounded-md w-fit">
										<div class="input-group-shim bg-white">Name</div>
										<input disabled type="search" value={currentUser.first_name + ' ' + currentUser.last_name} />
									</div>
									<div class="input-group input-group-divider grid-cols-[auto_1fr] rounded-md w-fit">
										<div class="input-group-shim bg-white">UID</div>
										<input disabled type="search" value={currentUser.uid.includes('U') ? currentUser.uid : 'U' + currentUser.uid} />
									</div>
								</section>
							{/if}
							{#if action !== Actions.Walkin && action !== Actions.Referral}
								<h1 class="text-semibold text-xl">Pick Advisor</h1>
								<select name="advisor" id="advisor" class="input rounded-md w-fit" bind:value={$appointmentForm.advisorRequested}>
									<option disabled selected value="">Select one...</option>
									{#each data.constants.users as user}
										{#if user.uidRange !== null}
											<option value={user.first_name + ' ' + user.last_name}>{user.first_name} {user.last_name} - ({user.uidRange})</option>
										{/if}
									{/each}
								</select>
							{/if}
							{#if action !== Actions.Referral}
								<h1 class="text-semibold text-xl">Time & Date</h1>
							{:else}
								<h1 class="text-semibold text-xl">Contact Method</h1>
							{/if}
							<div class="flex space-x-2">
								{#if action !== Actions.Referral}
									<input class="input rounded-md w-fit" type="date" name="date" id="date" min={minDate} max={maxDate} bind:value={$appointmentForm.date} />
								{:else}
									<RadioGroup background="bg-white" active="bg-accSlate text-white/90 w-fit block" rounded="rounded-md">
										<RadioItem bind:group={$appointmentForm.preferredContactMethod} name="preferredContactMethod" value="ROAMESG">ROAMESG</RadioItem>
										<RadioItem bind:group={$appointmentForm.preferredContactMethod} name="preferredContactMethod" value="Phone">Phone</RadioItem>
										<RadioItem bind:group={$appointmentForm.preferredContactMethod} name="preferredContactMethod" value="Email">Email</RadioItem>
									</RadioGroup>
								{/if}
							</div>
							{#if action === Actions.InPerson || action === Actions.Phone}
								<TimePickerAdvisor currentDate={$appointmentForm.date} requestedAdvisor={$appointmentForm.advisorRequested} bind:timeChosen={$appointmentForm.time} />
							{:else if action === Actions.Walkin}
								<TimePicker currentDate={$appointmentForm.date} bind:timeChosen={$appointmentForm.time} />
							{/if}
							<div class="flex space-x-2">
								{#if action !== Actions.Walkin}
									<div class="space-y-1">
										<label for="phone">Callback Number</label>
										<input
											class="input rounded-md w-fit"
											type="tel"
											name="phone"
											id="phone"
											placeholder="Callback number..."
											bind:value={$appointmentForm.callbackNumber}
											pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
										/>
									</div>
								{/if}
								<div class="space-y-1">
									<label for="reasons">Reason</label>
									<select class="input rounded-md w-fit" name="reasons" id="reasons" bind:value={$appointmentForm.appReason}>
										<option disabled selected value="">Select one...</option>
										{#each data.appointmentReasons as appointmentReason}
											<option value={appointmentReason.name}>{appointmentReason.name}</option>
										{/each}
									</select>
								</div>
							</div>
							{#if action === Actions.Referral}
								<div class="flex space-x-2">
									<div class="space-y-1">
										<label for="description">Description</label>
										<TextareaCopy bind:content={$appointmentForm.referralDetails}>
											<svelte:fragment slot="textarea">
												<textarea
													required
													class="input rounded-md max-h-[100px] w-full"
													name="description"
													cols="100"
													rows="4"
													placeholder="Why are you making this referral..."
													bind:value={$appointmentForm.referralDetails}
												/>
											</svelte:fragment>
										</TextareaCopy>
									</div>
								</div>
							{/if}
							<div class="flex space-x-2">
								<div class="space-y-1">
									<label for="source">Source</label>
									<select class="input rounded-md w-fit" name="source" id="source" bind:value={$appointmentForm.source}>
										<option disabled selected value="">Select one...</option>
										<option value="Counter Duty">Counter Duty</option>
										<option value="Phone Duty">Phone Duty</option>
										<option value="Phone Appointment">Phone Appt.</option>
										<option value="In-person Appointment">In-person Appt.</option>
										<option value="Walk-in Appointment">Walk-in Appt.</option>
										<option value="Referral">Referral</option>
									</select>
								</div>
							</div>
							<div class="flex {$appointmentForm.referralType === 'Collaboration Referral' ? 'flex-col gap-2' : 'gap-2'}">
								{#if action === Actions.Referral}
									<div class="space-y-1">
										<label for="referralType">Referral Type</label>
										<select class="input rounded-md w-fit" name="referralType" id="referralType" bind:value={$appointmentForm.referralType}>
											<option disabled selected value="">Select one...</option>
											<option value="Self Referral">Self Referral</option>
											<option value="Collaboration Referral">Collaboration Referral</option>
											<option value="Escalated Referral">Escalated Referral</option>
										</select>
									</div>
									{#if $appointmentForm.referralType === 'Collaboration Referral'}
										<UserPicker label="Collaborators" users={data.constants.users} bind:stringEmailList />
									{/if}
									{#if $appointmentForm.referralType === 'Escalated Referral'}
										<div class="space-y-1">
											<label for="escalatedUser">Escalated User</label>
											<select class="input rounded-md w-fit" name="escalatedUser" id="escalatedUser" bind:value={$appointmentForm.escalatedUser}>
												<option disabled selected value="">Select one...</option>
												{#each data.managementTeam as user}
													<option value={user.first_name + ' ' + user.last_name}>{user.first_name + ' ' + user.last_name}</option>
												{/each}
											</select>
										</div>
									{/if}
								{/if}
							</div>
							<div class="flex space-x-2">
								<div class:border-usfGreen={$appointmentForm.rhacomm} class="card flex items-center space-x-3 p-4 w-fit border border-accSlate/50 bg-transparent">
									<h1>RHACOMM Annotated</h1>
									<SlideToggle name="document" size="sm" bind:checked={$appointmentForm.rhacomm} />
								</div>
							</div>
							{#if showError}
								<div id="error-toast" class="card bg-white flex items-center space-x-3 p-4 w-full border border-red-700">
									<h1>{errorMessage}</h1>
								</div>
							{/if}
						</Step>
					{/if}
				</section>
			</Stepper>
		{:else}
			<section class="flex flex-col justify-center items-center p-6 rounded-md space-y-4">
				{#if !visitError}
					<div class="flex items-center space-x-4">
						<h1 class="text-2xl font-bold text-usfGreen">Created {$appointmentForm.type === '' ? 'Visit' : $appointmentForm.type}</h1>
						<SuccessCheck />
					</div>
				{:else}
					<h1 class="text-2xl font-bold text-red-700">Failed to Create {$appointmentForm.type === '' ? 'Visit' : $appointmentForm.type}</h1>
				{/if}
				<button
					class="btn bg-accSlate text-white/90 rounded-md font-medium"
					on:click={() => {
						modalStore.close();
						location.reload();
					}}>Close</button
				>
			</section>
		{/if}
	</section>
</section>

<style>
	th {
		background: #293a40;
		color: white;
		padding: 0 20px;
		border: 1px #293a40 solid;
		border-color: #293a40;
	}
	td {
		border: 1px #293a40 solid;
		border-color: #2e354c15;
		padding: 0px 20px;
	}
	tr {
		background: #2e354c15;
	}
	input {
		background-color: #ffffff;
		color: black;
		border-color: #3e4c7a8a;
	}
	select {
		background-color: #ffffff;
		color: black;
		border-color: #3e4c7a8a;
	}
	textarea {
		background: transparent;
	}
</style>
