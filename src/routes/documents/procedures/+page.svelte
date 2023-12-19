<script lang="ts">
	import { Search, TableWrapper, PageWrapper, HeaderSort, FileAttachment } from '$lib/components';
	import { getToastStore, Tab, TabGroup, getModalStore, type ModalSettings, type PaginationSettings, RadioGroup, RadioItem, Accordion, AccordionItem } from '@skeletonlabs/skeleton';
	import { api_key, getDateLocal, getProcedureURL } from '$lib/helpers.js';
	import { getProcedureArchives } from '$lib/stores/counter_duty.js';
	import { fly } from 'svelte/transition';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import moment from 'moment';
	export let form;
	export let data;

	enum AidYear {
		All = 0,
		Last = 1,
		Current = 2,
		Next = 3,
		NonYear = 4,
		Administrative = 5,
		Archive = 6
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

	type Archive = {
		[key: string]: string[];
	};
	type HeaderTypes = 'fileName' | 'aidYear' | 'owner' | 'lastUpdated' | 'extension';
	let currentSortField: HeaderTypes = 'fileName';
	let currentSortOrder: 'asc' | 'dsc' = 'asc';

	let filter = $page.url.searchParams.get('filter') === null ? 'all' : $page.url.searchParams.get('filter');
	let searchQuery = $page.url.searchParams.get('search') === null ? '' : String($page.url.searchParams.get('search'));
	let procedures = data.procedures;
	let filteredProcedures = data.procedures;
	let update = 'all';
	let tabSet: number = 0;
	let procedureArchives: Archive = {};
	let procedureArchivesNum: number = 0;

	onMount(() => {
		getProcedureArchives().then((res) => {
			console.log(res);
			procedureArchives = res;

			Object.keys(procedureArchives).forEach((key) => {
				procedureArchivesNum += procedureArchives[key].length;
			});
		});
	});

	$: {
		filteredProcedures = procedures.filter((procedure) => {
			let owner = procedure.owner.first_name + ' ' + procedure.owner.last_name;
			let aidYear = '';
			if (tabSet === AidYear.All) {
				aidYear = 'All';
			} else if (tabSet === AidYear.Last) {
				aidYear = moment().subtract(1, 'years').format('YY') + moment().format('YY');
			} else if (tabSet === AidYear.Current) {
				aidYear = moment().format('YY') + moment().add(1, 'years').format('YY');
			} else if (tabSet === AidYear.Next) {
				aidYear = moment().add(1, 'years').format('YY') + moment().add(2, 'years').format('YY');
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
		currentSortField = 'fileName';
		currentSortOrder = 'asc';
		sort();
	}

	let tableHeaders = [
		{ sortable: true, title: 'File Name', field: 'fileName' },
		{ sortable: true, title: 'Aid Year', field: 'aidYear' },
		{ sortable: true, title: 'Owner', field: 'owner' },
		{ sortable: true, title: 'Last Updated', field: 'lastUpdated' },
		{ sortable: false, title: 'Extension', field: 'extension' }
	];

	function sort() {
		filteredProcedures = procedures.sort((a, b) => {
			const getField = (obj: typeof a, field: HeaderTypes) => {
				const fieldsMap = {
					fileName: obj.fileName,
					aidYear: obj.aidYear.name,
					owner: obj.owner.first_name,
					lastUpdated: obj.updatedAt.toISOString(),
					extension: obj.extension
				};
				return fieldsMap[field] || obj.fileName;
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
				<Tab bind:group={tabSet} name="last" value={1}>
					{moment().subtract(1, 'years').format('YYYY')}-{moment().format('YYYY')}
					({procedures.filter((procedure) => procedure.aidYear.name === moment().subtract(1, 'years').format('YY') + moment().format('YY')).length})
				</Tab>
				<Tab bind:group={tabSet} name="current" value={2}>
					{moment().format('YYYY')}-{moment().add(1, 'years').format('YYYY')}
					({procedures.filter((procedure) => procedure.aidYear.name === moment().format('YY') + moment().add(1, 'years').format('YY')).length})</Tab
				>
				<Tab bind:group={tabSet} name="next" value={3}>
					{moment().add(1, 'years').format('YYYY')}-{moment().add(2, 'years').format('YYYY')}
					({procedures.filter((procedure) => procedure.aidYear.name === moment().add(1, 'years').format('YY') + moment().add(2, 'years').format('YY')).length})
				</Tab>
				<Tab bind:group={tabSet} name="nonyear" value={4}>Non-Year ({procedures.filter((procedure) => procedure.aidYear.name === 'Non-Year').length})</Tab>
				<Tab bind:group={tabSet} name="administrative" value={5}>Administrative ({procedures.filter((procedure) => procedure.aidYear.name === 'Administrative').length})</Tab>
				<Tab bind:group={tabSet} name="archive" value={6}>Archive ({procedureArchivesNum})</Tab>
				<!-- Tab Panels --->
				<svelte:fragment slot="panel">
					<TableWrapper arrLength={filteredProcedures.length} bind:paginationSettings>
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
								{#each paginatedSource as procedure}
									<tr on:click={() => updateProcedure(procedure.id)} class="cursor-pointer">
										<td><pre>{procedure.fileName}</pre></td>
										<td><pre>{procedure.aidYear.name}</pre></td>
										<td><pre>{procedure.owner.first_name + ' ' + procedure.owner.last_name}</pre></td>
										<td><pre>{getDateLocal(procedure.updatedAt.toISOString(), 'YYYY-MM-DD')}</pre></td>
										<td><pre>{procedure.extension}</pre></td>
									</tr>
								{/each}
							</tbody>
						</svelte:fragment>
						<svelte:fragment slot="none">
							{#if tabSet === AidYear.Archive}
								<Accordion regionControl="font-semibold" class="bg-transparent">
									{#each Object.keys(procedureArchives).sort() as year}
										<AccordionItem>
											<svelte:fragment slot="summary">{`20${year.slice(0, 2)} - 20${year.slice(-2)}`}</svelte:fragment>
											<svelte:fragment slot="content">
												<div class="pl-2 grid grid-cols-[100px_auto] bg-transparent">
													{#each procedureArchives[year] as file}
														{#if file.includes('.')}
															<span class="w-fit"><FileAttachment {file} small /></span>
															<a
																href={`https://tup-ofa.forest.usf.edu/files/procedures/${year}/${file}?apiKey=${api_key}`}
																target={file.split('.')[1] === 'pdf' ? '_blank' : '_self'}
																class="inline-flex gap-2 items-center"
															>
																<span class="hover:underline"
																	>{file
																		.split('.')
																		.slice(0, file.split('.').length - 1)
																		.join('')}</span
																>
															</a>
														{/if}
													{/each}
												</div>
											</svelte:fragment>
										</AccordionItem>
									{/each}
								</Accordion>
							{:else}
								<p>There are no procedures that match your search.</p>
							{/if}
						</svelte:fragment>
					</TableWrapper>
				</svelte:fragment>
			</TabGroup>
		</svelte:fragment>
	</PageWrapper>
</section>
