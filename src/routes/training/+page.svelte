<script lang="ts">
	import { getToastStore, type ModalSettings, getModalStore, type PaginationSettings, TabGroup, Tab } from '@skeletonlabs/skeleton';
	import { PageWrapper, Search, TableWrapper, HeaderSort } from '$lib/components';
	import { pageOptions } from '$lib/stores/filters.js';
	import { getDateLocal } from '$lib/helpers.js';
	import { fly } from 'svelte/transition';
	export let form;
	export let data;

	enum Training {
		Schedule = 0,
		Library = 1
	}

	let trainingModal: ModalSettings = {
		type: 'component',
		component: 'trainingModal',
		meta: { constants: data.constants }
	};

	let libraryModal: ModalSettings = {
		type: 'component',
		component: 'libraryModal',
		meta: { constants: data.constants }
	};

	type HeaderTypes = 'date' | 'title' | 'trainers' | 'lastUpdated';
	let currentSortField: HeaderTypes = 'date';
	let currentSortOrder: 'asc' | 'dsc' = 'asc';

	let modalStore = getModalStore();
	let toastStore = getToastStore();
	let trainings = data.trainings;
	let filterTrainings = data.trainings;
	let libraryTrainings = data.library;
	let filteredLibrary = data.library;
	let tabSet: number = 0;
	let searchQuery = '';

	if (form) {
		toastStore.trigger({
			message: String(form?.message),
			background: form?.success ? 'bg-accTeal' : 'bg-[#930000]',
			classes: 'text-white/90 font-medium'
		});
	}

	$: {
		filterTrainings = trainings.filter((training) => {
			let trainers = training.trainers
				.map((t) => {
					return t.first_name + ' ' + t.last_name;
				})
				.join(' ');
			if (training.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) || trainers.toLowerCase().includes(searchQuery.toLowerCase().trim())) {
				return training;
			}
		});

		filteredLibrary = libraryTrainings.filter((training) => {
			if (training.name.toLowerCase().includes(searchQuery.toLowerCase().trim())) {
				return training;
			}
		});

		updatePageSettings(filterTrainings);
	}

	let paginationSettings = {
		page: 0,
		limit: 10,
		size: filterTrainings.length,
		amounts: pageOptions
	} satisfies PaginationSettings;

	$: paginatedSource = filterTrainings.slice(paginationSettings.page * paginationSettings.limit, paginationSettings.page * paginationSettings.limit + paginationSettings.limit);

	function updatePageSettings(filteredArr: any[]) {
		paginationSettings.size = filteredArr.length;
		paginationSettings.page = 0;
	}

	function openModal(modal: ModalSettings) {
		modalStore.trigger(modal);
	}

	function updateLibrary(idx: number) {
		modalStore.trigger({
			type: 'component',
			component: 'updateLibraryModal',
			meta: { library: filteredLibrary[idx], constants: data.constants }
		});
	}

	function updateTrainingSchedule(id: string) {
		if (data.user.role !== 'ADMIN') return;
		modalStore.trigger({
			type: 'component',
			component: 'updateTrainingModal',
			meta: { training: trainings.find((training) => training.id === id), constants: data.constants }
		});
	}

	function openTraining(title: string, src: string) {
		modalStore.trigger({
			type: 'component',
			component: 'embedModal',
			meta: { src, title }
		});
	}

	function resetFilters() {
		searchQuery = '';
		currentSortField = 'date';
		currentSortOrder = 'asc';
		sort();
	}

	let tableHeaders = [
		{ sortable: true, title: 'Date', field: 'date' },
		{ sortable: true, title: 'Title', field: 'title' },
		{ sortable: false, title: 'Trainers', field: 'trainers' },
		{ sortable: true, title: 'Last Updated', field: 'lastUpdated' }
	];

	function sort() {
		filterTrainings = trainings.sort((a, b) => {
			const getField = (obj: typeof a, field: HeaderTypes) => {
				const fieldsMap = {
					date: obj.date.toISOString(),
					title: obj.name,
					trainers: '',
					lastUpdated: obj.updatedAt.toISOString()
				};
				return fieldsMap[field] || obj.date.toISOString();
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
	<title>OFA • Trainings</title>
</svelte:head>

<section in:fly={{ y: -10, duration: 200 }}>
	<PageWrapper>
		<svelte:fragment slot="title">
			<h1 class="text-2xl text-usfGreen font-semibold">Training Schedule & Library</h1>
		</svelte:fragment>
		<svelte:fragment slot="title-right">
			<Search bind:value={searchQuery} />
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			{#if data.profile?.role.name === 'ADMIN'}
				<div
					class="flex justify-center items-center bg-accSlate w-10 h-10 rounded-full cursor-pointer"
					on:click={() => {
						openModal(tabSet === Training.Schedule ? trainingModal : libraryModal);
					}}
				>
					<i class="fa-solid fa-plus fa-lg text-white/90" />
				</div>
			{/if}
		</svelte:fragment>
		<svelte:fragment slot="filters">
			<button class="bg-accSlate/80 text-white/90 font-medium rounded-md px-4 py-2" on:click={resetFilters}> Reset Filters </button>
		</svelte:fragment>
		<svelte:fragment slot="content">
			<TabGroup>
				<Tab bind:group={tabSet} name="all" value={0}>Schedule</Tab>
				<Tab bind:group={tabSet} name="current" value={1}>Library</Tab>
				<svelte:fragment slot="panel">
					{#if tabSet === Training.Schedule}
						<TableWrapper arrLength={filterTrainings.length} bind:paginationSettings>
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
									{#each paginatedSource as training}
										<tr on:click={() => updateTrainingSchedule(training.id)} class="cursor-pointer">
											<td>{training.weekday + ', ' + getDateLocal(training.date.toISOString(), 'MMMM Do')}</td>
											<td>{training.name}</td>
											<td
												>{@html training.trainers
													.map((t) => {
														return t.first_name + ' ' + t.last_name;
													})
													.join('<br>')}</td
											>
											<td>{getDateLocal(training.updatedAt.toISOString(), 'MMMM Do, h:mmA')}</td>
										</tr>
									{/each}
								</tbody>
							</svelte:fragment>
							<svelte:fragment slot="none">
								<p>There are no trainings that match your search.</p>
							</svelte:fragment>
						</TableWrapper>
					{:else if tabSet === Training.Library}
						{#if filteredLibrary.length > 0}
							<section class="grid grid-cols-3 gap-2">
								{#each filteredLibrary as training, i}
									<!-- svelte-ignore a11y-click-events-have-key-events -->
									<div class="block rounded relative p-4 border border-accSlate/20 shadow-lg group">
										<div class="mb-2">
											<h1 class="flex items-center font-medium">{training.name} ({getDateLocal(training.date.toISOString(), 'ddd')})</h1>
											<h1>{getDateLocal(training.date.toISOString(), 'MMMM Do, YYYY')}</h1>
										</div>
										<div class="flex flex-wrap gap-1">
											{#each training.trainers as trainer}
												<span class="badge bg-accSlate text-white/90 rounded-md">{trainer.first_name} {trainer.last_name}</span>
											{/each}
										</div>
										<div class="flex justify-center items-center absolute opacity-0 group-hover:opacity-100 duration-200 bg-white/80 top-0 right-0 left-0 bottom-0 rounded-lg h-full">
											<div class="flex items-center gap-2">
												{#if data.user.role === 'ADMIN'}
													<i class="fa-solid fa-pen-to-square fa-lg duration-200 hover:text-blue-600 cursor-pointer" on:click={() => updateLibrary(i)} />
												{/if}
												<i class="fa-solid fa-play fa-lg duration-200 hover:text-green-700 cursor-pointer" on:click={() => openTraining(training.name, training.url)} />
											</div>
										</div>
									</div>
								{/each}
							</section>
						{:else}
							<p>No trainings match this search.</p>
						{/if}
					{/if}
				</svelte:fragment>
			</TabGroup>
		</svelte:fragment>
	</PageWrapper>
</section>

<style>
	tr:nth-last-child(1) {
		border: none;
	}

	tbody tr:nth-child(n):hover {
		background-color: rgba(167, 167, 167, 0.298);
	}
</style>
