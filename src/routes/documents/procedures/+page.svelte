<script lang="ts">
	import Search from '$lib/components/Search.svelte';
	import { fly } from 'svelte/transition';
	import { getToastStore, Tab, TabGroup, getModalStore, type ModalSettings, type PaginationSettings, RadioGroup, RadioItem } from '@skeletonlabs/skeleton';
	import { getDateLocal, getProcedureURL } from '$lib/helpers.js';
	import { page } from '$app/stores';
	import TableWrapper from '$lib/components/TableWrapper.svelte';
	import PageWrapper from '$lib/components/PageWrapper.svelte';
	import moment from 'moment';
	export let form;
	export let data;

	enum AidYear {
		All = 0,
		Current = 1,
		Next = 2,
		NonYear = 3,
		Administrative = 4
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

	let tableFilter = {
		current: 'fileName',
		fileName: { filter: 'asc' },
		aidYear: { filter: 'asc' },
		owner: { filter: 'asc' },
		lastUpdated: { filter: 'asc' },
		extension: { filter: 'asc' }
	};

	let filter = $page.url.searchParams.get('filter') === null ? 'all' : $page.url.searchParams.get('filter');
	let update = 'all';
	let procedures = data.procedures;
	let filteredProcedures = data.procedures;
	let tabSet: number = 0;
	let searchQuery = $page.url.searchParams.get('search') === null ? '' : String($page.url.searchParams.get('search'));

	$: {
		filteredProcedures = procedures.filter((procedure) => {
			let owner = procedure.owner.first_name + ' ' + procedure.owner.last_name;
			let aidYear = '';
			if (tabSet === AidYear.All) {
				aidYear = 'All';
			} else if (tabSet === AidYear.Current) {
				aidYear = moment().subtract(1, 'years').format('YY') + moment().format('YY');
			} else if (tabSet === AidYear.Next) {
				aidYear = moment().format('YY') + moment().add(1, 'years').format('YY');
			} else if (tabSet === AidYear.NonYear) {
				aidYear = 'Non-Year';
			} else if (tabSet === AidYear.Administrative) {
				aidYear = 'Administrative';
			}
			if (
				procedure.fileName.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
				owner.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
				procedure.aidYear.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
			) {
				if (filter === 'my' && procedure.owner.netid !== data.profile?.netid) return false;
				// if (update === 'up_to_date' && moment(procedure.updatedAt).isBefore(moment().subtract(1, 'year'))) return false;
				if (update === 'out_of_date' && moment(procedure.updatedAt).isAfter(moment().subtract(1, 'year'))) return false;
				if (aidYear === 'All') {
					return procedure;
				}
				if (procedure.aidYear.name === aidYear) {
					return procedure;
				}
			}
		});
		updatePageSettings(filteredProcedures);
	}

	let paginationSettings = {
		page: 0,
		limit: 10,
		size: filteredProcedures.length,
		amounts: [5, 10, 15]
	} satisfies PaginationSettings;

	$: paginatedSource = filteredProcedures.slice(paginationSettings.page * paginationSettings.limit, paginationSettings.page * paginationSettings.limit + paginationSettings.limit);

	function updatePageSettings(filteredArr: any[]) {
		paginationSettings.size = filteredArr.length;
		paginationSettings.page = 0;
	}

	const procedureModal: ModalSettings = {
		type: 'component',
		component: 'standardProcedureModal',
		meta: { constants: data.constants }
	};

	function openModal(modal: ModalSettings) {
		modalStore.trigger(modal);
	}

	function updateProcedure(id: string) {
		if (data.profile?.role.name !== 'ADMIN') {
			let proc = procedures.find((procedure) => procedure.id === id);
			window.open(getProcedureURL(proc), '_newtab');
			return;
		}

		modalStore.trigger({
			type: 'component',
			component: 'updateStandardProcedureModal',
			meta: { procedure: procedures.find((procedure) => procedure.id === id), constants: data.constants }
		});
	}

	function resetFilters() {
		filter = 'all';
		update = 'all';
		searchQuery = '';
		sortBy('fileName', 'asc');
		tableFilter.fileName.filter = 'asc';
	}

	function sortBy(field: string, sort: string) {
		tableFilter.current = field;
		filteredProcedures = procedures.sort((a, b) => {
			let aSortBy = a.fileName;
			let bSortby = b.fileName;
			switch (field) {
				case 'fileName':
					aSortBy = a.fileName;
					bSortby = b.fileName;
					break;
				case 'aidYear':
					aSortBy = a.aidYear.name;
					bSortby = b.aidYear.name;
					break;
				case 'owner':
					aSortBy = a.owner.first_name;
					bSortby = b.owner.first_name;
					break;
				case 'lastUpdated':
					aSortBy = a.updatedAt.toISOString();
					bSortby = b.updatedAt.toISOString();
					break;
				case 'extension':
					aSortBy = a.extension;
					bSortby = b.extension;
					break;

				default:
					aSortBy = a.fileName;
					bSortby = b.fileName;
					break;
			}

			if (sort === 'asc') {
				if (field === 'lastUpdated') {
					if (new Date(aSortBy) < new Date(bSortby)) return -1;
					if (new Date(aSortBy) > new Date(bSortby)) return 1;
					return 0;
				} else {
					if (aSortBy < bSortby) return -1;
					if (aSortBy > bSortby) return 1;
					return 0;
				}
			} else if (sort === 'dsc') {
				if (field === 'lastUpdated') {
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
	<title>OFA • Procedures</title>
</svelte:head>

<section in:fly={{ y: -10, duration: 200 }}>
	<PageWrapper>
		<svelte:fragment slot="title">
			<h1 class="text-2xl text-usfGreen font-semibold">{filter === 'my' ? 'My' : ''} Standards & Procedures</h1>
		</svelte:fragment>
		<svelte:fragment slot="title-right">
			<Search bind:value={searchQuery} />
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			{#if data.profile?.role.name === 'ADMIN'}
				<div
					class="flex justify-center items-center bg-accSlate w-10 h-10 rounded-full cursor-pointer"
					on:click={() => {
						openModal(procedureModal);
					}}
				>
					<i class="fa-solid fa-plus fa-lg text-white/90" />
				</div>
			{/if}
		</svelte:fragment>
		<svelte:fragment slot="filters">
			<RadioGroup background="bg-transparent" active="bg-accSlate text-white/90" class="mt-0" rounded="rounded-md">
				<RadioItem bind:group={filter} name="visitorType" value="all">All</RadioItem>
				<RadioItem bind:group={filter} name="visitorType" value="my">My S&P's</RadioItem>
			</RadioGroup>
			<RadioGroup background="bg-transparent" active="bg-accSlate text-white/90" class="mt-0" rounded="rounded-md">
				<RadioItem bind:group={update} name="visitorType" value="all">All</RadioItem>
				<RadioItem bind:group={update} name="visitorType" value="out_of_date">Out of Date</RadioItem>
			</RadioGroup>
			<button class="bg-accSlate/80 text-white/90 font-medium rounded-md px-4 py-2" on:click={resetFilters}> Reset Filters </button>
		</svelte:fragment>
		<svelte:fragment slot="content">
			<TabGroup>
				<Tab bind:group={tabSet} name="all" value={0}>All ({procedures.length})</Tab>
				<Tab bind:group={tabSet} name="current" value={1}>
					{moment().subtract(1, 'years').format('YYYY')}-{moment().format('YYYY')}
					({procedures.filter((procedure) => procedure.aidYear.name === moment().subtract(1, 'years').format('YY') + moment().format('YY')).length})</Tab
				>
				<Tab bind:group={tabSet} name="next" value={2}>
					{moment().format('YYYY')}-{moment().add(1, 'years').format('YYYY')}
					({procedures.filter((procedure) => procedure.aidYear.name === moment().format('YY') + moment().add(1, 'years').format('YY')).length})
				</Tab>
				<Tab bind:group={tabSet} name="nonyear" value={3}>Non-Year ({procedures.filter((procedure) => procedure.aidYear.name === 'Non-Year').length})</Tab>
				<Tab bind:group={tabSet} name="administrative" value={4}>Administrative ({procedures.filter((procedure) => procedure.aidYear.name === 'Administrative').length})</Tab>
				<!-- Tab Panels --->
				<svelte:fragment slot="panel">
					<TableWrapper arrLength={filteredProcedures.length} bind:paginationSettings>
						<svelte:fragment slot="header">
							<thead>
								<tr class="bg-accSlate text-white/90">
									<th
										class="cursor-pointer select-none gap-2"
										on:click={() => {
											if (tableFilter.fileName.filter === 'asc') {
												tableFilter.fileName.filter = 'dsc';
											} else if (tableFilter.fileName.filter === 'dsc') {
												tableFilter.fileName.filter = 'asc';
											}
											sortBy('fileName', tableFilter.fileName.filter);
										}}
										>File Name
										<span>
											<i
												class="fa-solid fa-sm text-white/70
                        {tableFilter.current === 'fileName' ? 'inline-block' : 'hidden'} 
                        {tableFilter.fileName.filter === 'asc' ? 'fa-arrow-up-long' : 'fa-arrow-down-long'}"
											/>
										</span>
									</th>
									<th
										class="cursor-pointer select-none gap-2"
										on:click={() => {
											if (tableFilter.aidYear.filter === 'asc') {
												tableFilter.aidYear.filter = 'dsc';
											} else if (tableFilter.aidYear.filter === 'dsc') {
												tableFilter.aidYear.filter = 'asc';
											}
											sortBy('aidYear', tableFilter.aidYear.filter);
										}}
										>Aid Year
										<span>
											<i
												class="fa-solid fa-sm text-white/70
                        {tableFilter.current === 'aidYear' ? 'inline-block' : 'hidden'} 
                        {tableFilter.aidYear.filter === 'asc' ? 'fa-arrow-up-long' : 'fa-arrow-down-long'}"
											/>
										</span>
									</th>
									<th
										class="cursor-pointer select-none gap-2"
										on:click={() => {
											if (tableFilter.owner.filter === 'asc') {
												tableFilter.owner.filter = 'dsc';
											} else if (tableFilter.owner.filter === 'dsc') {
												tableFilter.owner.filter = 'asc';
											}
											sortBy('owner', tableFilter.owner.filter);
										}}
										>Owner
										<span>
											<i
												class="fa-solid fa-sm text-white/70
                        {tableFilter.current === 'owner' ? 'inline-block' : 'hidden'} 
                        {tableFilter.owner.filter === 'asc' ? 'fa-arrow-up-long' : 'fa-arrow-down-long'}"
											/>
										</span>
									</th>
									<th
										class="cursor-pointer select-none gap-2"
										on:click={() => {
											if (tableFilter.lastUpdated.filter === 'asc') {
												tableFilter.lastUpdated.filter = 'dsc';
											} else if (tableFilter.lastUpdated.filter === 'dsc') {
												tableFilter.lastUpdated.filter = 'asc';
											}
											sortBy('lastUpdated', tableFilter.lastUpdated.filter);
										}}
										>Last Updated
										<span>
											<i
												class="fa-solid fa-sm text-white/70
                        {tableFilter.current === 'lastUpdated' ? 'inline-block' : 'hidden'} 
                        {tableFilter.lastUpdated.filter === 'asc' ? 'fa-arrow-up-long' : 'fa-arrow-down-long'}"
											/>
										</span>
									</th>
									<th>Extension</th>
								</tr>
							</thead>
						</svelte:fragment>
						<svelte:fragment slot="body">
							<tbody>
								{#each paginatedSource as procedure}
									<tr on:click={() => updateProcedure(procedure.id)} class="cursor-pointer">
										<td>{procedure.fileName}</td>
										<td>{procedure.aidYear.name}</td>
										<td>{procedure.owner.first_name + ' ' + procedure.owner.last_name}</td>
										<td>{getDateLocal(procedure.updatedAt.toISOString(), 'MMMM Do, YYYY')}</td>
										<td>{procedure.extension}</td>
									</tr>
								{/each}
							</tbody>
						</svelte:fragment>
						<svelte:fragment slot="none">
							<p>There are no procedures that match your search.</p>
						</svelte:fragment>
					</TableWrapper>
				</svelte:fragment>
			</TabGroup>
		</svelte:fragment>
	</PageWrapper>
</section>
