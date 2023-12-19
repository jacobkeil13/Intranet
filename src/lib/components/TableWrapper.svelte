<script lang="ts">
	import { Paginator, type PaginationSettings } from '@skeletonlabs/skeleton';
	export let arrLength: number;
	export let paginationSettings: PaginationSettings;
	export let tableCompact: string = '';
</script>

{#if arrLength > 0}
	<section class="table-container border border-accSlate/20">
		<table id="tableWrapper" class="table bg-white/20 {tableCompact}">
			<slot name="header" />
			<slot name="body" />
		</table>
	</section>
	<br />
	<Paginator
		select="bg-transparent rounded-md border border-accSlate/30"
		buttonClasses="bg-accSlate fill-white hover:bg-accSlate/70"
		bind:settings={paginationSettings}
		showPreviousNextButtons
		showFirstLastButtons
	/>
{:else}
	<slot name="none" />
{/if}
