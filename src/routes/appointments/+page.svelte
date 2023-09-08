<script lang="ts">
	import Search from '$lib/components/Search.svelte';
  import { fly } from 'svelte/transition';
  import { toastStore, Tab, TabGroup, modalStore, type ModalSettings, type PaginationSettings, Paginator, Table, tableMapperValues, SlideToggle } from '@skeletonlabs/skeleton';
	import { getDateLocal, openModal } from '$lib/helpers.js';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
  export let form;
  export let data;

  enum AppointmentType {
    Phone = 0,
    InPerson = 1,
    Walkin = 2
  }

  if (form) {
    toastStore.trigger({
		  message: String(form?.message),
      background: form?.success ? "bg-accTeal" : "bg-[#930000]",
      classes: "text-white/90 font-medium"
	  });
  }

	let filterCompleted = false;
	let sourceData: any[] = [];
	let filteredSourceData: any[] = [];
	let searchQuery =	$page.url.searchParams.get("search") === null ? '' : String($page.url.searchParams.get("search"));
	let tabSet: number = $page.url.searchParams.get("tab") === null ? 0 : Number($page.url.searchParams.get("tab"));
  let appointments = data.appointments;

	onMount(() => {
		appointments.forEach((appt) => {
			let tr = {
				id: appt.id,
				type: appt.type.split(" ")[0],
				dateTime: getDateLocal(appt.dateTime.toISOString(), "MMMM Do, h:mmA"),
				name: appt.studentName,
				uid: appt.studentUid,
				advisor: appt.advisor ?? "-",
				completed: appt.completed,
				lastUpdatedBy: appt.lastUpdatedBy ?? "-",
			}
			sourceData.push(tr);
		});
		filteredSourceData = sourceData
	});

	$: {
    filteredSourceData = sourceData.filter((appt: any) => {
			let apptType = "";
			if (tabSet === AppointmentType.Phone) {
				apptType = "Phone"
			} else if (tabSet === AppointmentType.InPerson) {
				apptType = "In-person"
			} else if (tabSet === AppointmentType.Walkin) {
				apptType = "Walk-in"
			}
      if ((appt.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
				appt.uid.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
				appt.advisor.toLowerCase().includes(searchQuery.toLowerCase().trim())) && 
				appt.type === apptType) {
				if (filterCompleted && appt.completed) {
					return appt;
				}
				if (!filterCompleted && !appt.completed) {
					return appt;
				}
      }
    })
		updatePageSettings(filteredSourceData);
  }

  const headers: string[] = ['Date & Time', "Type", 'Name', 'UID', 'Advisor', 'Last Updated By'];
	const body: string[] = ['dateTime', 'type', 'name', 'uid', 'advisor', 'lastUpdatedBy'];
	const meta: string[] = ['id'];
  let state = { firstLast: false, previousNext: true };
	let pageSettings = { offset: 0, limit: 10, size: filteredSourceData.length, amounts: [5, 10, 15] } as PaginationSettings;
	$: sourceDataSliced = filteredSourceData.slice(pageSettings.offset * pageSettings.limit, pageSettings.offset * pageSettings.limit + pageSettings.limit);

	function updatePageSettings(filteredArr: any[]) {
		pageSettings.size = filteredArr.length;
		pageSettings.offset = 0
	}

	function updateAppointment(e: CustomEvent) {
		console.log(e);
		
    modalStore.trigger({
      type: 'component',
      component: 'updateAppointmentModal',
      meta: { appt: appointments.find(appt => appt.id === e.detail[0]), constants: data.constants }
    });
  }
</script>

<svelte:head>
	<title>OFA • Appointments</title>
</svelte:head>

<section in:fly={{ y: -10, duration: 200 }}>
  <div class="flex justify-between items-center">
    <h1 class="text-2xl text-usfGreen font-semibold">{filterCompleted ? "Completed" : "Pending"} Appointments</h1>
    <div class="flex justify-center items-center space-x-4">
			<div class="flex items-center space-x-3">
				<h1 class="font-semibold">Completed</h1>
				<SlideToggle name="completed" size="sm" bind:checked={filterCompleted} />
			</div>
      <Search bind:value={searchQuery} />
      <!-- svelte-ignore a11y-click-events-have-key-events -->
			<div class="flex justify-center items-center bg-accSlate p-[6px] rounded-full cursor-pointer" 
				on:click={() => { openModal("appointmentModal", { constants: data.constants, appointmentReasons: data.appointmentReasons, visitCounterReasons: data.visitCounterReasons })
			}}>
				<box-icon class="fill-white/90" name={"plus"} />
			</div>
    </div>
  </div>
  <br>
  <TabGroup>
    <Tab bind:group={tabSet} name="phone" value={0}>Phone</Tab>
    <Tab bind:group={tabSet} name="inperson" value={1}>In-person</Tab>
    <Tab bind:group={tabSet} name="walkin" value={2}>Walk-in</Tab>
    <!-- Tab Panels --->
    <svelte:fragment slot="panel">
			{#if filteredSourceData.length >= 1}
				<section>
					<Table on:selected={updateAppointment} interactive={true} source={{ head: headers, body: tableMapperValues(sourceDataSliced, body), meta: tableMapperValues(sourceDataSliced, meta)}} regionHeadCell="bg-accSlate text-white/90" />
					<br />
					<Paginator buttonClasses="bg-accSlate fill-white"  bind:settings={pageSettings} showFirstLastButtons={state.firstLast} showPreviousNextButtons={state.previousNext} />
				</section>
			{:else}
				<p>There are no appointments of this type.</p>
			{/if}
    </svelte:fragment>
  </TabGroup>
</section>