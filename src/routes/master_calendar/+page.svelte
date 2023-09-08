<script context="module">
	import Search from '$lib/components/Search.svelte';
	import { getDateLocal } from '$lib/helpers.js';
	import { RadioGroup, RadioItem, localStorageStore } from '@skeletonlabs/skeleton';
	let keyBar = localStorageStore("keyBar", true);
</script>

<script lang="ts">
	import { Table, type PaginationSettings, Paginator, tableMapperValues, type ModalSettings, modalStore, toastStore } from '@skeletonlabs/skeleton';
	import moment from 'moment';
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

	let todayFilter =	false;
	let weekFilter = false;
	let filter = 'all';
	let month = 'currentMonth';

	let items = data.masterCalendarItems;
	$: gridCols = $keyBar ? 'grid-cols-[auto_250px]' : 'grid-cols-1';

	onMount(() => {
		items.forEach((item) => {
			let tr = {
				id: item.id,
				dueDate: getDateLocal(item.dueDate.toISOString(), "YYYY-MM-DD"),
				type: item.type.name,
				title: item.title,
				who: "<span class='font-bold'>" + item.primaryOwner.first_name + " " + item.primaryOwner.last_name + "</span><br><p class='text-xs'>" + item.secondaryOwners.map(user => " " + user.first_name) + "</p>",
				lastComment: item.comments[0].content,
				completionDate: item.completionDate
			}
			sourceData.push(tr);
		});
		filteredSourceData = sourceData
	});

	$: {
    filteredSourceData = sourceData.filter((item: any) => {
      if (item.type.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
					item.title.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
					item.who.toLowerCase().includes(searchQuery.toLowerCase().trim())) {
				if (todayFilter) {
					if (item.completionDate === null && item.dueDate === moment().format("YYYY-MM-DD")) {
						return item;
					}
				} else if (weekFilter) {
					if (item.completionDate === null && moment(item.dueDate).week() === moment().week()) {
						return item;
					}
				} else {
					if (item.completionDate === null && moment(item.dueDate).format("MMMM") === getMonthString(month)) {
						return item;
					}
				}
      }
    })
		updatePageSettings(filteredSourceData);
		todayFilter = false;
  }

	const headers: string[] = ['Due', 'Type', 'Title', 'Who', 'Notes & Comments'];
	const body: string[] = ['dueDate', 'type', 'title', 'who', 'lastComment'];
	const meta: string[] = ['id'];
	let page = { offset: 0, limit: 25, size: sourceData.length, amounts: [5, 10, 25] } as PaginationSettings;
  let state = { firstLast: false, previousNext: true };
	$: sourceDataSliced = filteredSourceData.slice(page.offset * page.limit, page.offset * page.limit + page.limit);

	function toggleKey() {
		$keyBar = !$keyBar;
	}

	function updatePageSettings(filteredArr: any[]) {
		page.size = filteredArr.length;
		page.offset = 0
	}

	function openModal(modal: ModalSettings) {
		modalStore.trigger(modal);
	}

	function selectionHandler(e: CustomEvent) {
    modalStore.trigger({
      type: 'component',
      component: 'updateMasterCalendarModal',
      meta: { item: items.find(item => item.id === e.detail[0]), constants: data.constants }
    });
	}

	function resetFilters() {
		todayFilter =	false;
		weekFilter = false;
		filter = 'all';
		month = 'currentMonth';
		filteredSourceData = sourceData;
	}

	function getMonthString(monthString: string): string {
		if (monthString === "previousMonth") {
			return moment().subtract(1, "M").format("MMMM");
		} else if (monthString === "current") {
			return moment().format("MMMM");
		} else if (monthString === "nextMonth") {
			return moment().add(1, "M").format("MMMM");
		} else {
			return moment().format("MMMM");
		}
	}
</script>

<svelte:head>
	<title>OFA • Master Calendar</title>
</svelte:head>

<section in:fly={{ y: -10, duration: 200 }}>
	<div class="gap-x-4">
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
	<br>
	<section class="flex flex-wrap items-center gap-2 rounded-md w-fit">
		<button class="bg-accSlate text-white/90 font-medium rounded-md px-4 py-2"
			on:click={() => { 
				todayFilter = true;
				filteredSourceData = sourceData;
			}}
		>
			Today
		</button>
		<button class="bg-accSlate text-white/90 font-medium rounded-md px-4 py-2"
			on:click={() => { 
				weekFilter = true;
				filteredSourceData = sourceData;
			}}
		>
			This Week
		</button>
		<RadioGroup active="bg-accSlate text-white/90" class="mt-0" rounded="rounded-md">
			<RadioItem bind:group={filter} name="visitorType" value="all">All Tasks</RadioItem>
			<RadioItem bind:group={filter} name="visitorType" value="my">My Tasks</RadioItem>
			<RadioItem bind:group={filter} name="visitorType" value="team">Team Tasks</RadioItem>
		</RadioGroup>
		<RadioGroup active="bg-accSlate text-white/90" class="mt-0" rounded="rounded-md">
			<RadioItem bind:group={month} name="visitorType" value="previousMonth">{moment().subtract(1, "M").format("MMMM")}</RadioItem>
			<RadioItem bind:group={month} name="visitorType" value="currentMonth">{moment().format("MMMM")}</RadioItem>
			<RadioItem bind:group={month} name="visitorType" value="nextMonth">{moment().add(1, "M").format("MMMM")}</RadioItem>
		</RadioGroup>
		<button class="bg-accSlate/80 text-white/90 font-medium rounded-md px-4 py-2"
			on:click={resetFilters}
		>
			Reset Filters
		</button>
	</section>
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