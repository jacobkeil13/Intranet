<script lang="ts">
	import { type PaginationSettings, RadioGroup, RadioItem, type ModalSettings, getModalStore, getToastStore } from '@skeletonlabs/skeleton';
	import type { MasterCalendarComment, MasterCalendarItem, MasterCalendarType, UserProfile } from '@prisma/client';
	import { PageWrapper, Popup, Search, TableWrapper, HeaderSort } from '$lib/components';
	import { getDateLocal } from '$lib/helpers.js';
	import { fly } from 'svelte/transition';
	import moment from 'moment';
	import { pageOptions } from '$lib/stores/filters.js';
	export let form;
	export let data;

	interface FullUser extends UserProfile {
		directReport: UserProfile | null;
	}

	interface FullCalendarItem extends MasterCalendarItem {
		type: MasterCalendarType;
		primaryOwner: FullUser;
		secondaryOwners: UserProfile[];
		comments: MasterCalendarComment[];
	}

	let modalStore = getModalStore();
	let toastStore = getToastStore();
	if (form) {
		toastStore.trigger({
			message: String(form?.message),
			background: form?.success ? 'bg-accTeal' : 'bg-[#930000]',
			classes: 'text-white/90 font-medium'
		});
	}

	const masterCalendarModal: ModalSettings = {
		type: 'component',
		component: 'masterCalendarModal',
		meta: { constants: data.constants }
	};

	let keyBar = false;
	let searchQuery = '';
	let todayFilter = false;
	let weekFilter = false;
	let typeFilter = false;
	let typeFilterString = '';
	let filter = 'all';
	let month = 'currentMonth';
	let complete = 'pending';
	let fromDate = '';
	let toDate = '';

	type HeaderTypes = 'status' | 'dateDue' | 'type' | 'title' | 'who' | 'comments';
	let currentSortField: HeaderTypes = 'dateDue';
	let currentSortOrder: 'asc' | 'dsc' = 'asc';

	$: items = data.masterCalendarItems;
	let filteredItems = data.masterCalendarItems;
	$: gridCols = keyBar ? 'grid-cols-[auto_250px]' : 'grid-cols-1';

	$: {
		const matchesSearchQuery = (item: FullCalendarItem) => {
			const primaryOwner = `${item.primaryOwner.first_name} ${item.primaryOwner.last_name}`;
			const directReport = `${item.primaryOwner.directReport?.first_name || ''} ${item.primaryOwner.directReport?.last_name || ''}`;
			const search = searchQuery.toLowerCase().trim();
			return [item.type.type, item.type.name, item.title, primaryOwner].some((field) => field.toLowerCase().includes(search));
		};

		const matchesFilter = (item: FullCalendarItem, owner: string) => {
			const primaryOwner = `${item.primaryOwner.first_name} ${item.primaryOwner.last_name}`;
			const directReport = `${item.primaryOwner.directReport?.first_name || ''} ${item.primaryOwner.directReport?.last_name || ''}`;

			return (filter === 'my' && primaryOwner === owner) || (filter === 'report' && directReport === owner) || filter === 'all';
		};

		const isItemComplete = (item: FullCalendarItem) => item.completionDate !== null;
		const isItemOverdue = (item: FullCalendarItem) => moment(item.dueDate).isBefore(moment(), 'day');

		const isItemWithinDateRange = (date: Date, start: string, end: string) => moment(date).isSameOrAfter(start, 'day') && moment(date).isSameOrBefore(end, 'day');
		const isItemInSpecifiedMonth = (date: Date, month: string) => {
			const itemDate = moment(date); // Convert item date to moment object for easy comparison
			if (month === 'previousMonth') return itemDate.isSame(moment().subtract(1, 'month'), 'month');
			if (month === 'currentMonth') return itemDate.isSame(moment(), 'month');
			if (month === 'nextMonth') return itemDate.isSame(moment().add(1, 'month'), 'month');
			return false;
		};

		const currentOwner = `${data.profile?.first_name || ''} ${data.profile?.last_name || ''}`;

		filteredItems = items.filter((item) => {
			if (todayFilter || weekFilter) {
				fromDate = '';
				toDate = '';
				month = 'currentMonth';
			}
			if (!matchesSearchQuery(item)) return false;
			if (complete === 'pending' && isItemComplete(item)) return false;
			if (complete === 'completed' && !isItemComplete(item)) return false;
			if (fromDate !== '' && toDate !== '') {
				if (!isItemWithinDateRange(item.dueDate, fromDate, toDate)) return false;
			} else {
				if (!isItemInSpecifiedMonth(item.dueDate, month)) return false;
			}

			if (todayFilter) {
				if (getDateLocal(item.dueDate.toISOString(), 'YYYY-MM-DD') === moment().format('YYYY-MM-DD')) {
					return matchesFilter(item, currentOwner);
				}
			} else if (weekFilter) {
				if (moment(item.dueDate).week() === moment().week()) {
					return matchesFilter(item, currentOwner);
				}
			} else if (typeFilter) {
				if (typeFilterString !== '' && item.type.type === typeFilterString) {
					return matchesFilter(item, currentOwner);
				}
			} else {
				return matchesFilter(item, currentOwner);
			}

			return false;
		});

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
		amounts: pageOptions
	} satisfies PaginationSettings;

	$: paginatedSource = filteredItems.slice(paginationSettings.page * paginationSettings.limit, paginationSettings.page * paginationSettings.limit + paginationSettings.limit);

	function updatePageSettings(filteredArr: any[]) {
		paginationSettings.size = filteredArr.length;
		paginationSettings.page = 0;
	}

	function openModal(modal: ModalSettings) {
		if (data.profile?.role.name === 'STUDENT') return;
		modalStore.trigger(modal);
	}

	async function updateCalendarItem(id: string) {
		if (data.profile?.role.name === 'STUDENT') return;
		modalStore.trigger({
			type: 'component',
			component: 'updateMasterCalendarModal',
			meta: {
				item: items.find((item) => item.id === id),
				constants: data.constants,
				response: async (action: 'delete' | 'update') => {
					if (action === 'delete') {
						items = items.filter((item) => item.id !== id);
						modalStore.close();
						toastStore.trigger({
							message: 'Calendar item deleted successfully!',
							background: 'bg-accTeal',
							classes: 'text-white/90 font-medium'
						});
						return;
					}

					toastStore.trigger({
						message: 'Calendar item updated successfully!',
						background: 'bg-accTeal',
						classes: 'text-white/90 font-medium'
					});

					let res = await fetch('/api/master_calendar?id=' + id);
					let resp = await res.json();
					let newItem = resp.masterCalendarItems;

					items = items.map((item) => (item.id === newItem.id ? newItem : item));
				}
			}
		});
	}

	function resetFilters() {
		todayFilter = false;
		weekFilter = false;
		filter = 'all';
		month = 'currentMonth';
		complete = 'pending';
		searchQuery = '';
		fromDate = '';
		toDate = '';
		filteredItems = items;
		currentSortField = 'dateDue';
		currentSortOrder = 'asc';
		sort();
	}

	let tableHeaders = [
		{ sortable: false, title: '', field: 'status' },
		{ sortable: true, title: 'Due', field: 'dateDue' },
		{ sortable: true, title: 'Type', field: 'type' },
		{ sortable: true, title: 'Title', field: 'title' },
		{ sortable: true, title: 'Who', field: 'who' },
		{ sortable: false, title: 'Notes & Comments', field: 'comments' }
	];

	function sort() {
		filteredItems = items.sort((a, b) => {
			const getField = (obj: typeof a, field: HeaderTypes) => {
				const fieldsMap = {
					status: '',
					dateDue: obj.dueDate.toISOString(),
					type: obj.type.name,
					title: obj.title,
					who: obj.primaryOwner.first_name + ' ' + obj.primaryOwner.last_name,
					comments: ''
				};
				return fieldsMap[field] || obj.dueDate.toISOString();
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
	<title>OFA • Master Calendar</title>
</svelte:head>

<section in:fly={{ y: -10, duration: 200 }}>
	<PageWrapper>
		<svelte:fragment slot="title">
			<h1 class="text-2xl text-usfGreen font-semibold">{filter === 'my' ? 'My' : ''} Master Calendar {filter === 'my' ? 'Tasks' : ''}</h1>
		</svelte:fragment>
		<svelte:fragment slot="title-right">
			<Search bind:value={searchQuery} />
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<div
				class="flex justify-center items-center bg-accSlate w-10 h-10 rounded-full cursor-pointer"
				on:click={() => {
					openModal(masterCalendarModal);
				}}
			>
				<i class="fa-solid fa-plus fa-lg text-white/90" />
			</div>
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<div
				class="flex justify-center items-center bg-accSlate w-10 h-10 rounded-full cursor-pointer"
				on:click={() => {
					keyBar = !keyBar;
				}}
			>
				<i class="text-white/90 fa-solid {keyBar ? 'fa-xmark fa-lg' : 'fa-key'}" />
			</div>
		</svelte:fragment>
		<svelte:fragment slot="filters">
			<button
				class="bg-accSlate text-white/90 font-medium rounded-md px-4 py-2"
				on:click={() => {
					todayFilter = true;
					filteredItems = items;
				}}
			>
				Today
			</button>
			<button
				class="bg-accSlate text-white/90 font-medium rounded-md px-4 py-2"
				on:click={() => {
					weekFilter = true;
					filteredItems = items;
				}}
			>
				This Week
			</button>
			<RadioGroup background="bg-transparent" active="bg-accSlate text-white/90" class="mt-0" rounded="rounded-md">
				<RadioItem bind:group={month} name="visitorType" value="previousMonth">{moment().subtract(1, 'M').format('MMMM')}</RadioItem>
				<RadioItem bind:group={month} name="visitorType" value="currentMonth">{moment().format('MMMM')}</RadioItem>
				<RadioItem bind:group={month} name="visitorType" value="nextMonth">{moment().add(1, 'M').format('MMMM')}</RadioItem>
			</RadioGroup>
			<div class="flex gap-2">
				<h1 class="bg-accSlate/80 text-white/90 font-medium rounded-md px-4 py-2">From</h1>
				<input type="date" class="input rounded-md" name="from" id="" bind:value={fromDate} />
				<h1 class="bg-accSlate/80 text-white/90 font-medium rounded-md px-4 py-2">To</h1>
				<input type="date" class="input rounded-md" name="to" id="" min={fromDate} bind:value={toDate} />
			</div>
			<RadioGroup background="bg-transparent" active="bg-accSlate text-white/90" class="mt-0" rounded="rounded-md">
				<RadioItem bind:group={complete} name="complete" value="pending">Pending</RadioItem>
				<!-- <RadioItem bind:group={complete} name="complete" value="overdue">Overdue</RadioItem> -->
				<RadioItem bind:group={complete} name="complete" value="completed">Completed</RadioItem>
			</RadioGroup>
			<RadioGroup background="bg-transparent" active="bg-accSlate text-white/90" class="mt-0" rounded="rounded-md">
				<RadioItem bind:group={filter} name="visitorType" value="all">All Tasks</RadioItem>
				<RadioItem bind:group={filter} name="visitorType" value="my">My Tasks</RadioItem>
				{#if data.profile?.team.map((team) => team.name).includes('Management')}
					<RadioItem bind:group={filter} name="visitorType" value="report">Direct Report</RadioItem>
				{/if}
			</RadioGroup>
			<button class="bg-accSlate/80 text-white/90 font-medium rounded-md px-4 py-2" on:click={resetFilters}> Reset Filters </button>
		</svelte:fragment>
		<!-- <svelte:fragment slot="activeFilters">
			{#each activeFilters as aFilter}
				<span class="chip bg-accSlate text-white/90">{aFilter}</span>
			{/each}
		</svelte:fragment> -->
		<svelte:fragment slot="content">
			<div class="grid {gridCols} auto-rows-min gap-x-4 gap-y-0" style="align-items: flex-start;">
				<section>
					<TableWrapper arrLength={filteredItems.length} bind:paginationSettings>
						<svelte:fragment slot="header">
							<thead class="bg-accSlate">
								<tr class="bg-accSlate text-white/90">
									{#each tableHeaders as header}
										<HeaderSort sortable={header.sortable} title={header.title} field={header.field} bind:currentSortField bind:currentSortOrder on:sort={sort} />
									{/each}
								</tr>
							</thead>
						</svelte:fragment>
						<svelte:fragment slot="body">
							<tbody>
								{#each paginatedSource as item}
									<tr on:click={() => updateCalendarItem(item.id)} class="cursor-pointer">
										<td class="flex items-center gap-3">
											{#if moment(item.dueDate).isBefore(moment(), 'day') && item.completionDate === null && item.type.type !== 'ANN'}
												<Popup>
													<svelte:fragment slot="content">
														<div class="bg-red-600 rounded-full h-5 w-5 [&>*]:pointer-events-none cursor-pointer" />
													</svelte:fragment>
													<svelte:fragment slot="popup">
														<p class="text-white/80 font-semibold">Overdue - {moment(item.dueDate, 'YYYYMMDD').fromNow()}</p>
													</svelte:fragment>
												</Popup>
											{/if}
										</td>
										<td><pre>{getDateLocal(item.dueDate.toISOString(), 'YYYY-MM-DD')}</pre></td>
										<td>
											<Popup placement="top">
												<svelte:fragment slot="content">
													<p class="font-semibold">{item.type.type}</p>
												</svelte:fragment>
												<svelte:fragment slot="popup">
													<p class="text-white/80 font-semibold">{item.type.name}</p>
												</svelte:fragment>
											</Popup>
										</td>
										<td>{item.title}</td>
										<td>
											<Popup placement="top">
												<svelte:fragment slot="content">
													<pre><p class="font-semibold">{item.primaryOwner.first_name} {item.primaryOwner.last_name}</p></pre>
												</svelte:fragment>
												<svelte:fragment slot="popup">
													<p class="text-white/80 font-semibold">Secondary Owners</p>
													{#if item.secondaryOwners.length > 0}
														{#each item.secondaryOwners as user}
															<p class="text-white/80 font-medium">• {user.first_name + ' ' + user.last_name}</p>
														{/each}
													{:else}
														<p class="text-white/80 font-medium">• None</p>
													{/if}
												</svelte:fragment>
											</Popup>
										</td>
										<td>
											{#if item.comments[0]}
												<Popup placement="top" width="w-[300px]">
													<svelte:fragment slot="content">
														<p class="text-sm">
															{item.comments[0].content.slice(0, 50)}
															{#if item.comments[0].content.length > 50}
																...<span class="font-medium">hover or click to read more</span>
															{/if}
														</p>
													</svelte:fragment>
													<svelte:fragment slot="popup">
														<p class="text-white/80 font-bold">{item.comments[0].user}</p>
														<p class="text-white/80">{getDateLocal(item.comments[0].createdAt.toISOString(), 'LLL')}</p>
														<hr class="border-dotted my-2" />
														<pre class="whitespace-pre-wrap text-white/90">{@html item.comments[0].content}</pre>
													</svelte:fragment>
												</Popup>
											{/if}
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
							<div
								class="grid grid-cols-[auto_auto_1.5fr] gap-x-2 hover:bg-accSlate/70 cursor-pointer"
								on:click={() => {
									typeFilterString = masterCalendarType.type;
									typeFilter = true;
								}}
							>
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
