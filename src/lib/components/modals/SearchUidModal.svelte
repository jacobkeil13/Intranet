<script lang="ts">
	import { getModalStore, type PaginationSettings } from '@skeletonlabs/skeleton';
	import TableWrapper from '../TableWrapper.svelte';
	import type { Appointment, Referral, VisitCounter } from '@prisma/client';
	import Search from '../Search.svelte';
	import Popup from '../Popup.svelte';
	import { getDateLocal } from '$lib/helpers';

  interface FullVisit extends VisitCounter {
    appointment: Appointment | null
    referral: Referral | null
  }

	let modalStore = getModalStore();

  let visits: FullVisit[] = $modalStore[0].meta.visits;
	let filteredVisits = visits;
  let searchQuery = '';

  $: {
    filteredVisits = visits.filter((visit) => {
      if (visit.studentUid?.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
					visit.studentName?.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
					visit.reason.toLowerCase().includes(searchQuery.toLowerCase().trim())) {
        return visit;
      } else if (visit.studentName === null && searchQuery === "-") {
        return visit;
      }
    })
		updatePageSettings(filteredVisits);
  }

	let paginationSettings = {
		page: 0,
		limit: 5,
		size: filteredVisits.length,
		amounts: [5, 10],
	} satisfies PaginationSettings;

	$: paginatedSource = filteredVisits.slice(
		paginationSettings.page * paginationSettings.limit,
		paginationSettings.page * paginationSettings.limit + paginationSettings.limit
	);

	function updatePageSettings(filteredArr: any[]) {
		paginationSettings.size = filteredArr.length;
	}

	function closeForm(): void {
		modalStore.close();
	}
</script>

<section class="w-[50rem] max-h-[calc(100%_-_5rem)] overflow-y-auto bg-usfWhite p-4 rounded-md">
  <div class="flex justify-between items-center">
		<h1 class="text-xl text-usfGreen font-medium">Search Visits / UID</h1>
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<i class="fa-solid fa-xmark fa-lg text-black cursor-pointer" on:click={closeForm}></i>
	</div>
  <br>
  <Search bind:value={searchQuery} width="w-full" />
	<br />
  <TableWrapper arrLength={filteredVisits.length} bind:paginationSettings={paginationSettings} tableCompact="table-compact">
    <svelte:fragment slot="header">
      <thead>
        <tr class="bg-accSlate text-white/90">
          <th>Date & Time</th>
          <th>UID</th>
          <th>Student Name</th>
          <th>Counter User</th>
          <th>Appt.</th>
          <th>Referral</th>
        </tr>
      </thead>
    </svelte:fragment>
    <svelte:fragment slot="body">
      <tbody>
        {#each paginatedSource as visit}
          <tr class="cursor-pointer">
            <td>{getDateLocal(visit.createdAt.toISOString(), "MMM Do, YYYY [-] h:mmA")}</td>
            <td>{visit.studentUid ?? "-"}</td>
            <td>{visit.studentName ?? "-"}</td>
            <td>{visit.counterUser}</td>
            <td>
              {#if visit.appointment !== null}
                <Popup bgColor="bg-accSlate" eventType="click">
                  <svelte:fragment slot="content">
                    <i class="fa-solid fa-check fa-lg text-usfGreen"></i>
                  </svelte:fragment>
                  <svelte:fragment slot="popup">
                    <p class="text-white/80 font-semibold">{visit.appointment.advisor ?? "No Advisor Set"}</p>
                    <p class="flex items-center font-semibold {visit.appointment.completed ? "text-green-500" : "text-orange-300"}">
                      {visit.appointment.completed ? "Completed" : "Pending"}
                    </p>
                    <p class="text-white/80 font-semibold">{getDateLocal(visit.appointment.createdAt.toISOString(), "MMMM Do, YYYY")}</p>
                    <hr class="!border-dashed my-2" />
                    <p class="text-white/80 font-semibold">{visit.appointment.studentName}</p>
                    <p class="text-white/80 font-semibold">{visit.appointment.type}</p>
                  </svelte:fragment>
                </Popup>
              {:else}
                <i class="fa-solid fa-xmark fa-lg text-black/50"></i>
              {/if}
            </td>
            <td>
              {#if visit.referral !== null}
                <Popup bgColor="bg-accSlate" width="max-w-xs" eventType="click">
                  <svelte:fragment slot="content">
                    <i class="fa-solid fa-check fa-lg text-usfGreen"></i>
                  </svelte:fragment>
                  <svelte:fragment slot="popup">
                    <p class="text-white/80 font-semibold">{visit.referral.counterUser}</p>
                    <p class="flex items-center font-semibold {visit.referral.completed ? "text-green-400" : "text-orange-300"}">
                      {visit.referral.completed ? "Completed" : "Pending"}
                    </p>
                    <p class="text-white/80 font-semibold">{getDateLocal(visit.referral.bestTimeCallback.toISOString(), "MMMM Do, YYYY")}</p>
                    <hr class="!border-dashed my-2" />
                    <p class="text-white/80 font-semibold">{visit.referral.details}</p>
                    <hr class="!border-dashed my-2" />
                    <p class="text-white/80 font-semibold">{visit.referral.referralType}</p>
                  </svelte:fragment>
                </Popup>
              {:else}
                <i class="fa-solid fa-xmark fa-lg text-black/50"></i>
              {/if}
            </td>
          </tr>
        {/each}
      </tbody>
    </svelte:fragment>
    <svelte:fragment slot="none">
      <p>There are no visits that match your search.</p>
    </svelte:fragment>
  </TableWrapper>
</section>

<style>
  th {
    border: none;
    background-color: white;
    color: #4C4C4C;
  }
</style>