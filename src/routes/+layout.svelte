<script lang="ts">
	import '../app.postcss';

	import { getDrawerStore } from '@skeletonlabs/skeleton';
	import { initializeStores } from '@skeletonlabs/skeleton';
	import { AppShell, AppBar, Avatar, Modal, Toast, Drawer } from '@skeletonlabs/skeleton';
	import { computePosition, autoUpdate, offset, shift, flip, arrow } from '@floating-ui/dom';
	import { storePopup } from '@skeletonlabs/skeleton';
	import UsfLogo from '$lib/components/brand/USFLogo.svelte';
	import { forms } from '$lib/stores/modal';
	import { onMount } from 'svelte';
	import Resources from '$lib/components/Resources.svelte';
	import SidebarItem from '$lib/components/SidebarItem.svelte';
	export let data;

	initializeStores();
	storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });
	let drawerStore = getDrawerStore();

	onMount(() => {
		if (!data.profile) location.replace('https://www.usf.edu/financial-aid/');
	});
</script>

<Toast position="tl" buttonDismiss="btn-icon btn-icon-sm bg-white text-black" />
<Modal regionBackdrop="bg-black/40" components={forms} />
<Drawer height="h-[calc(100%_-_3rem)]" width="w-[450px]" position="right" bgBackdrop="bg-black/20" bgDrawer="bg-white my-6 mr-6 rounded-md">
	{#if $drawerStore.id === 'resources'}
		<Resources />
	{/if}
</Drawer>

{#if data.profile}
	<AppShell slotSidebarLeft="hidden mobile:block w-[300px] print:w-0 bg-accSlate text-white/80" slotHeader="p-0">
		<svelte:fragment slot="header">
			<section class="no-print">
				<AppBar background="bg-accSlate text-white/90" padding="py-2 pr-2">
					<svelte:fragment slot="lead">
						<span class="flex items-center space-x-2 w-[300px] px-4">
							<UsfLogo />
							<strong class="text-xl">OFA Intranet</strong>
						</span>
						<h1 class="hidden mobile:block">{data.profile?.first_name} {data.profile?.last_name} - {data.profile?.title.name}</h1>
					</svelte:fragment>
					<svelte:fragment slot="trail">
						<i class="block mobile:hidden fa-solid fa-bars fa-xl text-white/90 mr-2" />
						<span class="hidden mobile:flex items-center space-x-2">
							<Avatar background="bg-usfWhite" initials={data.profile?.first_name.charAt(0) + '' + data.profile?.last_name.charAt(0)} width="w-10" />
						</span>
					</svelte:fragment>
				</AppBar>
			</section>
		</svelte:fragment>
		<svelte:fragment slot="sidebarLeft">
			<section class="bg-accSlate text-white/80 no-print">
				<SidebarItem icon="fa-square-poll-vertical" label="Dashboard" border="border-y" href="/dashboard" />
				<SidebarItem icon="fa-phone" label="Phone List" border="border-b" href="/phone_list" />
				<SidebarItem icon="fa-book-bookmark" label="Trainings" border="border-b" href="/training" />
				<SidebarItem icon="fa-calendar-days" label="Master Calendar" border="border-b" href="/master_calendar" />
				<div class="flex flex-col gap-2 p-4 border-b border-white/10 duration-100 cursor-pointer">
					<SidebarItem icon="fa-arrow-trend-up" label="Chrons" target="_blank" href="https://app.powerbi.com/groups/5a0f9b38-88e0-4604-8dad-7328caeea86a/list/dashboards" />
					<SidebarItem icon="fa-user-check" label="Counter Duty" href="/counter_duty" />
					<SidebarItem icon="fa-comments" label="Appointments" href="/appointments" />
					<SidebarItem icon="fa-bell" label="Referrals" href="/referrals" />
				</div>
				<div class="flex flex-col gap-2 p-4 border-b border-white/10 duration-100 cursor-pointer">
					<SidebarItem icon="fa-file-lines" label="Forms" href="/documents/forms" />
					<SidebarItem icon="fa-envelope" label="Letters" href="/documents/letters" />
					<SidebarItem icon="fa-file-word" label="S&P's" href="/documents/procedures" />
					<a href="/" target="_self" on:click|preventDefault={() => drawerStore.open({ id: 'resources' })} class="flex items-center justify-between duration-100 cursor-pointer group">
						<h1 class="font-medium text-xl">Quick Resources / Links</h1>
						<div class="flex items-center justify-center w-6 h-6 rounded-full">
							<i class="fa-solid fa-paperclip fa-lg text-white/80 group-hover:text-accApple group-hover:rotate-[10deg] duration-200" />
						</div>
					</a>
					<SidebarItem icon="fa-file-excel" label="Track Spreadsheet" href="/track_spreadsheet" />
				</div>
				<div class="flex flex-col gap-2 p-4 border-b border-white/10 duration-100 cursor-pointer">
					<SidebarItem icon="fa-info-circle" label="IS Queue" href="/is_queue" />
					<SidebarItem icon="fa-database" label="DR Queue" href="/dr_queue" />
				</div>
				<div class="flex flex-col gap-2 p-4 border-b border-white/10 duration-100 cursor-pointer">
					<SidebarItem icon="fa-file-circle-plus" label="Reports" target="_blank" href="http://131.247.181.30:8080/apex/f?p=115:15" />
					<SidebarItem icon="fa-chart-simple" label="Visitor Stats" href="/visitor_stats" />
					<SidebarItem icon="fa-street-view" label="Population Selections" href="/popsel" />
				</div>
			</section>
		</svelte:fragment>
		<section id="content" class="relative">
			<section class="py-4 pl-4 pr-4 tablet:pr-16 tablet:pl-8 tablet:py-8 max-w-[1800px] mx-auto min-h-[calc(100vh_-_3.5rem)]">
				<div>
					<slot />
				</div>
			</section>
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<div
				class="absolute hidden tablet:flex items-center justify-center py-6 pl-3 pr-2 right-0 top-16 bg-accSlate rounded-l-md hover:px-4 duration-100 cursor-pointer no-print"
				on:click={() => drawerStore.open({ id: 'resources' })}
			>
				<i class="fa-solid fa-arrow-left fa-sm text-white/90" />
			</div>
		</section>
	</AppShell>
{:else}
	<h1>Not allowed</h1>
{/if}

<style>
	#content {
		background-color: #ffffff;
	}

	@media print {
		.no-print {
			display: none;
		}
	}
</style>
