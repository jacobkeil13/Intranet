<script lang="ts">
	import { type PaginationSettings, getToastStore, getModalStore } from '@skeletonlabs/skeleton';
	import { PageWrapper, Search, TableWrapper, HeaderSort } from '$lib/components';
	import { pageOptions } from '$lib/stores/filters.js';
	import { getDateLocal } from '$lib/helpers.js';
	import { fly } from 'svelte/transition';
	export let form;
	export let data;

	let modalStore = getModalStore();
	let toastStore = getToastStore();
	if (form) {
		toastStore.trigger({
			message: String(form?.message),
			background: form?.success ? 'bg-accTeal' : 'bg-[#930000]',
			classes: 'text-white/90 font-medium'
		});
	}

	type HeaderTypes = 'letterCode' | 'selectionId' | 'letterCount' | 'requestedBy' | 'requestedDate';
	let currentSortField: HeaderTypes = 'letterCode';
	let currentSortOrder: 'asc' | 'dsc' = 'asc';

	let searchQuery = '';
	$: popsels = data.popsels;
	let filteredPopsels = data.popsels;

	$: {
		filteredPopsels = popsels.filter((popsel) => {
			let requestedBy = popsel.requestedBy.first_name + ' ' + popsel.requestedBy.last_name;
			if (
				popsel.letterCode.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
				popsel.selectionId.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
				popsel.letterCount.toString().toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
				requestedBy.toLowerCase().includes(searchQuery.toLowerCase().trim())
			) {
				return popsel;
			}
		});
		updatePageSettings(filteredPopsels);
	}

	let paginationSettings = {
		page: 0,
		limit: 10,
		size: filteredPopsels.length,
		amounts: pageOptions
	} satisfies PaginationSettings;

	$: paginatedSource = filteredPopsels.slice(paginationSettings.page * paginationSettings.limit, paginationSettings.page * paginationSettings.limit + paginationSettings.limit);

	function updatePageSettings(filteredArr: any[]) {
		paginationSettings.size = filteredArr.length;
		paginationSettings.page = 0;
	}

	function updatePopsel(id: string) {
		if (data.profile?.role.name === 'STUDENT') return;
		modalStore.trigger({
			type: 'component',
			component: 'updatePopselModal',
			meta: {
				popsel: popsels.find((popsel) => popsel.id === id),
				constants: data.constants,
				response: async (action: 'delete' | 'update') => {
					if (action === 'delete') {
						popsels = popsels.filter((popsel) => popsel.id !== id);
						modalStore.close();
						toastStore.trigger({
							message: String('Popsel deleted successfully!'),
							background: 'bg-accTeal',
							classes: 'text-white/90 font-medium'
						});
						return;
					}

					toastStore.trigger({
						message: 'Popsel updated successfully!',
						background: 'bg-accTeal',
						classes: 'text-white/90 font-medium'
					});

					let res = await fetch('/api/popsel?id=' + id);
					let resp = await res.json();
					let newPopsel = resp.popsels;

					popsels = popsels.map((popsel) => (popsel.id === newPopsel.id ? newPopsel : popsel));
				}
			}
		});
	}

	function openModal(modal: string, meta: object) {
		if (data.profile?.role.name === 'STUDENT') return;
		modalStore.trigger({
			type: 'component',
			component: modal,
			meta
		});
	}

	function resetFilters() {
		searchQuery = '';
		currentSortField = 'letterCode';
		currentSortOrder = 'asc';
		sort();
	}

	let tableHeaders = [
		{ sortable: true, title: 'Letter Code', field: 'letterCode' },
		{ sortable: true, title: 'Selection ID', field: 'selectionId' },
		{ sortable: false, title: 'Letter Count', field: 'letterCount' },
		{ sortable: true, title: 'Requested By', field: 'requestedBy' },
		{ sortable: true, title: 'Requested Date', field: 'requestedDate' }
	];

	function sort() {
		filteredPopsels = popsels.sort((a, b) => {
			const getField = (obj: typeof a, field: HeaderTypes) => {
				const fieldsMap = {
					letterCode: obj.letterCode.name,
					selectionId: obj.selectionId,
					letterCount: obj.letterCount.toString(),
					requestedBy: obj.requestedBy.first_name + ' ' + obj.requestedBy.last_name,
					requestedDate: obj.createdAt.toISOString()
				};
				return fieldsMap[field] || obj.letterCode.name;
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
	<title>OFA • Population Selections</title>
</svelte:head>

<section in:fly={{ y: -10, duration: 200 }}>
	<PageWrapper>
		<svelte:fragment slot="title">
			<h1 class="text-2xl text-usfGreen font-semibold">Population Selections</h1>
		</svelte:fragment>
		<svelte:fragment slot="title-right">
			<Search bind:value={searchQuery} />
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<div
				class="flex justify-center items-center bg-accSlate w-10 h-10 rounded-full cursor-pointer"
				on:click={() => {
					openModal('popselModal', { constants: data.constants, isTeam: data.isTeam });
				}}
			>
				<i class="fa-solid fa-plus fa-lg text-white/90" />
			</div>
		</svelte:fragment>
		<svelte:fragment slot="filters">
			<button class="bg-accSlate/80 text-white/90 font-medium rounded-md px-4 py-2" on:click={resetFilters}> Reset Filters </button>
		</svelte:fragment>
		<svelte:fragment slot="content">
			<TableWrapper arrLength={filteredPopsels.length} bind:paginationSettings>
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
						{#each paginatedSource as popsel}
							<tr on:click={() => updatePopsel(popsel.id)} class="cursor-pointer">
								<td>{popsel.letterCode.name}</td>
								<td>{popsel.selectionId}</td>
								<td>{popsel.letterCount}</td>
								<td>{popsel.requestedBy.first_name + ' ' + popsel.requestedBy.last_name}</td>
								<td>{getDateLocal(popsel.createdAt.toISOString(), 'LLL')}</td>
							</tr>
						{/each}
					</tbody>
				</svelte:fragment>
				<svelte:fragment slot="none">
					<p>There are no population selections that match this search.</p>
				</svelte:fragment>
			</TableWrapper>
		</svelte:fragment>
	</PageWrapper>
</section>
