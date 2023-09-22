<script lang="ts">
	import { sidebar_links } from "$lib/stores/sidebar";
	import { Accordion, AccordionItem, getDrawerStore } from "@skeletonlabs/skeleton";

  let drawerStore = getDrawerStore();
</script>

<section class="max-h-[calc(100%_-_5rem)] overflow-y-auto bg-usfWhite p-4 rounded-md">
	<div class="flex justify-between items-center">
		<h1 class="text-xl text-usfGreen font-medium">Resources</h1>
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<i class="fa-solid fa-xmark text-black cursor-pointer" on:click={() => { drawerStore.close() }}></i>
	</div>
	<br />
	<Accordion regionControl="font-semibold" class="bg-transparent" autocollapse={true}>
		{#each $sidebar_links as section}
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
</section>