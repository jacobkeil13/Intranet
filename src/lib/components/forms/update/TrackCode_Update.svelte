<script lang="ts">
	import type { TrackCode } from '@prisma/client';
	import { Loading } from '$lib/components';
	import { SlideToggle, getModalStore } from '@skeletonlabs/skeleton';

	let modalStore = getModalStore();
	let isLoading = false;
	let trackCode: TrackCode = $modalStore[0].meta.trackCode;

	function closeForm(): void {
		modalStore.close();
	}
</script>

<section class="w-[40rem] max-h-[calc(100%_-_5rem)] overflow-y-auto bg-usfWhite p-4 rounded-md">
	<div class="flex justify-between items-center">
		<h1 class="text-xl text-usfGreen font-medium">Update Track Code</h1>
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<i class="fa-solid fa-xmark fa-lg text-black cursor-pointer" on:click={closeForm} />
	</div>
	<br />
	<form method="POST" action="/track_spreadsheet?/updateReqCode" enctype="multipart/form-data">
		<input type="hidden" name="id" value={trackCode.id} />
		<section class="flex flex-col gap-2">
			<div class="flex space-x-2">
				<span class="flex flex-col w-full space-y-1">
					<label for="statusIndicator">Status Indicator</label>
					<input required type="text" name="statusIndicator" class="input rounded-md" placeholder="Status Indicator..." value={trackCode.statusIndicator} />
				</span>
				<span class="flex flex-col space-y-1">
					<label for="satisfied" class="mb-2 text-transparent">Satisfied</label>
					<SlideToggle name="satisfied" size="sm" bind:checked={trackCode.satisfied}>Satisfied</SlideToggle>
				</span>
			</div>
			<div class="flex flex-col gap-2">
				<label for="description">Description</label>
				<textarea required class="input rounded-md" name="description" cols="20" rows="4" placeholder="Code description..." value={trackCode.description} />
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
					Update
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

	textarea {
		background-color: #ffffff;
		color: black;
		border-color: #3e4c7a8a;
	}
</style>
