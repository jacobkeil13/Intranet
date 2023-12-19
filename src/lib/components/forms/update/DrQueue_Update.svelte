<script lang="ts">
	import type { DataQueueComment, DataQueueItem, DataRequestType, Priority, UserProfile } from '@prisma/client';
	import { Loading, UserPicker, FileUpload } from '$lib/components';
	import { SlideToggle, getModalStore } from '@skeletonlabs/skeleton';
	import { getDateLocal } from '$lib/helpers';

	interface FullRequest extends DataQueueItem {
		priority: Priority;
		requestedBy: UserProfile;
		assignedTo: UserProfile;
		approvedBy: UserProfile;
		requestType: DataRequestType;
		emailTo: UserProfile[];
		comments: DataQueueComment[];
	}

	let modalStore = getModalStore();
	let isLoading = false;
	let constants = $modalStore[0].meta.constants;
	let eptTeam: UserProfile[] = $modalStore[0].meta.eptTeam[0].userProfile;
	let request: FullRequest = $modalStore[0].meta.request;
	let users: UserProfile[] = $modalStore[0].meta.constants.users;
	let loggedInUserId = $modalStore[0].meta.profile.id;

	let stringEmailList: string = '';
	let stringFileList: string = '';

	function closeForm(): void {
		modalStore.close();
	}
</script>

<section class="w-[60rem] max-h-[calc(100%_-_5rem)] overflow-y-auto bg-usfWhite p-4 rounded-md">
	<div class="flex justify-between items-center">
		<h1 class="text-xl text-usfGreen font-medium">Update DR Queue Request</h1>
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<i class="fa-solid fa-xmark fa-lg text-black cursor-pointer" on:click={closeForm} />
	</div>
	<br />
	<section class="grid grid-cols-[1fr_2fr] gap-4">
		<div class="space-y-1">
			<h1>Comments</h1>
			<div class="space-y-1 max-h-[400px] w-[300px] overflow-y-auto">
				{#if request.comments.length > 0}
					{#each request.comments as comment}
						<div class="rounded p-2 border border-accSlate/20 shadow-sm">
							<h1 class="text-sm">
								<span class="text-usfGreen font-semibold">
									{comment.user}
								</span>
								- {getDateLocal(comment.createdAt.toISOString(), 'MMM Do h:mmA')}
							</h1>
							<!-- <p class="text-sm break-words">{comment.content}</p> -->
							<pre class="text-sm whitespace-pre-wrap">{@html comment.content}</pre>
						</div>
					{/each}
				{:else}
					<div class="rounded p-2 border border-accSlate/20 shadow-sm">
						<pre class="text-sm whitespace-pre-wrap">No comments...</pre>
					</div>
				{/if}
			</div>
		</div>
		<form method="POST" action="/dr_queue?/update" enctype="multipart/form-data">
			<input type="hidden" name="id" value={request.id} />
			<input type="hidden" name="requestedById" value={request.requestedBy.id} />
			<input type="hidden" name="emailList" bind:value={stringEmailList} />
			<section class="space-y-2">
				<div class="flex space-x-2">
					<span class="flex flex-col w-full space-y-1">
						<label for="title">Title</label>
						<input required type="text" name="title" class="input rounded-md" placeholder="Title..." value={request.title} />
					</span>
					<span class="flex flex-col space-y-1">
						<label for="dateNeeded">Date Needed</label>
						<input required type="date" name="dateNeeded" class="input rounded-md" value={getDateLocal(request.dateNeeded.toISOString(), 'YYYY-MM-DD')} />
					</span>
				</div>
				<div class="flex space-x-2">
					<span class="flex flex-col w-full space-y-1">
						<label for="assignedToId">Assigned User</label>
						<select required class="input rounded-md" name="assignedToId" value={request.assignedTo === null ? '' : request.assignedTo.id}>
							<option disabled selected value="">Select one...</option>
							{#each eptTeam as user}
								<option value={user.id}>{user.first_name} {user.last_name}</option>
							{/each}
						</select>
					</span>
					<span class="flex flex-col w-full space-y-1">
						<label for="requestType">Request Type</label>
						<select required class="input rounded-md" name="requestType" value={request.requestType.name}>
							<option disabled selected value="">Select one...</option>
							{#each constants.dataRequestTypes as dataRequestType}
								<option value={dataRequestType.name}>{dataRequestType.name}</option>
							{/each}
						</select>
					</span>
					<span class="flex flex-col space-y-1 grow">
						<label for="priority">Priority</label>
						<select required class="input rounded-md w-fit" name="priority" value={request.priority.name}>
							<option disabled selected value="">Select one...</option>
							{#each constants.priorities as priority}
								<option value={priority.name}>{priority.name}</option>
							{/each}
						</select>
					</span>
				</div>
				<h1>Default Email List</h1>
				<div class="flex gap-2 flex-wrap">
					{#each eptTeam as user}
						{#if !user.netid.startsWith('tbd')}
							<span class="badge bg-accSlate text-white/90 rounded-sm">{user.first_name} {user.last_name}</span>
						{/if}
					{/each}
					{#if eptTeam.filter((user) => user.id === request.requestedBy.id).length < 1}
						<span class="badge bg-accSlate text-white/90 rounded-sm">{request.requestedBy.first_name} {request.requestedBy.last_name}</span>
					{/if}
				</div>
				<UserPicker team={eptTeam} currentList={request.emailTo.filter((user) => user.id !== request.requestedBy.id)} users={users.filter((user) => user.id !== loggedInUserId)} bind:stringEmailList />
				<FileUpload bind:stringFileList bind:isLoading>
					<svelte:fragment slot="description">
						<div class="flex flex-col space-y-2">
							<label for="description">Comment</label>
							<textarea class="input rounded-md" name="description" cols="20" rows="5" placeholder="Why are you making this request..." />
						</div>
					</svelte:fragment>
				</FileUpload>
			</section>
			<footer class="flex items-center gap-4 float-right mt-3">
				<span class="flex flex-col space-y-1">
					<SlideToggle name="complete" size="sm" checked={request.complete}>Completed</SlideToggle>
				</span>
				<button disabled={isLoading} type="submit" class="btn bg-accSlate text-white/90 rounded-md">
					{#if isLoading}
						<div class="flex items-center space-x-6">
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
