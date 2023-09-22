<script lang="ts">
	import Search from '$lib/components/Search.svelte';
  import { fly } from 'svelte/transition';
  import { getToastStore, Tab, TabGroup, getModalStore, type ModalSettings, type PaginationSettings, RadioGroup, RadioItem } from '@skeletonlabs/skeleton';
	import { getDateLocal } from '$lib/helpers.js';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import TableWrapper from '$lib/components/TableWrapper.svelte';
	import PageWrapper from '$lib/components/PageWrapper.svelte';
	import moment from 'moment';
  export let form;
  export let data;

  enum LetterTypes {
    All = 0,
    Email = 1,
    Paper = 2,
    Roremal = 3,
    Old = 4,
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
  let letters = data.letters;
  let filteredLetters = data.letters;
  let tabSet: number = 0;
  let searchQuery =	$page.url.searchParams.get("search") === null ? '' : String($page.url.searchParams.get("search"));

  $: {
    filteredLetters = letters.filter((letter) => {
      let owner = letter.owner.first_name + " " + letter.owner.last_name;
      let letterType = '';
      if (tabSet === LetterTypes.All) {
        letterType = "All"
      } else if (tabSet === LetterTypes.Email) {
        letterType = "Email Letters"
      } else if (tabSet === LetterTypes.Paper) {
        letterType = "Paper Letters"
      } else if (tabSet === LetterTypes.Roremal) {
        letterType = "ROREMAL"
      } else if (tabSet === LetterTypes.Old) {
        letterType = "Old Letters"
      }
      if ((letter.letterCode.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        letter.letterType.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        letter.letterGroup?.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        owner.toLowerCase().includes(searchQuery.toLowerCase().trim()))) {
          if (letterType === "All") {
            return letter;
          }
          if (letter.letterType.name === letterType) {
            return letter;
          }
      }
    })
    updatePageSettings(filteredLetters);
  }

  let paginationSettings = {
		page: 0,
		limit: 10,
		size: filteredLetters.length,
		amounts: [5, 10, 15],
	} satisfies PaginationSettings;

	$: paginatedSource = filteredLetters.slice(
		paginationSettings.page * paginationSettings.limit,
		paginationSettings.page * paginationSettings.limit + paginationSettings.limit
	);

	function updatePageSettings(filteredArr: any[]) {
		paginationSettings.size = filteredArr.length;
	}

  const letterModal: ModalSettings = {
		type: 'component',
		component: 'letterModal',
		meta: { constants: data.constants }
	}

  function openModal(modal: ModalSettings) {
		modalStore.trigger(modal);
	}

  function updateLetter(id: string) {
    if (data.profile?.role.name !== "ADMIN") {
      let letter = letters.find(letter => letter.id === id);
      if (letter?.letterType.name ===  "Paper Letters" || letter?.letterType.name ===  "Email Letters") {
        window.open(`
          https://tup-ofa.forest.usf.edu/files/letters/${letter?.letterType.name.replace(" ", "")}/${letter.letterGroup?.name}/${letter.letterCode.name}.pdf
        `,'_newtab');
        return;
      }
      window.open(`
        https://tup-ofa.forest.usf.edu/files/letters/${letter?.letterType.name.replace(" ", "")}/${letter?.letterCode.name}.pdf
      `,'_newtab');
      return;
    }
    
    modalStore.trigger({
      type: 'component',
      component: 'updateLetterModal',
      meta: { letter: letters.find(letter => letter.id === id), constants: data.constants }
    });
  }

  function resetFilters() {
		filter = 'all';
		searchQuery = '';
	}
</script>

<svelte:head>
	<title>OFA • Letters</title>
</svelte:head>

<section in:fly={{ y: -10, duration: 200 }}>
  <PageWrapper>
		<svelte:fragment slot="title">
			<h1 class="text-2xl text-usfGreen font-semibold">{filter === "my" ? "My" : ""} Letters</h1>
		</svelte:fragment>
		<svelte:fragment slot="title-right">
      <Search bind:value={searchQuery} />
      <!-- svelte-ignore a11y-click-events-have-key-events -->
			{#if data.profile?.role.name === "ADMIN"}
        <div class="flex justify-center items-center bg-accSlate w-10 h-10 rounded-full cursor-pointer" on:click={() => { openModal(letterModal) }}>
          <i class="fa-solid fa-plus fa-lg text-white/90"></i>
        </div>
      {/if}
		</svelte:fragment>
		<svelte:fragment slot="filters">
			<RadioGroup background="bg-transparent" active="bg-accSlate text-white/90" class="mt-0" rounded="rounded-md">
				<RadioItem bind:group={filter} name="visitorType" value="all">All</RadioItem>
				<RadioItem bind:group={filter} name="visitorType" value="my">My Letters</RadioItem>
			</RadioGroup>
			<button class="bg-accSlate/80 text-white/90 font-medium rounded-md px-4 py-2"
				on:click={resetFilters}
			>
				Reset Filters
			</button>
		</svelte:fragment>
		<svelte:fragment slot="content">
			<TabGroup>
        <Tab bind:group={tabSet} name="all" value={0}>All Current Letters</Tab>
        <Tab bind:group={tabSet} name="email" value={1}>Email Letters</Tab>
        <Tab bind:group={tabSet} name="paper" value={2}>Paper Letters</Tab>
        <Tab bind:group={tabSet} name="roremal" value={3}>ROREMAL</Tab>
        <Tab bind:group={tabSet} name="old" value={4}>Old Letters</Tab>
        <!-- Tab Panels --->
        <svelte:fragment slot="panel">
          <TableWrapper arrLength={filteredLetters.length} bind:paginationSettings={paginationSettings}>
            <svelte:fragment slot="header">
              <thead>
                <tr class="bg-accSlate text-white/90">
                  <th>Letter Code</th>
                  <th>Letter Type</th>
                  <th>Letter Group</th>
                  <th>Owner</th>
                  <th>Last Updated</th>
                </tr>
              </thead>
            </svelte:fragment>
            <svelte:fragment slot="body">
              <tbody>
                {#each paginatedSource as letter}
                    <tr on:click={() => updateLetter(letter.id)} class="cursor-pointer">
                      <td>{letter.letterCode.name}</td>
                      <td>{letter.letterType.name}</td>
                      <td>{letter.letterGroup?.name ?? "-"}</td>
                      <td>{letter.owner.first_name + " " + letter.owner.last_name}</td>
                      <td>{getDateLocal(letter.updatedAt.toISOString(), "MMMM Do, YYYY")}</td>
                    </tr>
                  {/each}
              </tbody>
            </svelte:fragment>
            <svelte:fragment slot="none">
              <p>There are no letters that match your search.</p>
            </svelte:fragment>
          </TableWrapper>
        </svelte:fragment>
      </TabGroup>
		</svelte:fragment>
	</PageWrapper>
</section>