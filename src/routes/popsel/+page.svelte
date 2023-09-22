<script lang="ts">
	import Search from '$lib/components/Search.svelte';
	import { type PaginationSettings, getToastStore, getModalStore } from '@skeletonlabs/skeleton';
	import { fly } from 'svelte/transition';
	import { getDateLocal } from '$lib/helpers.js';
	import TableWrapper from '$lib/components/TableWrapper.svelte';
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

	let searchQuery =	'';
	$: popsels = data.popsels;
	let filteredPopsels = data.popsels;

	$: {
    filteredPopsels = popsels.filter((popsel) => {
			let requestedBy = popsel.requestedBy.first_name + " " + popsel.requestedBy.last_name;
      if (popsel.letterCode.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
					popsel.selectionId.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
					popsel.letterCount.toString().toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
					requestedBy.toLowerCase().includes(searchQuery.toLowerCase().trim())) {
        return popsel;
      }
    })
		updatePageSettings(filteredPopsels);
  }

	let paginationSettings = {
		page: 0,
		limit: 10,
		size: filteredPopsels.length,
		amounts: [5, 10, 15],
	} satisfies PaginationSettings;

	$: paginatedSource = filteredPopsels.slice(
		paginationSettings.page * paginationSettings.limit,
		paginationSettings.page * paginationSettings.limit + paginationSettings.limit
	);

	function updatePageSettings(filteredArr: any[]) {
		paginationSettings.size = filteredArr.length;
	}

  function updatePopsel(id: string) {
    modalStore.trigger({
      type: 'component',
      component: "updatePopselModal",
      meta: { popsel: popsels.find(popsel => popsel.id === id), constants: data.constants,
				response: async (action: "delete" | "update") => {
					if (action === "delete") {
						popsels = popsels.filter(popsel => popsel.id !== id);
						modalStore.close();
						toastStore.trigger({
							message: String("Popsel deleted successfully!"),
							background: "bg-accTeal",
							classes: "text-white/90 font-medium"
						});
						return;
					};

					toastStore.trigger({
						message: "Popsel updated successfully!",
						background: "bg-accTeal",
						classes: "text-white/90 font-medium"
					});

					let res = await fetch('/api/popsel?id=' + id);
					let resp = await res.json();
					let newPopsel = resp.popsels;

					popsels = popsels.map(popsel => popsel.id === newPopsel.id ? newPopsel : popsel);
      }}
    })
  }

	function openModal(modal: string, meta: object) {
		modalStore.trigger({
			type: 'component',
			component: modal,
			meta
		})
	}
</script>

<svelte:head>
	<title>OFA • Population Selections</title>
</svelte:head>

<section in:fly={{ y: -10, duration: 200 }}>
	<PageWrapper>
		<svelte:fragment slot="title">
			<h1 class="text-2xl text-usfGreen font-semibold">Population Selections</h1>
		</svelte:fragment>
		<svelte:fragment slot="title-right">
      <Search bind:value={searchQuery} />
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<div class="flex justify-center items-center bg-accSlate w-10 h-10 rounded-full cursor-pointer" 
				on:click={() => { openModal("popselModal", { constants: data.constants, isTeam: data.isTeam }) }}
			>
				<i class="fa-solid fa-plus fa-lg text-white/90"></i>
			</div>
		</svelte:fragment>
		<svelte:fragment slot="content">
			<TableWrapper arrLength={filteredPopsels.length} bind:paginationSettings={paginationSettings}>
				<svelte:fragment slot="header">
					<thead>
						<tr class="bg-accSlate text-white/90">
							<th>Letter Code</th>
							<th>Selection ID</th>
							<th>Letter Count</th>
							<th>Requested By</th>
							<th>Requested Date</th>
						</tr>
					</thead>
				</svelte:fragment>
				<svelte:fragment slot="body">
					<tbody>
						{#each paginatedSource as popsel}
							<tr on:click={() => updatePopsel(popsel.id)} class="cursor-pointer">
								<td>{popsel.letterCode.name}</td>
								<td>{popsel.selectionId}</td>
								<td>{popsel.letterCount}</td>
								<td>{popsel.requestedBy.first_name + " " + popsel.requestedBy.last_name}</td>
								<td>{getDateLocal(popsel.createdAt.toISOString(), "LLL")}</td>
							</tr>
						{/each}
					</tbody>
				</svelte:fragment>
				<svelte:fragment slot="none">
					<p>There are no population selections that match this search.</p>
				</svelte:fragment>
			</TableWrapper>
		</svelte:fragment>
	</PageWrapper>
</section>