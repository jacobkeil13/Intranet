<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  export let line: boolean = false;
  export let icon: string;
  export let iconColor: string = "text-black/70";
  export let href: string = "/";
  export let label: string;
  export let stat: number = 0;
  export let modal: string = "";

  function onClick() {
    if (modal === "") return;
    dispatch('click');
  }
</script>

<a on:click={onClick} class="flex flex-col rounded pt-1 pb-3 px-4 border border-accSlate/20 shadow-lg group" {href}>
  <div class="flex justify-between items-center">
    <h1 class="text-6xl text-black/70">{stat}</h1>
    <i class="fa-solid {icon} fa-2xl {iconColor}"></i>
  </div>
  <h1 class="font-medium text-md">{label}</h1>
  {#if line}
    <hr class="my-2">
  {/if}
  <slot name="content" />
</a>

<style>
	a {
		transition: transform .15s ease-in-out;
	}

	a:hover {
		transform: translateY(-2px);
	}
</style>