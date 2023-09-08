<script lang="ts">
	import { goto } from "$app/navigation";
	import { fly } from "svelte/transition";
  import Search from '$lib/components/Search.svelte';
	import { onMount } from "svelte";
	import { page } from "$app/stores";
	import { getDateLocal } from "$lib/helpers";
	import { Table, type PaginationSettings, Paginator, tableMapperValues, modalStore } from "@skeletonlabs/skeleton";
  export let data;

	let sourceData: any[] = [];
	let filteredSourceData: any[] = [];
	let searchQuery =	$page.url.searchParams.get("search") === null ? '' : String($page.url.searchParams.get("search"));
  let visits = data.visits;

  onMount(() => {
    const visitsPerDay: { [key: string]: { visits: number, phone: number, inperson: number, walkin: number, refs: number } } = {};

    for (let visit of visits) {
      let date = getDateLocal(visit.createdAt.toISOString(), "YYYY-MM-DD");
      
      if (visitsPerDay[date] === undefined) {
        visitsPerDay[date] = { visits: 0, phone: 0, inperson: 0, walkin: 0, refs: 0 };
      }

      visitsPerDay[date].visits++;

      if (visit.appointment !== null) {
        if (visit.appointment.type === "Phone Appointment") {
          visitsPerDay[date].phone++;
        }
        if (visit.appointment.type === "In-person Appointment") {
          visitsPerDay[date].inperson++;
        }
        if (visit.appointment.type === "Walk-in Appointment") {
          visitsPerDay[date].walkin++;
        }
      }
      if (visit.referral !== null) {
        visitsPerDay[date].refs++;
      }
    }

		Object.keys(visitsPerDay).forEach((date) => {
			let tr = {
        date,
				totalVisits: visitsPerDay[date].visits,
				phoneAppts: visitsPerDay[date].phone,
				inPersonAppts: visitsPerDay[date].inperson,
				walkinAppts: visitsPerDay[date].walkin,
				referralsCreated: visitsPerDay[date].refs
			}
			sourceData.push(tr);
		});
		filteredSourceData = sourceData
	});

  $: {
    filteredSourceData = sourceData.filter((visit: any) => {
      if ((visit.date.toLowerCase().includes(searchQuery.toLowerCase().trim()))) {
        return visit;
      }
    })

    updatePageSettings(filteredSourceData);
  }

  const headers: string[] = ['Date', "Total Visits", 'Phone Appts.', 'In-person Appts.', 'Walk-in Appts.', 'Referrals'];
	const body: string[] = ['date', 'totalVisits', 'phoneAppts', 'inPersonAppts', 'walkinAppts', 'referralsCreated'];
	const meta: string[] = ['date'];
  let state = { firstLast: false, previousNext: true };
	let pageSettings = { offset: 0, limit: 10, size: filteredSourceData.length, amounts: [5, 10, 15] } as PaginationSettings;
	$: sourceDataSliced = filteredSourceData.slice(pageSettings.offset * pageSettings.limit, pageSettings.offset * pageSettings.limit + pageSettings.limit);

	function updatePageSettings(filteredArr: any[]) {
		pageSettings.size = filteredArr.length;
		pageSettings.offset = 0
	}

  function viewDate(e: CustomEvent) {
		console.log(e);
    modalStore.trigger({
      type: 'component',
      component: 'visitStatsModal',
      meta: { visits: visits.filter(visit => getDateLocal(visit.createdAt.toISOString(), "YYYY-MM-DD") === e.detail[0]), date: e.detail[0] }
    });
  }
</script>

<svelte:head>
	<title>OFA • Visitor Statistics</title>
</svelte:head>

<section in:fly={{ y: -10, duration: 200 }}>
  <div class="flex justify-between items-center">
    <h1 class="text-2xl text-usfGreen font-semibold">Visitor Statistics</h1>
    <div class="flex justify-center items-center space-x-4">
      <Search bind:value={searchQuery} />
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <div class="flex justify-center items-center bg-accSlate p-[6px] rounded-full cursor-pointer" 
        on:click={() => { goto("/counter_duty") }}>
        <box-icon class="fill-white/90" name={"plus"} />
      </div>
    </div>
  </div>
  <br>
  <section>
    <Table on:selected={viewDate} interactive={true} source={{ head: headers, body: tableMapperValues(sourceDataSliced, body), meta: tableMapperValues(sourceDataSliced, meta)}} regionHeadCell="bg-accSlate text-white/90" />
    <br />
    <Paginator buttonClasses="bg-accSlate fill-white"  bind:settings={pageSettings} showFirstLastButtons={state.firstLast} showPreviousNextButtons={state.previousNext} />
  </section>
</section>