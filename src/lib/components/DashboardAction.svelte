<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  export let href: string = "/";
  export let label: string;

  function onClick() {
    dispatch('click');
  }
</script>

<a  class="flex justify-center items-center rounded p-4 border border-accSlate/20 shadow-md" {href} on:click={onClick}>
  {label}
</a>

<style>
	a {
		transition: transform .15s ease-in-out;
	}

	a:hover {
		transform: translateY(-2px);
	}
</style>