<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	export let href: string | null = null;
	export let label: string;
	export let target: '_self' | '_blank' = '_self';

	function onClick() {
		dispatch('click');
	}
</script>

{#if href !== null}
	<a class="flex justify-center items-center rounded p-4 border border-accSlate/20 shadow-md" {target} {href} on:click={onClick}>
		{label}
	</a>
{:else}
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<div class="flex justify-center items-center rounded p-4 border border-accSlate/20 shadow-md cursor-pointer" on:click={onClick}>
		{label}
	</div>
{/if}

<style>
	a,
	div {
		transition: transform 0.15s ease-in-out;
	}

	a:hover {
		transform: translateY(-2px);
	}

	div:hover {
		transform: translateY(-2px);
	}
</style>
