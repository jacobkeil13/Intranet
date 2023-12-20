<script lang="ts">
	export let value = '';
	export let width = 'w-fit';
	export let divWidth = '';
</script>

<div class="hidden tablet:block relative {divWidth}">
	<div class="input-group input-group-divider grid-cols-[auto_1fr] rounded-md {width} bg-transparent">
		<div class="input-group-shim bg-transparent"><i class="fa-solid fa-magnifying-glass text-black/60" /></div>
		<input spellcheck="false" type="search" placeholder="Search..." bind:value />
	</div>
</div>