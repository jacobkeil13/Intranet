<script lang="ts">
	import PageWrapper from '$lib/components/PageWrapper.svelte';
  import Search from '$lib/components/Search.svelte';
	import TableWrapper from '$lib/components/TableWrapper.svelte';
  import { getToastStore, type ModalSettings, getModalStore, type PaginationSettings, TabGroup, Tab, RadioGroup, RadioItem } from '@skeletonlabs/skeleton';
  import { fly } from 'svelte/transition';
  export let form;
  export let data;

  enum Track {
    Sheet = 0,
    Code = 1
  }

  let trackSheetModal: ModalSettings = {
    type: 'component',
    component: 'trackSheetModal',
    meta: { trackCodes: data.trackCodes, constants: data.constants }
  }

  let trackCodeModal: ModalSettings = {
    type: 'component',
    component: 'trackCodeModal',
    meta: { constants: data.constants }
  }

  let modalStore = getModalStore();
	let toastStore = getToastStore();
  let trackSheets = data.trackSheets;
  let filteredTrackSheets = trackSheets;
  let trackCodes = data.trackCodes;
  let filteredTrackCodes = data.trackCodes;
  let tabSet: number = 0;
  let searchQuery =	'';
  
  if (form) {
    toastStore.trigger({
		  message: String(form?.message),
      background: form?.success ? "bg-accTeal" : "bg-[#930000]",
      classes: "text-white/90 font-medium"
	  });
  }

  $: {
    filteredTrackSheets = trackSheets.filter((trackSheet) => {
      if ((trackSheet.reqCode.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
          trackSheet.description.toLowerCase().includes(searchQuery.toLowerCase().trim()))) {
          return trackSheet;
      }
    })

    filteredTrackCodes = trackCodes.filter((trackCode) => {
      if ((trackCode.description.toLowerCase().includes(searchQuery.toLowerCase().trim()))) {
          return trackCode;
      }
    })

    if (tabSet === Track.Sheet) {
      updatePageSettings(filteredTrackSheets);
    } else if (tabSet === Track.Code) {
      updatePageSettings(filteredTrackCodes);
    }
  }

  let paginationSettings = {
		page: 0,
		limit: 10,
		size: tabSet === Track.Sheet ? filteredTrackSheets.length : filteredTrackCodes.length,
		amounts: [5, 10, 15],
	} satisfies PaginationSettings;

	$: trackSheetPaginatedSource = filteredTrackSheets.slice(
		paginationSettings.page * paginationSettings.limit,
		paginationSettings.page * paginationSettings.limit + paginationSettings.limit
	);

	$: trackCodePaginatedSource = filteredTrackCodes.slice(
		paginationSettings.page * paginationSettings.limit,
		paginationSettings.page * paginationSettings.limit + paginationSettings.limit
	);

	function updatePageSettings(filteredArr: any[]) {
		paginationSettings.size = filteredArr.length;
	}
  
  function openModal(modal: ModalSettings) {
    modalStore.trigger(modal);
  }

  function updateTrackSheet(id: string) {
    if (data.profile?.role.name === "ADMIN" || data.profile?.team.map(team => team.name).includes("Management")) {
      modalStore.trigger({
        type: 'component',
        component: 'updateTrackSheetModal',
        meta: { trackSheet: filteredTrackSheets.find(trackSheet => trackSheet.id === id), trackCodes: data.trackCodes }
      });
    } else {
      modalStore.trigger({
        type: 'component',
        component: 'viewTrackSheetModal',
        meta: { trackSheet: filteredTrackSheets.find(trackSheet => trackSheet.id === id) }
      });
    }
  }

  function updateTrackCode(id: string) {
    modalStore.trigger({
      type: 'component',
      component: 'updateTrackCodeModal',
      meta: { trackCode: filteredTrackCodes.find(trackCode => trackCode.id === id) }
    });
  }
</script>

<svelte:head>
	<title>OFA • Track Spreadsheet</title>
</svelte:head>

<section in:fly={{ y: -10, duration: 200 }}>
  <PageWrapper>
		<svelte:fragment slot="title">
			<h1 class="text-2xl text-usfGreen font-semibold">Track Spreadsheets</h1>
		</svelte:fragment>
		<svelte:fragment slot="title-right">
      <Search bind:value={searchQuery} />
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      {#if data.profile?.role.name === "ADMIN" || data.profile?.team.map(team => team.name).includes("Management")}
        <div class="flex justify-center items-center bg-accSlate w-10 h-10 rounded-full cursor-pointer" on:click={() => { 
            openModal(tabSet === Track.Sheet ? trackSheetModal : trackCodeModal)
          }}>
          <i class="fa-solid fa-plus fa-lg text-white/90"></i>
        </div>
      {/if}
		</svelte:fragment>
		<svelte:fragment slot="content">
      <TabGroup>
        <Tab bind:group={tabSet} name="sheets" value={0}>Sheets</Tab>
        <Tab bind:group={tabSet} name="codes" value={1}>Codes</Tab>
        <svelte:fragment slot="panel">
          {#if tabSet === Track.Sheet}
            <TableWrapper arrLength={filteredTrackSheets.length} bind:paginationSettings={paginationSettings}>
              <svelte:fragment slot="header">
                <thead>
                  <tr class="bg-accSlate text-white/90">
                    <th>Req Code</th>
                    <th>Description</th>
                    <th>Form Type</th>
                    <th>Uploadable</th>
                    <th>Requires Appt.</th>
                  </tr>
                </thead>
              </svelte:fragment>
              <svelte:fragment slot="body">
                <tbody>
                  {#each trackSheetPaginatedSource as trackSheet}
                    <tr on:click={() => updateTrackSheet(trackSheet.id)} class="cursor-pointer">
                      <td class="font-semibold">{trackSheet.reqCode}</td>
                      <td>{trackSheet.description}</td>
                      <td>{trackSheet.formType === "None" ? "-" : trackSheet.formType}</td>
                      <td>
                        {#if trackSheet.uploadable}
                          <i class="fa-solid fa-check fa-lg text-usfGreen"></i>
                        {:else}
                          <i class="fa-solid fa-xmark fa-lg text-black/70"></i>
                        {/if}
                      </td>
                      <td>
                        {#if trackSheet.requiresAdvisor}
                          <i class="fa-solid fa-check fa-lg text-usfGreen"></i>
                        {:else}
                          <i class="fa-solid fa-xmark fa-lg text-black/70"></i>
                        {/if}
                      </td>
                    </tr>
                  {/each}
                </tbody>
              </svelte:fragment>
              <svelte:fragment slot="none">
                <p>There are no sheets that match your search.</p>
              </svelte:fragment>
            </TableWrapper>
          {:else if tabSet === Track.Code}
            <TableWrapper arrLength={filteredTrackCodes.length} bind:paginationSettings={paginationSettings}>
              <svelte:fragment slot="header">
                <thead>
                  <tr class="bg-accSlate text-white/90">
                    <th>Indicator</th>
                    <th>Description</th>
                    <th>Satisfied</th>
                  </tr>
                </thead>
              </svelte:fragment>
              <svelte:fragment slot="body">
                <tbody>
                  {#each trackCodePaginatedSource as trackCode}
                    <tr on:click={() => updateTrackCode(trackCode.id)} class="cursor-pointer">
                      <td>
                        <div class="bg-accSlate text-white/80 px-3 py-1 w-fit rounded-md font-medium">
                          <p class="text-white/80 font-semibold">{trackCode.statusIndicator}</p>
                        </div>
                      </td>
                      <td>{trackCode.description}</td>
                      <td>
                        <div class="{trackCode.satisfied ? "bg-usfGreen" : "bg-red-700"} text-white/80 px-3 py-1 w-fit rounded-md font-medium">
                          <p class="text-white/80 font-semibold">{trackCode.satisfied ? "Yes" : "No"}</p>
                        </div>
                      </td>
                    </tr>
                  {/each}
                </tbody>
              </svelte:fragment>
              <svelte:fragment slot="none">
                <p>There are no codes that match your search.</p>
              </svelte:fragment>
            </TableWrapper>
          {/if}
        </svelte:fragment>
      </TabGroup>
		</svelte:fragment>
	</PageWrapper>
</section>

<style>
  th {
    border: none;
  }

  tr:nth-last-child(1) {
    border: none;
  }

	tbody tr:nth-child(n):hover {
		background-color: rgba(167, 167, 167, 0.298)
	}
</style>