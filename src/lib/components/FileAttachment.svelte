<script lang="ts">
	import Popup from './Popup.svelte';
	export let file: string;
</script>

{#if file.endsWith('.pdf')}
	<Popup placement="top" bgColor="bg-accSlate">
		<svelte:fragment slot="content">
			<div class="flex items-center gap-3 bg-red-600 px-3 py-1 rounded-md">
				<i class="fa-solid fa-file-lines text-white/90" />
				<span class="font-medium text-white/90">{file.split('.')[1].toUpperCase()}</span>
			</div>
		</svelte:fragment>
		<svelte:fragment slot="popup">
			<p class="text-white/80 font-semibold">{file}</p>
		</svelte:fragment>
	</Popup>
{:else if file.endsWith('.xlsx') || file.endsWith('.csv')}
	<Popup placement="top" bgColor="bg-accSlate">
		<svelte:fragment slot="content">
			<div class="flex items-center gap-3 bg-usfGreen px-3 py-1 rounded-md">
				<i class="fa-solid fa-file-excel text-white/90" />
				<span class="font-medium text-white/90">{file.split('.')[1].toUpperCase()}</span>
			</div>
		</svelte:fragment>
		<svelte:fragment slot="popup">
			<p class="text-white/80 font-semibold">{file}</p>
		</svelte:fragment>
	</Popup>
{:else if file.endsWith('.docx')}
	<Popup placement="top" bgColor="bg-accSlate">
		<svelte:fragment slot="content">
			<div class="flex items-center gap-3 bg-blue-800 px-3 py-1 rounded-md">
				<i class="fa-solid fa-file-word text-white/90" />
				<span class="font-medium text-white/90">{file.split('.')[1].toUpperCase()}</span>
			</div>
		</svelte:fragment>
		<svelte:fragment slot="popup">
			<p class="text-white/80 font-semibold">{file}</p>
		</svelte:fragment>
	</Popup>
{:else if file.endsWith('.pptx')}
	<Popup placement="top" bgColor="bg-accSlate">
		<svelte:fragment slot="content">
			<div class="flex items-center gap-3 bg-[#C03F1F] px-3 py-1 rounded-md">
				<i class="fa-solid fa-file-word text-white/90" />
				<span class="font-medium text-white/90">{file.split('.')[1].toUpperCase()}</span>
			</div>
		</svelte:fragment>
		<svelte:fragment slot="popup">
			<p class="text-white/80 font-semibold">{file}</p>
		</svelte:fragment>
	</Popup>
{:else}
	<Popup placement="top" bgColor="bg-accSlate">
		<svelte:fragment slot="content">
			<div class="flex items-center gap-3 bg-accSlate px-3 py-1 rounded-md">
				<i class="fa-solid fa-file-lines text-white/90" />
				<span class="font-medium text-white/90">{file.split('.')[1].toUpperCase()}</span>
			</div>
		</svelte:fragment>
		<svelte:fragment slot="popup">
			<p class="text-white/80 font-semibold">{file}</p>
		</svelte:fragment>
	</Popup>
{/if}
