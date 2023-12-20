<script lang="ts">
	import { 
		getToastStore, type ModalSettings, getModalStore, type PaginationSettings, 
		TabGroup, Tab, RadioGroup, RadioItem
	} from '@skeletonlabs/skeleton';
	import { PageWrapper, Search, TableWrapper, HeaderSort } from '$lib/components';
	import { pageOptions } from '$lib/stores/filters.js';
	import { fly } from 'svelte/transition';
	export let form;
	export let data;

	enum Track {
		Sheet = 0,
		Code = 1
	}

	let trackSheetModal: ModalSettings = {
		type: 'component',
		component: 'trackSheetModal',
		meta: { trackCodes: data.trackCodes, constants: data.constants }
	};

	let trackCodeModal: ModalSettings = {
		type: 'component',
		component: 'trackCodeModal',
		meta: { constants: data.constants }
	};

	type HeaderTypes = 'reqCode' | 'description' | 'formType' | 'uploadable' | 'requiresAppt';
	let currentSortField: HeaderTypes = 'reqCode';
	let currentSortOrder: 'asc' | 'dsc' = 'asc';

	let modalStore = getModalStore();
	let toastStore = getToastStore();
	let trackSheets = data.trackSheets;
	let trackCodes = data.trackCodes;
	let filteredTrackSheets = trackSheets;
	let filteredTrackCodes = data.trackCodes;
	let tabSet: number = 0;
	let searchQuery = '';
	let sheetFormType = 'all';

	if (form) {
		toastStore.trigger({
			message: String(form?.message),
			background: form?.success ? 'bg-accTeal' : 'bg-[#930000]',
			classes: 'text-white/90 font-medium'
		});
	}

	$: {
		filteredTrackSheets = trackSheets.filter((trackSheet) => {
			if (trackSheet.reqCode.toLowerCase().includes(searchQuery.toLowerCase().trim()) || trackSheet.description.toLowerCase().includes(searchQuery.toLowerCase().trim())) {
				if (sheetFormType === 'all') {
					return trackSheet;
				} else if (sheetFormType === 'none' && trackSheet.formType === 'None') {
					return trackSheet;
				} else if (sheetFormType === 'paper' && trackSheet.formType === 'Paper') {
					return trackSheet;
				} else if (sheetFormType === 'online' && trackSheet.formType === 'Online') {
					return trackSheet;
				}
			}
		});

		filteredTrackCodes = trackCodes.filter((trackCode) => {
			if (trackCode.description.toLowerCase().includes(searchQuery.toLowerCase().trim())) {
				return trackCode;
			}
		});

		if (tabSet === Track.Sheet) {
			updatePageSettings(filteredTrackSheets);
		} else if (tabSet === Track.Code) {
			updatePageSettings(filteredTrackCodes);
		}
	}

	let paginationSettings = {
		page: 0,
		limit: 10,
		size: tabSet === Track.Sheet ? filteredTrackSheets.length : filteredTrackCodes.length,
		amounts: pageOptions
	} satisfies PaginationSettings;

	$: trackSheetPaginatedSource = filteredTrackSheets.slice(paginationSettings.page * paginationSettings.limit, paginationSettings.page * paginationSettings.limit + paginationSettings.limit);

	$: trackCodePaginatedSource = filteredTrackCodes.slice(paginationSettings.page * paginationSettings.limit, paginationSettings.page * paginationSettings.limit + paginationSettings.limit);

	function updatePageSettings(filteredArr: any[]) {
		paginationSettings.size = filteredArr.length;
		paginationSettings.page = 0;
	}

	function openModal(modal: ModalSettings) {
		modalStore.trigger(modal);
	}

	function updateTrackSheet(id: string) {
		if (data.profile?.role.name === 'ADMIN' || data.profile?.team.map((team) => team.name).includes('Management')) {
			modalStore.trigger({
				type: 'component',
				component: 'updateTrackSheetModal',
				meta: { trackSheet: filteredTrackSheets.find((trackSheet) => trackSheet.id === id), trackCodes: data.trackCodes }
			});
		} else {
			modalStore.trigger({
				type: 'component',
				component: 'viewTrackSheetModal',
				meta: { trackSheet: filteredTrackSheets.find((trackSheet) => trackSheet.id === id) }
			});
		}
	}

	function updateTrackCode(id: string) {
		modalStore.trigger({
			type: 'component',
			component: 'updateTrackCodeModal',
			meta: { trackCode: filteredTrackCodes.find((trackCode) => trackCode.id === id) }
		});
	}

	function resetFilters() {
		sheetFormType = 'all';
		searchQuery = '';
		currentSortField = 'reqCode';
		currentSortOrder = 'asc';
		sort();
	}

	let tableHeaders = [
		{ sortable: true, title: 'Req Code', field: 'reqCode' },
		{ sortable: true, title: 'Description', field: 'description' },
		{ sortable: true, title: 'FormType', field: 'formType' },
		{ sortable: false, title: 'Uploadable', field: 'uploadable' },
		{ sortable: false, title: 'Requires Appt.', field: 'requiresAppt' }
	];

	function sort() {
		filteredTrackSheets = trackSheets.sort((a, b) => {
			const getField = (obj: typeof a, field: HeaderTypes) => {
				const fieldsMap = {
					reqCode: obj.reqCode,
					description: obj.description,
					formType: obj.formType,
					uploadable: '',
					requiresAppt: ''
				};
				return fieldsMap[field] || obj.reqCode;
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
	<title>OFA • Track Spreadsheet</title>
</svelte:head>

<section in:fly={{ y: -10, duration: 200 }}>
	<PageWrapper>
		<svelte:fragment slot="title">
			<h1 class="text-2xl text-usfGreen font-semibold">Track Spreadsheets</h1>
		</svelte:fragment>
		<svelte:fragment slot="title-right">
			<Search bind:value={searchQuery} />
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			{#if data.profile?.role.name === 'ADMIN' || data.profile?.team.map((team) => team.name).includes('Management')}
				<div
					class="flex justify-center items-center bg-accSlate w-10 h-10 rounded-full cursor-pointer"
					on:click={() => {
						openModal(tabSet === Track.Sheet ? trackSheetModal : trackCodeModal);
					}}
				>
					<i class="fa-solid fa-plus fa-lg text-white/90" />
				</div>
			{/if}
		</svelte:fragment>
		<svelte:fragment slot="filters">
			{#if tabSet === Track.Sheet}
				<RadioGroup background="bg-transparent" active="bg-accSlate text-white/90" class="mt-0" rounded="rounded-md">
					<RadioItem bind:group={sheetFormType} name="sheetFormType" value="all">All</RadioItem>
					<RadioItem bind:group={sheetFormType} name="sheetFormType" value="none">None</RadioItem>
					<RadioItem bind:group={sheetFormType} name="sheetFormType" value="paper">Paper</RadioItem>
					<RadioItem bind:group={sheetFormType} name="sheetFormType" value="online">Online</RadioItem>
				</RadioGroup>
			{/if}
			<button class="bg-accSlate/80 text-white/90 font-medium rounded-md px-4 py-2" on:click={resetFilters}> Reset Filters </button>
		</svelte:fragment>
		<svelte:fragment slot="content">
			<TabGroup>
				<Tab bind:group={tabSet} name="sheets" value={0}>Sheets</Tab>
				<Tab bind:group={tabSet} name="codes" value={1}>Codes</Tab>
				<svelte:fragment slot="panel">
					{#if tabSet === Track.Sheet}
						<TableWrapper arrLength={filteredTrackSheets.length} bind:paginationSettings>
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
									{#each trackSheetPaginatedSource as trackSheet}
										<tr on:click={() => updateTrackSheet(trackSheet.id)} class="cursor-pointer">
											<td class="font-semibold">{trackSheet.reqCode}</td>
											<td>{trackSheet.description}</td>
											<td>{trackSheet.formType === 'None' ? '-' : trackSheet.formType}</td>
											<td>
												{#if trackSheet.uploadable}
													<i class="fa-solid fa-check fa-lg text-usfGreen" />
												{:else}
													<i class="fa-solid fa-xmark fa-lg text-black/70" />
												{/if}
											</td>
											<td>
												{#if trackSheet.requiresAdvisor}
													<i class="fa-solid fa-check fa-lg text-usfGreen" />
												{:else}
													<i class="fa-solid fa-xmark fa-lg text-black/70" />
												{/if}
											</td>
										</tr>
									{/each}
								</tbody>
							</svelte:fragment>
							<svelte:fragment slot="none">
								<p>There are no sheets that match your search.</p>
							</svelte:fragment>
						</TableWrapper>
					{:else if tabSet === Track.Code}
						<TableWrapper arrLength={filteredTrackCodes.length} bind:paginationSettings>
							<svelte:fragment slot="header">
								<thead>
									<tr class="bg-accSlate text-white/90">
										<th>Indicator</th>
										<th>Description</th>
										<th>Satisfied</th>
									</tr>
								</thead>
							</svelte:fragment>
							<svelte:fragment slot="body">
								<tbody>
									{#each trackCodePaginatedSource as trackCode}
										<tr on:click={() => updateTrackCode(trackCode.id)} class="cursor-pointer">
											<td>
												<div class="bg-accSlate text-white/80 px-3 py-1 w-fit rounded-md font-medium">
													<p class="text-white/80 font-semibold">{trackCode.statusIndicator}</p>
												</div>
											</td>
											<td>{trackCode.description}</td>
											<td>
												<div class="{trackCode.satisfied ? 'bg-usfGreen' : 'bg-red-700'} text-white/80 px-3 py-1 w-fit rounded-md font-medium">
													<p class="text-white/80 font-semibold">{trackCode.satisfied ? 'Yes' : 'No'}</p>
												</div>
											</td>
										</tr>
									{/each}
								</tbody>
							</svelte:fragment>
							<svelte:fragment slot="none">
								<p>There are no codes that match your search.</p>
							</svelte:fragment>
						</TableWrapper>
					{/if}
				</svelte:fragment>
			</TabGroup>
		</svelte:fragment>
	</PageWrapper>
</section>

<style>
	th {
		border: none;
	}

	tr:nth-last-child(1) {
		border: none;
	}

	tbody tr:nth-child(n):hover {
		background-color: rgba(167, 167, 167, 0.298);
	}
</style>
