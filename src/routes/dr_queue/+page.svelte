<script lang="ts">
	import { getDateLocal } from '$lib/helpers.js';
	import { Table, type PaginationSettings, Paginator, tableMapperValues, type ModalSettings, modalStore, toastStore } from '@skeletonlabs/skeleton';
	import { fly } from 'svelte/transition';
	export let data;
	export let form;

	if (form) {
    toastStore.trigger({
		  message: String(form?.message),
      background: form?.success ? "bg-accTeal" : "bg-[#930000]",
      classes: "text-white/90 font-medium"
	  });
  }

	let sourceData: any = [];

	const drQueueModal: ModalSettings = {
		type: 'component',
		component: 'drQueueModal',
		meta: { 
			constants: data.constants,
			eptTeam: data.eptTeam
		}
	};

	let dataQueueRequests = data.requests;

	dataQueueRequests.forEach((req) => {
		let tr = {
			id: req.id,
			priority: req.priority.name,
			type: req.requestType.name,
			title: req.title,
			dateSubmitted: getDateLocal(req.createdAt.toISOString(), "YYYY-MM-DD"),
			requestor: req.requestedBy.first_name + ' ' + req.requestedBy.last_name,
			assignedUser: req.assignedTo !== null ? req.assignedTo.first_name + " " + req.assignedTo.last_name : "-"
		};

		sourceData.push(tr);
	});

	const headers: string[] = ['Priority', 'Type', 'Title', 'Date Submitted', 'Requestor', 'Assigned User'];
	const body: string[] = ['priority', 'type', 'title', 'dateSubmitted', 'requestor', 'assignedUser'];
	const meta: string[] = ['id'];
	let page = { offset: 0, limit: 10, size: sourceData.length, amounts: [5, 10, 15] } as PaginationSettings;
  let state = { firstLast: false, previousNext: true };
	$: sourceDataSliced = sourceData.slice(page.offset * page.limit, page.offset * page.limit + page.limit);

	function openModal(modal: ModalSettings) {
		modalStore.trigger(modal);
	}

	function updateRequest(e: CustomEvent) {
		console.log(e.detail);
    modalStore.trigger({
      type: 'component',
      component: 'updateDrQueueModal',
      meta: { request: dataQueueRequests.find(req => req.id === e.detail[0]), eptTeam: data.eptTeam, constants: data.constants }
    });
  }
</script>

<section in:fly={{ y: -10, duration: 200 }}>
	<span class="flex justify-between items-center">
		<h1 class="text-2xl text-usfGreen font-semibold">Data Request Queue</h1>
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<div class="flex justify-center items-center bg-accSlate p-[6px] rounded-full cursor-pointer" on:click={() => { openModal(drQueueModal) }}>
			<box-icon class="fill-white/90" name={'plus'}></box-icon>
		</div>
	</span>
	<br />
	<Table on:selected={updateRequest} interactive={true} source={{ head: headers, body: tableMapperValues(sourceDataSliced, body), meta: tableMapperValues(sourceDataSliced, meta)}} regionHeadCell="bg-accSlate text-white/90" />
	<br />
	<Paginator buttonClasses="bg-accSlate fill-white" bind:settings={page} showFirstLastButtons={state.firstLast} showPreviousNextButtons={state.previousNext} />
</section>
