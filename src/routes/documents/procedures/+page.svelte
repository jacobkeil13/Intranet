<script lang="ts">
	import Search from '$lib/components/Search.svelte';
  import { fly } from 'svelte/transition';
  import { getToastStore, Tab, TabGroup, getModalStore, type ModalSettings, type PaginationSettings, RadioGroup, RadioItem } from '@skeletonlabs/skeleton';
	import { getDateLocal } from '$lib/helpers.js';
	import { page } from '$app/stores';
	import TableWrapper from '$lib/components/TableWrapper.svelte';
	import PageWrapper from '$lib/components/PageWrapper.svelte';
	import moment from 'moment';
  export let form;
  export let data;

  enum AidYear {
    All = 0,
    Current = 1,
    Next = 2,
    NonYear = 3
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
  let procedures = data.procedures;
  let filteredProcedures = data.procedures;
  let tabSet: number = 0;
  let searchQuery =	$page.url.searchParams.get("search") === null ? '' : String($page.url.searchParams.get("search"));

  $: {
    filteredProcedures = procedures.filter((procedure) => {
      let owner = procedure.owner.first_name + " " + procedure.owner.last_name;
      let aidYear = '';
      if (tabSet === AidYear.All) {
        aidYear = "All"
      } else if (tabSet === AidYear.Current) {
        aidYear = moment().subtract(1, "years").format("YY") + moment().format("YY");
      } else if (tabSet === AidYear.Next) {
        aidYear = moment().format("YY") + moment().add(1, "years").format("YY");
      } else if (tabSet === AidYear.NonYear) {
        aidYear = "Non-Year"
      }
      if ((procedure.fileName.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
          owner.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
          procedure.aidYear.name.toLowerCase().includes(searchQuery.toLowerCase().trim()))) {
          if (aidYear === "All") {
            return procedure;
          }
          if (procedure.aidYear.name === aidYear) {
            return procedure;
          }
      }
    })
    updatePageSettings(filteredProcedures);
  }

  let paginationSettings = {
		page: 0,
		limit: 10,
		size: filteredProcedures.length,
		amounts: [5, 10, 15],
	} satisfies PaginationSettings;

	$: paginatedSource = filteredProcedures.slice(
		paginationSettings.page * paginationSettings.limit,
		paginationSettings.page * paginationSettings.limit + paginationSettings.limit
	);

	function updatePageSettings(filteredArr: any[]) {
		paginationSettings.size = filteredArr.length;
	}

  const procedureModal: ModalSettings = {
		type: 'component',
		component: 'standardProcedureModal',
		meta: { constants: data.constants }
	}

  function openModal(modal: ModalSettings) {
		modalStore.trigger(modal);
	}

  function updateProcedure(id: string) {
    if (data.profile?.role.name !== "ADMIN") {
      let proc = procedures.find(procedure => procedure.id === id);
      window.open(`
        https://tup-ofa.forest.usf.edu/files/procedures/${proc?.aidYear.name}/${proc?.aidYear.name} ${proc?.fileName}.${proc?.extension}
      `,'_newtab');
      return;
    }

    modalStore.trigger({
      type: 'component',
      component: 'updateStandardProcedureModal',
      meta: { procedure: procedures.find(procedure => procedure.id === id), constants: data.constants }
    });
  }

  function resetFilters() {
		filter = 'all';
		searchQuery = '';
	}
</script>

<svelte:head>
	<title>OFA • Procedures</title>
</svelte:head>

<section in:fly={{ y: -10, duration: 200 }}>
  <PageWrapper>
		<svelte:fragment slot="title">
			<h1 class="text-2xl text-usfGreen font-semibold">{filter === "my" ? "My" : ""} Standards & Procedures</h1>
		</svelte:fragment>
		<svelte:fragment slot="title-right">
      <Search bind:value={searchQuery} />
      <!-- svelte-ignore a11y-click-events-have-key-events -->
			{#if data.profile?.role.name === "ADMIN"}
        <div class="flex justify-center items-center bg-accSlate w-10 h-10 rounded-full cursor-pointer" on:click={() => { openModal(procedureModal) }}>
          <i class="fa-solid fa-plus fa-lg text-white/90"></i>
        </div>
      {/if}
		</svelte:fragment>
		<svelte:fragment slot="filters">
			<RadioGroup background="bg-transparent" active="bg-accSlate text-white/90" class="mt-0" rounded="rounded-md">
				<RadioItem bind:group={filter} name="visitorType" value="all">All</RadioItem>
				<RadioItem bind:group={filter} name="visitorType" value="my">My S&P's</RadioItem>
			</RadioGroup>
			<button class="bg-accSlate/80 text-white/90 font-medium rounded-md px-4 py-2"
				on:click={resetFilters}
			>
				Reset Filters
			</button>
		</svelte:fragment>
		<svelte:fragment slot="content">
			<TabGroup>
        <Tab bind:group={tabSet} name="all" value={0}>All</Tab>
        <Tab bind:group={tabSet} name="current" value={1}>2022-2023</Tab>
        <Tab bind:group={tabSet} name="next" value={2}>2023-2024</Tab>
        <Tab bind:group={tabSet} name="nonyear" value={3}>Non-Year</Tab>
        <!-- Tab Panels --->
        <svelte:fragment slot="panel">
          <TableWrapper arrLength={filteredProcedures.length} bind:paginationSettings={paginationSettings}>
            <svelte:fragment slot="header">
              <thead>
                <tr class="bg-accSlate text-white/90">
                  <th>Extension</th>
                  <th>File Name</th>
                  <th>Aid Year</th>
                  <th>Owner</th>
                  <th>Last Updated</th>
                </tr>
              </thead>
            </svelte:fragment>
            <svelte:fragment slot="body">
              <tbody>
                {#each paginatedSource as procedure}
                    <tr on:click={() => updateProcedure(procedure.id)} class="cursor-pointer">
                      <td>{procedure.extension}</td>
                      <td>{procedure.fileName}</td>
                      <td>{procedure.aidYear.name}</td>
                      <td>{procedure.owner.first_name + " " + procedure.owner.last_name}</td>
                      <td>{getDateLocal(procedure.updatedAt.toISOString(), "MMMM Do, YYYY")}</td>
                    </tr>
                  {/each}
              </tbody>
            </svelte:fragment>
            <svelte:fragment slot="none">
              <p>There are no procedures that match your search.</p>
            </svelte:fragment>
          </TableWrapper>
        </svelte:fragment>
      </TabGroup>
		</svelte:fragment>
	</PageWrapper>
</section>