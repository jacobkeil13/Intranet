<script context="module">
	import { localStorageStore } from '@skeletonlabs/skeleton';
	const sidebarStore = localStorageStore("sidebarStore", true);
</script>

<script lang="ts">
	import '@skeletonlabs/skeleton/styles/skeleton.css';
	import '../theme.postcss';
	import '../app.postcss';

	import { AppShell, AppBar, Accordion, AccordionItem, Avatar, Modal, Toast } from '@skeletonlabs/skeleton';
	import UsfLogo from '$lib/components/brand/USFLogo.svelte';
	import { sidebar_links } from '$lib/stores/sidebar';
	import { forms } from '$lib/stores/modal';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { openModal } from '$lib/helpers';
	export let data;

	onMount(() => {
		if (!data.profile) location.replace("https://www.usf.edu/financial-aid/");
	})

	function toggleSidebar() {
		$sidebarStore = !$sidebarStore;
	}
</script>

<Toast position="tl" buttonDismiss="btn-icon btn-icon-sm bg-white text-black" />
<Modal regionBackdrop="bg-black/40" components={forms} />

{#if data.profile}
	<AppShell slotSidebarLeft="{$sidebarStore ? 'block' : 'hidden'} w-[300px] bg-accSlate text-white/80" slotHeader="p-0">
		<svelte:fragment slot="header">
			<AppBar background="bg-accSlate text-white/90" padding="py-2 pr-2">
				<svelte:fragment slot="lead">
					<span class="flex items-center space-x-2 w-[300px] px-2">
						<!-- svelte-ignore a11y-click-events-have-key-events -->
						<box-icon on:click={toggleSidebar} class="fill-white/90 mr-2 cursor-pointer" name={$sidebarStore ? 'x' : 'menu'} />
						<UsfLogo />
						<strong class="text-xl">OFA Intranet</strong>
					</span>
					<h1>{data.profile?.first_name} {data.profile?.last_name} - {data.profile?.title.name}</h1>
				</svelte:fragment>
				<svelte:fragment slot="trail">
					<span class="flex items-center space-x-2">
						<!-- svelte-ignore a11y-click-events-have-key-events -->
						<div class="flex justify-center items-center bg-usfWhite p-2 rounded-full cursor-pointer" on:click={() => { 
								openModal("globalSearchModal", { constants: data.constants })
							}}>
							<box-icon class="fill-accSlate" name="search" />
						</div>
						<Avatar background="bg-usfWhite" initials={data.profile?.first_name.charAt(0) + "" + data.profile?.last_name.charAt(0)} width="w-10" />
					</span>
				</svelte:fragment>
			</AppBar>
			<AppBar background="bg-accSlate/90 text-white/90" padding="p-2">
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<span on:click={() => goto("/dashboard")} class="chip bg-usfWhite/90 text-black py-1 px-2 rounded-sm">Dashboard</span>
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<span on:click={() => goto("/visitor_stats")} class="chip bg-usfWhite/90 text-black py-1 px-2 rounded-sm">Visitor Stats</span>
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<span on:click={() => goto("/counter_duty")} class="chip bg-usfWhite/90 text-black py-1 px-2 rounded-sm">Counter Duty</span>
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<span on:click={() => goto("/appointments")} class="chip bg-usfWhite/90 text-black py-1 px-2 rounded-sm">Appointments</span>
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<span on:click={() => goto("/referrals")} class="chip bg-usfWhite/90 text-black py-1 px-2 rounded-sm">Referrals</span>
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<span on:click={() => goto("/is_queue")} class="chip bg-usfWhite/90 text-black py-1 px-2 rounded-sm">IS Queue</span>
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<span on:click={() => goto("/dr_queue")} class="chip bg-usfWhite/90 text-black py-1 px-2 rounded-sm">DR Queue</span>
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<span on:click={() => goto("/master_calendar")} class="chip bg-usfWhite/90 text-black py-1 px-2 rounded-sm">Master Calendar</span>
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<span on:click={() => goto("/phone_list")} class="chip bg-usfWhite/90 text-black py-1 px-2 rounded-sm">Phone List</span>
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<span on:click={() => goto("/training")} class="chip bg-usfWhite/90 text-black py-1 px-2 rounded-sm">Trainings</span>
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<span on:click={() => goto("/popsel")} class="chip bg-usfWhite/90 text-black py-1 px-2 rounded-sm">Popsels</span>
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<span on:click={() => goto("/documents/procedures")} class="chip bg-usfWhite/90 text-black py-1 px-2 rounded-sm">S&P's</span>
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<span on:click={() => goto("/documents/letters")} class="chip bg-usfWhite/90 text-black py-1 px-2 rounded-sm">Letters</span>
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<span on:click={() => goto("/documents/forms")} class="chip bg-usfWhite/90 text-black py-1 px-2 rounded-sm">Forms</span>
			</AppBar>
		</svelte:fragment>
		<svelte:fragment slot="sidebarLeft">
			{#if $sidebarStore}
				<Accordion class="bg-accSlate">
					{#each $sidebar_links as section}
						<AccordionItem>
							<svelte:fragment slot="summary">{section.header}</svelte:fragment>
							<svelte:fragment slot="content">
								<ul class="pl-2 text-usfWhite">
									{#each section.links as url}
										<li class="hover:underline text-white/80">
											<a href={url.link} target={url.target}>{url.label}</a>
										</li>
									{/each}
								</ul>
							</svelte:fragment>
						</AccordionItem>
					{/each}
				</Accordion>
			{/if}
		</svelte:fragment>
		<section id="content">
			<section class="p-8 { $sidebarStore ? "max-w-7xl" : "max-w-[1600px]"} mx-auto min-h-[calc(100vh_-_3.5rem_-_41px)]">
				<div>
					<slot />
				</div>
			</section>
		</section>
	</AppShell>
{:else}
	<h1>Not allowed</h1>
{/if}

<style>
	#content {
		background-color: #eeeeee;
		background-image: radial-gradient(#e9e9e9 2px, transparent 0);
		background-size: 20px 20px;
		background-position: -19px -19px;
	}
</style>
