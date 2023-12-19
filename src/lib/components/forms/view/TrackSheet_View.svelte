<script lang="ts">
	import type { TrackCode, TrackSheet } from '@prisma/client';
	import { SlideToggle, getModalStore } from '@skeletonlabs/skeleton';

	interface FullTrackSheet extends TrackSheet {
		defaultStatus: TrackCode[];
		processingStatus: TrackCode[];
		incompleteHeld: TrackCode[];
		processMailed: TrackCode[];
		approved: TrackCode[];
		reviewedNoChange: TrackCode[];
		declined: TrackCode[];
		cancelled: TrackCode[];
	}

	let modalStore = getModalStore();
	let isLoading = false;
	let constants = $modalStore[0].meta.constants;
	let trackSheet: FullTrackSheet = $modalStore[0].meta.trackSheet;

	function closeForm(): void {
		modalStore.close();
	}
</script>

<section class="w-[44rem] max-h-[calc(100%_-_5rem)] overflow-y-auto bg-usfWhite p-4 rounded-md">
	<div class="flex justify-between items-center">
		<h1 class="text-xl text-usfGreen font-medium">Update Track Sheet</h1>
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<i class="fa-solid fa-xmark fa-lg text-black cursor-pointer" on:click={closeForm} />
	</div>
	<br />
	<section class="space-y-2">
		<div class="flex space-x-2">
			<span class="flex flex-col w-fit space-y-1">
				<label for="reqCode">Req Code</label>
				<input autocomplete="off" required type="text" name="reqCode" class="input rounded-md" placeholder="Req Code..." value={trackSheet.reqCode} />
			</span>
			<span class="flex flex-col w-full space-y-1">
				<label for="description">Description</label>
				<input autocomplete="off" required type="text" name="description" class="input rounded-md" placeholder="Description..." value={trackSheet.description} />
			</span>
		</div>
		<br />
		<section class="grid grid-cols-2 gap-2">
			{#if trackSheet.defaultStatus.length > 0}
				<div class="flex flex-col gap-2">
					<h1 class="font-medium text-white/90 bg-accSlate w-fit py-1 px-2 rounded-md">Default Status</h1>
					<ul class="pl-5 text-black list-disc">
						{#each trackSheet.defaultStatus as code}
							<li>{code.statusIndicator} • {code.description}</li>
						{/each}
					</ul>
				</div>
			{/if}
			{#if trackSheet.processingStatus.length > 0}
				<div class="flex flex-col gap-2">
					<h1 class="font-medium text-white/90 bg-accSlate w-fit py-1 px-2 rounded-md">Processing Status</h1>
					<ul class="pl-5 text-black list-disc">
						{#each trackSheet.processingStatus as code}
							<li>{code.statusIndicator} • {code.description}</li>
						{/each}
					</ul>
				</div>
			{/if}
			{#if trackSheet.incompleteHeld.length > 0}
				<div class="flex flex-col gap-2">
					<h1 class="font-medium text-white/90 bg-accSlate w-fit py-1 px-2 rounded-md">Incomplete / Held</h1>
					<ul class="pl-5 text-black list-disc">
						{#each trackSheet.incompleteHeld as code}
							<li>{code.statusIndicator} • {code.description}</li>
						{/each}
					</ul>
				</div>
			{/if}
			{#if trackSheet.processMailed.length > 0}
				<div class="flex flex-col gap-2">
					<h1 class="font-medium text-white/90 bg-accSlate w-fit py-1 px-2 rounded-md">Process Mailed</h1>
					<ul class="pl-5 text-black list-disc">
						{#each trackSheet.processMailed as code}
							<li>{code.statusIndicator} • {code.description}</li>
						{/each}
					</ul>
				</div>
			{/if}
			{#if trackSheet.approved.length > 0}
				<div class="flex flex-col gap-2">
					<h1 class="font-medium text-white/90 bg-accSlate w-fit py-1 px-2 rounded-md">Approved</h1>
					<ul class="pl-5 text-black list-disc">
						{#each trackSheet.approved as code}
							<li>{code.statusIndicator} • {code.description}</li>
						{/each}
					</ul>
				</div>
			{/if}
			{#if trackSheet.reviewedNoChange.length > 0}
				<div class="flex flex-col gap-2">
					<h1 class="font-medium text-white/90 bg-accSlate w-fit py-1 px-2 rounded-md">Default Status</h1>
					<ul class="pl-5 text-black list-disc">
						{#each trackSheet.reviewedNoChange as code}
							<li>{code.statusIndicator} • {code.description}</li>
						{/each}
					</ul>
				</div>
			{/if}
			{#if trackSheet.declined.length > 0}
				<div class="flex flex-col gap-2">
					<h1 class="font-medium text-white/90 bg-accSlate w-fit py-1 px-2 rounded-md">Denied / Declined</h1>
					<ul class="pl-5 text-black list-disc">
						{#each trackSheet.declined as code}
							<li>{code.statusIndicator} • {code.description}</li>
						{/each}
					</ul>
				</div>
			{/if}
			{#if trackSheet.cancelled.length > 0}
				<div class="flex flex-col gap-2">
					<h1 class="font-medium text-white/90 bg-accSlate w-fit py-1 px-2 rounded-md">Cancelled / Don't Need</h1>
					<ul class="pl-5 text-black list-disc">
						{#each trackSheet.cancelled as code}
							<li>{code.statusIndicator} • {code.description}</li>
						{/each}
					</ul>
				</div>
			{/if}
		</section>
		<br />
		<div class="flex items-center gap-2">
			<span class="flex flex-col space-y-1">
				<label for="formType">Form Type</label>
				<select required class="input rounded-md w-fit" name="formType" value={trackSheet.formType}>
					<option disabled selected value="">Select one...</option>
					<option value="None">None</option>
					<option value="Paper">Paper</option>
					<option value="Online">Online</option>
				</select>
			</span>
			<span class="flex flex-col space-y-1">
				<label for="requiredAdvisor" class="mb-2 text-transparent">Requires Appt. with Advisor</label>
				<SlideToggle name="requiredAdvisor" size="sm" checked={trackSheet.requiresAdvisor}>Requires Appt. with Advisor</SlideToggle>
			</span>
			<span class="flex flex-col space-y-1">
				<label for="uploadable" class="mb-2 text-transparent">Uploadable</label>
				<SlideToggle name="uploadable" size="sm" checked={trackSheet.uploadable}>Uploadable</SlideToggle>
			</span>
		</div>
	</section>
</section>

<style>
	input {
		background-color: #ffffff;
		color: black;
		border-color: #3e4c7a8a;
	}

	select {
		background-color: #ffffff;
		color: black;
		border-color: #3e4c7a8a;
	}
</style>
