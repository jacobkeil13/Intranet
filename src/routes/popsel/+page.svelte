<script lang="ts">
	import Search from '$lib/components/Search.svelte';
	import { Table, type PaginationSettings, Paginator, tableMapperValues, toastStore, modalStore } from '@skeletonlabs/skeleton';
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { getDateLocal, openModal } from '$lib/helpers.js';
	export let form;
	export let data;

	if (form) {
    toastStore.trigger({
		  message: String(form?.message),
      background: form?.success ? "bg-accTeal" : "bg-[#930000]",
      classes: "text-white/90 font-medium"
	  });
  }

	let sourceData: any[] = [];
	let filteredSourceData: any[] = [];
	let searchQuery =	'';
	let popsels = data.popsels;

	onMount(() => {
		popsels.forEach((popsel) => {
			let tr = {
				id: popsel.id,
				letterCode: popsel.letterCode.name,
				selectionId: popsel.selectionId,
				letterCount: popsel.letterCount,
				requestedBy: popsel.requestedBy.first_name + " " + popsel.requestedBy.last_name,
				requestedOn: getDateLocal(popsel.createdAt.toISOString(), "LLL")
			}
			sourceData.push(tr);
		});
		filteredSourceData = sourceData
	});

	$: {
    filteredSourceData = sourceData.filter((popsel: any) => {
      if (popsel.letterCode.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
					popsel.selectionId.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
					popsel.letterCount.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
					popsel.requestedBy.toLowerCase().includes(searchQuery.toLowerCase().trim())) {
        return popsel;
      }
    })
		updatePageSettings(filteredSourceData);
  }

	const headers: string[] = ['Letter Code', 'Selection ID', 'Letter Count', 'Requested By', 'Requested Date'];
	const body: string[] = ['letterCode', 'selectionId', 'letterCount', 'requestedBy', 'requestedOn'];
	const meta: string[] = ['id'];
  let state = { firstLast: false, previousNext: true };
	let page = { offset: 0, limit: 10, size: filteredSourceData.length, amounts: [5, 10, 256] } as PaginationSettings;
	$: sourceDataSliced = filteredSourceData.slice(page.offset * page.limit, page.offset * page.limit + page.limit);

	function updatePageSettings(filteredArr: any[]) {
		page.size = filteredArr.length;
		page.offset = 0
	}

  function deletePopsel(e: CustomEvent) {
    if (data.user.role !== "ADMIN") return;
    console.log(e.detail[0]);
    modalStore.trigger({
      type: 'component',
      component: "confirmDeleteModal",
      meta: { response: async (r: boolean) => {
        if (!r) {
          return;
        };
        const formData = new FormData();
        formData.append('id', e.detail[0]);
        await fetch("/popsel?/delete", {
          method: 'POST',
          body: formData,
        })

        toastStore.trigger({
          message: String("Popsel deleted successfully!"),
          background: "bg-accTeal",
          classes: "text-white/90 font-medium"
        });

        sourceData = sourceData.filter(popsel => popsel.id !== e.detail[0]);
      }}
    })
  }
</script>

<svelte:head>
	<title>OFA • Population Selections</title>
</svelte:head>

<section in:fly={{ y: -10, duration: 200 }}>
		<div class="flex justify-between items-center">
			<h1 class="text-2xl text-usfGreen font-semibold">Population Selections</h1>
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<div class="flex justify-center items-center space-x-4">
				<Search bind:value={searchQuery} />
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<div class="flex justify-center items-center bg-accSlate p-[6px] rounded-full cursor-pointer" on:click={() => { 
            openModal("popselModal", { constants: data.constants, isTeam: data.isTeam }) 
          }}>
          <box-icon class="fill-white/90" name={"plus"} />
        </div>
			</div>
	</div>
	<br />
  {#if filteredSourceData.length > 0}
    <section>
      <Table on:selected={deletePopsel} interactive={true} source={{ head: headers, body: tableMapperValues(sourceDataSliced, body), meta: tableMapperValues(sourceDataSliced, meta)}} regionHeadCell="bg-accSlate text-white/90" />
      <br />
      <Paginator buttonClasses="bg-accSlate fill-white"  bind:settings={page} showFirstLastButtons={state.firstLast} showPreviousNextButtons={state.previousNext} />
    </section>
  {:else}
  <p>No population selections match this search.</p>
  {/if}
</section>