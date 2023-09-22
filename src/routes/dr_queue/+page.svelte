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

	let modalStore = getModalStore();
	let toastStore = getToastStore();
	if (form) {
    toastStore.trigger({
		  message: String(form?.message),
      background: form?.success ? "bg-accTeal" : "bg-[#930000]",
      classes: "text-white/90 font-medium"
	  });
  }

	const drQueueModal: ModalSettings = {
		type: 'component',
		component: 'drQueueModal',
		meta: { 
			constants: data.constants,
			eptTeam: data.eptTeam,
			managementTeam: data.managementTeam
		}
	};

	let filter = $page.url.searchParams.get("filter") === null ? "all" : $page.url.searchParams.get("filter");
	let complete = "pending";
	let searchQuery = "";
	let dataRequests = data.requests;
	let filteredQueueRequests = data.requests;

	$: {
    filteredQueueRequests = dataRequests.filter((request) => {
			let assignedTo = request.assignedTo?.first_name + " " + request.assignedTo?.last_name;
			let requestedBy = request.requestedBy.first_name + " " + request.requestedBy.last_name;
      if ((request.title.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
				requestedBy.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
				assignedTo.toLowerCase().includes(searchQuery.toLowerCase().trim()))) {
				if (complete === "pending" && !request.complete) {
					return request;
				}
				if (complete === "completed" && request.complete) {
					return request;
				}
      }
    })
		updatePageSettings(filteredQueueRequests);
  }

	let paginationSettings = {
		page: 0,
		limit: 10,
		size: filteredQueueRequests.length,
		amounts: [5, 10, 15],
	} satisfies PaginationSettings;

	$: paginatedSource = filteredQueueRequests.slice(
		paginationSettings.page * paginationSettings.limit,
		paginationSettings.page * paginationSettings.limit + paginationSettings.limit
	);

	function updatePageSettings(filteredArr: any[]) {
		paginationSettings.size = filteredArr.length;
	}

	function openModal(modal: ModalSettings) {
		modalStore.trigger(modal);
	}

	function updateRequest(id: string) {
    modalStore.trigger({
      type: 'component',
      component: 'updateDrQueueModal',
      meta: { request: dataRequests.find(req => req.id === id), eptTeam: data.eptTeam, constants: data.constants }
    });
  }

	function resetFilters() {
		filter = 'all';
		complete = 'pending';
		searchQuery = '';
	}
</script>

<svelte:head>
	<title>OFA • Data Request Queue</title>
</svelte:head>

<section in:fly={{ y: -10, duration: 200 }}>
	<PageWrapper>
		<svelte:fragment slot="title">
			<h1 class="text-2xl text-usfGreen font-semibold">{filter === "my" ? "My" : ""} {complete === "completed" ? "Completed" : ""} DR Queue Requests</h1>
		</svelte:fragment>
		<svelte:fragment slot="title-right">
      <Search bind:value={searchQuery} />
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<div class="flex justify-center items-center bg-accSlate w-10 h-10 rounded-full cursor-pointer" on:click={() => { openModal(drQueueModal) }}>
				<i class="fa-solid fa-plus fa-lg text-white/90"></i>
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
			<button class="bg-accSlate/80 text-white/90 font-medium rounded-md px-4 py-2"
				on:click={resetFilters}
			>
				Reset Filters
			</button>
		</svelte:fragment>
		<svelte:fragment slot="content">
			<TableWrapper arrLength={filteredQueueRequests.length} bind:paginationSettings={paginationSettings}>
				<svelte:fragment slot="header">
					<thead>
						<tr class="bg-accSlate text-white/90">
							<th class="table-cell-fit">Priority</th>
							<th>Title</th>
							<th>Date Needed</th>
							<th>Requested By</th>
							<th>Assigned User</th>
						</tr>
					</thead>
				</svelte:fragment>
				<svelte:fragment slot="body">
					<tbody>
						{#each paginatedSource as request}
								<tr on:click={() => updateRequest(request.id)} class="cursor-pointer">
									<td class="flex items-center gap-3">
										<h1 
											class:bg-usfGreen={request.priority.name === "Low"}
											class:bg-orange-500={request.priority.name === "Medium"}
											class:bg-red-600={request.priority.name === "High"}
											class="px-3 py-1 text-white/90 font-medium rounded-md"
										>
											{request.priority.name}
										</h1>
									</td>
									<td>{request.title}</td>
									<td>{getDateLocal(request.dateNeeded.toISOString(), "MMMM Do, YYYY")}</td>
									<td>{request.requestedBy.first_name + " " + request.requestedBy.last_name}</td>
									<td>
										<Popup placement="right">
											<svelte:fragment slot="content">
												{request.comments[0].content}
											</svelte:fragment>
											<svelte:fragment slot="popup">
												<p class="text-white/80 font-bold">{request.comments[0].userProfile.first_name + " " + request.comments[0].userProfile.last_name}</p>
												<p class="text-white/80">{getDateLocal(request.comments[0].createdAt.toISOString(), "LLL")}</p>
											</svelte:fragment>
										</Popup>
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
