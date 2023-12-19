<script lang="ts">
	import { Search, TableWrapper, PageWrapper, HeaderSort } from '$lib/components';
	import { getToastStore, Tab, TabGroup, getModalStore, type ModalSettings, type PaginationSettings, RadioGroup, RadioItem } from '@skeletonlabs/skeleton';
	import { getDateLocal, getLetterURL } from '$lib/helpers.js';
	import { fly } from 'svelte/transition';
	import { page } from '$app/stores';
	import moment from 'moment';
	export let form;
	export let data;

	enum LetterTypes {
		All = 0,
		Email = 1,
		Paper = 2,
		Roremal = 3,
		Old = 4
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

	type HeaderTypes = 'letterCode' | 'letterType' | 'letterGroup' | 'owner' | 'lastUpdated';
	let currentSortField: HeaderTypes = 'letterCode';
	let currentSortOrder: 'asc' | 'dsc' = 'asc';

	let filter = $page.url.searchParams.get('filter') === null ? 'all' : $page.url.searchParams.get('filter');
	let update = 'all';
	let letters = data.letters;
	let filteredLetters = data.letters;
	let tabSet: number = 0;
	let searchQuery = $page.url.searchParams.get('search') === null ? '' : String($page.url.searchParams.get('search'));

	$: {
		filteredLetters = letters.filter((letter) => {
			let owner = letter.owner.first_name + ' ' + letter.owner.last_name;
			let letterType = '';
			if (tabSet === LetterTypes.All) {
				letterType = 'All';
			} else if (tabSet === LetterTypes.Email) {
				letterType = 'Email Letters';
			} else if (tabSet === LetterTypes.Paper) {
				letterType = 'Paper Letters';
			} else if (tabSet === LetterTypes.Roremal) {
				letterType = 'ROREMAL';
			} else if (tabSet === LetterTypes.Old) {
				letterType = 'Old Letters';
			}
			if (
				letter.letterCode.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
				letter.letterType.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
				letter.letterGroup?.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
				owner.toLowerCase().includes(searchQuery.toLowerCase().trim())
			) {
				if (filter === 'my' && letter.owner.netid !== data.profile?.netid) return false;
				if (update === 'out_of_date' && moment(letter.updatedAt).isAfter(moment().subtract(1, 'year'))) return false;
				if (letterType === 'All' && letter.letterType.name !== 'Old Letters') {
					return letter;
				}
				if (letter.letterType.name === letterType) {
					return letter;
				}
			}
		});
		updatePageSettings(filteredLetters);
	}

	let paginationSettings = {
		page: 0,
		limit: 10,
		size: filteredLetters.length,
		amounts: [5, 10, 15]
	} satisfies PaginationSettings;

	$: paginatedSource = filteredLetters.slice(paginationSettings.page * paginationSettings.limit, paginationSettings.page * paginationSettings.limit + paginationSettings.limit);

	function updatePageSettings(filteredArr: any[]) {
		paginationSettings.size = filteredArr.length;
		paginationSettings.page = 0;
	}

	const letterModal: ModalSettings = {
		type: 'component',
		component: 'letterModal',
		meta: { constants: data.constants }
	};

	function openModal(modal: ModalSettings) {
		modalStore.trigger(modal);
	}

	function updateLetter(id: string) {
		if (data.profile?.role.name !== 'ADMIN') {
			let letter = letters.find((letter) => letter.id === id);
			window.open(getLetterURL(letter), '_newtab');
			return;
		}

		modalStore.trigger({
			type: 'component',
			component: 'updateLetterModal',
			meta: { letter: letters.find((letter) => letter.id === id), constants: data.constants }
		});
	}

	function resetFilters() {
		filter = 'all';
		update = 'all';
		searchQuery = '';
		currentSortField = 'letterCode';
		currentSortOrder = 'asc';
		sort();
	}

	let tableHeaders = [
		{ sortable: true, title: 'Letter Code', field: 'letterCode' },
		{ sortable: true, title: 'Letter Type', field: 'letterType' },
		{ sortable: true, title: 'Letter Group', field: 'letterGroup' },
		{ sortable: true, title: 'Owner', field: 'owner' },
		{ sortable: true, title: 'Last Updated', field: 'lastUpdated' }
	];

	function sort() {
		filteredLetters = letters.sort((a, b) => {
			const getField = (obj: typeof a, field: HeaderTypes) => {
				const fieldsMap = {
					letterCode: obj.letterCode.name,
					letterType: obj.letterType.name,
					letterGroup: obj.letterGroup?.name,
					owner: obj.owner.first_name + ' ' + obj.owner.last_name,
					lastUpdated: obj.updatedAt.toISOString()
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
	<title>OFA • Letters</title>
</svelte:head>

<section in:fly={{ y: -10, duration: 200 }}>
	<PageWrapper>
		<svelte:fragment slot="title">
			<h1 class="text-2xl text-usfGreen font-semibold">{filter === 'my' ? 'My' : ''} Letters</h1>
		</svelte:fragment>
		<svelte:fragment slot="title-right">
			<Search bind:value={searchQuery} />
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			{#if data.profile?.role.name === 'ADMIN'}
				<div
					class="flex justify-center items-center bg-accSlate w-10 h-10 rounded-full cursor-pointer"
					on:click={() => {
						openModal(letterModal);
					}}
				>
					<i class="fa-solid fa-plus fa-lg text-white/90" />
				</div>
			{/if}
		</svelte:fragment>
		<svelte:fragment slot="filters">
			<RadioGroup background="bg-transparent" active="bg-accSlate text-white/90" class="mt-0" rounded="rounded-md">
				<RadioItem bind:group={filter} name="visitorType" value="all">All</RadioItem>
				<RadioItem bind:group={filter} name="visitorType" value="my">My Letters</RadioItem>
			</RadioGroup>
			<RadioGroup background="bg-transparent" active="bg-accSlate text-white/90" class="mt-0" rounded="rounded-md">
				<RadioItem bind:group={update} name="visitorType" value="all">All</RadioItem>
				<RadioItem bind:group={update} name="visitorType" value="out_of_date">Out of Date</RadioItem>
			</RadioGroup>
			<button class="bg-accSlate/80 text-white/90 font-medium rounded-md px-4 py-2" on:click={resetFilters}> Reset Filters </button>
		</svelte:fragment>
		<svelte:fragment slot="content">
			<TabGroup>
				<Tab bind:group={tabSet} name="all" value={0}>All Current Letters ({letters.filter((letter) => letter.letterType.name !== 'Old Letters').length})</Tab>
				<Tab bind:group={tabSet} name="email" value={1}>Email Letters ({letters.filter((letter) => letter.letterType.name === 'Email Letters').length})</Tab>
				<Tab bind:group={tabSet} name="paper" value={2}>Paper Letters ({letters.filter((letter) => letter.letterType.name === 'Paper Letters').length})</Tab>
				<Tab bind:group={tabSet} name="roremal" value={3}>ROREMAL ({letters.filter((letter) => letter.letterType.name === 'ROREMAL').length})</Tab>
				<Tab bind:group={tabSet} name="old" value={4}>Old Letters ({letters.filter((letter) => letter.letterType.name === 'Old Letters').length})</Tab>
				<!-- Tab Panels --->
				<svelte:fragment slot="panel">
					<TableWrapper arrLength={filteredLetters.length} bind:paginationSettings>
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
								{#each paginatedSource as letter}
									<tr on:click={() => updateLetter(letter.id)} class="cursor-pointer">
										<td><pre>{letter.letterCode.name}</pre></td>
										<td><pre>{letter.letterType.name}</pre></td>
										<td><pre>{letter.letterGroup?.name ?? '-'}</pre></td>
										<td><pre>{letter.owner.first_name + ' ' + letter.owner.last_name}</pre></td>
										<td><pre>{getDateLocal(letter.updatedAt.toISOString(), 'YYYY-MM-DD')}</pre></td>
									</tr>
								{/each}
							</tbody>
						</svelte:fragment>
						<svelte:fragment slot="none">
							<p>There are no letters that match your search.</p>
						</svelte:fragment>
					</TableWrapper>
				</svelte:fragment>
			</TabGroup>
		</svelte:fragment>
	</PageWrapper>
</section>
