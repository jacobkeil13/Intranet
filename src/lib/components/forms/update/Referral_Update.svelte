<script lang="ts">
	import { SlideToggle, modalStore } from '@skeletonlabs/skeleton';
	import Loading from '$lib/components/animation/Loading.svelte';
	import type { Referral, ReferralComment } from '@prisma/client';
	import { getDateLocal } from '$lib/helpers';

	interface FullReferral extends Referral {
		comments: ReferralComment[]
	}

	let isLoading = false;
  let referral: FullReferral = $modalStore[0].meta.referral;
	let completed = referral.completed;

	function closeForm(): void {
		modalStore.close();
	}
</script>

<section class="w-[60rem] max-h-[calc(100%_-_5rem)] overflow-y-auto bg-usfWhite p-4 rounded-md">
	<div class="flex justify-between items-center">
		<h1 class="text-xl text-usfGreen font-medium">Update Referral</h1>
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<box-icon class="fill-black cursor-pointer" name="x" on:click={closeForm} />
	</div>
	<br />
	<section class="grid grid-cols-[1fr_2fr] gap-4">
		<div class="space-y-1">
			<h1>Comments</h1>
			<div class="space-y-1 max-h-[400px] overflow-auto">
				{#each referral.comments as comment}
					<div class="card rounded-sm px-2 py-1">
						<h1>
							<span class="text-usfGreen font-semibold">
								{comment.user}
							</span> - {getDateLocal(comment.createdAt.toISOString(), "MMMM Do h:mmA")}</h1>
						<p>{comment.content}</p>
					</div>
				{/each}
			</div>
		</div>
		<form method="POST" action="/referrals?/update" enctype="multipart/form-data">
			<input type="hidden" name="id" value={referral.id} />
			<input type="hidden" name="type" value={referral.type} />
			<section class="space-y-2">
				<div class="flex space-x-2">
					<span class="flex flex-col w-full space-y-1">
						<label for="studentName">Student Name</label>
						<input readonly required type="text" name="studentName" class="rounded-md" placeholder="Title..." value={referral.studentName} />
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
						<label for="counterUser">Counter User</label>
						<input readonly required type="text" name="counterUser" class="rounded-md" value={referral.counterUser} />
					</span>
					<span class="flex flex-col space-y-1">
						<label for="bestTimeCallback">Best Time Callback</label>
						<input readonly required type="text" name="bestTimeCallback" class="rounded-md" value={getDateLocal(referral.bestTimeCallback.toISOString(), "h:mmA")} />
					</span>
					<span class="flex flex-col space-y-1">
						<label for="callbackNumber">Callback Number</label>
						<input readonly required type="text" name="callbackNumber" class="rounded-md" value={referral.callbackNumber} />
					</span>
				</div>
				<div class="flex space-x-2">
					<span class="flex flex-col space-y-1 w-full">
						<label for="reason">Reason</label>
						<input readonly required type="text" name="reason" class="rounded-md" placeholder="Title..." value={referral.reason} />
					</span>
					<span class="flex flex-col space-y-1 w-full">
						<label for="preferredContactMethod">Preferred Method</label>
						<input readonly required type="text" name="preferredContactMethod" class="rounded-md" placeholder="Title..." value={referral.preferredContactMethod} />
					</span>
				</div>
				<div class="flex flex-col space-y-2">
					<label for="description">Comment</label>
					<textarea required class="rounded-md" name="description" cols="20" rows="4" placeholder="Why are you updating this..." />
				</div>
				<div class="flex space-x-2">
					{#if referral.escalationUser}
						<span class="flex flex-col space-y-1 w-fit">
							<label for="reason">Escalated Referral</label>
							<input readonly required type="text" name="reason" class="rounded-md" placeholder="Title..." value={referral.escalationUser} />
						</span>
					{/if}
					{#if referral.researchUser}
						<span class="flex flex-col space-y-1 w-fit">
							<label for="reason">Research Referral</label>
							<input readonly required type="text" name="reason" class="rounded-md" placeholder="Title..." value={referral.researchUser} />
						</span>
					{/if}
					<span class="flex flex-col space-y-1 w-fit">
						<label for="preferredContactMethod">Response Method</label>
						<select required={completed} class="input rounded-md" name="responseMethod" value={referral.responseMethod ?? ""}>
							<option disabled selected value="">Select one...</option>
							<option value="Phone">Phone</option>
							<option value="Email">Email</option>
						</select>
					</span>
					<span class="flex flex-col space-y-1">
						<label for="complete" class="mb-2 text-transparent">Completed</label>
						<SlideToggle name="complete" size="sm" bind:checked={completed}>Completed</SlideToggle>
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
</section>

<style>
	input {
		background-color: #ffffff;
		color: black;
		border-color: #3e4c7a8a;
	}

	select {
		color: black;
		background-color: #ffffff;
		border-color: #3e4c7a8a;
	}
</style>