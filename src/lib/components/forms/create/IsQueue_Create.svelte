<script lang="ts">
	import type { UserProfile } from '@prisma/client';
	import { Autocomplete, InputChip, getModalStore, type AutocompleteOption } from '@skeletonlabs/skeleton';
	import Loading from '../../animation/Loading.svelte';
	import UserPicker from '$lib/components/UserPicker.svelte';

	let modalStore = getModalStore();
	let isLoading = false;
	let delayPost = false;
	let constants = $modalStore[0].meta.constants;
	let isTeam = $modalStore[0].meta.isTeam;
	let managementTeam: UserProfile[] = $modalStore[0].meta.managementTeam[0].userProfile;

	let stringEmailList: string = '';

	function closeForm(): void {
		modalStore.close();
	}
</script>

<section class="w-[40rem] max-h-[calc(100%_-_5rem)] overflow-y-auto bg-usfWhite p-4 rounded-md">
	<div class="flex justify-between items-center">
		<h1 class="text-xl text-usfGreen font-medium">Create IS Queue Request</h1>
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<i class="fa-solid fa-xmark fa-lg text-black cursor-pointer" on:click={closeForm}></i>
	</div>
	<br />
	<form method="POST" action="/is_queue?/create" enctype="multipart/form-data">
		<input type="hidden" name="emailList" bind:value={stringEmailList} />
		<section class="space-y-2">
			<div class="flex space-x-2">
				<span class="flex flex-col w-full space-y-1">
					<label for="title">Title</label>
					<input required type="text" name="title" class="input rounded-md" placeholder="Title..." />
				</span>
				<span class="flex flex-col space-y-1">
					<label for="dateNeeded">Date Needed</label>
					<input required type="date" name="dateNeeded" class="input rounded-md" />
				</span>
			</div>
			<div class="flex space-x-2">
				<span class="flex flex-col w-full space-y-1">
					<label for="requestType">Request Type</label>
					<select required class="input rounded-md" name="requestType">
						<option disabled selected value="">Select one...</option>
						{#each constants.requestTypes as requestType}
							<option value={requestType.name}>{requestType.name}</option>
						{/each}
					</select>
				</span>
				<span class="flex flex-col space-y-1">
					<label for="priority">Priority</label>
					<select required class="input rounded-md w-fit" name="priority">
						<option disabled selected value="">Select one...</option>
						{#each constants.priorities as priority}
							<option value={priority.name}>{priority.name}</option>
						{/each}
					</select>
				</span>
				<span class="flex flex-col space-y-1">
					<label for="delayPost">Delay</label>
					<select class="input rounded-md w-fit" name="delayPost" value={delayPost ? 'yes' : 'no'} on:change={() => (delayPost = !delayPost)}>
						<option value="no">No</option>
						<option value="yes">Yes</option>
					</select>
				</span>
			</div>
			<div class="flex space-x-2">
				<span class="flex flex-col w-full space-y-1">
					<label for="approvingManagerId">Approving Manager</label>
					<select class="input rounded-md" name="approvingManagerId">
						<option selected value="">Select One...</option>
						{#each managementTeam as user}
						 <option value={user.id}>{user.first_name} {user.last_name}</option>
						{/each}
					</select>
				</span>
				{#if delayPost}
					<span class="flex flex-col space-y-1">
						<label for="delayPostDate">Post Date</label>
						<input required type="date" name="delayPostDate" class="input rounded-md w-fit" />
					</span>
					<span class="flex flex-col space-y-1">
						<label for="postTo">Post To</label>
						<select required class="input rounded-md w-fit" name="postTo">
							<option selected disabled value="">Select one...</option>
							<option value="internet">Internet</option>
							<option value="intranet">Intranet</option>
						</select>
					</span>
				{/if}
			</div>
			<UserPicker team={isTeam[0].userProfile} users={constants.users} bind:stringEmailList={stringEmailList} />
			<div class="flex flex-col space-y-2">
				<label for="description">Description</label>
				<textarea required class="input rounded-md" name="description" cols="20" rows="4" placeholder="Why are you making this request..." />
			</div>
		</section>
		<footer class="float-right mt-3">
			<button type="submit" class="btn bg-accSlate text-white/90 rounded-md">
				{#if isLoading}
					<div class="flex items-center space-x-6">
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
	option:hover {
		background-color: white;
	}

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
		background-color: #ffffff;
		border-color: #3e4c7a8a;
	}
</style>
