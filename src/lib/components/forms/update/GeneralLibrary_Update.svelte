<script lang="ts">
	import type { GeneralLibrary, UserProfile } from '@prisma/client';
	import { Loading, UserPicker } from '$lib/components';
	import { getModalStore } from '@skeletonlabs/skeleton';

	interface FullGeneralLibrary extends GeneralLibrary {
		trainers: UserProfile[];
	}

	let modalStore = getModalStore();
	let isLoading = false;
	let constants = $modalStore[0].meta.constants;
	let library: FullGeneralLibrary = $modalStore[0].meta.library;

	let stringEmailList = '';

	function closeForm(): void {
		modalStore.close();
	}
</script>

<section class="w-[44rem] max-h-[calc(100%_-_5rem)] overflow-y-auto bg-usfWhite p-4 rounded-md">
	<div class="flex justify-between items-center">
		<h1 class="text-xl text-usfGreen font-medium">Update General Library Video</h1>
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<i class="fa-solid fa-xmark fa-lg text-black cursor-pointer" on:click={closeForm} />
	</div>
	<br />
	<form method="POST" action="/training?/updateLibrary" enctype="multipart/form-data">
		<input type="hidden" name="id" value={library.id} />
		<input type="hidden" name="trainerList" bind:value={stringEmailList} />
		<section class="space-y-2">
			<div class="flex space-x-2">
				<span class="flex flex-col w-full space-y-1">
					<label for="title">Title</label>
					<input required type="text" name="title" class="input rounded-md" placeholder="Title..." value={library.name} />
				</span>
				<span class="flex flex-col space-y-1">
					<label for="date">Date</label>
					<input required type="date" name="date" class="input rounded-md" value={library.date.toISOString().split('T')[0]} />
				</span>
			</div>
			<UserPicker label="Trainers" currentList={library.trainers} users={constants.users} bind:stringEmailList />
			<div class="space-y-2">
				<div class="flex items-center space-x-2">
					<label for="chips">Training Video</label>
				</div>
				<div class="flex items-center space-x-2">
					<input name="url" type="text" class="input rounded-md" placeholder="Video URL..." value={library.url} />
				</div>
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
