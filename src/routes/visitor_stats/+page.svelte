<script lang="ts">
	import { type PaginationSettings, getModalStore } from '@skeletonlabs/skeleton';
	import { PageWrapper, TableWrapper } from '$lib/components';
	import { pageOptions } from '$lib/stores/filters.js';
	import { fly } from 'svelte/transition';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import moment from 'moment';
	export let data;

	let modalStore = getModalStore();
	$: fromDate = '';
	$: toDate = '';
	let filteredParsedVisits = data.parsedVists;
	let searchQuery = $page.url.searchParams.get('search') === null ? '' : String($page.url.searchParams.get('search'));

	onMount(() => {
		// const visitsPerDay: { [key: string]: { visits: number; phone: number; inperson: number; walkin: number; refs: number } } = {};

		// for (let visit of data.visits) {
		// 	let date = getDateLocal(visit.createdAt.toISOString(), 'YYYY-MM-DD');

		// 	if (visitsPerDay[date] === undefined) {
		// 		visitsPerDay[date] = { visits: 0, phone: 0, inperson: 0, walkin: 0, refs: 0 };
		// 	}

		// 	visitsPerDay[date].visits++;

		// 	if (visit.appointment !== null) {
		// 		if (visit.appointment.type === 'Phone Appointment') {
		// 			visitsPerDay[date].phone++;
		// 		}
		// 		if (visit.appointment.type === 'In-person Appointment') {
		// 			visitsPerDay[date].inperson++;
		// 		}
		// 		if (visit.appointment.type === 'Walk-in Appointment') {
		// 			visitsPerDay[date].walkin++;
		// 		}
		// 	}
		// 	if (visit.referral !== null) {
		// 		visitsPerDay[date].refs++;
		// 	}
		// }

		// Object.keys(visitsPerDay).forEach((date) => {
		// 	let tr = {
		// 		date,
		// 		totalVisits: visitsPerDay[date].visits,
		// 		phoneAppts: visitsPerDay[date].phone,
		// 		inPersonAppts: visitsPerDay[date].inperson,
		// 		walkinAppts: visitsPerDay[date].walkin,
		// 		referralsCreated: visitsPerDay[date].refs
		// 	};
		// 	parsedVists.push(tr);
		// });
		filteredParsedVisits = data.parsedVists;
	});

	$: {
		filteredParsedVisits = data.parsedVists.filter((visit: any) => {
			if (fromDate !== '' && toDate !== '') {
				if (moment(visit.date).isSameOrAfter(fromDate) && moment(visit.date).isSameOrBefore(toDate)) {
					return visit;
				}
			} else {
				return visit;
			}
		});

		updatePageSettings(filteredParsedVisits);
	}

	let paginationSettings = {
		page: 0,
		limit: 10,
		size: filteredParsedVisits.length,
		amounts: pageOptions
	} satisfies PaginationSettings;

	$: paginatedSource = filteredParsedVisits.slice(paginationSettings.page * paginationSettings.limit, paginationSettings.page * paginationSettings.limit + paginationSettings.limit);

	function updatePageSettings(filteredArr: any[]) {
		paginationSettings.size = filteredArr.length;
		paginationSettings.page = 0;
	}

	function viewDate(date: string) {
		fetch('/api/visits/date/' + moment(date).format('YYYY-MM-DD')).then(async (res) => {
			let resp = await res.json();

			modalStore.trigger({
				type: 'component',
				component: 'visitStatsModal',
				meta: { visits: resp.visits, date }
			});
		});
		// console.log(visitsDate.length);
	}

	// function downloadCSV() {
	// 	const rows: any = [];
	// 	const headerRow: string[] = ['UID', 'Student Name', 'Student Email', 'Reason', 'Visitor Type', 'Counter User', 'Submitted Document', 'Appointment', 'Referral', 'Time'];
	// 	rows.push(headerRow);

	// 	let rangeVisits = data.visits.filter((visit) => {
	// 		if (moment(visit.createdAt).isSameOrAfter(fromDate, 'day') && moment(visit.createdAt).isSameOrBefore(toDate, 'day')) {
	// 			return visit;
	// 		}
	// 	});

	// 	rangeVisits.forEach((visit) => {
	// 		let row: any = [];
	// 		row.push(String(visit.studentUid === null || visit.studentUid.includes('#') ? '-' : visit.studentUid));
	// 		row.push(String(visit.studentName ?? '-'));
	// 		row.push(String(visit.studentEmail ?? '-'));
	// 		row.push(String(visit.reason.replaceAll(', ', ' / ')));
	// 		row.push(String(visit.visitorType));
	// 		row.push(String(visit.counterUser));
	// 		row.push(String(visit.submittedDocument));
	// 		row.push(String(visit.appointment ? true : false));
	// 		row.push(String(visit.referral ? true : false));
	// 		row.push(String(getDateLocal(visit.createdAt.toISOString(), 'YYYY-MM-DD hh:mmA')));
	// 		rows.push(row);
	// 	});

	// 	let csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e: any) => e.join(',')).join('\n');

	// 	var encodedUri = encodeURI(csvContent);

	// 	var link = document.createElement('a');
	// 	link.setAttribute('href', encodedUri);
	// 	link.setAttribute('download', `Visits_${fromDate}_-_${toDate}.csv`);
	// 	document.body.appendChild(link);
	// 	link.click();
	// }

	function resetFilters() {
		fromDate = '';
		toDate = '';
		searchQuery = '';
	}
</script>

<svelte:head>
	<title>OFA • Visitor Statistics</title>
</svelte:head>

<section in:fly={{ y: -10, duration: 200 }}>
	<PageWrapper>
		<svelte:fragment slot="title">
			<h1 class="text-2xl text-usfGreen font-semibold">Visitor Statistics</h1>
		</svelte:fragment>
		<svelte:fragment slot="title-right">
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<div
				class="flex justify-center items-center bg-accSlate w-10 h-10 rounded-full cursor-pointer"
				on:click={() => {
					goto('/counter_duty');
				}}
			>
				<i class="fa-solid fa-plus fa-lg text-white/90" />
			</div>
		</svelte:fragment>
		<svelte:fragment slot="filters">
			<h1 class="bg-accSlate/80 text-white/90 font-medium rounded-md px-4 py-2">From</h1>
			<input type="date" class="input rounded-md" name="from" id="" bind:value={fromDate} />
			<h1 class="bg-accSlate/80 text-white/90 font-medium rounded-md px-4 py-2">To</h1>
			<input type="date" class="input rounded-md" name="to" id="" min={fromDate} bind:value={toDate} />
			<!-- {#if fromDate !== '' && toDate !== ''}
				<button class="bg-accSlate/80 text-white/90 font-medium rounded-md px-4 py-2" on:click={downloadCSV}> Export Visits </button>
			{/if} -->
			<button class="bg-accSlate/80 text-white/90 font-medium rounded-md px-4 py-2" on:click={resetFilters}> Reset Filters </button>
		</svelte:fragment>
		<svelte:fragment slot="content">
			<TableWrapper arrLength={filteredParsedVisits.length} bind:paginationSettings>
				<svelte:fragment slot="header">
					<thead>
						<tr class="bg-accSlate text-white/90">
							<th>Date</th>
							<th>Total Visits</th>
							<th>Phone Appts.</th>
							<th>In-Person Appts.</th>
							<th>Walk-In Appts.</th>
							<th>Referrals</th>
						</tr>
					</thead>
				</svelte:fragment>
				<svelte:fragment slot="body">
					<tbody>
						{#each paginatedSource as visit}
							<tr on:click={() => viewDate(visit.date)} class="cursor-pointer">
								<td>{moment(visit.date).format('MM/DD/YYYY')}</td>
								<td>{visit.totalVisits}</td>
								<td>{visit.phoneAppts}</td>
								<td>{visit.inPersonAppts}</td>
								<td>{visit.walkinAppts}</td>
								<td>{visit.referralsCreated}</td>
							</tr>
						{/each}
					</tbody>
				</svelte:fragment>
				<svelte:fragment slot="none">
					<p>There are no days with visits in this range.</p>
				</svelte:fragment>
			</TableWrapper>
		</svelte:fragment>
	</PageWrapper>
</section>

<style>
	input {
		background-color: transparent;
		width: fit-content;
		color: black;
		border-color: #3e4c7a8a;
	}
</style>
