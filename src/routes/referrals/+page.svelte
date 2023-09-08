<script lang="ts">
	import Search from '$lib/components/Search.svelte';
	import { getDateLocal, openModal } from '$lib/helpers.js';
	import { Table, type PaginationSettings, Paginator, tableMapperValues, toastStore, SlideToggle, modalStore } from '@skeletonlabs/skeleton';
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { page } from '$app/stores';
	export let form;
	export let data;

	if (form) {
    toastStore.trigger({
		  message: String(form?.message),
      background: form?.success ? "bg-accTeal" : "bg-[#930000]",
      classes: "text-white/90 font-medium"
	  });
  }

	let filterCompleted = false;
	let sourceData: any[] = [];
	let filteredSourceData: any[] = [];
	let searchQuery =	$page.url.searchParams.get("search") === null ? '' : String($page.url.searchParams.get("search"));
	let referrals = data.referrals;

	onMount(() => {
		referrals.forEach((referral) => {
			let tr = {
				id: referral.id,
				dateTime: getDateLocal(referral.bestTimeCallback.toISOString(), "MMMM Do, h:mmA"),
				name: referral.studentName,
				uid: referral.studentUid,
				assignedUser: referral.counterUser,
				lastUpdatedBy: referral.lastUpdatedBy,
				completed: referral.completed
			}
			sourceData.push(tr);
		});
		filteredSourceData = sourceData
	});

	$: {
    filteredSourceData = sourceData.filter((referral: any) => {
      if (referral.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
				referral.uid.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
				referral.assignedUser.toLowerCase().includes(searchQuery.toLowerCase().trim())) {
				if (filterCompleted && referral.completed) {
					return referral;
				}
				if (!filterCompleted && !referral.completed) {
					return referral;
				}
      }
    })
		updatePageSettings(filteredSourceData);
  }

	const headers: string[] = ['Date & Time', 'Name', 'UID', 'Assigned User', 'Last Updated By'];
	const body: string[] = ['dateTime', 'name', 'uid', 'assignedUser', 'lastUpdatedBy'];
	const meta: string[] = ['id'];
  let state = { firstLast: false, previousNext: true };
	let pageSettings = { offset: 0, limit: 10, size: filteredSourceData.length, amounts: [5, 10, 15] } as PaginationSettings;
	$: sourceDataSliced = filteredSourceData.slice(pageSettings.offset * pageSettings.limit, pageSettings.offset * pageSettings.limit + pageSettings.limit);

	function updatePageSettings(filteredArr: any[]) {
		pageSettings.size = filteredArr.length;
		pageSettings.offset = 0
	}

	function updateReferral(e: CustomEvent) {
		console.log(e);
		
    modalStore.trigger({
      type: 'component',
      component: 'updateReferralModal',
      meta: { referral: referrals.find(referral => referral.id === e.detail[0]) }
    });
  }
</script>

<svelte:head>
	<title>OFA • Referrals</title>
</svelte:head>

<section in:fly={{ y: -10, duration: 200 }}>
	<div class="flex justify-between items-center">
		<h1 class="text-2xl text-usfGreen font-semibold">{filterCompleted ? "Completed" : "Pending"} Referrals</h1>
		<div class="flex justify-center items-center space-x-4">
			<div class="flex items-center space-x-3">
				<h1 class="font-semibold">Completed</h1>
				<SlideToggle name="completed" size="sm" bind:checked={filterCompleted} />
			</div>
			<Search bind:value={searchQuery} />
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<div class="flex justify-center items-center bg-accSlate p-[6px] rounded-full cursor-pointer" 
				on:click={() => { openModal("appointmentModal", { constants: data.constants, appointmentReasons: data.appointmentReasons, visitCounterReasons: data.visitCounterReasons })
			}}>
				<box-icon class="fill-white/90" name={"plus"} />
			</div>
		</div>
	</div>
	<br />
	{#if filteredSourceData.length >= 1}
		<section>
			<Table on:selected={updateReferral} interactive={true} source={{ head: headers, body: tableMapperValues(sourceDataSliced, body), meta: tableMapperValues(sourceDataSliced, meta)}} regionHeadCell="bg-accSlate text-white/90" />
			<br />
			<Paginator buttonClasses="bg-accSlate fill-white"  bind:settings={pageSettings} showFirstLastButtons={state.firstLast} showPreviousNextButtons={state.previousNext} />
		</section>
	{:else}
		<p>There are no referrals that match your search.</p>
	{/if}
</section>