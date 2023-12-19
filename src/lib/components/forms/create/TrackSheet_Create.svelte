<script lang="ts">
	import type { TrackCode, TrackSheet } from '@prisma/client';
	import { Loading, TrackCodePickerList } from '$lib/components';
	import { SlideToggle, getModalStore } from '@skeletonlabs/skeleton';
	import { writable } from 'svelte/store';

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
	let trackCodes: TrackCode[] = $modalStore[0].meta.trackCodes;

	let defaultStatusCodes = writable<TrackCode[]>([]);
	let processingStatusCodes = writable<TrackCode[]>([]);
	let incompleteHeldCodes = writable<TrackCode[]>([]);
	let processMailedCodes = writable<TrackCode[]>([]);
	let approvedCodes = writable<TrackCode[]>([]);
	let reviewedNoChangeCodes = writable<TrackCode[]>([]);
	let deniedDeclinedCodes = writable<TrackCode[]>([]);
	let cancelledDontNeedCodes = writable<TrackCode[]>([]);

	function closeForm(): void {
		modalStore.close();
	}
</script>

<section class="w-[44rem] max-h-[calc(100%_-_5rem)] overflow-y-auto bg-usfWhite p-4 rounded-md">
	<div class="flex justify-between items-center">
		<h1 class="text-xl text-usfGreen font-medium">Create Track Sheet</h1>
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<i class="fa-solid fa-xmark fa-lg text-black cursor-pointer" on:click={closeForm} />
	</div>
	<br />
	<form method="POST" action="/track_spreadsheet?/createReq" enctype="multipart/form-data">
		<input type="hidden" name="defaultStatus" value={$defaultStatusCodes.map((code) => code.id).join(',')} />
		<input type="hidden" name="processingStatus" value={$processingStatusCodes.map((code) => code.id).join(',')} />
		<input type="hidden" name="incompleteHeld" value={$incompleteHeldCodes.map((code) => code.id).join(',')} />
		<input type="hidden" name="processMailed" value={$processMailedCodes.map((code) => code.id).join(',')} />
		<input type="hidden" name="approved" value={$approvedCodes.map((code) => code.id).join(',')} />
		<input type="hidden" name="reviewedNoChange" value={$reviewedNoChangeCodes.map((code) => code.id).join(',')} />
		<input type="hidden" name="declined" value={$deniedDeclinedCodes.map((code) => code.id).join(',')} />
		<input type="hidden" name="cancelled" value={$cancelledDontNeedCodes.map((code) => code.id).join(',')} />
		<section class="space-y-2">
			<div class="flex space-x-2">
				<span class="flex flex-col w-fit space-y-1">
					<label for="reqCode">Req Code</label>
					<input required type="text" name="reqCode" class="input rounded-md" placeholder="Req Code..." />
				</span>
				<span class="flex flex-col w-full space-y-1">
					<label for="description">Description</label>
					<input required type="text" name="description" class="input rounded-md" placeholder="Description..." />
				</span>
			</div>
			<div class="flex items-center gap-2">
				<TrackCodePickerList label="Default Status" bind:trackCodeList={trackCodes} bind:trackCodeStore={defaultStatusCodes} />
			</div>
			<div class="flex items-center gap-2">
				<TrackCodePickerList label="Processing Status" bind:trackCodeList={trackCodes} bind:trackCodeStore={processingStatusCodes} />
			</div>
			<div class="flex items-center gap-2">
				<TrackCodePickerList label="Incomplete / Held" bind:trackCodeList={trackCodes} bind:trackCodeStore={incompleteHeldCodes} />
			</div>
			<div class="flex items-center gap-2">
				<TrackCodePickerList label="Process / Mailed" bind:trackCodeList={trackCodes} bind:trackCodeStore={processMailedCodes} />
			</div>
			<div class="flex items-center gap-2">
				<TrackCodePickerList label="Approved" bind:trackCodeList={trackCodes} bind:trackCodeStore={approvedCodes} />
			</div>
			<div class="flex items-center gap-2">
				<TrackCodePickerList label="Reviewed / No Change" bind:trackCodeList={trackCodes} bind:trackCodeStore={reviewedNoChangeCodes} />
			</div>
			<div class="flex items-center gap-2">
				<TrackCodePickerList label="Denied / Declined" bind:trackCodeList={trackCodes} bind:trackCodeStore={deniedDeclinedCodes} />
			</div>
			<div class="flex items-center gap-2">
				<TrackCodePickerList label="Cancelled / Don't Need" bind:trackCodeList={trackCodes} bind:trackCodeStore={cancelledDontNeedCodes} />
			</div>
			<div class="flex items-center gap-2">
				<span class="flex flex-col space-y-1">
					<label for="formType">Form Type</label>
					<select required class="input rounded-md w-fit" name="formType">
						<option disabled selected value="">Select one...</option>
						<option value="None">None</option>
						<option value="Paper">Paper</option>
						<option value="Online">Online</option>
					</select>
				</span>
				<span class="flex flex-col space-y-1">
					<label for="requiredAdvisor" class="mb-2 text-transparent">Requires Appt. with Advisor</label>
					<SlideToggle name="requiredAdvisor" size="sm">Requires Appt. with Advisor</SlideToggle>
				</span>
				<span class="flex flex-col space-y-1">
					<label for="uploadable" class="mb-2 text-transparent">Uploadable</label>
					<SlideToggle name="uploadable" size="sm">Uploadable</SlideToggle>
				</span>
			</div>
		</section>
		<footer class="float-right mt-3">
			<button type="submit" class="btn bg-accSlate text-white/90 rounded-md">
				{#if isLoading}
					<div class="flex space-x-6">
						<Loading />
						<h1>Loading...</h1>
					</div>
				{:else}
					Create
				{/if}
			</button>
		</footer>
	</form>
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
