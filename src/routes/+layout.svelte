<script lang='ts'>
	import '../theme.postcss';
	import '@skeletonlabs/skeleton/styles/skeleton.css';
	import '../app.postcss';

	import { AppShell, AppBar, LightSwitch, Accordion, AccordionItem, Avatar, Modal } from '@skeletonlabs/skeleton';
	import UsfLogo from '$lib/components/brand/USFLogo.svelte';
	import { sidebar_links } from '$lib/stores/sidebar';
	import { forms } from '$lib/stores/modal';

	let sidebarOpen = true;
</script>

<Modal components={forms} />

<AppShell slotSidebarLeft="max-w-[250px] bg-surface-100-800-token" slotHeader="p-0">
	<svelte:fragment slot="header">
		<AppBar padding="px-4 py-2">
			<svelte:fragment slot="lead">
				<span class="flex items-center space-x-2">
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					<box-icon on:click={() => sidebarOpen = !sidebarOpen} class="fill-token mr-2 cursor-pointer" name={sidebarOpen ? "x" : "menu"}></box-icon>
					<UsfLogo />
					<strong class="text-xl">OFA Intranet</strong>
				</span>
			</svelte:fragment>
			<svelte:fragment slot="trail">
				<span class="flex items-center space-x-2">
					<LightSwitch />
					<Avatar width="w-10" />
				</span>
			</svelte:fragment>
		</AppBar>
	</svelte:fragment>
	<svelte:fragment slot="sidebarLeft">
		{#if sidebarOpen}
		<Accordion>
			{#each $sidebar_links as section}
			<AccordionItem>
				<svelte:fragment slot="summary">{section.header}</svelte:fragment>
				<svelte:fragment slot="content">
					<ul class="pl-2 text-token">
						{#each section.links as url}
							<li class="hover:underline"><a href={url.link} target={url.target}>{url.label}</a></li>
						{/each}
					</ul>
				</svelte:fragment>
			</AccordionItem>
			{/each}
		</Accordion>
		{/if}
	</svelte:fragment>
	<section class="p-8">
		<slot />
	</section>
</AppShell>
