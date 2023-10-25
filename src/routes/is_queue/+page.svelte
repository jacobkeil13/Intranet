<script lang="ts">
	import { page } from '$app/stores';
	import PageWrapper from '$lib/components/PageWrapper.svelte';
	import Popup from '$lib/components/Popup.svelte';
	import Search from '$lib/components/Search.svelte';
	import TableWrapper from '$lib/components/TableWrapper.svelte';
	import { getDateLocal } from '$lib/helpers.js';
	import { type PaginationSettings, type ModalSettings, getModalStore, getToastStore, RadioGroup, RadioItem } from '@skeletonlabs/skeleton';
	import { fly } from 'svelte/transition';
	export let data;
	export let form;

	let tableFilter = {
		current: 'dateNeeded',
		title: { filter: 'asc' },
		type: { filter: 'asc' },
		dateRequested: { filter: 'asc' },
		dateNeeded: { filter: 'asc' },
		requestedBy: { filter: 'asc' },
		assignedTo: { filter: 'asc' }
	};

	let modalStore = getModalStore();
	let toastStore = getToastStore();
	if (form) {
		toastStore.trigger({
			message: String(form?.message),
			background: form?.success ? 'bg-accTeal' : 'bg-[#930000]',
			classes: 'text-white/90 font-medium'
		});
	}

	const isQueueModal: ModalSettings = {
		type: 'component',
		component: 'isQueueModal',
		meta: {
			constants: data.constants,
			isTeam: data.isTeam,
			managementTeam: data.managementTeam,
			profile: data.profile
		}
	};

	let filter = $page.url.searchParams.get('filter') === null ? 'all' : $page.url.searchParams.get('filter');
	let complete = 'pending';
	let searchQuery = '';
	let queueRequests = data.requests;
	let filteredQueueRequests = data.requests;

	$: {
		filteredQueueRequests = queueRequests.filter((request) => {
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
		limit: 20,
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
			component: 'updateIsQueueModal',
			meta: {
				request: queueRequests.find((req) => req.id === id),
				isTeam: data.isTeam,
				constants: data.constants,
				profile: data.profile,
				response: async (action: 'delete' | 'update') => {
					if (action === 'delete') {
						queueRequests = queueRequests.filter((queueRequest) => queueRequest.id !== id);
						modalStore.close();
						toastStore.trigger({
							message: String('Request deleted successfully!'),
							background: 'bg-accTeal',
							classes: 'text-white/90 font-medium'
						});
						return;
					}

					toastStore.trigger({
						message: 'Request updated successfully!',
						background: 'bg-accTeal',
						classes: 'text-white/90 font-medium'
					});

					let res = await fetch('/api/is_queue?id=' + id);
					let resp = await res.json();
					let newRequest = resp.requests;

					queueRequests = queueRequests.map((queueRequest) => (queueRequest.id === newRequest.id ? newRequest : queueRequest));
				}
			}
		});
	}

	function resetFilters() {
		filter = 'all';
		complete = 'pending';
		searchQuery = '';
		sortBy('dateNeeded', 'asc');
		tableFilter.dateNeeded.filter = 'asc';
	}

	function sortBy(field: string, sort: string) {
		tableFilter.current = field;
		filteredQueueRequests = queueRequests.sort((a, b) => {
			let aSortBy = a.dateNeeded.toISOString();
			let bSortby = b.dateNeeded.toISOString();
			switch (field) {
				case 'title':
					aSortBy = a.title;
					bSortby = b.title;
					break;
				case 'type':
					aSortBy = a.requestType.name;
					bSortby = b.requestType.name;
					break;
				case 'dateRequested':
					aSortBy = a.createdAt.toISOString();
					bSortby = b.createdAt.toISOString();
					break;
				case 'dateNeeded':
					aSortBy = a.dateNeeded.toISOString();
					bSortby = b.dateNeeded.toISOString();
					break;
				case 'requestedBy':
					aSortBy = a.requestedBy.first_name + ' ' + a.requestedBy.last_name;
					bSortby = b.requestedBy.first_name + ' ' + b.requestedBy.last_name;
					break;
				case 'assignedTo':
					aSortBy = a.assignedTo?.first_name + ' ' + a.assignedTo?.last_name;
					bSortby = b.assignedTo?.first_name + ' ' + b.assignedTo?.last_name;
					break;

				default:
					aSortBy = a.dateNeeded.toISOString();
					bSortby = b.dateNeeded.toISOString();
					break;
			}

			if (sort === 'asc') {
				if (field === 'dateNeeded' || field === 'dateRequested') {
					if (new Date(aSortBy) < new Date(bSortby)) return -1;
					if (new Date(aSortBy) > new Date(bSortby)) return 1;
					return 0;
				} else {
					if (aSortBy < bSortby) return -1;
					if (aSortBy > bSortby) return 1;
					return 0;
				}
			} else if (sort === 'dsc') {
				if (field === 'dateNeeded' || field === 'dateRequested') {
					if (new Date(aSortBy) > new Date(bSortby)) return -1;
					if (new Date(aSortBy) < new Date(bSortby)) return 1;
					return 0;
				} else {
					if (aSortBy > bSortby) return -1;
					if (aSortBy < bSortby) return 1;
					return 0;
				}
			} else {
				return 0;
			}
		});
	}
</script>

<svelte:head>
	<title>OFA • Information Services Queue</title>
</svelte:head>

<section in:fly={{ y: -10, duration: 200 }}>
	<PageWrapper>
		<svelte:fragment slot="title">
			<h1 class="text-2xl text-usfGreen font-semibold">{filter === 'my' ? 'My' : ''} {complete === 'completed' ? 'Completed' : ''} IS Queue Requests</h1>
		</svelte:fragment>
		<svelte:fragment slot="title-right">
			<Search bind:value={searchQuery} />
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<div
				class="flex justify-center items-center bg-accSlate w-10 h-10 rounded-full cursor-pointer"
				on:click={() => {
					openModal(isQueueModal);
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
							<th class="table-cell-fit">Priority</th>
							<th
								class="cursor-pointer select-none gap-2 min-w-[35ch]"
								on:click={() => {
									if (tableFilter.title.filter === 'asc') {
										tableFilter.title.filter = 'dsc';
									} else if (tableFilter.title.filter === 'dsc') {
										tableFilter.title.filter = 'asc';
									}
									sortBy('title', tableFilter.title.filter);
								}}
								>Title*
								<span>
									<i
										class="fa-solid fa-sm text-white/70
                        {tableFilter.current === 'title' ? 'inline-block' : 'hidden'} 
                        {tableFilter.title.filter === 'asc' ? 'fa-arrow-up-long' : 'fa-arrow-down-long'}"
									/>
								</span>
							</th>
							<th
								class="cursor-pointer select-none gap-2 whitespace-nowrap"
								on:click={() => {
									if (tableFilter.type.filter === 'asc') {
										tableFilter.type.filter = 'dsc';
									} else if (tableFilter.type.filter === 'dsc') {
										tableFilter.type.filter = 'asc';
									}
									sortBy('type', tableFilter.type.filter);
								}}
								>Type*
								<span>
									<i
										class="fa-solid fa-sm text-white/70
                        {tableFilter.current === 'type' ? 'inline-block' : 'hidden'} 
                        {tableFilter.type.filter === 'asc' ? 'fa-arrow-up-long' : 'fa-arrow-down-long'}"
									/>
								</span>
							</th>
							<th
								class="cursor-pointer select-none gap-2 whitespace-nowrap"
								on:click={() => {
									if (tableFilter.dateRequested.filter === 'asc') {
										tableFilter.dateRequested.filter = 'dsc';
									} else if (tableFilter.dateRequested.filter === 'dsc') {
										tableFilter.dateRequested.filter = 'asc';
									}
									sortBy('dateRequested', tableFilter.dateRequested.filter);
								}}
								>Date Requested*
								<span>
									<i
										class="fa-solid fa-sm text-white/70
                        {tableFilter.current === 'dateRequested' ? 'inline-block' : 'hidden'} 
                        {tableFilter.dateRequested.filter === 'asc' ? 'fa-arrow-up-long' : 'fa-arrow-down-long'}"
									/>
								</span>
							</th>
							<th
								class="cursor-pointer select-none gap-2 whitespace-nowrap"
								on:click={() => {
									if (tableFilter.dateNeeded.filter === 'asc') {
										tableFilter.dateNeeded.filter = 'dsc';
									} else if (tableFilter.dateNeeded.filter === 'dsc') {
										tableFilter.dateNeeded.filter = 'asc';
									}
									sortBy('dateNeeded', tableFilter.dateNeeded.filter);
								}}
								>Date Needed*
								<span>
									<i
										class="fa-solid fa-sm text-white/70
                        {tableFilter.current === 'dateNeeded' ? 'inline-block' : 'hidden'} 
                        {tableFilter.dateNeeded.filter === 'asc' ? 'fa-arrow-up-long' : 'fa-arrow-down-long'}"
									/>
								</span>
							</th>
							<th
								class="cursor-pointer select-none gap-2 whitespace-nowrap"
								on:click={() => {
									if (tableFilter.requestedBy.filter === 'asc') {
										tableFilter.requestedBy.filter = 'dsc';
									} else if (tableFilter.requestedBy.filter === 'dsc') {
										tableFilter.requestedBy.filter = 'asc';
									}
									sortBy('requestedBy', tableFilter.requestedBy.filter);
								}}
								>Requested By*
								<span>
									<i
										class="fa-solid fa-sm text-white/70
                        {tableFilter.current === 'requestedBy' ? 'inline-block' : 'hidden'} 
                        {tableFilter.requestedBy.filter === 'asc' ? 'fa-arrow-up-long' : 'fa-arrow-down-long'}"
									/>
								</span>
							</th>
							<th
								class="cursor-pointer select-none gap-2 whitespace-nowrap"
								on:click={() => {
									if (tableFilter.assignedTo.filter === 'asc') {
										tableFilter.assignedTo.filter = 'dsc';
									} else if (tableFilter.assignedTo.filter === 'dsc') {
										tableFilter.assignedTo.filter = 'asc';
									}
									sortBy('assignedTo', tableFilter.assignedTo.filter);
								}}
								>Assigned To*
								<span>
									<i
										class="fa-solid fa-sm text-white/70
                        {tableFilter.current === 'assignedTo' ? 'inline-block' : 'hidden'} 
                        {tableFilter.assignedTo.filter === 'asc' ? 'fa-arrow-up-long' : 'fa-arrow-down-long'}"
									/>
								</span>
							</th>
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
								<td><pre>{request.title}</pre></td>
								<td><pre>{request.requestType.name}</pre></td>
								<td><pre>{getDateLocal(request.createdAt.toISOString(), 'YYYY-MM-DD')}</pre></td>
								<td><pre>{getDateLocal(request.dateNeeded.toISOString(), 'YYYY-MM-DD')}</pre></td>
								<td><pre>{request.requestedBy.first_name + ' ' + request.requestedBy.last_name}</pre></td>
								<td><pre>{request.assignedTo ? request.assignedTo?.first_name + ' ' + request.assignedTo?.last_name : '-'}</pre></td>
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
