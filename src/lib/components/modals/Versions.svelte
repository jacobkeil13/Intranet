<script lang="ts">
	import { getModalStore } from '@skeletonlabs/skeleton';
	import { currentVersion, versions } from '$lib/stores/version';

	let modalStore = getModalStore();

	function closeForm(): void {
		modalStore.close();
	}
</script>

<section class="max-w-[60rem] h-[700px] overflow-y-auto bg-usfWhite p-4 rounded-md">
	<div class="flex justify-between items-center">
		<h1 class="text-lg text-usfGreen font-medium">Fixes and New Features - <span class="underline">v{currentVersion}</span></h1>
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<i class="fa-solid fa-xmark fa-lg text-black cursor-pointer" on:click={closeForm} />
	</div>
	<div class="flex flex-col gap-2">
		{#each versions as version}
			<hr class="my-3" />
			<h1
				class="font-medium
        {currentVersion === version.version ? 'text-xl' : 'text-lg'} text-usfGreen"
			>
				<span class="underline">{currentVersion === version.version ? 'Current - v' + version.version : 'v' + version.version}</span> <span class="no-underline">- {version.date}</span>
			</h1>
			{#each version.notes as note}
				<h1 class="font-medium underline">{@html note.header}</h1>
				<ul class="list-inside list-disc pl-2">
					{#each note.items as item}
						<li>{@html item}</li>
					{/each}
				</ul>
			{/each}
		{/each}
	</div>
</section>
