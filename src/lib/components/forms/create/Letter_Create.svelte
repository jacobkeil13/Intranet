<script lang="ts">
	import { SlideToggle, modalStore } from '@skeletonlabs/skeleton';
	import Loading from '$lib/components/animation/Loading.svelte';

	let isLoading = false;
	let constants = $modalStore[0].meta.constants;

	function closeForm(): void {
		modalStore.close();
	}
</script>

<section class="w-[40rem] max-h-[calc(100%_-_5rem)] overflow-y-auto bg-usfWhite p-4 rounded-md">
	<div class="flex justify-between items-center">
		<h1 class="text-xl text-usfGreen font-medium">Create Letter</h1>
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<box-icon class="fill-black cursor-pointer" name="x" on:click={closeForm} />
	</div>
	<br />
	<form method="POST" action="/documents/letters?/create" enctype="multipart/form-data">
		<section class="space-y-2">
			<div class="flex space-x-2">
				<span class="flex flex-col w-full space-y-1">
					<label for="letterCode">Letter Code</label>
					<input required type="text" name="letterCode" class="input rounded-md" placeholder="New letter code..." />
				</span>
        <span class="flex flex-col w-full space-y-1">
					<label for="letterType">Letter Type</label>
					<select required class="input rounded-md w-full" name="letterType">
						<option disabled selected value="">Select one...</option>
						{#each constants.letterTypes as letterType}
							<option value={letterType.name}>{letterType.name}</option>
						{/each}
					</select>
				</span>
			</div>
			<div class="flex space-x-2">
				<span class="flex flex-col space-y-1 flex-grow">
					<label for="letterGroup">Letter Group</label>
					<select required class="input rounded-md w-full" name="letterGroup">
						<option disabled selected value="">Select one...</option>
						{#each constants.letterGroups as letterGroup}
							<option value={letterGroup.name}>{letterGroup.name}</option>
						{/each}
					</select>
				</span>
        <span class="flex flex-col space-y-1">
					<label for="tape" class="mb-2 text-transparent">Weekly Tape Load?</label>
					<SlideToggle name="tape" size="sm">Weekly Tape Load?</SlideToggle>
				</span>
        <span class="flex flex-col space-y-1">
					<label for="ruamail" class="mb-2 text-transparent">Staff in RUAMAIL?</label>
					<SlideToggle name="ruamail" size="sm">Staff in RUAMAIL?</SlideToggle>
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
			<div class="flex flex-col">
				<label for="description">Description</label>
				<textarea required class="input rounded-md" name="description" cols="20" rows="4" placeholder="What is the letter for..." />
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

	textarea {
		background-color: #ffffff;
		border-color: #3e4c7a8a;
	}
</style>