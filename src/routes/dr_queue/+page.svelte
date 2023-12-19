<script lang="ts">
	import { Search, PageWrapper, Popup, TableWrapper, HeaderSort } from '$lib/components';
	import { type PaginationSettings, type ModalSettings, getModalStore, getToastStore, RadioGroup, RadioItem } from '@skeletonlabs/skeleton';
	import { getDateLocal } from '$lib/helpers.js';
	import { fly } from 'svelte/transition';
	import { page } from '$app/stores';
	export let data;
	export let form;

	let modalStore = getModalStore();
	let toastStore = getToastStore();
	if (form) {
		toastStore.trigger({
			message: String(form?.message),
			background: form?.success ? 'bg-accTeal' : 'bg-[#930000]',
			classes: 'text-white/90 font-medium'
		});
	}

	const drQueueModal: ModalSettings = {
		type: 'component',
		component: 'drQueueModal',
		meta: {
			constants: data.constants,
			eptTeam: data.eptTeam,
			managementTeam: data.managementTeam,
			profile: data.profile
		}
	};

	type HeaderTypes = 'priority' | 'title' | 'dateRequested' | 'dateNeeded' | 'requestedBy' | 'assignedTo' | 'comments';
	let currentSortField: HeaderTypes = 'dateNeeded';
	let currentSortOrder: 'asc' | 'dsc' = 'asc';

	let filter = $page.url.searchParams.get('filter') === null ? 'all' : $page.url.searchParams.get('filter');
	let complete = 'pending';
	let searchQuery = '';
	$: dataRequests = data.requests;
	let filteredQueueRequests = data.requests;

	$: {
		filteredQueueRequests = dataRequests.filter((request) => {
			let assignedTo = request.assignedTo?.first_name + ' ' + request.assignedTo?.last_name;
			let requestedBy = request.requestedBy.first_name + ' ' + request.requestedBy.last_name;
			if (
				request.title.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
				requestedBy.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
				assignedTo.toLowerCase().includes(searchQuery.toLowerCase().trim())
			) {
				if (complete === 'pending' && request.complete) return false;
				if (complete === 'completed' && !request.complete) return false;
				if (filter === 'my' && !(request.assignedTo?.netid === data.profile?.netid || request.requestedBy?.netid === data.profile?.netid)) return false;
				return request;
			}
		});
		updatePageSettings(filteredQueueRequests);
	}

	let paginationSettings = {
		page: 0,
		limit: 10,
		size: filteredQueueRequests.length,
		amounts: [5, 10, 20, 50, 100]
	} satisfies PaginationSettings;

	$: paginatedSource = filteredQueueRequests.slice(paginationSettings.page * paginationSettings.limit, paginationSettings.page * paginationSettings.limit + paginationSettings.limit);

	function updatePageSettings(filteredArr: any[]) {
		paginationSettings.size = filteredArr.length;
		paginationSettings.page = 0;
	}

	function openModal(modal: ModalSettings) {
		if (data.profile?.role.name === 'STUDENT') return;
		modalStore.trigger(modal);
	}

	function updateRequest(id: string) {
		if (data.profile?.role.name === 'STUDENT') return;
		modalStore.trigger({
			type: 'component',
			component: 'updateDrQueueModal',
			meta: { request: dataRequests.find((req) => req.id === id), eptTeam: data.eptTeam, constants: data.constants, profile: data.profile }
		});
	}

	function resetFilters() {
		filter = 'all';
		complete = 'pending';
		searchQuery = '';
		currentSortField = 'dateNeeded';
		currentSortOrder = 'asc';
		sort();
	}

	let tableHeaders = [
		{ sortable: false, title: 'Priority', field: 'priority' },
		{ sortable: true, title: 'Title', field: 'title' },
		{ sortable: true, title: 'Date Needed', field: 'dateNeeded' },
		{ sortable: true, title: 'Date Requested', field: 'dateRequested' },
		{ sortable: true, title: 'Requested By', field: 'requestedBy' },
		{ sortable: true, title: 'Assigned To', field: 'assignedTo' },
		{ sortable: false, title: 'Comments', field: 'comments' }
	];

	function sort() {
		filteredQueueRequests = dataRequests.sort((a, b) => {
			const getField = (obj: typeof a, field: HeaderTypes) => {
				const fieldsMap = {
					priority: obj.priority.name,
					title: obj.title,
					dateNeeded: obj.dateNeeded.toISOString(),
					dateRequested: obj.createdAt.toISOString(),
					requestedBy: obj.requestedBy.first_name + ' ' + obj.requestedBy.last_name,
					assignedTo: obj.assignedTo ? obj.assignedTo.first_name + ' ' + obj.assignedTo.last_name : '-',
					comments: ''
				};
				return fieldsMap[field] || obj.dateNeeded.toISOString();
			};

			let aSortBy = getField(a, currentSortField);
			let bSortby = getField(b, currentSortField);

			const compareValues = (a: string, b: string) => {
				if (currentSortOrder === 'asc') return a < b ? -1 : a > b ? 1 : 0;
				return a > b ? -1 : a < b ? 1 : 0;
			};

			return compareValues(aSortBy, bSortby);
		});
	}
</script>

<svelte:head>
	<title>OFA • Data Request Queue</title>
</svelte:head>

<section in:fly={{ y: -10, duration: 200 }}>
	<PageWrapper>
		<svelte:fragment slot="title">
			<h1 class="text-2xl text-usfGreen font-semibold">{filter === 'my' ? 'My' : ''} {complete === 'completed' ? 'Completed' : ''} DR Queue Requests</h1>
		</svelte:fragment>
		<svelte:fragment slot="title-right">
			<Search bind:value={searchQuery} />
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<div
				class="flex justify-center items-center bg-accSlate w-10 h-10 rounded-full cursor-pointer"
				on:click={() => {
					openModal(drQueueModal);
				}}
			>
				<i class="fa-solid fa-plus fa-lg text-white/90" />
			</div>
		</svelte:fragment>
		<svelte:fragment slot="filters">
			<RadioGroup background="bg-transparent" active="bg-accSlate text-white/90" class="mt-0" rounded="rounded-md">
				<RadioItem bind:group={complete} name="complete" value="pending">Pending</RadioItem>
				<RadioItem bind:group={complete} name="complete" value="completed">Completed</RadioItem>
			</RadioGroup>
			<RadioGroup background="bg-transparent" active="bg-accSlate text-white/90" class="mt-0" rounded="rounded-md">
				<RadioItem bind:group={filter} name="visitorType" value="all">All</RadioItem>
				<RadioItem bind:group={filter} name="visitorType" value="my">My Requests</RadioItem>
			</RadioGroup>
			<button class="bg-accSlate/80 text-white/90 font-medium rounded-md px-4 py-2" on:click={resetFilters}> Reset Filters </button>
		</svelte:fragment>
		<svelte:fragment slot="content">
			<TableWrapper arrLength={filteredQueueRequests.length} bind:paginationSettings>
				<svelte:fragment slot="header">
					<thead>
						<tr class="bg-accSlate text-white/90">
							{#each tableHeaders as header}
								<HeaderSort sortable={header.sortable} title={header.title} field={header.field} bind:currentSortField bind:currentSortOrder on:sort={sort} />
							{/each}
						</tr>
					</thead>
				</svelte:fragment>
				<svelte:fragment slot="body">
					<tbody>
						{#each paginatedSource as request}
							<tr on:click={() => updateRequest(request.id)} class="cursor-pointer">
								<td class="flex items-center gap-3">
									<Popup>
										<svelte:fragment slot="content">
											<div
												class:bg-usfGreen={request.priority.name === 'Low'}
												class:bg-orange-500={request.priority.name === 'Medium'}
												class:bg-red-600={request.priority.name === 'High'}
												class="rounded-full h-5 w-5 [&>*]:pointer-events-none cursor-pointer"
											/>
										</svelte:fragment>
										<svelte:fragment slot="popup">
											<p class="text-white/80 font-semibold">{request.priority.name}</p>
										</svelte:fragment>
									</Popup>
								</td>
								<td>{request.title}</td>
								<td><pre>{getDateLocal(request.dateNeeded.toISOString(), 'YYYY-MM-DD')}</pre></td>
								<td><pre>{getDateLocal(request.createdAt.toISOString(), 'YYYY-MM-DD')}</pre></td>
								<td><pre>{request.requestedBy.first_name + ' ' + request.requestedBy.last_name}</pre></td>
								<td>
									{#if request.assignedTo}
										<pre>{request.assignedTo.first_name + ' ' + request.assignedTo.last_name}</pre>
									{:else}
										<pre>-</pre>
									{/if}
								</td>
								<td>
									{#if request.comments[0]}
										<Popup placement="top" width="w-[300px]">
											<svelte:fragment slot="content">
												<p class="text-sm">
													{request.comments[0].content.slice(0, 50)}
													{#if request.comments[0].content.length > 50}
														...<span class="font-medium">hover or click to read more</span>
													{/if}
												</p>
											</svelte:fragment>
											<svelte:fragment slot="popup">
												<p class="text-white/80 font-bold">{request.comments[0].user}</p>
												<p class="text-white/80">{getDateLocal(request.comments[0].createdAt.toISOString(), 'LLL')}</p>
												<hr class="!border-dotted my-2" />
												<pre class="whitespace-pre-wrap text-white/90">{@html request.comments[0].content}</pre>
											</svelte:fragment>
										</Popup>
									{/if}
								</td>
							</tr>
						{/each}
					</tbody>
				</svelte:fragment>
				<svelte:fragment slot="none">
					<p>There are no requests that match your search.</p>
				</svelte:fragment>
			</TableWrapper>
		</svelte:fragment>
	</PageWrapper>
</section>
