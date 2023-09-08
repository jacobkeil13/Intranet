<script lang="ts">
	import { page } from '$app/stores';
  import Search from '$lib/components/Search.svelte';
	import { getDateLocal } from '$lib/helpers.js';
  import { toastStore, type ModalSettings, modalStore, type PaginationSettings, TabGroup, Tab, Table, Paginator, tableMapperValues } from '@skeletonlabs/skeleton';
	import moment from 'moment';
	import { onMount } from 'svelte';
  import { fly } from 'svelte/transition';
  export let form;
  export let data;

  enum Training {
    Schedule = 0,
    Library = 1
  }

  let trainingModal: ModalSettings = {
    type: 'component',
    component: 'trainingModal',
    meta: { constants: data.constants }
  }

  let libraryModal: ModalSettings = {
    type: 'component',
    component: 'libraryModal',
    meta: { constants: data.constants }
  }

  let trainings = data.trainings;
  let libraryTrainings = data.library;
  let filteredLibrary = data.library;
  let tabSet: number = 0;
  let searchQuery =	$page.url.searchParams.get("search") === null ? '' : String($page.url.searchParams.get("search"));
	let sourceData: any[] = [];
	let filteredSourceData: any[] = [];
  
  if (form) {
    toastStore.trigger({
		  message: String(form?.message),
      background: form?.success ? "bg-accTeal" : "bg-[#930000]",
      classes: "text-white/90 font-medium"
	  });
  }

  onMount(() => {
		trainings.forEach((training) => {
      let trainers = training.trainers.map(trainer => trainer.first_name + " " + trainer.last_name)
			let tr = {
				id: training.id,
        date: training.weekday + ", " + getDateLocal(training.date.toISOString(), "MMMM Do"),
				title: training.name,
				trainers: trainers.join(", "),
				lastUpdated: getDateLocal(training.updatedAt.toISOString(), "MMMM Do, h:mmA")
			}
			sourceData.push(tr);
		});
		filteredSourceData = sourceData
	});

  $: {
    filteredSourceData = sourceData.filter((training: any) => {
      if ((training.title.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        training.trainers.toLowerCase().includes(searchQuery.toLowerCase().trim()))) {
          return training;
      }
    })

    filteredLibrary = libraryTrainings.filter((training) => {
      if ((training.name.toLowerCase().includes(searchQuery.toLowerCase().trim()))) {
          return training;
      }
    })

    updatePageSettings(filteredSourceData);
  }

  const headers: string[] = ['Date', 'Title', 'Trainers', 'Last Updated'];
	const body: string[] = ['date', 'title', 'trainers', 'lastUpdated'];
	const meta: string[] = ['id'];
  let state = { firstLast: false, previousNext: true };
	let pageSettings = { offset: 0, limit: 10, size: filteredSourceData.length, amounts: [5, 10, 15] } as PaginationSettings;
	$: sourceDataSliced = filteredSourceData.slice(pageSettings.offset * pageSettings.limit, pageSettings.offset * pageSettings.limit + pageSettings.limit);

  function openModal(modal: ModalSettings) {
		modalStore.trigger(modal);
	}

	function updatePageSettings(filteredArr: any[]) {
		pageSettings.size = filteredArr.length;
		pageSettings.offset = 0
	}

  function updateLibrary(idx: number) {
    modalStore.trigger({
      type: 'component',
      component: 'updateLibraryModal',
      meta: { library: filteredLibrary[idx], constants: data.constants }
    });
  }

  function updateTrainingSchedule(e: CustomEvent) {
    if (data.user.role !== "ADMIN") return;
    modalStore.trigger({
      type: 'component',
      component: 'updateTrainingModal',
      meta: { training: trainings.find(training => training.id === e.detail[0]), constants: data.constants }
    });
  }

  function openTraining(title: string, src: string) {
    modalStore.trigger({
      type: 'component',
      component: 'embedModal',
      meta: { src, title }
    });
  }
</script>

<svelte:head>
	<title>OFA • Trainings</title>
</svelte:head>

<section in:fly={{ y: -10, duration: 200 }}>
  <div class="flex justify-between items-center">
    <h1 class="text-2xl text-usfGreen font-semibold">Training Schedule & Library</h1>
    <div class="flex justify-center items-center space-x-4">
      <Search bind:value={searchQuery} />
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      {#if data.profile?.role.name === "ADMIN"}
        <div class="flex justify-center items-center bg-accSlate p-[6px] rounded-full cursor-pointer" on:click={() => { 
            openModal(tabSet === Training.Schedule ? trainingModal : libraryModal)
          }}>
          <box-icon class="fill-white/90" name={"plus"} />
        </div>
      {/if}
    </div>
  </div>
  <br>
  <TabGroup>
    <Tab bind:group={tabSet} name="all" value={0}>Schedule</Tab>
    <Tab bind:group={tabSet} name="current" value={1}>Library</Tab>
    <svelte:fragment slot="panel">
      {#if tabSet === Training.Schedule}
        {#if filteredSourceData.length > 0}
          <section>
            <Table on:selected={updateTrainingSchedule} interactive={true} source={{ head: headers, body: tableMapperValues(sourceDataSliced, body), meta: tableMapperValues(sourceDataSliced, meta)}} regionHeadCell="bg-accSlate text-white/90" />
            <br />
            <Paginator buttonClasses="bg-accSlate fill-white"  bind:settings={pageSettings} showFirstLastButtons={state.firstLast} showPreviousNextButtons={state.previousNext} />
          </section>
        {:else}
          <p>No upcoming trainings found.</p>
        {/if}
      {:else if tabSet === Training.Library}
        {#if filteredLibrary.length > 0 }
          <section class="grid grid-cols-3 gap-2">
            {#each filteredLibrary as training, i}
              <!-- svelte-ignore a11y-click-events-have-key-events -->
              <div class="flex flex-col group relative justify-between card p-3 cursor-pointer">
                <div class="mb-2">
                  <h1 class="flex items-center font-medium">{training.name} ({moment(new Date(training.date)).add(1, "days").format("dddd").slice(0, 3)})</h1>
                  <h1>{moment(new Date(training.date)).add(1, "days").format("MMMM D, YYYY")}</h1>
                </div>
                <div class="flex flex-wrap gap-1">
                  {#each training.trainers as trainer}
                    <span class="badge bg-accSlate text-white/90 rounded-md">{trainer.first_name} {trainer.last_name}</span>
                  {/each}
                </div>
                <div class="flex justify-center items-center absolute opacity-0 group-hover:opacity-100 duration-200 bg-[#dfe2eb]/90 top-0 right-0 left-0 bottom-0 rounded-lg h-full">
                  <div class="flex items-center">
                    {#if data.user.role === "ADMIN"}
                      <box-icon type='solid' name='edit' class="duration-200 hover:fill-blue-600 h-6 w-6" on:click={() => updateLibrary(i)}></box-icon>
                    {/if}
                    <box-icon name='play' class="duration-100 hover:fill-green-700 h-8 w-8" 
                      on:click={() => openTraining(training.name, training.url) }
                    ></box-icon>
                  </div>
                </div>
              </div>
            {/each}
          </section>
        {:else}
          <p>No trainings match this search.</p>
        {/if}
      {/if}
    </svelte:fragment>
  </TabGroup>
</section>