<script lang="ts">
	import type { UserProfile } from '@prisma/client';
	import { Loading, UserPicker, FileUpload } from '$lib/components';
	import { getModalStore } from '@skeletonlabs/skeleton';

	let modalStore = getModalStore();
	let isLoading = false;
	let delayPost = false;
	let constants = $modalStore[0].meta.constants;
	let users: UserProfile[] = $modalStore[0].meta.constants.users;
	let isTeam: UserProfile[] = $modalStore[0].meta.isTeam[0].userProfile;
	let loggedInUserId = $modalStore[0].meta.profile.id;
	let loggedInUser = $modalStore[0].meta.profile;

	let stringEmailList: string = '';
	let stringFileList: string = '';

	function closeForm(): void {
		modalStore.close();
	}
</script>

<section class="w-[40rem] max-h-[calc(100%_-_5rem)] overflow-y-auto bg-usfWhite p-4 rounded-md">
	<div class="flex justify-between items-center">
		<h1 class="text-xl text-usfGreen font-medium">Create IS Queue Request</h1>
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<i class="fa-solid fa-xmark fa-lg text-black cursor-pointer" on:click={closeForm} />
	</div>
	<br />
	<form method="POST" action="/is_queue?/create" enctype="multipart/form-data">
		<input type="hidden" name="emailList" bind:value={stringEmailList} />
		<input type="hidden" name="files" bind:value={stringFileList} />
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
					<select class="input rounded-md w-fit" name="priority">
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
			<h1>Default Email List</h1>
			<div class="flex gap-2 flex-wrap">
				{#each isTeam as user}
					<span class="badge bg-accSlate text-white/90 rounded-sm">{user.first_name} {user.last_name}</span>
				{/each}
				{#if isTeam.filter((user) => user.id === loggedInUserId).length < 1}
					<span class="badge bg-accSlate text-white/90 rounded-sm">{loggedInUser.first_name} {loggedInUser.last_name}</span>
				{/if}
			</div>
			<UserPicker team={isTeam} users={users.filter((user) => user.id !== loggedInUserId)} bind:stringEmailList />
			<FileUpload bind:stringFileList bind:isLoading>
				<svelte:fragment slot="description">
					<div class="flex flex-col space-y-2">
						<label for="description">Description</label>
						<textarea required class="input rounded-md" name="description" cols="20" rows="5" placeholder="Why are you making this request..." />
					</div>
				</svelte:fragment>
			</FileUpload>
		</section>
		<footer class="float-right mt-3">
			<button disabled={isLoading} type="submit" class="btn bg-accSlate text-white/90 rounded-md">
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
