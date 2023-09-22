<script lang="ts">
	import { SlideToggle, getModalStore } from '@skeletonlabs/skeleton';
	import Loading from '$lib/components/animation/Loading.svelte';

	let modalStore = getModalStore();
	let isLoading = false;
	let constants = $modalStore[0].meta.constants;

	function closeForm(): void {
		modalStore.close();
	}
</script>

<section class="w-[40rem] max-h-[calc(100%_-_5rem)] overflow-y-auto bg-usfWhite p-4 rounded-md">
	<div class="flex justify-between items-center">
		<h1 class="text-xl text-usfGreen font-medium">Create Form</h1>
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<i class="fa-solid fa-xmark fa-lg text-black cursor-pointer" on:click={closeForm}></i>
	</div>
	<br />
	<form method="POST" action="/documents/forms?/create" enctype="multipart/form-data">
		<section class="space-y-2">
			<div class="flex space-x-2">
				<span class="flex flex-col w-full space-y-1">
					<label for="fileName">File Name</label>
					<input required type="text" name="fileName" class="input rounded-md" placeholder="Name of file without extension..." />
				</span>
        <span class="flex flex-col space-y-1 grow min-w-fit">
					<label for="aidYear">Aid Year</label>
					<select required class="input rounded-md w-full" name="aidYear">
						<option disabled selected value="">Select one...</option>
						{#each constants.aidYears as aidYear}
							<option value={aidYear.name}>{aidYear.name}</option>
						{/each}
					</select>
				</span>
			</div>
			<div class="flex space-x-2">
        <span class="flex flex-col w-full space-y-1">
					<label for="owner">Owner</label>
					<select required class="input rounded-md" name="owner">
						<option disabled selected value="">Select one...</option>
						{#each constants.users as user}
							<option value={user.id}>{user.first_name} {user.last_name}</option>
						{/each}
					</select>
				</span>
			</div>
      <div class="flex space-x-2">
        <span class="flex flex-col space-y-1 flex-grow">
					<label for="rraareq">RRAAREQ Code</label>
					<input required type="text" name="rraareq" class="input rounded-md" placeholder="RRAAREQ Code..." />
				</span>
				<span class="flex flex-col space-y-1">
					<label for="bdms" class="mb-2 text-transparent">BDMS?</label>
					<SlideToggle name="bdms" size="sm">BDMS?</SlideToggle>
				</span>
        <span class="flex flex-col space-y-1">
					<label for="web" class="mb-2 text-transparent">Web?</label>
					<SlideToggle name="web" size="sm">Web?</SlideToggle>
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
</style>