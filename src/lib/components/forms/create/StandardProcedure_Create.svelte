<script lang="ts">
	import { modalStore } from '@skeletonlabs/skeleton';
	import Loading from '$lib/components/animation/Loading.svelte';

	let isLoading = false;
	let constants = $modalStore[0].meta.constants;

	function closeForm(): void {
		modalStore.close();
	}
</script>

<section class="w-[40rem] max-h-[calc(100%_-_5rem)] overflow-y-auto bg-usfWhite p-4 rounded-md">
	<div class="flex justify-between items-center">
		<h1 class="text-xl text-usfGreen font-medium">Create Standard or Procedure</h1>
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<box-icon class="fill-black cursor-pointer" name="x" on:click={closeForm} />
	</div>
	<br />
	<form method="POST" action="/documents/procedures?/create" enctype="multipart/form-data">
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
				<span class="flex flex-col space-y-1">
					<label for="extension">Extension</label>
					<select class="input rounded-md w-fit" name="extension">
						<option value="docx">.docx</option>
            <option value="pdf">.pdf</option>
            <option value="pptx">.pptx</option>
						<option value="xlsx">.xlsx</option>
					</select>
				</span>
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