<script lang="ts">
	import { getDateLocal } from "$lib/helpers";
	import type { Appointment, Referral, VisitCounter } from "@prisma/client";
	import { SlideToggle, Tab, TabGroup, modalStore } from "@skeletonlabs/skeleton";
	import moment from "moment";
	import { onMount } from "svelte";
	import Search from "$lib/components/Search.svelte";
	import D3Chart from "../charts/D3Chart.svelte";
	import { fly } from "svelte/transition";

  enum Stat {
    Visits = 0,
    Phone = 1,
    InPerson = 2,
    Walkin = 3,
    Referral = 4
  }

  interface FullVisit extends VisitCounter {
    appointment: Appointment | null
    referral: Referral | null
  }

  interface ChartData {
    date: string,
    visits: number
  }

  let graphView = false;
  let graphData: ChartData[] = [];
  let tabSet: number = 0;
  let searchQuery: string = "";
  let timePicked: string;
  let times: { time: string, visits: number }[] = [];
  let visits: FullVisit[] = $modalStore[0].meta.visits.sort((a: VisitCounter, b: VisitCounter) => 
    a.createdAt.toISOString().localeCompare(b.createdAt.toISOString()));
  let filteredVisits = visits;
  let date = $modalStore[0].meta.date;

  // console.log(visits);

  onMount(() => {
    let visitsPerHour: { [key: string]: { visits: number, iso: string } } = {};
    for (let visit of visits) {
      let time = getDateLocal(visit.createdAt.toISOString(), "hA");
      if (visitsPerHour[time] === undefined) {
        visitsPerHour[time] = { visits: 0, iso: "" };
      }
      visitsPerHour[time].visits++;
      visitsPerHour[time].iso = visit.createdAt.toISOString();
    }

    Object.keys(visitsPerHour).forEach(time => {
      times.push({ time, visits: visitsPerHour[time].visits });

      graphData.push({
        date: visitsPerHour[time].iso,
        visits: visitsPerHour[time].visits
      })
    })

    console.log(times);
    

    timePicked = "All";
  });

  $: {
    filteredVisits = visits.filter(visit => {
      if (tabSet === Stat.Visits) {
        if (timePicked === "All") {
          if (visit.studentUid?.toLowerCase().includes(searchQuery.toLowerCase().trim()) || 
              visit.studentName?.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
              visit.counterUser?.toLowerCase().includes(searchQuery.toLowerCase().trim())) {
            return visit
          }
        }
        if (timePicked && getDateLocal(visit.createdAt.toISOString(), "hA") === timePicked) {
          if (visit.studentUid?.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
              visit.studentName?.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
              visit.counterUser?.toLowerCase().includes(searchQuery.toLowerCase().trim())) {
            return visit
          }
        }
      } else if (tabSet === Stat.Phone || tabSet === Stat.InPerson || tabSet === Stat.Walkin) {
        if (visit.appointment !== null) {
          if (timePicked === "All") {
            if (visit.studentUid?.toLowerCase().includes(searchQuery.toLowerCase().trim())) {
              if (visit.appointment.advisor?.toLowerCase().includes(searchQuery.toLowerCase().trim())) {
                if (tabSet === Stat.Phone && visit.appointment.type === "Phone Appointment") {
                  return visit
                } else if (tabSet === Stat.InPerson && visit.appointment.type === "In-person Appointment") {
                  return visit
                } else if (tabSet === Stat.Walkin && visit.appointment.type === "Walk-in Appointment") {
                  return visit
                }
              }
            }
          }
          if (timePicked && getDateLocal(visit.createdAt.toISOString(), "hA") === timePicked) {
            if (visit.studentUid?.toLowerCase().includes(searchQuery.toLowerCase().trim())) {
              if (visit.appointment.advisor?.toLowerCase().includes(searchQuery.toLowerCase().trim())) {
                if (tabSet === Stat.Phone && visit.appointment.type === "Phone Appointment") {
                  return visit
                } else if (tabSet === Stat.InPerson && visit.appointment.type === "In-person Appointment") {
                  return visit
                } else if (tabSet === Stat.Walkin && visit.appointment.type === "Walk-in Appointment") {
                  return visit
                }
              }
            }
          }
        }
      } else if (tabSet === Stat.Referral) {
        if (visit.referral !== null) {
          if (timePicked === "All") {
            if (visit.studentUid?.toLowerCase().includes(searchQuery.toLowerCase().trim())) {
              if (visit.referral.counterUser?.toLowerCase().includes(searchQuery.toLowerCase().trim())) {
                return visit
              }
            }
          }
          if (timePicked && getDateLocal(visit.createdAt.toISOString(), "hA") === timePicked) {
            if (visit.studentUid?.toLowerCase().includes(searchQuery.toLowerCase().trim())) {
              if (visit.referral.counterUser?.toLowerCase().includes(searchQuery.toLowerCase().trim())) {
                return visit
              }
            }
          }
        }
      }
    })
  }
  
  function closeForm(): void {
		modalStore.close();
	}

  function downloadCSV() {
    const rows: any = [];
    const headerRow: string[] = ["UID", "Student Name", "Student Email", "Reason", "Visitor Type", 
      "Counter User", "Submitted Document", "Appointment", "Referral", "Time"];
    rows.push(headerRow)

    visits.forEach(visit => {
      let row: any = [];
      row.push(String(visit.studentUid ?? "-"));
      row.push(String(visit.studentName ?? "-"));
      row.push(String(visit.studentEmail ?? "-"));
      row.push(String(visit.reason));
      row.push(String(visit.visitorType));
      row.push(String(visit.counterUser));
      row.push(String(visit.submittedDocument));
      row.push(String(visit.appointment ? true : false));
      row.push(String(visit.referral ? true : false));
      row.push(String(getDateLocal(visit.createdAt.toISOString(), "YYYY-MM-DD hh:mmA")));
      rows.push(row);
    });

    let csvContent = "data:text/csv;charset=utf-8," 
    + rows.map((e: any) => e.join(",")).join("\n");

    var encodedUri = encodeURI(csvContent);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Visits_${date}.csv`);
    document.body.appendChild(link);
    link.click();
  }
</script>

<section class="w-[60rem] min-h-[500px] max-h-[calc(100%_-_5rem)] overflow-y-auto bg-usfWhite p-4 rounded-md">
	<div class="flex justify-between items-center">
    <div class="flex items-center space-x-2">
      <h1 class="text-xl text-usfGreen font-medium">{moment(date).format("MMMM Do, YYYY")}</h1>
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <box-icon type='solid' name='file-export' class="w-5 h-5 fill-usfGreen/50 hover:fill-usfGreen cursor-pointer duration-150" 
        on:click={downloadCSV}
      ></box-icon>
    </div>
    <div class="flex justify-center items-center space-x-4">
      <div class="flex items-center space-x-3">
				<h1 class="font-semibold">Graph View</h1>
				<SlideToggle name="graph" size="sm" bind:checked={graphView} />
			</div>
      <Search bind:value={searchQuery} />
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <box-icon class="fill-black cursor-pointer" name="x" on:click={closeForm} />
    </div>
	</div>
	<br />
  <TabGroup>
    <Tab bind:group={tabSet} name="visits" value={0}>Visits</Tab>
    <Tab bind:group={tabSet} name="phone" value={1}>Phone Appts</Tab>
    <Tab bind:group={tabSet} name="inperson" value={2}>In-person Appts</Tab>
    <Tab bind:group={tabSet} name="walkin" value={3}>Walk-in Appts</Tab>
    <Tab bind:group={tabSet} name="referrals" value={4}>Referrals</Tab>
    <svelte:fragment slot="panel">
      <section class="grid grid-cols-[200px_2fr] gap-4">
        <div class="space-y-1">
          <!-- <h1 class="font-semibold">Visits by Time</h1> -->
          <div class="space-y-1 max-h-[400px] overflow-auto">
            <ul class="flex flex-col gap-1">
              <li>
                <input type="radio" id="All" value="All" class="hidden peer" bind:group={timePicked} />
                <label for="All"
                  class="inline-flex items-center justify-between w-full py-1 px-3 text-accSlate bg-white border border-accSlate/20 rounded-md cursor-pointer 
                      peer-checked:bg-accSlate peer-checked:border-accSlate peer-checked:text-usfWhite/90">
                  <div class="flex justify-between w-full text-lg font-semibold">
                    <h1>All</h1>
                    <h1>{visits.length}</h1>
                  </div>
                </label>
              </li>
              {#each times as t}
                <li>
                  <input type="radio" id={t.time} value={t.time} class="hidden peer" bind:group={timePicked} />
                  <label for={t.time}
                    class="inline-flex items-center justify-between w-full py-1 px-3 text-accSlate bg-white border border-accSlate/20 rounded-md cursor-pointer 
                        peer-checked:bg-accSlate peer-checked:border-accSlate peer-checked:text-usfWhite/90">
                    <div class="flex justify-between w-full text-lg font-semibold">
                      <h1>{t.time}</h1>
                      <h1>{t.visits}</h1>
                    </div>
                  </label>
                </li>
              {/each}
            </ul>
          </div>
        </div>
        <div class:flex={filteredVisits.length === 0 || graphData.length < 3} 
             class:justify-center={filteredVisits.length === 0 || graphData.length < 3} 
             class:items-center={filteredVisits.length === 0 || graphData.length < 3}
        >
          {#if graphView}
            {#if graphData.length > 2 }
              <section in:fly={{ y: -10, duration: 250 }}>
                <D3Chart width={800} height={400} data={graphData} />
              </section>
            {:else}
              <h1>Graph needs more data before it can be rendered</h1>
            {/if}
          {:else}
            <section in:fly={{ y: -10, duration: 250 }}>
              {#if filteredVisits.length > 0}
                {#if tabSet === Stat.Visits}
                  <div class="grid grid-cols-[120px_220px_150px_75px_auto] gap-3 w-full rounded px-4 py-2 border border-accSlate/20 shadow-sm mb-1">
                    <h1 class="font-medium">UID</h1>
                    <h1 class="font-medium">Student Name</h1>
                    <h1 class="font-medium">Counter User</h1>
                    <h1 class="font-medium">Appt.</h1>
                    <h1 class="font-medium">Referral</h1>
                  </div>
                {:else if tabSet === Stat.Phone || tabSet === Stat.InPerson || tabSet === Stat.Walkin}
                  <div class="grid grid-cols-[120px_220px_150px_150px] gap-3 w-full rounded px-4 py-2 border border-accSlate/20 shadow-sm mb-1">
                    <h1 class="font-medium">UID</h1>
                    <h1 class="font-medium">Reason</h1>
                    <h1 class="font-medium">Advisor</h1>
                    <h1 class="font-medium">Source</h1>
                  </div>
                {:else if tabSet === Stat.Referral}
                  <div class="grid grid-cols-[120px_220px_150px_150px] gap-3 w-full rounded px-4 py-2 border border-accSlate/20 shadow-sm mb-1">
                    <h1 class="font-medium">UID</h1>
                    <h1 class="font-medium">Reason</h1>
                    <h1 class="font-medium">Owner</h1>
                    <h1 class="font-medium">Source</h1>
                  </div>
                {/if}
                <section class="flex flex-col gap-1 max-h-[328px] overflow-auto">
                  {#if tabSet === Stat.Visits}
                    {#each filteredVisits as visit}
                      <div class="grid grid-cols-[120px_220px_150px_75px_auto] gap-3 w-full rounded px-4 py-2 border border-accSlate/20 shadow-sm">
                        <h1 class="font-medium">{visit.studentUid ?? "-"}</h1>
                        <h1>{visit.studentName ?? "-"}</h1>
                        <h1>{visit.counterUser}</h1>
                        {#if visit.appointment !== null}
                          <box-icon name='check' class="fill-usfGreen" ></box-icon>
                        {:else}
                          <box-icon name='x' class="fill-black/50" ></box-icon>
                        {/if}
                        {#if visit.referral !== null}
                          <box-icon name='check' class="fill-usfGreen" ></box-icon>
                        {:else}
                          <box-icon name='x' class="fill-black/50" ></box-icon>
                        {/if}
                      </div>
                    {/each}
                  {:else if tabSet === Stat.Phone || tabSet === Stat.InPerson || tabSet === Stat.Walkin}
                    {#each filteredVisits as visit}
                      <div class="grid grid-cols-[120px_220px_150px_150px] gap-3 w-full rounded px-4 py-2 border border-accSlate/20 shadow-sm">
                        <h1 class="font-medium">{visit.studentUid ?? "-"}</h1>
                        <h1>{visit.appointment?.reason}</h1>
                        <h1>{visit.appointment?.advisor ?? "-"}</h1>
                        <h1>{visit.appointment?.source}</h1>
                      </div>
                    {/each}
                  {:else if tabSet === Stat.Referral}
                    {#each filteredVisits as visit}
                      <div class="grid grid-cols-[120px_220px_150px_150px] gap-3 w-full rounded px-4 py-2 border border-accSlate/20 shadow-sm">
                        <h1 class="font-medium">{visit.studentUid ?? "-"}</h1>
                        <h1>{visit.referral?.reason}</h1>
                        <h1>{visit.referral?.counterUser}</h1>
                        <h1>{visit.referral?.source}</h1>
                      </div>
                    {/each}
                  {/if}
                </section>
              {:else}
                <h1>There are no records that match this criteria.</h1>
              {/if}
            </section>
          {/if}
        </div>
      </section>
    </svelte:fragment>
  </TabGroup>
</section>