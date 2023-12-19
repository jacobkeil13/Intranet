<script lang="ts">
	import { getModalStore } from '@skeletonlabs/skeleton';
	import { currentVersion, versions } from '$lib/stores/version';

	let modalStore = getModalStore();

	function closeForm(): void {
		modalStore.close();
	}
</script>

<section class="grid grid-cols-[auto_2fr] max-w-[60rem] h-[700px] gap-4 rounded-md">
	<div class="bg-usfWhite p-4 rounded-md min-w-[300px] h-full max-h-[700px] overflow-y-auto">
		<div class="flex justify-between items-center">
			<h1 class="text-lg text-usfGreen font-medium">Versions</h1>
		</div>
		<hr class="my-3" />
		<div class="flex flex-col gap-1">
			{#each versions as version}
				<a class="flex items-center justify-between px-3 py-2 bg-accSlate/20 hover:bg-accSlate/40 rounded-md cursor-pointer" href={`#${version.version}`}>
					<span class="underline">v{version.version}</span>
					<h1>{version.date}</h1>
				</a>
			{/each}
		</div>
	</div>
	<div class="flex flex-col gap-4">
		<div class="flex justify-between items-center h-16 bg-usfWhite px-3 rounded-md">
			<h1 class="text-lg text-usfGreen font-medium">Fixes and New Features - <span class="underline font-medium">v{currentVersion}</span></h1>
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<i class="fa-solid fa-xmark fa-lg text-black cursor-pointer" on:click={closeForm} />
		</div>
		<div class="bg-usfWhite p-4 rounded-md overflow-y-auto h-[calc(700px_-_80px)]">
			<div class="flex flex-col gap-2">
				{#each versions as version, i}
					<div id={version.version}>
						{#if i > 0}
							<hr class="my-3" />
						{/if}
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
					</div>
				{/each}
			</div>
		</div>
	</div>
</section>

<style>
	section {
		scroll-behavior: smooth !important;
	}
</style>
