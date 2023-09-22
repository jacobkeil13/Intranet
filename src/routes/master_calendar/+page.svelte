<script lang="ts">
	import Search from '$lib/components/Search.svelte';
	import Popup from '$lib/components/Popup.svelte';
	import { type PaginationSettings, RadioGroup, RadioItem, type ModalSettings, getModalStore, getToastStore } from '@skeletonlabs/skeleton';
	import moment from 'moment';
	import { fly } from 'svelte/transition';
	import { getDateLocal } from '$lib/helpers.js';
	import TableWrapper from '$lib/components/TableWrapper.svelte';
	import PageWrapper from '$lib/components/PageWrapper.svelte';
	export let form;
	export let data;

	let modalStore = getModalStore();
	let toastStore = getToastStore();
	if (form) {
    toastStore.trigger({
		  message: String(form?.message),
      background: form?.success ? "bg-accTeal" : "bg-[#930000]",
      classes: "text-white/90 font-medium"
	  });
  }

	const masterCalendarModal: ModalSettings = {
		type: 'component',
		component: 'masterCalendarModal',
		meta: { constants: data.constants }
	}

	let keyBar = false;
	let searchQuery =	'';
	let todayFilter =	false;
	let weekFilter = false;
	let typeFilter = false;
	let typeFilterString = '';
	let filter = 'all';
	let month = 'currentMonth';
	let complete = 'pending';
	let fromDate = '';
	let toDate = '';

	$: items = data.masterCalendarItems;
	let filteredItems = data.masterCalendarItems;
	$: gridCols = keyBar ? 'grid-cols-[auto_250px]' : 'grid-cols-1';

	$: {
    filteredItems = items.filter((item) => {
			let primaryOwner = item.primaryOwner.first_name + " " + item.primaryOwner.last_name;
			let directReport = item.primaryOwner.directReport?.first_name + " " + item.primaryOwner.directReport?.last_name;
      if (item.type.type.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
					item.type.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
					item.title.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
					primaryOwner.toLowerCase().includes(searchQuery.toLowerCase().trim())) {
				if (todayFilter) {
					if (item.completionDate === null && getDateLocal(item.dueDate.toISOString(), "YYYY-MM-DD") === moment().format("YYYY-MM-DD")) {
						if (filter === "my" && primaryOwner === data.profile?.first_name + " " + data.profile?.last_name) {
							return item;
						} else if (filter === "report" && data.profile?.first_name + " " + data.profile?.last_name === directReport) {
							return item;
						} else if (filter === "all") {
							return item
						}
					}
					month = 'currentMonth';
				} else if (weekFilter) {
					if (item.completionDate === null && moment(item.dueDate).week() === moment().week()) {
						if (filter === "my" && primaryOwner === data.profile?.first_name + " " + data.profile?.last_name) {
							return item;
						} else if (filter === "report" && data.profile?.first_name + " " + data.profile?.last_name === directReport) {
							return item;
						} else if (filter === "all") {
							return item
						}
					}
					month = 'currentMonth';
				} else if (typeFilter) {
					if (typeFilterString !== '') {
						if (item.type.type === typeFilterString) {
							if (filter === "my" && primaryOwner === data.profile?.first_name + " " + data.profile?.last_name) {
								return item;
							} else if (filter === "report" && data.profile?.first_name + " " + data.profile?.last_name === directReport) {
								return item;
							} else if (filter === "all") {
								return item
							}
						}
					}
				} else {
					if (fromDate !== "" && toDate !== "") {
						if (item.completionDate === null && moment(item.dueDate).format("MMMM") === getMonthString(month)) {
							if (moment(item.dueDate).isSameOrAfter(fromDate) && moment(item.dueDate).isSameOrBefore(toDate)) {
								if (filter === "my" && primaryOwner === data.profile?.first_name + " " + data.profile?.last_name) {
									return item;
								} else if (filter === "report" && data.profile?.first_name + " " + data.profile?.last_name === directReport) {
									return item;
								} else if (filter === "all") {
									return item
								}
							}
						}
					} else {
						if (filter === "my" && primaryOwner === data.profile?.first_name + " " + data.profile?.last_name) {
							return item;
						} else if (filter === "report" && data.profile?.first_name + " " + data.profile?.last_name === directReport) {
							return item;
						} else if (filter === "all") {
							return item;
						}
					}
				}
      }
    })
		updatePageSettings(filteredItems);
		todayFilter = false;
		weekFilter = false;
		typeFilter = false;
		typeFilterString = '';
  }

	let paginationSettings = {
		page: 0,
		limit: 10,
		size: filteredItems.length,
		amounts: [5, 10, 25],
	} satisfies PaginationSettings;

	$: paginatedSource = filteredItems.slice(
		paginationSettings.page * paginationSettings.limit,
		paginationSettings.page * paginationSettings.limit + paginationSettings.limit
	);

	function updatePageSettings(filteredArr: any[]) {
		paginationSettings.size = filteredArr.length;
	}

	function openModal(modal: ModalSettings) {
		modalStore.trigger(modal);
	}

	async function updateCalendarItem(id: string) {
    modalStore.trigger({
      type: 'component',
      component: 'updateMasterCalendarModal',
      meta: { item: items.find(item => item.id === id), constants: data.constants,  
				response: async (action: "delete" | "update") => {
					if (action === "delete") {
						items = items.filter(item => item.id !== id);
						modalStore.close();
						toastStore.trigger({
							message: String("Calendar item deleted successfully!"),
							background: "bg-accTeal",
							classes: "text-white/90 font-medium"
						});
						return;
					};

					toastStore.trigger({
						message: "Calendar item updated successfully!",
						background: "bg-accTeal",
						classes: "text-white/90 font-medium"
					});

					let res = await fetch('/api/master_calendar?id=' + id);
					let resp = await res.json();
					let newItem = resp.masterCalendarItems;

					items = items.map(item => item.id === newItem.id ? newItem : item);
      }}
    });
	}

	function resetFilters() {
		todayFilter =	false;
		weekFilter = false;
		filter = 'all';
		month = 'currentMonth';
		searchQuery = '';
		fromDate = '';
		toDate = '';
		filteredItems = items;
	}

	function getMonthString(monthString: string): string {
		if (monthString === "previousMonth") {
			return moment().subtract(1, "M").format("MMMM");
		} else if (monthString === "current") {
			return moment().format("MMMM");
		} else if (monthString === "nextMonth") {
			return moment().add(1, "M").format("MMMM");
		} else {
			return moment().format("MMMM");
		}
	}
</script>

<svelte:head>
	<title>OFA • Master Calendar</title>
</svelte:head>

<section in:fly={{ y: -10, duration: 200 }}>
	<PageWrapper>
		<svelte:fragment slot="title">
			<h1 class="text-2xl text-usfGreen font-semibold">{filter === "my" ? "My" : ""} Master Calendar {filter === "my" ? "Tasks" : ""}</h1>
		</svelte:fragment>
		<svelte:fragment slot="title-right">
      <Search bind:value={searchQuery} />
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<div class="flex justify-center items-center bg-accSlate w-10 h-10 rounded-full cursor-pointer" on:click={() => { openModal(masterCalendarModal) }}>
				<i class="fa-solid fa-plus fa-lg text-white/90"></i>
			</div>
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<div class="flex justify-center items-center bg-accSlate w-10 h-10 rounded-full cursor-pointer" on:click={() => { keyBar = !keyBar }}>
				<i class="text-white/90 fa-solid {keyBar ? 'fa-xmark fa-lg' : 'fa-key'}"></i>
			</div>
		</svelte:fragment>
		<svelte:fragment slot="filters">
			<button class="bg-accSlate text-white/90 font-medium rounded-md px-4 py-2"
				on:click={() => { 
					todayFilter = true;
					filteredItems = items;
				}}
			>
				Today
			</button>
			<button class="bg-accSlate text-white/90 font-medium rounded-md px-4 py-2"
				on:click={() => { 
					weekFilter = true;
					filteredItems = items;
				}}
			>
				This Week
			</button>
			<h1 class="bg-accSlate/80 text-white/90 font-medium rounded-md px-4 py-2">From</h1>
			<input type="date" class="input rounded-md" name="from" id="" bind:value={fromDate}>
      <h1 class="bg-accSlate/80 text-white/90 font-medium rounded-md px-4 py-2">To</h1>
			<input type="date" class="input rounded-md" name="to" id="" min={fromDate} bind:value={toDate}>
			<RadioGroup background="bg-transparent" active="bg-accSlate text-white/90" class="mt-0" rounded="rounded-md">
				<RadioItem bind:group={complete} name="complete" value="pending">Pending</RadioItem>
				<RadioItem bind:group={complete} name="complete" value="completed">Completed</RadioItem>
			</RadioGroup>
			<RadioGroup background="bg-transparent" active="bg-accSlate text-white/90" class="mt-0" rounded="rounded-md">
				<RadioItem bind:group={filter} name="visitorType" value="all">All Tasks</RadioItem>
				<RadioItem bind:group={filter} name="visitorType" value="my">My Tasks</RadioItem>
				{#if data.profile?.team.map(team => team.name).includes("Management")}
					<RadioItem bind:group={filter} name="visitorType" value="report">Direct Report</RadioItem>
				{/if}
			</RadioGroup>
			<RadioGroup background="bg-transparent" active="bg-accSlate text-white/90" class="mt-0" rounded="rounded-md">
				<RadioItem bind:group={month} name="visitorType" value="previousMonth">{moment().subtract(1, "M").format("MMMM")}</RadioItem>
				<RadioItem bind:group={month} name="visitorType" value="currentMonth">{moment().format("MMMM")}</RadioItem>
				<RadioItem bind:group={month} name="visitorType" value="nextMonth">{moment().add(1, "M").format("MMMM")}</RadioItem>
			</RadioGroup>
			<button class="bg-accSlate/80 text-white/90 font-medium rounded-md px-4 py-2"
				on:click={resetFilters}
			>
				Reset Filters
			</button>
		</svelte:fragment>
		<svelte:fragment slot="content">
			<div class="grid {gridCols} auto-rows-min gap-x-4 gap-y-0" style="align-items: flex-start;">
				<section>
					<TableWrapper arrLength={filteredItems.length} bind:paginationSettings={paginationSettings}>
						<svelte:fragment slot="header">
							<thead class="bg-accSlate">
								<tr class="bg-accSlate text-white/90">
									<th class="table-cell-fit"></th>
									<th class="w-[100px]">Due</th>
									<th>Type</th>
									<th>Title</th>
									<th class="table-cell-fit">who</th>
									<th>Notes & Comments</th>
								</tr>
							</thead>
						</svelte:fragment>
						<svelte:fragment slot="body">
							<tbody>
								{#each paginatedSource as item}
									<tr on:click={() => updateCalendarItem(item.id)} class="cursor-pointer">
										<td class="flex items-center gap-3">
											{#if moment(item.dueDate).isBefore(new Date(), "day") && !item.completionDate}
												<h1 class="px-3 py-1 bg-red-600 text-white/80 rounded-md font-bold">Overdue</h1>
											{:else}
												<h1>-</h1>
											{/if}
										</td>
										<td>{getDateLocal(item.dueDate.toISOString(), "YYYY-MM-DD")}</td>
										<td>
											<Popup>
												<svelte:fragment slot="content">
													<div class="bg-accSlate text-white/80 px-3 py-1 w-fit rounded-md font-medium">
														<p class="text-white/80 font-semibold">{item.type.type}</p>
													</div>
												</svelte:fragment>
												<svelte:fragment slot="popup">
													<p class="text-white/80 font-semibold">{item.type.name}</p>
												</svelte:fragment>
											</Popup>
										</td>
										<td>{item.title}</td>
										<td>
											<Popup>
												<svelte:fragment slot="content">
													<div class="bg-accSlate text-white/80 px-3 py-1 w-fit rounded-md font-medium">
														<p class="text-white/80 font-semibold">{item.primaryOwner.first_name}</p>
													</div>
												</svelte:fragment>
												<svelte:fragment slot="popup">
													<p class="text-white/80 font-semibold">Secondary Owners</p>
													{#each item.secondaryOwners as user}
														<p class="text-white/80 font-medium">• {user.first_name + " " + user.last_name}</p>
													{/each}
												</svelte:fragment>
											</Popup>
										</td>
										<td>
											<Popup placement="top-start">
												<svelte:fragment slot="content">
													{item.comments[0].content}
												</svelte:fragment>
												<svelte:fragment slot="popup">
													<p class="text-white/80 font-bold">{item.comments[0].userProfile.first_name + " " + item.comments[0].userProfile.last_name}</p>
													<p class="text-white/80">{getDateLocal(item.comments[0].createdAt.toISOString(), "LLL")}</p>
												</svelte:fragment>
											</Popup>
										</td>
									</tr>
								{/each}
							</tbody>
						</svelte:fragment>
						<svelte:fragment slot="none">
							<p>There are no calendar items that match your search.</p>
						</svelte:fragment>
					</TableWrapper>
				</section>
				{#if keyBar}
					<div class="bg-accSlate rounded-lg p-3 text-white/90">
						<h1 class="font-medium mb-2">Type Key:</h1>
						{#each data.masterCalendarTypes as masterCalendarType}
							<!-- svelte-ignore a11y-click-events-have-key-events -->
							<div class="grid grid-cols-[auto_auto_1.5fr] gap-x-2 hover:bg-accSlate/70 cursor-pointer" on:click={() => { 
									typeFilterString = masterCalendarType.type;
									typeFilter = true;
								}}>
								<h1 class="font-medium text-accApple">{masterCalendarType.type}</h1>
								<h1>=</h1>
								<h1>{masterCalendarType.name}</h1>
							</div>
						{/each}
					</div>
				{/if}
			</div>
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