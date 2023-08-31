<script lang="ts">
	import { modalStore } from '@skeletonlabs/skeleton';
	import Loading from '../../animation/Loading.svelte';
	import { getDateLocal } from '$lib/helpers';

	let isLoading = false;
	let constants = $modalStore[0].meta.constants;
	
	let item: any = $modalStore[0].meta.item;
	console.log(item);
	
	function closeForm(): void {
		modalStore.close();
	}
</script>

<section class="w-[60rem] max-h-[calc(100%_-_5rem)] overflow-y-auto bg-usfWhite p-4 rounded-md">
	<div class="flex justify-between items-center">
		<h1 class="text-xl text-usfGreen font-medium">Update Master Calendar Item</h1>
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<box-icon class="fill-black cursor-pointer" name="x" on:click={closeForm} />
	</div>
	<br />
	<section class="grid grid-cols-[1fr_2fr] gap-4">
		<div class="space-y-1">
			<h1>Comments</h1>
			<div class="space-y-1 max-h-[400px] overflow-auto">
				{#each item.comments as comment}
					<div class="card rounded-sm px-2 py-1">
						<h1>
							<span class="text-usfGreen font-semibold">
								{comment.userProfile.first_name} {comment.userProfile.last_name}
							</span> - {getDateLocal(comment.createdAt.toISOString(), "MMMM Do h:mmA")}</h1>
						<p>{comment.content}</p>
					</div>
				{/each}
			</div>
		</div>
		<form method="POST" action="/master_calendar?/update" enctype="multipart/form-data">
			<input type="hidden" name="id" value={item.id}>
			<section class="space-y-2">
				<div class="flex space-x-2">
					<span class="flex flex-col w-full space-y-1">
						<label for="title">Title</label>
						<input required type="text" name="title" class="input rounded-md" placeholder="Title..." value={item.title} />
					</span>
					<span class="flex flex-col space-y-1">
						<label for="dueDate">Due Date</label>
						<input required type="date" name="dueDate" class="input rounded-md" value={getDateLocal(item.dueDate, "YYYY-MM-DD")} />
					</span>
				</div>
				<div class="flex space-x-2">
					<span class="flex flex-col w-full space-y-1">
						<label for="primaryOwner">Primary Owner</label>
						<select required class="input rounded-md" name="primaryOwner" value={item.primaryOwner.id}>
							<option disabled selected value="">Select one...</option>
							{#each constants.users as user}
								<option value={user.id}>{user.first_name} {user.last_name}</option>
							{/each}
						</select>
					</span>
					<span class="flex flex-col w-full space-y-1">
						<label for="type">Type</label>
						<select required class="input rounded-md" name="type" value={item.type.type}>
							<option disabled selected value="">Select one...</option>
							{#each constants.masterCalendarTypes as masterCalendarType}
								<option value={masterCalendarType.type}>{masterCalendarType.name}</option>
							{/each}
						</select>
					</span>
				</div>
				<div class="flex flex-col space-y-2">
					<label for="chips">Secondary Owners</label>
					<div class="flex flex-wrap gap-1">
						{#each item.secondaryOwners as user}
							<span class="badge bg-accSlate text-white/90 rounded-md">{user.first_name} {user.last_name}</span>
						{/each}
        	</div>
				</div>
				<div class="flex flex-col space-y-2">
					<label for="description">Comment</label>
					<textarea required class="input rounded-md" name="description" cols="20" rows="4" placeholder="Why are you updating this item..." />
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