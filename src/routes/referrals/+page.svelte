<script lang="ts">
	import Search from '$lib/components/Search.svelte';
	import { getDateLocal } from '$lib/helpers.js';
	import { type PaginationSettings, getToastStore, getModalStore, RadioGroup, RadioItem } from '@skeletonlabs/skeleton';
	import { fly } from 'svelte/transition';
	import { page } from '$app/stores';
	import moment from 'moment';
	import TableWrapper from '$lib/components/TableWrapper.svelte';
	import Popup from '$lib/components/Popup.svelte';
	import PageWrapper from '$lib/components/PageWrapper.svelte';
	export let form;
	export let data;

	let modalStore = getModalStore();
	let toastStore = getToastStore();
	if (form) {
    toastStore.trigger({
		  message: String(form?.message),
      background: form?.success ? "bg-accTeal" : "bg-[#930000]",
      classes: "text-white/90 font-medium"
	  });
  }

	let filter = 'all';
	let complete = 'pending';
	let searchQuery =	$page.url.searchParams.get("search") === null ? '' : String($page.url.searchParams.get("search"));
	let referrals = data.referrals;
	let filteredReferrals = data.referrals;

	$: {
    filteredReferrals = referrals.filter((referral) => {
			let owner = referral.escalationUser === null ? referral.counterUser : referral.escalationUser;
      if (referral.studentName?.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
				referral.studentUid?.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
				owner.toLowerCase().includes(searchQuery.toLowerCase().trim())) {
				if (complete === "completed" && referral.completed) {
					if (referral.escalationUser && filter === "escalated") {
						return referral;
					} else if (referral.researchUser && filter === "research") {
						return referral;
					} else if (filter === "all") {
						return referral;
					}
				} else if (complete === "pending" && !referral.completed) {
					if (referral.escalationUser && filter === "escalated") {
						return referral;
					} else if (referral.researchUser && filter === "research") {
						return referral;
					} else if (filter === "all") {
						return referral;
					}
				}
      }
    })
		updatePageSettings(filteredReferrals);
  }

	let paginationSettings = {
		page: 0,
		limit: 10,
		size: filteredReferrals.length,
		amounts: [5, 10, 15],
	} satisfies PaginationSettings;

	$: paginatedSource = filteredReferrals.slice(
		paginationSettings.page * paginationSettings.limit,
		paginationSettings.page * paginationSettings.limit + paginationSettings.limit
	);

	function updatePageSettings(filteredArr: any[]) {
		paginationSettings.size = filteredArr.length;
	}

	function updateReferral(idx: string) {
    modalStore.trigger({
      type: 'component',
      component: 'updateReferralModal',
      meta: { referral: referrals.find(referral => referral.id === idx) }
    });
  }

	function openModal(modal: string, meta: object) {
		modalStore.trigger({
			type: 'component',
			component: modal,
			meta
		})
	}

	function resetFilters() {
		filter = 'all';
		complete = 'pending';
		searchQuery = '';
		filteredReferrals = referrals;
	}
</script>

<svelte:head>
	<title>OFA • Referrals</title>
</svelte:head>

<section in:fly={{ y: -10, duration: 200 }}>
	<PageWrapper>
		<svelte:fragment slot="title">
			<h1 class="text-2xl text-usfGreen font-semibold">{complete === "pending" ? "Pending" : "Completed"} {filter === "all" ? "" : filter === "escalated" ? "Escalated" : "Research"} Referrals</h1>
		</svelte:fragment>
		<svelte:fragment slot="title-right">
      <Search bind:value={searchQuery} />
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<div class="flex justify-center items-center bg-accSlate w-10 h-10 rounded-full cursor-pointer" 
				on:click={() => { openModal("appointmentModal", { constants: data.constants, appointmentReasons: data.appointmentReasons, visitCounterReasons: data.visitCounterReasons })
			}}>
				<i class="fa-solid fa-plus fa-lg text-white/90"></i>
			</div>
		</svelte:fragment>
		<svelte:fragment slot="filters">
			<RadioGroup background="bg-transparent" active="bg-accSlate text-white/90" class="mt-0" rounded="rounded-md">
				<RadioItem bind:group={complete} name="complete" value="pending">Pending</RadioItem>
				<RadioItem bind:group={complete} name="complete" value="completed">Completed</RadioItem>
			</RadioGroup>
			<RadioGroup background="bg-transparent" active="bg-accSlate text-white/90" class="mt-0" rounded="rounded-md">
				<RadioItem bind:group={filter} name="filter" value="all">All</RadioItem>
				<RadioItem bind:group={filter} name="filter" value="escalated">Escalated</RadioItem>
				<RadioItem bind:group={filter} name="filter" value="research">Research</RadioItem>
			</RadioGroup>
			<button class="bg-accSlate/80 text-white/90 font-medium rounded-md px-4 py-2"
				on:click={resetFilters}
			>
				Reset Filters
			</button>
		</svelte:fragment>
		<svelte:fragment slot="content">
			<TableWrapper arrLength={filteredReferrals.length} bind:paginationSettings={paginationSettings}>
				<svelte:fragment slot="header">
					<thead>
						<tr class="bg-accSlate text-white/90">
							<th class="table-cell-fit">Status</th>
							<th>Due</th>
							<th>Name</th>
							<th>UID</th>
							<th>Assigned User</th>
							<th>Last Updated By</th>
						</tr>
					</thead>
				</svelte:fragment>
				<svelte:fragment slot="body">
					<tbody>
						{#each paginatedSource as referral}
							<tr on:click={() => updateReferral(referral.id)} class="cursor-pointer">
								<td class="flex items-center gap-3">
									{#if moment(referral.bestTimeCallback).isBefore(new Date(), "day") && !referral.completed}
										<h1 class="px-3 py-1 bg-red-600 text-white/80 rounded-md font-bold">Overdue</h1>
									{/if}
									{#if referral.referralType !== "Self Referral"}
										<Popup>
											<svelte:fragment slot="content">
												<div
												class:bg-red-600={referral.escalationUser !== null}
												class:bg-orange-400={referral.researchUser !== null}
												class="rounded-full h-5 w-5 [&>*]:pointer-events-none cursor-pointer"
											></div>
											</svelte:fragment>
											<svelte:fragment slot="popup">
												<p class="text-white/80 font-semibold">{referral.referralType ?? ""}</p>
												<p class="text-white/80">{referral.researchUser === null ? referral.escalationUser : referral.researchUser}</p>
											</svelte:fragment>
										</Popup>
									{/if}
								</td>
								<td>{getDateLocal(referral.bestTimeCallback.toISOString(), "MMMM Do")}</td>
								<td>{referral.studentName}</td>
								<td>{referral.studentUid}</td>
								<td>{referral.escalationUser === null ? referral.counterUser : referral.escalationUser}</td>
								<td>{referral.lastUpdatedBy ?? "-"}</td>
							</tr>
						{/each}
					</tbody>
				</svelte:fragment>
				<svelte:fragment slot="none">
					<p>There are no referrals that match your search.</p>
				</svelte:fragment>
			</TableWrapper>
		</svelte:fragment>
	</PageWrapper>
</section>