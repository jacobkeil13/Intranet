<script lang="ts">
	import { SlideToggle, getModalStore } from '@skeletonlabs/skeleton';
	import Loading from '$lib/components/animation/Loading.svelte';
	import type { Referral, ReferralComment, UserProfile } from '@prisma/client';
	import { getDateLocal } from '$lib/helpers';
	import TextareaCopy from '$lib/components/TextareaCopy.svelte';
	import UserPicker from '$lib/components/UserPicker.svelte';

	interface FullReferral extends Referral {
		comments: ReferralComment[];
	}

	let modalStore = getModalStore();
	let isLoading = false;
	let referral: FullReferral = $modalStore[0].meta.referral;
	let completed = referral.completed;
	let rhacomm = referral.completed;
	let referralTypeChange = false;
	let content = '';
	let stringEmailList = '[]';

	let users: UserProfile[] = $modalStore[0].meta.constants.users;
	let currentCollabs: UserProfile[] = $modalStore[0].meta.constants.users.filter((user: { first_name: string; last_name: string }) => {
		if (referral.researchUser !== null && referral.referralType === 'Collaboration Referral') {
			if (referral.researchUser.split(',').includes(user.first_name + ' ' + user.last_name)) {
				return user;
			}
		}
	});

	function closeForm(): void {
		modalStore.close();
	}

	function validate() {
		if (!rhacomm) {
			let rhacommEl = document.getElementById('rhacomm');
			rhacommEl?.classList.add('shake');
			setTimeout(() => {
				rhacommEl?.classList.remove('shake');
			}, 200);
		}
		if (!referralTypeChange) {
			let rhacommEl = document.getElementById('referralChange');
			rhacommEl?.classList.add('shake');
			setTimeout(() => {
				rhacommEl?.classList.remove('shake');
			}, 200);
		}
	}
</script>

<section class="w-[60rem] max-h-[calc(100%_-_5rem)] overflow-hidden bg-usfWhite p-4 rounded-md">
	<div class="flex justify-between items-center">
		<h1 class="text-xl text-usfGreen font-medium">Update {referral.referralType}</h1>
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<i class="fa-solid fa-xmark fa-lg text-black cursor-pointer" on:click={closeForm} />
	</div>
	<br />
	<section class="grid grid-cols-[1fr_2fr] gap-4">
		<div class="space-y-1">
			<h1>Comments</h1>
			<div class="space-y-1 max-h-[42rem] w-auto overflow-y-auto box-border">
				{#each referral.comments as comment}
					<div class="rounded p-2 border border-accSlate/20 shadow-sm">
						<h1 class="text-sm">
							<span class="text-usfGreen font-semibold">
								{comment.user}
							</span>
							- {getDateLocal(comment.createdAt.toISOString(), 'MMM Do h:mmA')}
						</h1>
						<p class="text-sm">{comment.content}</p>
					</div>
				{/each}
			</div>
		</div>
		<form method="POST" action="/referrals?/update" enctype="multipart/form-data">
			<input type="hidden" name="id" value={referral.id} />
			<input type="hidden" name="type" value={referral.referralType} />
			<input type="hidden" name="collaborators" bind:value={stringEmailList} />
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
						<label for="counterUser">Referral Owner</label>
						<input readonly required type="text" name="counterUser" class="rounded-md" value={referral.escalationUser === null ? referral.counterUser : referral.escalationUser} />
					</span>
					{#if referral.escalationUser}
						<div class="flex space-x-2">
							{#if referral.escalationUser}
								<span class="flex flex-col space-y-1 w-fit">
									<label for="counterUser">Escalated By</label>
									<input readonly required type="text" name="counterUser" class="rounded-md" value={referral.counterUser} />
								</span>
							{/if}
						</div>
					{/if}
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
				{#if referral.referralType !== 'Escalated Referral'}
					<UserPicker label="Collaborators" currentList={currentCollabs} {users} bind:stringEmailList />
				{/if}
				<div class="flex flex-col space-y-1">
					<label for="description">Comment</label>
					<TextareaCopy bind:content>
						<svelte:fragment slot="textarea">
							<textarea required class="rounded-md w-full" name="description" cols="20" rows="4" placeholder="Why are you updating this..." bind:value={content} />
						</svelte:fragment>
					</TextareaCopy>
				</div>
				<div class="flex space-x-2">
					<span class="flex flex-col space-y-1 w-fit">
						<label for="preferredContactMethod">Response Method</label>
						<select required={completed} class="input rounded-md w-fit" name="responseMethod" value={referral.responseMethod ?? ''}>
							<option disabled selected value="">Select one...</option>
							<option value="ROAMESG">ROAMESG</option>
							<option value="Phone">Phone</option>
							<option value="Email">Email</option>
						</select>
					</span>
				</div>
				{#if completed}
					<div id="rhacomm" class:border-usfGreen={rhacomm} class="card flex items-center space-x-3 p-4 w-fit border border-red-700 bg-transparent">
						<SlideToggle required={completed} name="rhacomm" size="sm" bind:checked={rhacomm} />
						{#if rhacomm}
							<h1>Annotated RHACOMM!</h1>
						{:else}
							<h1>Annotate RHACOMM before you can complete!</h1>
						{/if}
					</div>
				{/if}
				{#if (referral.referralType === 'Collaboration Referral' && stringEmailList === '[]') || (referral.referralType === 'Self Referral' && stringEmailList.length > 5)}
					<div id="referralChange" class:border-usfGreen={referralTypeChange} class="card flex items-center space-x-3 p-4 w-fit border border-red-700 bg-transparent">
						{#if referral.referralType === 'Collaboration Referral'}
							<SlideToggle required={referral.referralType === 'Collaboration Referral' && stringEmailList === '[]'} name="referralChange" size="sm" bind:checked={referralTypeChange} />
							{#if referralTypeChange}
								<h1>Referral change acknowledged.</h1>
							{:else}
								<h1>I acknowledge that this will be changed to a Self Referral.</h1>
							{/if}
						{:else}
							<SlideToggle required={referral.referralType === 'Self Referral' && stringEmailList === '[]'} name="referralChange" size="sm" bind:checked={referralTypeChange} />
							{#if referralTypeChange}
								<h1>Referral change acknowledged.</h1>
							{:else}
								<h1>I acknowledge that this will be changed to a Collaboration Referral.</h1>
							{/if}
						{/if}
					</div>
				{/if}
			</section>
			<footer class="flex items-center gap-4 float-right mt-3">
				<span class="flex flex-col space-y-1">
					<SlideToggle name="complete" size="sm" bind:checked={completed}>Completed</SlideToggle>
				</span>
				<button
					disabled={!referralTypeChange &&
						((referral.referralType === 'Collaboration Referral' && stringEmailList === '[]') || (referral.referralType === 'Self Referral' && stringEmailList.length > 5))}
					on:click={validate}
					type="submit"
					class="btn bg-accSlate text-white/90 rounded-md"
				>
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

	textarea {
		color: black;
		background-color: #ffffff;
		border-color: #3e4c7a8a;
	}
</style>
