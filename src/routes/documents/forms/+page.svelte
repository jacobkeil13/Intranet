<script lang="ts">
	import Search from '$lib/components/Search.svelte';
  import { fly } from 'svelte/transition';
  import { toastStore, Tab, TabGroup, modalStore, type ModalSettings, Paginator, Table, tableMapperValues, type PaginationSettings } from '@skeletonlabs/skeleton';
	import { getDateLocal } from '$lib/helpers.js';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
  export let form;
  export let data;

  enum AidYear {
    All = 0,
    Current = 1,
    Next = 2,
    NonYear = 3
  }

  if (form) {
    toastStore.trigger({
		  message: String(form?.message),
      background: form?.success ? "bg-accTeal" : "bg-[#930000]",
      classes: "text-white/90 font-medium"
	  });
  }

  let forms = data.forms;
  let tabSet: number = 0;
  let searchQuery =	$page.url.searchParams.get("search") === null ? '' : String($page.url.searchParams.get("search"));
	let sourceData: any[] = [];
	let filteredSourceData: any[] = [];

  onMount(() => {
		forms.forEach((form) => {
			let tr = {
				id: form.id,
        aidYear: form.aidYear.name,
				rraareqCode: form.rraareqCode,
				fileName: form.name,
				owner: form.owner.first_name + " " + form.owner.last_name,
				lastUpdated: getDateLocal(form.updatedAt.toISOString(), "MMMM Do, h:mmA"),
			}
			sourceData.push(tr);
		});
		filteredSourceData = sourceData
	});

  $: {
    filteredSourceData = sourceData.filter((form: any) => {
      let aidYear = '';
      if (tabSet === AidYear.All) {
        aidYear = "All"
      } else if (tabSet === AidYear.Current) {
        aidYear = "2223"
      } else if (tabSet === AidYear.Next) {
        aidYear = "2324"
      } else if (tabSet === AidYear.NonYear) {
        aidYear = "Non-Year"
      }
      if ((form.fileName.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        form.owner.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        form.rraareqCode.toLowerCase().includes(searchQuery.toLowerCase().trim()))) {
          if (aidYear === "All") {
            return form;
          }
          if (form.aidYear === aidYear) {
            return form;
          }
      }
    })
    updatePageSettings(filteredSourceData);
  }

  const headers: string[] = ['RRAAREQ Code', 'Aid Year', 'File Name', 'Owner', 'Last Updated'];
	const body: string[] = ['rraareqCode', 'aidYear', 'fileName', 'owner', 'lastUpdated'];
	const meta: string[] = ['id'];
  let state = { firstLast: false, previousNext: true };
	let pageSettings = { offset: 0, limit: 10, size: filteredSourceData.length, amounts: [5, 10, 15] } as PaginationSettings;
	$: sourceDataSliced = filteredSourceData.slice(pageSettings.offset * pageSettings.limit, pageSettings.offset * pageSettings.limit + pageSettings.limit);

	function updatePageSettings(filteredArr: any[]) {
		pageSettings.size = filteredArr.length;
		pageSettings.offset = 0
	}

  const formModal: ModalSettings = {
		type: 'component',
		component: 'formModal',
		meta: { constants: data.constants }
	}

  function openModal(modal: ModalSettings) {
		modalStore.trigger(modal);
	}

  function updateForm(e: CustomEvent) {
    if (data.profile?.role.name !== "ADMIN") {
      let form = forms.find(form => form.id === e.detail[0]);
      window.open(`
        https://tup-ofa.forest.usf.edu/files/forms/${form?.web ? "internet" : "intranet"}/${form?.aidYear.name}/${form?.aidYear.name}_${form?.rraareqCode}.pdf
      `,'_newtab');
      return;
    }

    modalStore.trigger({
      type: 'component',
      component: 'updateFormModal',
      meta: { form: forms.find(form => form.id === e.detail[0]), constants: data.constants }
    });
  }
</script>

<svelte:head>
	<title>OFA • Forms</title>
</svelte:head>

<section in:fly={{ y: -10, duration: 200 }}>
  <div class="flex justify-between items-center">
    <h1 class="text-2xl text-usfGreen font-semibold">Forms</h1>
    <div class="flex justify-center items-center space-x-4">
      <Search bind:value={searchQuery} />
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      {#if data.profile?.role.name === "ADMIN"}
        <div class="flex justify-center items-center bg-accSlate p-[6px] rounded-full cursor-pointer" on:click={() => { openModal(formModal) }}>
          <box-icon class="fill-white/90" name={"plus"} />
        </div>
      {/if}
    </div>
  </div>
  <br>
  <TabGroup>
    <Tab bind:group={tabSet} name="all" value={0}>All</Tab>
    <Tab bind:group={tabSet} name="current" value={1}>2022-2023</Tab>
    <Tab bind:group={tabSet} name="next" value={2}>2023-2024</Tab>
    <Tab bind:group={tabSet} name="nonyear" value={3}>Non-Year</Tab>
    <!-- Tab Panels --->
    <svelte:fragment slot="panel">
      {#if filteredSourceData.length >= 1}
				<section>
					<Table on:selected={updateForm} interactive={true} source={{ head: headers, body: tableMapperValues(sourceDataSliced, body), meta: tableMapperValues(sourceDataSliced, meta)}} regionHeadCell="bg-accSlate text-white/90" />
					<br />
					<Paginator buttonClasses="bg-accSlate fill-white"  bind:settings={pageSettings} showFirstLastButtons={state.firstLast} showPreviousNextButtons={state.previousNext} />
				</section>
			{:else}
				<p>No forms match this search.</p>
			{/if}
    </svelte:fragment>
  </TabGroup>
</section>