<script lang="ts">
	import { Search, TableWrapper, PageWrapper, HeaderSort } from '$lib/components';
	import { getToastStore, Tab, TabGroup, getModalStore, type PaginationSettings, RadioGroup, RadioItem } from '@skeletonlabs/skeleton';
	import { fly } from 'svelte/transition';
	import { getDateLocal } from '$lib/helpers.js';
	import { page } from '$app/stores';
	export let form;
	export let data;

	enum AppointmentType {
		Phone = 0,
		InPerson = 1,
		Walkin = 2
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

	type HeaderTypes = 'dateTime' | 'type' | 'name' | 'uid' | 'advisor' | 'lastUpdatedBy';
	let currentSortField: HeaderTypes = 'dateTime';
	let currentSortOrder: 'asc' | 'dsc' = 'asc';

	let filter = $page.url.searchParams.get('filter') === null ? 'all' : $page.url.searchParams.get('filter');
	let tabSet: number = $page.url.searchParams.get('tab') === null ? 0 : Number($page.url.searchParams.get('tab'));
	let appointments = data.appointments;
	let filteredAppointments = data.appointments;
	let complete = 'pending';
	let searchQuery = '';

	$: {
		let profileName = data.profile?.first_name + ' ' + data.profile?.last_name;
		filteredAppointments = appointments.filter((appt) => {
			let apptType = '';
			if (tabSet === AppointmentType.Phone) {
				apptType = 'Phone';
			} else if (tabSet === AppointmentType.InPerson) {
				apptType = 'In-person';
			} else if (tabSet === AppointmentType.Walkin) {
				apptType = 'Walk-in';
			}
			if (
				(appt.studentName?.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
					appt.studentUid?.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
					appt.advisor?.toLowerCase().includes(searchQuery.toLowerCase().trim())) &&
				appt.type.split(' ')[0] === apptType
			) {
				if (complete === 'pending' && !appt.completed) {
					if (appt.advisor === profileName && filter === 'my') {
						if (apptType === 'Walk-in' && appt.advisor === null) {
							return appt;
						} else if (apptType !== 'Walk-in') {
							return appt;
						}
					} else if (filter === 'all') {
						return appt;
					}
				}
				if (complete === 'completed' && appt.completed) {
					if (appt.advisor === profileName && filter === 'my') {
						return appt;
					} else if (filter === 'all') {
						return appt;
					}
				}
			}
		});
		updatePageSettings(filteredAppointments);
	}

	let paginationSettings = {
		page: 0,
		limit: 10,
		size: filteredAppointments.length,
		amounts: [5, 10, 15]
	} satisfies PaginationSettings;

	$: paginatedSource = filteredAppointments.slice(paginationSettings.page * paginationSettings.limit, paginationSettings.page * paginationSettings.limit + paginationSettings.limit);

	function updatePageSettings(filteredArr: any[]) {
		paginationSettings.size = filteredArr.length;
		paginationSettings.page = 0;
	}

	function updateAppointment(id: string) {
		if (data.profile?.role.name === 'STUDENT') return;
		modalStore.trigger({
			type: 'component',
			component: 'updateAppointmentModal',
			meta: { appt: appointments.find((appt) => appt.id === id), constants: data.constants, managementTeam: data.managementTeam[0].userProfile }
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
		complete = 'pending';
		searchQuery = '';
		currentSortField = 'dateTime';
		currentSortOrder = 'asc';
		sort();
	}

	let tableHeaders = [
		{ sortable: true, title: 'Date & Time', field: 'dateTime' },
		{ sortable: true, title: 'Type', field: 'type' },
		{ sortable: true, title: 'Name', field: 'name' },
		{ sortable: true, title: 'UID', field: 'uid' },
		{ sortable: true, title: 'Advisor', field: 'advisor' },
		{ sortable: true, title: 'Last Updated By', field: 'lastUpdatedBy' }
	];

	function sort() {
		filteredAppointments = appointments.sort((a, b) => {
			const getField = (obj: typeof a, field: HeaderTypes) => {
				const fieldsMap = {
					dateTime: obj.dateTime.toISOString(),
					type: obj.type,
					name: obj.studentName,
					uid: obj.studentUid,
					advisor: obj.advisor,
					lastUpdatedBy: obj.lastUpdatedBy
				};
				return fieldsMap[field] || obj.dateTime.toISOString();
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
	<title>OFA • Appointments</title>
</svelte:head>

<section in:fly={{ y: -10, duration: 200 }}>
	<PageWrapper>
		<svelte:fragment slot="title">
			<h1 class="text-2xl text-usfGreen font-semibold">{filter === 'my' ? 'My' : ''} {complete === 'completed' ? 'Completed' : 'Pending'} Appointments</h1>
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
				<RadioItem bind:group={filter} name="visitorType" value="all">All Appts.</RadioItem>
				<RadioItem bind:group={filter} name="visitorType" value="my">My Appts.</RadioItem>
			</RadioGroup>
			<button class="bg-accSlate/80 text-white/90 font-medium rounded-md px-4 py-2" on:click={resetFilters}> Reset Filters </button>
		</svelte:fragment>
		<svelte:fragment slot="content">
			<TabGroup>
				<Tab bind:group={tabSet} name="phone" value={0}>Phone</Tab>
				<Tab bind:group={tabSet} name="inperson" value={1}>In-person</Tab>
				<Tab bind:group={tabSet} name="walkin" value={2}>Walk-in</Tab>
				<svelte:fragment slot="panel">
					<TableWrapper arrLength={filteredAppointments.length} bind:paginationSettings>
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
								{#each paginatedSource as appt}
									<tr on:click={() => updateAppointment(appt.id)} class="cursor-pointer">
										<td><pre>{getDateLocal(appt.dateTime.toISOString(), 'MMM Do, h:mmA')}</pre></td>
										<td>{appt.type.split(' ')[0]}</td>
										<td><pre>{appt.studentName}</pre></td>
										<td>{appt.studentUid}</td>
										<td><pre>{appt.advisor ?? '-'}</pre></td>
										<td><pre>{appt.lastUpdatedBy ?? '-'}</pre></td>
									</tr>
								{/each}
							</tbody>
						</svelte:fragment>
						<svelte:fragment slot="none">
							<p>There are no appointments that match this search.</p>
						</svelte:fragment>
					</TableWrapper>
				</svelte:fragment>
			</TabGroup>
		</svelte:fragment>
	</PageWrapper>
</section>
