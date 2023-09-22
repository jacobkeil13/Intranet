<script lang="ts">
	import type { TrackCode } from "@prisma/client";
	import type { Writable } from "svelte/store";

  export let label: string;
  export let trackCodeList: TrackCode[];
  export let trackCodeStore: Writable<TrackCode[]>;

  $: selected = "";

  function onAdd() {
    let selectedTrackCode: TrackCode | undefined = trackCodeList.find(code => code.statusIndicator === selected);
    if (selectedTrackCode !== undefined) {
      let searchedCode = $trackCodeStore.find(code => code.statusIndicator === selectedTrackCode?.statusIndicator)
      if (searchedCode === undefined) {
        $trackCodeStore.push(selectedTrackCode);
      }
    }
    selected = "";
    $trackCodeStore = $trackCodeStore;
  }

  function onRemove(status: string) {
    $trackCodeStore = $trackCodeStore.filter(code => code.statusIndicator !== status);
    $trackCodeStore = $trackCodeStore;
  }
</script>

<div class="flex flex-col w-full">
  <div class="flex space-x-2 mb-2 w-full">
    <h1 class="bg-accSlate text-white/90 py-2 px-3 rounded-md">{label}</h1>
    <select class="rounded-md grow" bind:value={selected} on:change={onAdd}>
      <option value="">Select one...</option>
      {#each trackCodeList as trackCode}
        <option value={trackCode.statusIndicator}>{trackCode.statusIndicator} • {trackCode.description}</option>
      {/each}
    </select>
    <!-- <button disabled={selected === ""} class="{selected === "" ? "bg-accSlate/50" : "bg-accSlate"} text-white/90 font-medium rounded-md px-4 py-2"
      on:click={onAdd}
    >
      Add
    </button> -->
  </div>
  {#if $trackCodeStore.length > 0}
    <section class="flex flex-col gap-2 rounded-md border-2 border-accSlate p-4">
      {#each $trackCodeStore as trackCode, i}
        <div class="flex items-center justify-between">
          <h1>- {trackCode.statusIndicator} • {trackCode.description}</h1>
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <i on:click={() => { onRemove(trackCode.statusIndicator) }} class="fa-solid fa-xmark fa-lg text-red-600 cursor-pointer"></i>
        </div>
      {/each}
    </section>
  {/if}
</div>

<style>
  select {
		background-color: #ffffff;
		color: black;
		border-color: #3e4c7a8a;
	}
</style>