<script lang="ts">
	import { getModalStore } from '@skeletonlabs/skeleton';
	import Loading from '$lib/components/animation/Loading.svelte';
	import type { TrainingSchedule, UserProfile } from '@prisma/client';
	import { getDateLocal } from '$lib/helpers';
	import UserPicker from '$lib/components/UserPicker.svelte';

	interface FullTraining extends TrainingSchedule {
		trainers: UserProfile[];
	}

	let modalStore = getModalStore();
	let isLoading = false;
	let constants = $modalStore[0].meta.constants;
	let training: FullTraining = $modalStore[0].meta.training;

	let stringEmailList = '';

	function closeForm(): void {
		modalStore.close();
	}
</script>

<section class="w-[44rem] max-h-[calc(100%_-_5rem)] overflow-y-auto bg-usfWhite p-4 rounded-md">
	<div class="flex justify-between items-center">
		<h1 class="text-xl text-usfGreen font-medium">Update Training</h1>
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<i class="fa-solid fa-xmark fa-lg text-black cursor-pointer" on:click={closeForm} />
	</div>
	<br />
	<form method="POST" action="/training?/updateTraining" enctype="multipart/form-data">
		<input type="hidden" name="id" value={training.id} />
		<input type="hidden" name="trainerList" value={stringEmailList} />
		<section class="space-y-2">
			<div class="flex space-x-2">
				<span class="flex flex-col w-full space-y-1">
					<label for="title">Title</label>
					<input required type="text" name="title" class="input rounded-md" placeholder="Title..." value={training.name} />
				</span>
				<span class="flex flex-col space-y-1">
					<label for="date">Date</label>
					<input required type="date" name="date" class="input rounded-md" value={getDateLocal(training.date.toISOString(), 'YYYY-MM-DD')} />
				</span>
			</div>
			<UserPicker label="Trainers" currentList={training.trainers} users={constants.users} bind:stringEmailList />
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
