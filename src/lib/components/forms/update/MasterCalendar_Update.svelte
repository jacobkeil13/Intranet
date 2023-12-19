<script lang="ts">
	import type { MasterCalendarComment, MasterCalendarItem, MasterCalendarType, UserProfile } from '@prisma/client';
	import { Loading, UserPicker } from '$lib/components';
	import { getModalStore } from '@skeletonlabs/skeleton';
	import { getDateLocal } from '$lib/helpers';
	import { enhance } from '$app/forms';

	interface FullCalendarItem extends MasterCalendarItem {
		type: MasterCalendarType;
		primaryOwner: UserProfile;
		secondaryOwners: UserProfile[];
		comments: MasterCalendarComment[];
	}

	let modalStore = getModalStore();
	let isLoading = false;
	let deletedSafety = false;
	let toDelete = false;
	let constants = $modalStore[0].meta.constants;

	let item: FullCalendarItem = $modalStore[0].meta.item;
	let completed = item.completionDate !== null;
	let completionDate = item.completionDate !== null ? getDateLocal(String(item.completionDate.toString()), 'YYYY-MM-DD') : '';

	let stringEmailList = '';

	function closeForm(): void {
		modalStore.close();
	}

	function response(action: 'delete' | 'update'): void {
		if ($modalStore[0] !== undefined) {
			$modalStore[0].meta.response(action);
		}
		closeForm();
	}

	function toggleSafety() {
		deletedSafety = !deletedSafety;
	}

	async function deleteCalendarItem(id: string) {
		if (deletedSafety && toDelete) {
			const formData = new FormData();
			formData.append('id', id);
			await fetch('/master_calendar?/delete', {
				method: 'POST',
				body: formData
			});

			response('delete');
		}
	}
</script>

<section class="w-[60rem] max-h-[calc(100%_-_5rem)] overflow-y-auto bg-usfWhite p-4 rounded-md">
	<div class="flex justify-between items-center">
		<div class="flex items-center gap-3">
			<h1 class="text-xl text-usfGreen font-medium">Update Master Calendar Item</h1>
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<i class="fa-solid fa-trash-can text-black/60 hover:text-red-600 cursor-pointer" on:click={toggleSafety} />
			{#if deletedSafety}
				<div class="flex items-center gap-3 px-3 py-[2px] rounded-md bg-red-600 text-white/90 font-medium">
					<button
						on:click={() => {
							deleteCalendarItem(item.id);
						}}>Delete Permanently</button
					>
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					{#if !toDelete}
						<i class="fa-regular fa-square-check text-white/90 cursor-pointer" on:click={() => (toDelete = !toDelete)} />
					{:else}
						<i class="fa-solid fa-square-check text-white/90 cursor-pointer" on:click={() => (toDelete = !toDelete)} />
					{/if}
				</div>
			{/if}
		</div>
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<i class="fa-solid fa-xmark fa-lg text-black cursor-pointer" on:click={closeForm} />
	</div>
	<br />
	<section class="grid grid-cols-[1fr_2fr] gap-4">
		<div class="space-y-1">
			<h1>Comments</h1>
			<div class="space-y-1 max-h-[600px] overflow-y-auto">
				{#if item.comments.length > 0}
					{#each item.comments as comment}
						<div class="rounded p-2 border border-accSlate/20 shadow-sm">
							<h1 class="text-sm">
								<span class="text-usfGreen font-semibold">
									{comment.user}
								</span>
								- {getDateLocal(comment.createdAt.toISOString(), 'MMM Do h:mmA')}
							</h1>
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
		<form
			use:enhance={() => {
				response('update');
			}}
			method="POST"
			action="/master_calendar?/update"
			enctype="multipart/form-data"
		>
			<input type="hidden" name="id" value={item.id} />
			<input type="hidden" name="secondaryOwners" bind:value={stringEmailList} />
			<section class="space-y-2">
				<div class="flex space-x-2">
					<span class="flex flex-col w-full space-y-1">
						<label for="title">Title</label>
						<input required type="text" name="title" class="input rounded-md" placeholder="Title..." value={item.title} />
					</span>
					<span class="flex flex-col space-y-1">
						<label for="dueDate">Due Date</label>
						<input required type="date" name="dueDate" class="input rounded-md" value={getDateLocal(item.dueDate.toISOString(), 'YYYY-MM-DD')} />
					</span>
				</div>
				<div class="flex space-x-2">
					<span class="flex flex-col space-y-1 min-w-fit">
						<label for="primaryOwner">Primary Owner</label>
						<select required class="input rounded-md" name="primaryOwner" value={item.primaryOwner.id}>
							<option disabled selected value="">Select one...</option>
							{#each constants.users as user}
								<option value={user.id}>{user.first_name} {user.last_name}</option>
							{/each}
						</select>
					</span>
					<span class="flex flex-col w-full space-y-1 grow">
						<label for="type">Type</label>
						<select required class="input rounded-md" name="type" value={item.type.type}>
							<option disabled selected value="">Select one...</option>
							{#each constants.masterCalendarTypes as masterCalendarType}
								<option value={masterCalendarType.type}>{masterCalendarType.name}</option>
							{/each}
						</select>
					</span>
				</div>
				<UserPicker currentList={item.secondaryOwners} users={constants.users} bind:stringEmailList />
				<div class="flex flex-col space-y-2">
					<label for="description">Comment</label>
					<textarea class="input rounded-md" name="description" cols="20" rows="4" placeholder="Why are you updating this item..." />
				</div>
				<div class="flex space-x-2">
					<span class="flex flex-col space-y-1">
						<label for="completionDate">Completion Date</label>
						<input required={completed} type="date" name="completionDate" class="input rounded-md" bind:value={completionDate} />
					</span>
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
						{completionDate !== '' ? 'Complete' : 'Update'}
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
