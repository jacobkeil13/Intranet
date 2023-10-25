<script lang="ts">
	import { Accordion, AccordionItem, getModalStore } from '@skeletonlabs/skeleton';
	import type { Appointment, Referral, VisitCounter } from '@prisma/client';
	import { getDateLocal } from '$lib/helpers';
	import Search from '../Search.svelte';
	import Popup from '../Popup.svelte';
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
			<section class="table-container border border-accSlate/20">
				<table id="tableWrapper" class="table table-compact bg-white/20">
					<thead>
						<tr class="bg-accSlate text-white/90">
							<th>Date & Time</th>
							<th>Student Name</th>
							<th>Counter User</th>
							<th>Appt.</th>
							<th>Referral</th>
							<th>Document</th>
						</tr>
					</thead>
					<tbody>
						{#each data.visits as visit}
							<tr class="cursor-pointer">
								<td>{moment(visit.createdAt).format('MMM Do, YYYY [-] h:mmA')}</td>
								<td>{visit.studentName ?? '-'}</td>
								<td>{visit.counterUser}</td>
								<td>
									{#if visit.appointment !== null}
										<Popup bgColor="bg-accSlate" eventType="click">
											<svelte:fragment slot="content">
												<i class="fa-solid fa-check fa-lg text-usfGreen" />
											</svelte:fragment>
											<svelte:fragment slot="popup">
												<p class="text-white/80 font-semibold">{visit.appointment.advisor ?? 'No Advisor Set'}</p>
												<p class="flex items-center font-semibold {visit.appointment.completed ? 'text-green-500' : 'text-orange-300'}">
													{visit.appointment.completed ? 'Completed' : 'Pending'}
												</p>
												<p class="text-white/80 font-semibold">{getDateLocal(visit.appointment.createdAt, 'MMMM Do, YYYY')}</p>
												<hr class="!border-dashed my-2" />
												<p class="text-white/80 font-semibold">{visit.appointment.studentName}</p>
												<p class="text-white/80 font-semibold">{visit.appointment.type}</p>
											</svelte:fragment>
										</Popup>
									{:else}
										<i class="fa-solid fa-xmark fa-lg text-black/50" />
									{/if}
								</td>
								<td>
									{#if visit.referral !== null}
										<Popup bgColor="bg-accSlate" width="max-w-xs" eventType="click">
											<svelte:fragment slot="content">
												<i class="fa-solid fa-check fa-lg text-usfGreen" />
											</svelte:fragment>
											<svelte:fragment slot="popup">
												<p class="text-white/80 font-semibold">{visit.referral.counterUser}</p>
												<p class="flex items-center font-semibold {visit.referral.completed ? 'text-green-400' : 'text-orange-300'}">
													{visit.referral.completed ? 'Completed' : 'Pending'}
												</p>
												<p class="text-white/80 font-semibold">{getDateLocal(visit.referral.bestTimeCallback, 'MMMM Do, YYYY')}</p>
												<hr class="!border-dashed my-2" />
												<p class="text-white/80 font-semibold">{visit.referral.details}</p>
												<hr class="!border-dashed my-2" />
												<p class="text-white/80 font-semibold">{visit.referral.referralType}</p>
											</svelte:fragment>
										</Popup>
									{:else}
										<i class="fa-solid fa-xmark fa-lg text-black/50" />
									{/if}
								</td>
								<td>
									{#if visit.submittedDocument}
										<i class="fa-solid fa-check fa-lg text-usfGreen" />
									{:else}
										<i class="fa-solid fa-xmark fa-lg text-black/50" />
									{/if}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</section>
		{:else}
			<section class="card bg-transparent flex py-1 px-2 w-fit border border-black text-sm rounded-md">
				<h1>None</h1>
			</section>
		{/if}
		<br />
		<h1 class="font-medium text-lg mb-1">Appointments</h1>
		<hr class="mb-2" />
		{#if data.appts.length > 0}
			<section class="table-container border border-accSlate/20">
				<table id="tableWrapper" class="table table-compact bg-white/20">
					<thead>
						<tr class="bg-accSlate text-white/90">
							<th>Date & Time</th>
							<th>Type</th>
							<th>Student Name</th>
							<th>Secheduled By</th>
						</tr>
					</thead>
					<tbody>
						{#each data.appts as appt}
							<tr class="cursor-pointer">
								<td>{moment(appt.createdAt).format('MMM Do, YYYY [-] h:mmA')}</td>
								<td>{appt.type}</td>
								<td>{appt.studentName ?? '-'}</td>
								<td>{appt.scheduledBy ?? '-'}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</section>
		{:else}
			<section class="card bg-transparent flex py-1 px-2 w-fit border border-black text-sm rounded-md">
				<h1>None</h1>
			</section>
		{/if}
		<br />
		<h1 class="font-medium text-lg mb-1">Referrals</h1>
		<hr class="mb-2" />
		{#if data.referrals.length > 0}
			<section class="table-container border border-accSlate/20">
				<table id="tableWrapper" class="table table-compact bg-white/20">
					<thead>
						<tr class="bg-accSlate text-white/90">
							<th>Date & Time</th>
							<th>Type</th>
							<th>Student Name</th>
							<th>Secheduled By</th>
						</tr>
					</thead>
					<tbody>
						{#each data.referrals as ref}
							<tr class="cursor-pointer">
								<td>{moment(ref.createdAt).format('MMM Do, YYYY [-] h:mmA')}</td>
								<td>{ref.referralType}</td>
								<td>{ref.studentName ?? '-'}</td>
								<td>{ref.scheduledBy ?? '-'}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</section>
		{:else}
			<section class="card bg-transparent flex py-1 px-2 w-fit border border-black text-sm rounded-md">
				<h1>None</h1>
			</section>
		{/if}
		<br />
		<h1 class="font-medium text-lg mb-1">DR Queue</h1>
		<hr class="mb-2" />
		{#if data.dr_queue.length > 0}
			<Accordion>
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
