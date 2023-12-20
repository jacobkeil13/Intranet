<script lang="ts">
	import { Loading, UserPicker} from '$lib/components';
	import { getModalStore } from '@skeletonlabs/skeleton';

	let modalStore = getModalStore();
	let isLoading = false;
	let constants = $modalStore[0].meta.constants;

	let stringEmailList: string = '';

	function closeForm(): void {
		modalStore.close();
	}
</script>

<section class="w-[40rem] max-h-[calc(100%_-_5rem)] overflow-y-auto bg-usfWhite p-4 rounded-md">
	<div class="flex justify-between items-center">
		<h1 class="text-xl text-usfGreen font-medium">Create General Library Video</h1>
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<i class="fa-solid fa-xmark fa-lg text-black cursor-pointer" on:click={closeForm} />
	</div>
	<br />
	<form method="POST" action="/training?/createLibrary" enctype="multipart/form-data">
		<input type="hidden" name="trainerList" bind:value={stringEmailList} />
		<section class="space-y-2">
			<div class="flex space-x-2">
				<span class="flex flex-col w-full space-y-1">
					<label for="title">Title</label>
					<input required type="text" name="title" class="input rounded-md" placeholder="Title..." />
				</span>
				<span class="flex flex-col space-y-1">
					<label for="date">Date</label>
					<input required type="date" name="date" class="input rounded-md" />
				</span>
			</div>
			<UserPicker label="Trainers" users={constants.users} bind:stringEmailList />
			<div class="space-y-2">
				<div class="flex items-center space-x-2">
					<label for="video">Training Video</label>
				</div>
				<section class="space-y-2">
					<div class="flex items-center space-x-2">
						<input required name="url" type="text" class="input rounded-md" placeholder="Video URL..." />
					</div>
				</section>
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
					Create
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
