<script lang="ts">
	import Search from '$lib/components/Search.svelte';
  import { fly } from 'svelte/transition';
  import { getToastStore, Tab, TabGroup, getModalStore, type PaginationSettings, SlideToggle, RadioGroup, RadioItem } from '@skeletonlabs/skeleton';
	import { getDateLocal } from '$lib/helpers.js';
	import { page } from '$app/stores';
	import TableWrapper from '$lib/components/TableWrapper.svelte';
	import PageWrapper from '$lib/components/PageWrapper.svelte';
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
      background: form?.success ? "bg-accTeal" : "bg-[#930000]",
      classes: "text-white/90 font-medium"
	  });
  }

	let filter = $page.url.searchParams.get("filter") === null ? "all" : $page.url.searchParams.get("filter");
	let complete = "pending";
	let searchQuery =	"";
	let tabSet: number = $page.url.searchParams.get("tab") === null ? 0 : Number($page.url.searchParams.get("tab"));
  let appointments = data.appointments;
	let filteredAppointments = data.appointments;

	$: {
		let profileName = data.profile?.first_name + " " + data.profile?.last_name;
    filteredAppointments = appointments.filter((appt) => {
			let apptType = "";
			if (tabSet === AppointmentType.Phone) {
				apptType = "Phone"
			} else if (tabSet === AppointmentType.InPerson) {
				apptType = "In-person"
			} else if (tabSet === AppointmentType.Walkin) {
				apptType = "Walk-in"
			}
      if ((appt.studentName?.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
				appt.studentUid?.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
				appt.advisor?.toLowerCase().includes(searchQuery.toLowerCase().trim())) && 
				appt.type.split(" ")[0] === apptType) {
				if (complete === "pending" && !appt.completed) {
					if (appt.advisor === profileName && filter === "my") {
						if (apptType === "Walk-in" && appt.advisor === null) {
							return appt;
						} else if (apptType !== "Walk-in") {
							return appt;
						}
					} else if (filter === "all") {
						return appt;
					}
				}
				if (complete === "completed" && appt.completed) {
					if (appt.advisor === profileName && filter === "my") {
						return appt;
					} else if (filter === "all") {
						return appt;
					}
				}
      }
    })
		updatePageSettings(filteredAppointments);
  }

  let paginationSettings = {
		page: 0,
		limit: 10,
		size: filteredAppointments.length,
		amounts: [5, 10, 15],
	} satisfies PaginationSettings;

	$: paginatedSource = filteredAppointments.slice(
		paginationSettings.page * paginationSettings.limit,
		paginationSettings.page * paginationSettings.limit + paginationSettings.limit
	);

	function updatePageSettings(filteredArr: any[]) {
		paginationSettings.size = filteredArr.length;
	}

	function updateAppointment(id: string) {
    modalStore.trigger({
      type: 'component',
      component: 'updateAppointmentModal',
      meta: { appt: appointments.find(appt => appt.id === id), constants: data.constants,
				managementTeam: data.managementTeam[0].userProfile }
    });
  }

	function openModal(modal: string, meta: object) {
		modalStore.trigger({
			type: 'component',
			component: modal,
			meta
		})
	}

	function resetFilters() {
		filter = 'all';
		complete = 'pending';
		searchQuery = '';
	}
</script>

<svelte:head>
	<title>OFA • Appointments</title>
</svelte:head>

<section in:fly={{ y: -10, duration: 200 }}>
	<PageWrapper>
		<svelte:fragment slot="title">
			<h1 class="text-2xl text-usfGreen font-semibold">{filter === "my" ? "My" : ""} {complete === "completed" ? "Completed" : "Pending"} Appointments</h1>
		</svelte:fragment>
		<svelte:fragment slot="title-right">
      <Search bind:value={searchQuery} />
      <!-- svelte-ignore a11y-click-events-have-key-events -->
			<div class="flex justify-center items-center bg-accSlate w-10 h-10 rounded-full cursor-pointer" 
				on:click={() => { openModal("appointmentModal", { constants: data.constants, appointmentReasons: data.appointmentReasons, visitCounterReasons: data.visitCounterReasons, managementTeam: data.managementTeam[0].userProfile })
			}}>
				<i class="fa-solid fa-plus fa-lg text-white/90"></i>
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
			<button class="bg-accSlate/80 text-white/90 font-medium rounded-md px-4 py-2"
				on:click={resetFilters}
			>
				Reset Filters
			</button>
		</svelte:fragment>
		<svelte:fragment slot="content">
			<TabGroup>
				<Tab bind:group={tabSet} name="phone" value={0}>Phone</Tab>
				<Tab bind:group={tabSet} name="inperson" value={1}>In-person</Tab>
				<Tab bind:group={tabSet} name="walkin" value={2}>Walk-in</Tab>
				<svelte:fragment slot="panel">
					<TableWrapper arrLength={filteredAppointments.length} bind:paginationSettings={paginationSettings}>
						<svelte:fragment slot="header">
							<thead>
								<tr class="bg-accSlate text-white/90">
									<th>Date & Time</th>
									<th>Type</th>
									<th>Name</th>
									<th>UID</th>
									<th>Advisor</th>
									<th>Last Updated By</th>
								</tr>
							</thead>
						</svelte:fragment>
						<svelte:fragment slot="body">
							<tbody>
								{#each paginatedSource as appt}
									<tr on:click={() => updateAppointment(appt.id)} class="cursor-pointer">
										<td>{getDateLocal(appt.dateTime.toISOString(), "MMMM Do, h:mmA")}</td>
										<td>{appt.type.split(" ")[0]}</td>
										<td>{appt.studentName}</td>
										<td>{appt.studentUid}</td>
										<td>{appt.advisor ?? "-"}</td>
										<td>{appt.lastUpdatedBy ?? "-"}</td>
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