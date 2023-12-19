<script lang="ts">
	import type { Appointment, Referral, VisitCounter } from '@prisma/client';
	import { Search } from '$lib/components';
	import { Accordion, AccordionItem, getModalStore } from '@skeletonlabs/skeleton';
	import moment from 'moment';

	interface FullVisit extends VisitCounter {
		appointment: Appointment | null;
		referral: Referral | null;
	}

	let modalStore = getModalStore();
	let promise = searchUID();
	let searchQuery = '';
	$: matchesUIDForm = /^U?\d{8}$/.test(searchQuery.toUpperCase().trim());

	function closeForm(): void {
		modalStore.close();
	}

	async function searchUID() {
		let res = await fetch('/api/visits/' + searchQuery);
		let resp = await res.json();

		return { visits: resp.visits, appts: resp.appts, referrals: resp.referrals, dr_queue: resp.dr_queue };
	}

	function handleSearch() {
		promise = searchUID();
	}

	function getStudentName(visits: any[]) {
		let foundName = visits.filter((visit: any) => visit.studentName !== null);

		if (foundName.length > 0) {
			return foundName[0].studentName;
		}

		return undefined;
	}
</script>

<section class="w-[50rem] max-h-[calc(100%_-_5rem)] overflow-y-auto bg-usfWhite p-4 rounded-md">
	<div class="flex justify-between items-center">
		<h1 class="text-xl text-usfGreen font-medium">Search UID</h1>
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<i class="fa-solid fa-xmark fa-lg text-black cursor-pointer" on:click={closeForm} />
	</div>
	<br />
	<section class="flex gap-2">
		<Search bind:value={searchQuery} width="w-full" divWidth="w-full" />
		<button on:click={handleSearch} disabled={!matchesUIDForm} class="{matchesUIDForm ? 'bg-accSlate' : 'bg-accSlate/50'} px-4 text-white/90 font-medium rounded-md"> Search </button>
	</section>
	<br />
	{#if !matchesUIDForm}
		<section class="card bg-transparent flex py-1 px-2 w-fit border border-red-700 text-sm rounded-md">
			<h1>Please enter a valid UID</h1>
		</section>
		<br />
	{/if}
	{#await promise}
		<p>Loading...</p>
	{:then data}
		<h1 class="font-medium text-lg mb-1">Visits</h1>
		<hr class="mb-2" />
		{#if data.visits.length > 0}
			<Accordion padding="py-2 px-1" autocollapse>
				{#each data.visits as visit}
					<AccordionItem>
						<svelte:fragment slot="summary"><span class="font-semibold">{visit.reason}</span> - {moment(visit.createdAt).format('YYYY-MM-DD h:mmA')}</svelte:fragment>
						<svelte:fragment slot="content">
							<ul>
								<li><span class="font-medium">Student Name:</span> {getStudentName(data.visits) ?? 'Unknown'}</li>
								<li><span class="font-medium">Counter User:</span> {visit.counterUser ?? 'None'}</li>
								<li>
									<span class="font-medium">Document Submitted - </span>
									{#if visit.submittedDocument}
										<i class="fa-solid fa-check fa-lg text-usfGreen" />
									{:else}
										<i class="fa-solid fa-xmark fa-lg text-black/50" />
									{/if}
								</li>
								<li>
									<span class="font-medium">Appointment Created - </span>
									{#if visit.appointment !== null}
										<i class="fa-solid fa-check fa-lg text-usfGreen" />
									{:else}
										<i class="fa-solid fa-xmark fa-lg text-black/50" />
									{/if}
								</li>
								<li>
									<span class="font-medium">Referral Created - </span>
									{#if visit.referral !== null}
										<i class="fa-solid fa-check fa-lg text-usfGreen" />
									{:else}
										<i class="fa-solid fa-xmark fa-lg text-black/50" />
									{/if}
								</li>
							</ul>
						</svelte:fragment>
					</AccordionItem>
				{/each}
			</Accordion>
		{:else}
			<section class="card bg-transparent flex py-1 px-2 w-fit border border-black text-sm rounded-md">
				<h1>None</h1>
			</section>
		{/if}
		<br />
		<h1 class="font-medium text-lg mb-1">Appointments</h1>
		<hr class="mb-2" />
		{#if data.appts.length > 0}
			<Accordion padding="py-2 px-1" autocollapse>
				{#each data.appts as appt}
					<AccordionItem>
						<svelte:fragment slot="summary"><span class="font-semibold">{appt.type} -- {appt.reason}</span> - {moment(appt.dateTime).format('YYYY-MM-DD h:mmA')}</svelte:fragment>
						<svelte:fragment slot="content">
							<ul>
								<li class="font-bold" class:text-usfGreen={appt.completed} class:text-orange-600={!appt.completed}>{appt.completed ? 'Completed' : 'Pending'}</li>
								<li><span class="font-medium">Student Name:</span> {appt.studentName ?? 'Unknown'}</li>
								<li><span class="font-medium">Advisor:</span> {appt.advisor}</li>
							</ul>
							{#if appt.timeIn !== null && appt.timeOut !== null}
								<div class="flex space-x-2">
									<span class="flex flex-col space-y-1">
										<label for="timeIn">Time In</label>
										<input class="input rounded-md w-fit block" type="time" name="timeIn" id="timeIn" value={moment(appt.timeIn).format('HH:mm')} />
									</span>
									<span class="flex flex-col space-y-1">
										<label for="timeOut">Time Out</label>
										<input class="input rounded-md w-fit block" type="time" name="timeOut" id="timeOut" value={moment(appt.timeOut).format('HH:mm')} />
									</span>
								</div>
							{/if}
						</svelte:fragment>
					</AccordionItem>
				{/each}
			</Accordion>
		{:else}
			<section class="card bg-transparent flex py-1 px-2 w-fit border border-black text-sm rounded-md">
				<h1>None</h1>
			</section>
		{/if}
		<br />
		<h1 class="font-medium text-lg mb-1">Referrals</h1>
		<hr class="mb-2" />
		{#if data.referrals.length > 0}
			<Accordion padding="py-2 px-1" autocollapse>
				{#each data.referrals as referral}
					<AccordionItem>
						<svelte:fragment slot="summary"><span class="font-semibold">{referral.counterUser} -- {referral.reason}</span> - {moment(referral.createdAt).format('YYYY-MM-DD')}</svelte:fragment>
						<svelte:fragment slot="content">
							<ul>
								<li class="font-bold" class:text-usfGreen={referral.completed} class:text-orange-600={!referral.completed}>{referral.completed ? 'Completed' : 'Pending'}</li>
								<li><span class="font-medium">Created By:</span> {referral.counterUser}</li>
								<li><span class="font-medium">Student Name:</span> {referral.studentName}</li>
								<li><span class="font-medium">Collaborators:</span> {referral.researchUser !== null ? referral.researchUser.split(',').join(', ') : 'None'}</li>
							</ul>
							{#if referral.comments.length > 0}
								<section class="m-0 mt-1 space-y-2">
									{#each referral.comments as comment}
										<div class="bg-black/10 p-3 rounded-md">
											<span class="font-semibold">{comment.user}</span> <span class="font-normal"> - {moment(comment.createdAt).format('YYYY-MM-DD h:mmA')}</span>
											<p>{comment.content}</p>
										</div>
									{/each}
								</section>
							{/if}
						</svelte:fragment>
					</AccordionItem>
				{/each}
			</Accordion>
		{:else}
			<section class="card bg-transparent flex py-1 px-2 w-fit border border-black text-sm rounded-md">
				<h1>None</h1>
			</section>
		{/if}
		<br />
		<h1 class="font-medium text-lg mb-1">DR Queue</h1>
		<hr class="mb-2" />
		{#if data.dr_queue.length > 0}
			<Accordion padding="py-2 px-1" autocollapse>
				{#each data.dr_queue as request}
					<AccordionItem>
						<svelte:fragment slot="summary"><span class="font-semibold">{request.title}</span> - {moment(request.createdAt).format('YYYY-MM-DD')}</svelte:fragment>
						<svelte:fragment slot="content">
							<ul>
								<li class="font-bold" class:text-usfGreen={request.complete} class:text-orange-600={!request.complete}>{request.complete ? 'Completed' : 'Pending'}</li>
								<li><span class="font-medium">Requested By:</span> {request.requestedBy.first_name} {request.requestedBy.last_name}</li>
								<li><span class="font-medium">Assigned To:</span> {request.assignedTo.first_name} {request.assignedTo.last_name}</li>
								<li><span class="font-medium">Request Type:</span> {request.requestType.name}</li>
							</ul>
							{#if request.comments.length > 0}
								<!-- <h1 class="m-0">Comments</h1> -->
								<section class="m-0 mt-1 space-y-2">
									{#each request.comments as comment}
										<div class="bg-black/10 p-3 rounded-md">
											<span class="font-semibold">{comment.user}</span> <span class="font-normal"> - {moment(comment.createdAt).format('YYYY-MM-DD h:mmA')}</span>
											<p>{comment.content}</p>
										</div>
									{/each}
								</section>
							{/if}
						</svelte:fragment>
					</AccordionItem>
				{/each}
			</Accordion>
		{:else}
			<section class="card bg-transparent flex py-1 px-2 w-fit border border-black text-sm rounded-md">
				<h1>None</h1>
			</section>
		{/if}
	{:catch error}
		<!-- <p>No entries...</p> -->
	{/await}
</section>

<style>
	input {
		background-color: #ffffff;
		color: black;
		border-color: #3e4c7a8a;
	}
</style>
