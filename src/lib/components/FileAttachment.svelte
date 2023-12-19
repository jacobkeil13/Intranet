<script lang="ts">
	import { Popup } from '$lib/components';
	export let file: string;
	export let small: boolean = false;
</script>

{#if small}
	<span
		class:bg-red-600={file.endsWith('.pdf')}
		class:bg-usfGreen={file.endsWith('.xlsx') || file.endsWith('.xls') || file.endsWith('.csv')}
		class:bg-blue-800={file.endsWith('.docx') || file.endsWith('.doc')}
		class:bg-clay={file.endsWith('.pptx') || file.endsWith('.ppt')}
		class="flex items-center gap-3 bg-accSlate px-1 rounded-sm w-fit"
	>
		<span class="font-medium text-white/90 text-sm">{file.split('.')[file.split('.').length - 1].toUpperCase()}</span>
	</span>
{:else}
	<Popup placement="top" bgColor="bg-accSlate">
		<svelte:fragment slot="content">
			<div
				class:bg-red-600={file.endsWith('.pdf')}
				class:bg-usfGreen={file.endsWith('.xlsx') || file.endsWith('.xls') || file.endsWith('.csv')}
				class:bg-blue-800={file.endsWith('.docx') || file.endsWith('.doc')}
				class:bg-clay={file.endsWith('.pptx') || file.endsWith('.ppt')}
				class="flex items-center gap-3 bg-accSlate px-3 py-1 rounded-md"
			>
				<i class="fa-solid fa-file-lines text-white/90" />
				<span class="font-medium text-white/90">{file.split('.')[1].toUpperCase()}</span>
			</div>
		</svelte:fragment>
		<svelte:fragment slot="popup">
			<p class="text-white/80 font-semibold">{file}</p>
		</svelte:fragment>
	</Popup>
{/if}
