<script lang="ts">
	import type { AidYear, Procedure, UserProfile } from '@prisma/client';
	import { Loading } from '$lib/components';
	import { getModalStore } from '@skeletonlabs/skeleton';
	import { getProcedureURL } from '$lib/helpers';

	interface FullProcedure extends Procedure {
		owner: UserProfile;
		aidYear: AidYear;
	}

	let modalStore = getModalStore();
	let isLoading = false;
	let constants = $modalStore[0].meta.constants;
	let procedure: FullProcedure = $modalStore[0].meta.procedure;

	function closeForm(): void {
		modalStore.close();
	}

	function openProcedure(): void {
		window.open(getProcedureURL(procedure), '_newtab');
	}
</script>

<section class="w-[40rem] max-h-[calc(100%_-_5rem)] overflow-y-auto bg-usfWhite p-4 rounded-md">
	<div class="flex justify-between items-center">
		<div class="flex items-center gap-3">
			<h1 class="text-xl text-usfGreen font-medium">Update Standard or Procedure</h1>
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<div class="bg-accSlate text-white/90 font-medium rounded-md px-4 py-1 cursor-pointer" on:click={openProcedure}>View</div>
		</div>
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<i class="fa-solid fa-xmark fa-lg text-black cursor-pointer" on:click={closeForm} />
	</div>
	<br />
	<form method="POST" action="/documents/procedures?/update" enctype="multipart/form-data">
		<input type="hidden" name="id" value={procedure.id} />
		<section class="space-y-2">
			<div class="flex space-x-2">
				<span class="flex flex-col w-full space-y-1">
					<label for="fileName">File Name</label>
					<input required type="text" name="fileName" class="input rounded-md" placeholder="Name of file without extension..." value={procedure.fileName} />
				</span>
				<span class="flex flex-col space-y-1 grow min-w-fit">
					<label for="aidYear">Aid Year</label>
					<select required class="input rounded-md w-full" name="aidYear" value={procedure.aidYear.name}>
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
					<select class="input rounded-md w-fit" name="extension" value={procedure.extension}>
						<option value="docx">.docx</option>
						<option value="pdf">.pdf</option>
						<option value="pptx">.pptx</option>
						<option value="xlsx">.xlsx</option>
					</select>
				</span>
				<span class="flex flex-col w-full space-y-1">
					<label for="owner">Owner</label>
					<select required class="input rounded-md" name="owner" value={procedure.owner.id}>
						<option disabled selected value="">Select one...</option>
						{#each constants.users as user}
							<option value={user.id}>{user.first_name} {user.last_name}</option>
						{/each}
					</select>
				</span>
				<span class="flex flex-col space-y-1">
					<label for="updatedAt">Updated At</label>
					<input type="date" name="updatedAt" class="input rounded-md" />
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
					Update
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
