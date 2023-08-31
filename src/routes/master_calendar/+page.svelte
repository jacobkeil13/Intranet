<script context="module">
	import Search from '$lib/components/Search.svelte';
	import { getDateLocal } from '$lib/helpers.js';
	import { localStorageStore } from '@skeletonlabs/skeleton';
	let keyBar = localStorageStore("keyBar", true);
</script>

<script lang="ts">
	import { Table, type PaginationSettings, Paginator, tableMapperValues, type ModalSettings, modalStore, toastStore } from '@skeletonlabs/skeleton';
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	export let form;
	export let data;

	if (form) {
    toastStore.trigger({
		  message: String(form?.message),
      background: form?.success ? "bg-accTeal" : "bg-[#930000]",
      classes: "text-white/90 font-medium"
	  });
  }

	const masterCalendarModal: ModalSettings = {
		type: 'component',
		component: 'masterCalendarModal',
		meta: { constants: data.constants }
	}

	let sourceData: any[] = [];
	let filteredSourceData: any[] = [];
	let searchQuery =	'';
	let items = data.masterCalendarItems;
	$: gridCols = $keyBar ? 'grid-cols-[auto_250px]' : 'grid-cols-1';

	onMount(() => {
		items.forEach((item) => {
			let tr = {
				id: item.id,
				dueDate: getDateLocal(item.dueDate.toISOString(), "YYYY-MM-DD"),
				type: item.type.name,
				title: item.title,
				who: item.primaryOwner.first_name + " " + item.primaryOwner.last_name + "<br>+" + item.secondaryOwners.length + " others",
				completionDate: item.completionDate ? getDateLocal(item.completionDate.toISOString(), "YYYY-MM-DD") : "-"
			}
			sourceData.push(tr);
		});
		filteredSourceData = sourceData
	});

	function toggleKey() {
		$keyBar = !$keyBar;
	}

	$: {
    filteredSourceData = sourceData.filter((item: any) => {
      if (item.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
					item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
					item.who.toLowerCase().includes(searchQuery.toLowerCase())) {
        return item;
      }
    })
		updatePageSettings(filteredSourceData);
  }

	const headers: string[] = ['Due', 'Type', 'Title', 'Who', 'Completion Date'];
	const body: string[] = ['dueDate', 'type', 'title', 'who', 'completionDate'];
	const meta: string[] = ['id'];
	let page = { offset: 0, limit: 25, size: sourceData.length, amounts: [5, 10, 25] } as PaginationSettings;
  let state = { firstLast: false, previousNext: true };
	$: sourceDataSliced = filteredSourceData.slice(page.offset * page.limit, page.offset * page.limit + page.limit);

	function updatePageSettings(filteredArr: any[]) {
		page.size = filteredArr.length;
		page.offset = 0
	}

	function openModal(modal: ModalSettings) {
		modalStore.trigger(modal);
	}

	function selectionHandler(e: CustomEvent) {
		console.log(e.detail);
		
    modalStore.trigger({
      type: 'component',
      component: 'updateMasterCalendarModal',
      meta: { item: items.find(item => item.id === e.detail[0]), constants: data.constants }
    });
	}
</script>

<section in:fly={{ y: -10, duration: 200 }}>
	<div class="grid {gridCols} auto-rows-min gap-x-4">
		<div class="flex justify-between items-center">
			<h1 class="text-2xl text-usfGreen font-semibold">Master Calendar</h1>
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<div class="flex items-center space-x-2">
				<Search bind:value={searchQuery} />
				<div class="flex justify-center items-center bg-accSlate p-[6px] rounded-full cursor-pointer" on:click={() => { openModal(masterCalendarModal) }}>
					<box-icon class="fill-white/90" name={"plus"} />
				</div>
				<div class="flex justify-center items-center bg-accSlate p-[6px] rounded-full cursor-pointer" on:click={toggleKey}>
					<box-icon class="fill-white/90" name={$keyBar ? 'x' : 'key'} />
				</div>
			</div>
		</div>
	</div>
	<br />
	<div class="grid {gridCols} auto-rows-min gap-x-4 gap-y-0" style="align-items: flex-start;">
		<section>
			<Table on:selected={selectionHandler} interactive={true} source={{ head: headers, body: tableMapperValues(sourceDataSliced, body), meta: tableMapperValues(sourceDataSliced, meta)}} regionHeadCell="bg-accSlate text-white/90" />
			<br />
			<Paginator buttonClasses="bg-accSlate fill-white" bind:settings={page} showFirstLastButtons={state.firstLast} showPreviousNextButtons={state.previousNext} />
		</section>
		{#if $keyBar}
			<div class="bg-accSlate rounded-lg p-3 text-white/90">
				<h1 class="font-medium mb-2">Type Key:</h1>
				<div class="grid grid-cols-[auto_auto_1.5fr] gap-x-2">
					{#each data.masterCalendarTypes as masterCalendarType}
						<h1 class="font-medium text-accApple">{masterCalendarType.type}</h1>
						<h1>=</h1>
						<h1>{masterCalendarType.name}</h1>
					{/each}
				</div>
			</div>
		{/if}
	</div>
</section>