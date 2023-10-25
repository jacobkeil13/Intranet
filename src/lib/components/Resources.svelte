<script lang="ts">
	import { resources } from "$lib/stores/resources";
	import { links } from "$lib/stores/links";
	import { Accordion, AccordionItem, getDrawerStore } from "@skeletonlabs/skeleton";

  let drawerStore = getDrawerStore();
</script>

<section class="h-full overflow-y-auto bg-usfWhite p-4 rounded-md">
	<div class="flex justify-between items-center">
		<h1 class="text-xl text-usfGreen font-medium">Quick Resources</h1>
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<i class="fa-solid fa-xmark text-black cursor-pointer" on:click={() => { drawerStore.close() }}></i>
	</div>
	<br />
	<Accordion regionControl="font-semibold" class="bg-transparent" autocollapse={true}>
		{#each $resources as section}
			<AccordionItem>
				<svelte:fragment slot="summary">{section.header}</svelte:fragment>
				<svelte:fragment slot="content">
					<ul class="pl-2">
						{#each section.links as url}
							<li>
								<a href={url.link} target={url.target}><span>•</span> <span class="hover:underline">{url.label}</span></a>
							</li>
						{/each}
					</ul>
				</svelte:fragment>
			</AccordionItem>
		{/each}
	</Accordion>
	<br>
	<div class="flex justify-between items-center mb-2">
		<h1 class="text-xl text-usfGreen font-medium">Quick Links</h1>
	</div>
	<ul class="pl-2">
		{#each $links as url}
			<li>
				<a href={url.link} target={url.target}><span>•</span> <span class="hover:underline">{url.label}</span></a>
			</li>
		{/each}
	</ul>
</section>