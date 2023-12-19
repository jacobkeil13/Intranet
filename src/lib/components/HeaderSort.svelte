<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let sortable: boolean = true;

	export let title: string;
	export let field: string;
	export let currentSortField: string;
	export let currentSortOrder: 'asc' | 'dsc' = 'asc';

	const dispatch = createEventDispatcher();

	function sort() {
		if (field === currentSortField) {
			if (currentSortOrder === 'asc') {
				currentSortOrder = 'dsc';
			} else {
				currentSortOrder = 'asc';
			}
		}
		currentSortField = field;
		dispatch('sort');
	}
</script>

{#if sortable}
	<th class="cursor-pointer select-none gap-2 whitespace-nowrap" class:text-orange-300={field === currentSortField} on:click={sort}>
		{title}*
		<span>
			<i
				class={`fa-solid fa-sm text-white/70 
      ${currentSortField === field ? 'inline-block' : 'hidden'} 
      ${currentSortOrder === 'asc' ? 'fa-arrow-down-short-wide' : 'fa-arrow-up-wide-short'}`}
			/>
		</span>
	</th>
{:else}
	<th class="whitespace-nowrap">{title}</th>
{/if}
