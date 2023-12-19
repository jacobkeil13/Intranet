<script lang="ts">
	import { Popup } from '$lib/components';
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { currentVersion, versions } from '$lib/stores/version';
	import { Accordion, AccordionItem, getModalStore, type ModalSettings } from '@skeletonlabs/skeleton';

	let modalStore = getModalStore();

	const versionModal: ModalSettings = {
		type: 'component',
		component: 'versionModal',
		meta: {}
	};

	function openModal() {
		modalStore.trigger(versionModal);
	}

	let isVisible = false;
	const currentVersionNotes = versions.find((version) => {
		return version.version === currentVersion;
	});

	onMount(() => {
		const dismissedUpdate = localStorage.getItem('dismissedUpdate');
		if (dismissedUpdate !== currentVersion) {
			isVisible = true;
		}
	});

	function dismiss() {
		isVisible = false;
		localStorage.setItem('dismissedUpdate', currentVersion);
	}
</script>

<br />
<section class="flex" in:fly={{ y: -10, duration: 200 }} out:fly={{ y: -10, duration: 200 }}>
	<div class="flex gap-2 border border-accSlate max-w-[900px] rounded-md">
		<Accordion>
			<AccordionItem open={isVisible} on:toggle={dismiss}>
				<svelte:fragment slot="summary">
					<h1 class="text-lg text-usfGreen font-medium">Fixes and New Features - <span class="underline">v{currentVersion}</span> - {currentVersionNotes?.date}</h1>
				</svelte:fragment>
				<svelte:fragment slot="content">
					<hr class="my-3" />
					<div class="flex flex-col gap-2">
						{#if currentVersionNotes !== undefined}
							{#each currentVersionNotes.notes as sect}
								<h1 class="font-medium underline">{@html sect.header}</h1>
								<ul class="list-inside list-disc pl-2">
									{#each sect.items as item}
										<li>{@html item}</li>
									{/each}
								</ul>
							{/each}
						{/if}
						{#if isVisible}
							<div class="flex flex-row-reverse">
								<button class="bg-accSlate px-5 py-2 rounded-md text-white/90" on:click={dismiss}>Dismiss</button>
							</div>
						{/if}
					</div>
				</svelte:fragment>
			</AccordionItem>
		</Accordion>
		<div class="flex justify-center pl-2 pr-4 pt-[9px] h-fit">
			<Popup pointer="" offset={30} placement="right">
				<svelte:fragment slot="content">
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					<i class="fa-solid fa-code-compare text-usfGreen/50 hover:text-usfGreen fa-lg cursor-pointer" on:click={openModal} />
				</svelte:fragment>
				<svelte:fragment slot="popup">
					<p class="text-white/80 font-semibold">View all versions</p>
				</svelte:fragment>
			</Popup>
		</div>
	</div>
</section>
