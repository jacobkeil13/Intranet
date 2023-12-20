<script lang="ts">
	import { Search, TableWrapper, PageWrapper, HeaderSort, FileAttachment } from '$lib/components';
	import { getToastStore, Tab, TabGroup, getModalStore, type ModalSettings, type PaginationSettings, RadioGroup, RadioItem, Accordion, AccordionItem } from '@skeletonlabs/skeleton';
	import { api_key, getDateLocal, getFormURL } from '$lib/helpers.js';
	import { pageOptions } from '$lib/stores/filters.js';
	import { getFormArchives } from '$lib/helpers';
	import { fly } from 'svelte/transition';
	import { goto } from '$app/navigation';
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
		Archive = 5
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
		[key: string]: {
			[key: string]: string[];
		};
	};
	type HeaderTypes = 'rraareqCode' | 'aidYear' | 'lastUpdated' | 'owner' | 'lastUpdated';
	let currentSortField: HeaderTypes = 'rraareqCode';
	let currentSortOrder: 'asc' | 'dsc' = 'asc';

	let filter = $page.url.searchParams.get('filter') === null ? 'all' : $page.url.searchParams.get('filter');
	let searchQuery = $page.url.searchParams.get('search') === null ? '' : String($page.url.searchParams.get('search'));
	let forms = data.forms;
	let filteredForms = data.forms;
	let update = 'all';
	let tabSet: number = 0;
	let formsArchive: Archive = {};
	let formsArchiveNum: number = 0;

	onMount(() => {
		getFormArchives().then((res) => {
			console.log(res);
			formsArchive = res;

			Object.keys(formsArchive['intranet']).forEach((key) => {
				formsArchiveNum += formsArchive['intranet'][key].length;
			});

			Object.keys(formsArchive['internet']).forEach((key) => {
				formsArchiveNum += formsArchive['internet'][key].length;
			});
		});
	});

	$: {
		filteredForms = forms.filter((form) => {
			let owner = form.owner.first_name + ' ' + form.owner.last_name;
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
			}
			if (
				form.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
				owner.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
				form.rraareqCode.toLowerCase().includes(searchQuery.toLowerCase().trim())
			) {
				if (filter === 'my' && form.owner.netid !== data.profile?.netid) return false;
				if (update === 'out_of_date' && moment(form.updatedAt).isAfter(moment().subtract(1, 'year'))) return false;
				if (aidYear === 'All') {
					return form;
				}
				if (form.aidYear.name === aidYear) {
					return form;
				}
			}
		});
		updatePageSettings(filteredForms);
	}

	let paginationSettings = {
		page: 0,
		limit: 10,
		size: filteredForms.length,
		amounts: pageOptions
	} satisfies PaginationSettings;

	$: paginatedSource = filteredForms.slice(paginationSettings.page * paginationSettings.limit, paginationSettings.page * paginationSettings.limit + paginationSettings.limit);

	function updatePageSettings(filteredArr: any[]) {
		paginationSettings.size = filteredArr.length;
		paginationSettings.page = 0;
	}

	const formModal: ModalSettings = {
		type: 'component',
		component: 'formModal',
		meta: { constants: data.constants }
	};

	function openModal(modal: ModalSettings) {
		modalStore.trigger(modal);
	}

	function updateForm(id: string) {
		if (data.profile?.role.name !== 'ADMIN') {
			let form = forms.find((form) => form.id === id);
			if (form?.rraareqCode === 'BUDADJ') {
				goto('/documents/forms/budadj/' + form.aidYear.name);
				return;
			}
			if (form?.rraareqCode === 'Alternative Work Schedule Request') {
				goto('/documents/forms/alt_wrk_req');
				return;
			}
			if (form?.rraareqCode === 'Student Employee Evaluation') {
				goto('/documents/forms/student_eval');
				return;
			}
			window.open(getFormURL(form), '_newtab');
			return;
		}

		modalStore.trigger({
			type: 'component',
			component: 'updateFormModal',
			meta: { form: forms.find((form) => form.id === id), constants: data.constants }
		});
	}

	function resetFilters() {
		filter = 'all';
		update = 'all';
		searchQuery = '';
		currentSortField = 'rraareqCode';
		currentSortOrder = 'asc';
		sort();
	}

	let tableHeaders = [
		{ sortable: true, title: 'RRAAREQ Code', field: 'rraareqCode' },
		{ sortable: true, title: 'Aid Year', field: 'aidYear' },
		{ sortable: true, title: 'File Name', field: 'fileName' },
		{ sortable: true, title: 'Owner', field: 'owner' },
		{ sortable: true, title: 'Last Updated', field: 'lastUpdated' }
	];

	function sort() {
		filteredForms = forms.sort((a, b) => {
			const getField = (obj: typeof a, field: HeaderTypes) => {
				const fieldsMap = {
					rraareqCode: obj.rraareqCode.includes(' ') ? '-' : obj.rraareqCode,
					aidYear: obj.aidYear.name,
					fileName: obj.name,
					owner: obj.owner.first_name + ' ' + obj.owner.last_name,
					lastUpdated: obj.updatedAt.toISOString()
				};
				return fieldsMap[field] || obj.rraareqCode;
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
	<title>OFA • Forms</title>
</svelte:head>

<section in:fly={{ y: -10, duration: 200 }}>
	<PageWrapper>
		<svelte:fragment slot="title">
			<h1 class="text-2xl text-usfGreen font-semibold">{filter === 'my' ? 'My' : ''} Forms</h1>
		</svelte:fragment>
		<svelte:fragment slot="title-right">
			<Search bind:value={searchQuery} />
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			{#if data.profile?.role.name === 'ADMIN'}
				<div
					class="flex justify-center items-center bg-accSlate w-10 h-10 rounded-full cursor-pointer"
					on:click={() => {
						openModal(formModal);
					}}
				>
					<i class="fa-solid fa-plus fa-lg text-white/90" />
				</div>
			{/if}
		</svelte:fragment>
		<svelte:fragment slot="filters">
			<RadioGroup background="bg-transparent" active="bg-accSlate text-white/90" class="mt-0" rounded="rounded-md">
				<RadioItem bind:group={filter} name="visitorType" value="all">All</RadioItem>
				<RadioItem bind:group={filter} name="visitorType" value="my">My Forms</RadioItem>
			</RadioGroup>
			<RadioGroup background="bg-transparent" active="bg-accSlate text-white/90" class="mt-0" rounded="rounded-md">
				<RadioItem bind:group={update} name="visitorType" value="all">All</RadioItem>
				<RadioItem bind:group={update} name="visitorType" value="out_of_date">Out of Date</RadioItem>
			</RadioGroup>
			<button class="bg-accSlate/80 text-white/90 font-medium rounded-md px-4 py-2" on:click={resetFilters}> Reset Filters </button>
		</svelte:fragment>
		<svelte:fragment slot="content">
			<TabGroup>
				<Tab bind:group={tabSet} name="all" value={0}>All ({forms.length})</Tab>
				<Tab bind:group={tabSet} name="last" value={1}>
					{moment().subtract(1, 'years').format('YYYY')}-{moment().format('YYYY')}
					({forms.filter((form) => form.aidYear.name === moment().subtract(1, 'years').format('YY') + moment().format('YY')).length})
				</Tab>
				<Tab bind:group={tabSet} name="current" value={2}>
					{moment().format('YYYY')}-{moment().add(1, 'years').format('YYYY')}
					({forms.filter((form) => form.aidYear.name === moment().format('YY') + moment().add(1, 'years').format('YY')).length})</Tab
				>
				<Tab bind:group={tabSet} name="next" value={3}>
					{moment().add(1, 'years').format('YYYY')}-{moment().add(2, 'years').format('YYYY')}
					({forms.filter((form) => form.aidYear.name === moment().add(1, 'years').format('YY') + moment().add(2, 'years').format('YY')).length})
				</Tab>
				<Tab bind:group={tabSet} name="nonyear" value={4}>Non-Year ({forms.filter((form) => form.aidYear.name === 'Non-Year').length})</Tab>
				<Tab bind:group={tabSet} name="archive" value={5}>Archive ({formsArchiveNum})</Tab>
				<!-- Tab Panels --->
				<svelte:fragment slot="panel">
					<TableWrapper arrLength={filteredForms.length} bind:paginationSettings>
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
								{#each paginatedSource as form}
									<tr on:click={() => updateForm(form.id)} class="cursor-pointer">
										<td><pre>{form.rraareqCode.includes(' ') ? '-' : form.rraareqCode}</pre></td>
										<td><pre>{form.aidYear.name}</pre></td>
										<td><pre>{form.name}</pre></td>
										<td><pre>{form.owner.first_name + ' ' + form.owner.last_name}</pre></td>
										<td><pre>{getDateLocal(form.updatedAt.toISOString(), 'YYYY-MM-DD')}</pre></td>
									</tr>
								{/each}
							</tbody>
						</svelte:fragment>
						<svelte:fragment slot="none">
							{#if tabSet === AidYear.Archive}
								<Accordion regionControl="font-semibold" class="bg-transparent">
									{#each Object.keys(formsArchive['intranet']).sort() as year}
										<AccordionItem>
											<svelte:fragment slot="summary">{`20${year.slice(0, 2)} - 20${year.slice(-2)}`}</svelte:fragment>
											<svelte:fragment slot="content">
												<div class="pl-2 grid grid-cols-2 bg-transparent">
													<div>
														<h1 class="text-lg font-medium underline mb-2">Intranet</h1>
														<div class="grid grid-cols-[50px_auto]">
															{#each formsArchive['intranet'][year] as file}
																{#if file.includes('.')}
																	<span class="w-fit"><FileAttachment {file} small /></span>
																	<a
																		href={`https://tup-ofa.forest.usf.edu/files/forms/intranet/${year}/${file}?apiKey=${api_key}`}
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
													</div>
													<div>
														<h1 class="text-lg font-medium underline mb-2">Internet</h1>
														<div class="grid grid-cols-[50px_auto]">
															{#each formsArchive['internet'][year] as file}
																{#if file.includes('.')}
																	<span class="w-fit"><FileAttachment {file} small /></span>
																	<a
																		href={`https://tup-ofa.forest.usf.edu/finaid/internet/${year}/${file}?apiKey=${api_key}`}
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
													</div>
												</div></svelte:fragment
											>
										</AccordionItem>
									{/each}
								</Accordion>
							{:else}
								<p>There are no forms that match this search.</p>
							{/if}
						</svelte:fragment>
					</TableWrapper>
				</svelte:fragment>
			</TabGroup>
		</svelte:fragment>
	</PageWrapper>
</section>
