<script lang="ts">
	import Search from '$lib/components/Search.svelte';
  import { fly } from 'svelte/transition';
  import { toastStore, Tab, TabGroup, modalStore, type ModalSettings, Paginator, Table, tableMapperValues, type PaginationSettings } from '@skeletonlabs/skeleton';
	import { getDateLocal } from '$lib/helpers.js';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
  export let form;
  export let data;

  enum LetterTypes {
    All = 0,
    Email = 1,
    Paper = 2,
    Roremal = 3,
    Old = 4,
  }

  if (form) {
    toastStore.trigger({
		  message: String(form?.message),
      background: form?.success ? "bg-accTeal" : "bg-[#930000]",
      classes: "text-white/90 font-medium"
	  });
  }

  let letters = data.letters;
  let tabSet: number = 0;
  let searchQuery =	$page.url.searchParams.get("search") === null ? '' : String($page.url.searchParams.get("search"));
	let sourceData: any[] = [];
	let filteredSourceData: any[] = [];

  onMount(() => {
		letters.forEach((letter) => {
			let tr = {
				id: letter.id,
        letterCode: letter.letterCode.name,
				letterType: letter.letterType.name,
				letterGroup: letter.letterGroup.name,
				owner: letter.owner.first_name + " " + letter.owner.last_name,
				lastUpdated: getDateLocal(letter.updatedAt.toISOString(), "MMMM Do, h:mmA"),
			}
			sourceData.push(tr);
		});
		filteredSourceData = sourceData
	});

  $: {
    filteredSourceData = sourceData.filter((letter: any) => {
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
      if ((letter.letterCode.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        letter.letterType.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        letter.letterGroup.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        letter.owner.toLowerCase().includes(searchQuery.toLowerCase().trim()))) {
          if (letterType === "All") {
            return letter;
          }
          if (letter.letterType === letterType) {
            return letter;
          }
      }
    })
    updatePageSettings(filteredSourceData);
  }

  const headers: string[] = ['Letter Code', 'Letter Type', 'Letter Group', 'Owner', 'Last Updated'];
	const body: string[] = ['letterCode', 'letterType', 'letterGroup', 'owner', 'lastUpdated'];
	const meta: string[] = ['id'];
  let state = { firstLast: false, previousNext: true };
	let pageSettings = { offset: 0, limit: 10, size: filteredSourceData.length, amounts: [5, 10, 15] } as PaginationSettings;
	$: sourceDataSliced = filteredSourceData.slice(pageSettings.offset * pageSettings.limit, pageSettings.offset * pageSettings.limit + pageSettings.limit);

	function updatePageSettings(filteredArr: any[]) {
		pageSettings.size = filteredArr.length;
		pageSettings.offset = 0
	}

  const letterModal: ModalSettings = {
		type: 'component',
		component: 'letterModal',
		meta: { constants: data.constants }
	}

  function openModal(modal: ModalSettings) {
		modalStore.trigger(modal);
	}

  function updateLetter(e: CustomEvent) {
    if (data.profile?.role.name !== "ADMIN") {
      let letter = letters.find(letter => letter.id === e.detail[0]);
      if (letter?.letterType.name ===  "Paper Letters" || letter?.letterType.name ===  "Email Letters") {
        window.open(`
          https://tup-ofa.forest.usf.edu/files/letters/${letter?.letterType.name.replace(" ", "")}/${letter.letterGroup.name}/${letter.letterCode.name}.pdf
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
      meta: { letter: letters.find(letter => letter.id === e.detail[0]), constants: data.constants }
    });
  }
</script>

<svelte:head>
	<title>OFA • Letters</title>
</svelte:head>

<section in:fly={{ y: -10, duration: 200 }}>
  <div class="flex justify-between items-center">
    <h1 class="text-2xl text-usfGreen font-semibold">Letters</h1>
    <div class="flex justify-center items-center space-x-4">
      <Search bind:value={searchQuery} />
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      {#if data.profile?.role.name === "ADMIN"}
        <div class="flex justify-center items-center bg-accSlate p-[6px] rounded-full cursor-pointer" on:click={() => { openModal(letterModal) }}>
          <box-icon class="fill-white/90" name={"plus"} />
        </div>
      {/if}
    </div>
  </div>
  <br>
  <TabGroup>
    <Tab bind:group={tabSet} name="all" value={0}>All Current Letters</Tab>
    <Tab bind:group={tabSet} name="email" value={1}>Email Letters</Tab>
    <Tab bind:group={tabSet} name="paper" value={2}>Paper Letters</Tab>
    <Tab bind:group={tabSet} name="roremal" value={3}>ROREMAL</Tab>
    <Tab bind:group={tabSet} name="old" value={4}>Old Letters</Tab>
    <!-- Tab Panels --->
    <svelte:fragment slot="panel">
      {#if filteredSourceData.length >= 1}
				<section>
					<Table on:selected={updateLetter} interactive={true} source={{ head: headers, body: tableMapperValues(sourceDataSliced, body), meta: tableMapperValues(sourceDataSliced, meta)}} regionHeadCell="bg-accSlate text-white/90" />
					<br />
					<Paginator buttonClasses="bg-accSlate fill-white"  bind:settings={pageSettings} showFirstLastButtons={state.firstLast} showPreviousNextButtons={state.previousNext} />
				</section>
			{:else}
				<p>No letters match this search.</p>
			{/if}
    </svelte:fragment>
  </TabGroup>
</section>