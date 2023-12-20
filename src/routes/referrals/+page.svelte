<script lang="ts">
	import { type PaginationSettings, getToastStore, getModalStore, RadioGroup, RadioItem } from '@skeletonlabs/skeleton';
	import { PageWrapper, Popup, Search, TableWrapper, HeaderSort } from '$lib/components';
	import { pageOptions } from '$lib/stores/filters.js';
	import { getDateLocal } from '$lib/helpers.js';
	import { fly } from 'svelte/transition';
	import { page } from '$app/stores';
	import moment from 'moment';
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

	type HeaderTypes = 'status' | 'dueDate' | 'name' | 'uid' | 'assignedTo' | 'collaborators' | 'lastUpdatedBy';
	let currentSortField: HeaderTypes = 'dueDate';
	let currentSortOrder: 'asc' | 'dsc' = 'asc';

	let filter = $page.url.searchParams.get('filter') === null ? 'all' : $page.url.searchParams.get('filter');
	let type = 'all';
	let complete = 'pending';
	let searchQuery = $page.url.searchParams.get('search') === null ? '' : String($page.url.searchParams.get('search'));
	let referrals = data.referrals;
	let filteredReferrals = data.referrals;

	$: {
		filteredReferrals = referrals.filter((referral) => {
			let owner = referral.escalationUser === null ? referral.counterUser : referral.escalationUser;
			let researchUser = referral.researchUser === null ? null : referral.researchUser;
			let currentUser = data.profile?.first_name + ' ' + data.profile?.last_name;
			if (
				referral.studentName?.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
				referral.studentUid?.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
				(researchUser !== null && researchUser.toLowerCase().includes(searchQuery.toLowerCase().trim())) ||
				owner.toLowerCase().includes(searchQuery.toLowerCase().trim())
			) {
				if (complete === 'pending' && referral.completed) return false;
				if (complete === 'completed' && !referral.completed) return false;
				if (filter === 'my' && currentUser !== owner && !researchUser?.split(',').includes(currentUser)) return false;
				if (type === 'escalated' && referral.referralType !== 'Escalated Referral') return false;
				if (type === 'research' && referral.referralType !== 'Collaboration Referral') return false;
				return true;
			}
			return false;
		});
		updatePageSettings(filteredReferrals);
	}

	let paginationSettings = {
		page: 0,
		limit: 50,
		size: filteredReferrals.length,
		amounts: pageOptions
	} satisfies PaginationSettings;

	$: paginatedSource = filteredReferrals.slice(paginationSettings.page * paginationSettings.limit, paginationSettings.page * paginationSettings.limit + paginationSettings.limit);

	function updatePageSettings(filteredArr: any[]) {
		paginationSettings.size = filteredArr.length;
		paginationSettings.page = 0;
	}

	function updateReferral(idx: string) {
		if (data.profile?.role.name === 'STUDENT') return;
		modalStore.trigger({
			type: 'component',
			component: 'updateReferralModal',
			meta: { referral: referrals.find((referral) => referral.id === idx), constants: data.constants }
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
		filter = 'all';
		type = 'all';
		complete = 'pending';
		searchQuery = '';
		filteredReferrals = referrals;
		currentSortField = 'dueDate';
		currentSortOrder = 'asc';
		sort();
	}

	let tableHeaders = [
		{ sortable: false, title: 'Status', field: 'status' },
		{ sortable: true, title: 'Due', field: 'dueDate' },
		{ sortable: true, title: 'Name', field: 'name' },
		{ sortable: true, title: 'UID', field: 'uid' },
		{ sortable: true, title: 'Assigned To', field: 'assignedTo' },
		{ sortable: false, title: 'Collaborators', field: 'collaborators' },
		{ sortable: true, title: 'Last Updated By', field: 'lastUpdatedBy' }
	];

	function sort() {
		filteredReferrals = referrals.sort((a, b) => {
			const getField = (obj: typeof a, field: HeaderTypes) => {
				const fieldsMap = {
					status: '',
					dueDate: obj.bestTimeCallback.toISOString(),
					name: obj.studentName,
					uid: obj.studentUid,
					assignedTo: obj.counterUser,
					collaborators: '',
					lastUpdatedBy: obj.lastUpdatedBy
				};
				return fieldsMap[field] || obj.bestTimeCallback.toISOString();
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
	<title>OFA • Referrals</title>
</svelte:head>

<section in:fly={{ y: -10, duration: 200 }}>
	<PageWrapper>
		<svelte:fragment slot="title">
			<h1 class="text-2xl text-usfGreen font-semibold">
				{complete === 'pending' ? 'Pending' : 'Completed'}
				{filter === 'all' ? '' : filter === 'escalated' ? 'Escalated' : 'Collaboration'} Referrals
			</h1>
		</svelte:fragment>
		<svelte:fragment slot="title-right">
			<Search bind:value={searchQuery} />
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<div
				class="flex justify-center items-center bg-accSlate w-10 h-10 rounded-full cursor-pointer"
				on:click={() => {
					openModal('appointmentModal', {
						constants: data.constants,
						appointmentReasons: data.appointmentReasons,
						visitCounterReasons: data.visitCounterReasons,
						managementTeam: data.managementTeam[0].userProfile
					});
				}}
			>
				<i class="fa-solid fa-plus fa-lg text-white/90" />
			</div>
		</svelte:fragment>
		<svelte:fragment slot="filters">
			<RadioGroup background="bg-transparent" active="bg-accSlate text-white/90" class="mt-0" rounded="rounded-md">
				<RadioItem bind:group={complete} name="complete" value="pending">Pending</RadioItem>
				<RadioItem bind:group={complete} name="complete" value="completed">Completed</RadioItem>
			</RadioGroup>
			<RadioGroup background="bg-transparent" active="bg-accSlate text-white/90" class="mt-0" rounded="rounded-md">
				<RadioItem bind:group={filter} name="visitorType" value="all">All</RadioItem>
				<RadioItem bind:group={filter} name="visitorType" value="my">My Referrals</RadioItem>
				<!-- {#if data.profile?.team.map((team) => team.name).includes('Management')}
					<RadioItem bind:group={filter} name="visitorType" value="report">Direct Report</RadioItem>
				{/if} -->
			</RadioGroup>
			<RadioGroup background="bg-transparent" active="bg-accSlate text-white/90" class="mt-0" rounded="rounded-md">
				<RadioItem bind:group={type} name="filter" value="all">All</RadioItem>
				<RadioItem bind:group={type} name="filter" value="escalated">Escalated</RadioItem>
				<RadioItem bind:group={type} name="filter" value="research">Collaboration</RadioItem>
			</RadioGroup>
			<button class="bg-accSlate/80 text-white/90 font-medium rounded-md px-4 py-2" on:click={resetFilters}>Reset Filters</button>
		</svelte:fragment>
		<svelte:fragment slot="content">
			<TableWrapper arrLength={filteredReferrals.length} bind:paginationSettings>
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
						{#each paginatedSource as referral}
							<tr on:click={() => updateReferral(referral.id)} class="cursor-pointer">
								<td class="flex items-center gap-3">
									<Popup>
										<svelte:fragment slot="content">
											<div
												class:bg-red-600={referral.escalationUser !== null && referral.researchUser === null}
												class:bg-orange-400={referral.researchUser !== null && referral.escalationUser === null}
												class:bg-gray-300={referral.researchUser === null && referral.escalationUser === null}
												class="rounded-full h-5 w-5 [&>*]:pointer-events-none cursor-pointer"
											/>
										</svelte:fragment>
										<svelte:fragment slot="popup">
											<p class="text-white/80 font-semibold">{referral.referralType ?? ''}</p>
											<p class="text-white/80">{referral.researchUser ? referral.researchUser.split(',').length + ' Collaborators' : ''}</p>
										</svelte:fragment>
									</Popup>
									{#if moment(referral.bestTimeCallback).isBefore(new Date(), 'day') && !referral.completed}
										<Popup>
											<svelte:fragment slot="content">
												<div class="h-5 w-5">
													<i class="fa-regular fa-circle-exclamation fa-xl text-red-600" />
												</div>
											</svelte:fragment>
											<svelte:fragment slot="popup">
												<p class="text-white/80 font-semibold">Overdue - {moment(referral.bestTimeCallback, 'YYYYMMDD').fromNow()}</p>
											</svelte:fragment>
										</Popup>
									{/if}
								</td>
								<td><pre>{getDateLocal(referral.bestTimeCallback.toISOString(), 'YYYY-MM-DD')}</pre></td>
								<td><pre>{referral.studentName}</pre></td>
								<td><pre>{referral.studentUid}</pre></td>
								<td><pre>{referral.escalationUser === null ? referral.counterUser : referral.escalationUser}</pre></td>
								<td>
									{#if referral.researchUser !== null}
										{#if referral.researchUser.split(',').length > 1}
											<Popup placement="top">
												<svelte:fragment slot="content">
													<pre><span class="font-semibold">{referral.researchUser.split(',')[0]}</span>{referral.researchUser.split(',').length > 1
															? ` +${referral.researchUser.split(',').length - 1}`
															: ''}</pre>
												</svelte:fragment>
												<svelte:fragment slot="popup">
													<p class="text-white/80 font-semibold">Collaborators</p>
													{#if referral.researchUser.split(',').length > 1}
														{#each referral.researchUser.split(',') as user}
															<p class="text-white/80 font-medium">• {user}</p>
														{/each}
													{:else}
														<p class="text-white/80 font-medium">• None</p>
													{/if}
												</svelte:fragment>
											</Popup>
										{:else}
											<pre>{referral.researchUser.split(',')[0]}</pre>
										{/if}
									{:else}
										<pre>-</pre>
									{/if}
								</td>
								<td><pre>{referral.lastUpdatedBy ?? '-'}</pre></td>
							</tr>
						{/each}
					</tbody>
				</svelte:fragment>
				<svelte:fragment slot="none">
					<p>There are no referrals that match your search.</p>
				</svelte:fragment>
			</TableWrapper>
		</svelte:fragment>
	</PageWrapper>
</section>
