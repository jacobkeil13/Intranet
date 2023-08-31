<script lang="ts">
	import { SlideToggle, modalStore } from '@skeletonlabs/skeleton';
	import Loading from '$lib/components/animation/Loading.svelte';
	import type { Referral } from '@prisma/client';
	import { getDateLocal } from '$lib/helpers';

	let isLoading = false;
	let constants = $modalStore[0].meta.constants;
  let referral: Referral = $modalStore[0].meta.referral;

	function closeForm(): void {
		modalStore.close();
	}
</script>

<section class="w-[44rem] max-h-[calc(100%_-_5rem)] overflow-y-auto bg-usfWhite p-4 rounded-md">
	<div class="flex justify-between items-center">
		<h1 class="text-xl text-usfGreen font-medium">Update Referral</h1>
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<box-icon class="fill-black cursor-pointer" name="x" on:click={closeForm} />
	</div>
	<br />
	<form method="POST" action="/referrals?/update" enctype="multipart/form-data">
    <input type="hidden" name="id" value={referral.id} />
    <input type="hidden" name="type" value={referral.type} />
		<section class="space-y-2">
			<div class="flex space-x-2">
				<span class="flex flex-col w-full space-y-1">
					<label for="studentName">Student Name</label>
					<input readonly required type="text" name="studentName" class="rounded-md border border-[#3e4c7a8a]" placeholder="Title..." value={referral.studentName} />
				</span>
				<span class="flex flex-col space-y-1">
					<label for="visitorType">Visitor Type</label>
					<input readonly required type="text" name="visitorType" class="rounded-md" value={referral.visitorType} />
				</span>
        <span class="flex flex-col space-y-1">
					<label for="studentUid">UID</label>
					<input readonly required type="text" name="studentUid" class="rounded-md" value={referral.studentUid} />
				</span>
			</div>
      <div class="flex space-x-2">
        <span class="flex flex-col space-y-1">
					<label for="complete" class="mb-2 text-transparent">Completed</label>
					<SlideToggle name="complete" size="sm" checked={referral.completed}>Completed</SlideToggle>
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
</style>