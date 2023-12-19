<script lang="ts">
	import type { AidYear, Form, UserProfile } from '@prisma/client';
	import { Loading } from '$lib/components';
	import { SlideToggle, getModalStore } from '@skeletonlabs/skeleton';
	import { getFormURL } from '$lib/helpers';
	import { goto } from '$app/navigation';

	interface FullForm extends Form {
		owner: UserProfile;
		aidYear: AidYear;
	}

	let modalStore = getModalStore();
	let isLoading = false;
	let constants = $modalStore[0].meta.constants;
	let form: FullForm = $modalStore[0].meta.form;

	function closeForm(): void {
		modalStore.close();
	}

	function openForm(): void {
		if (form.rraareqCode === 'BUDADJ') {
			modalStore.close();
			goto('/documents/forms/budadj/' + form.aidYear.name);
			return;
		}
		if (form.rraareqCode === 'Alternative Work Schedule Request') {
			modalStore.close();
			goto('/documents/forms/alt_wrk_req');
			return;
		}
		if (form.rraareqCode === 'Student Employee Evaluation') {
			modalStore.close();
			goto('/documents/forms/student_eval');
			return;
		}
		window.open(getFormURL(form), '_newtab');
	}
</script>

<section class="w-[40rem] max-h-[calc(100%_-_5rem)] overflow-y-auto bg-usfWhite p-4 rounded-md">
	<div class="flex justify-between items-center">
		<div class="flex items-center gap-3">
			<h1 class="text-xl text-usfGreen font-medium">Update Form</h1>
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<div class="bg-accSlate text-white/90 font-medium rounded-md px-4 py-1 cursor-pointer" on:click={openForm}>View</div>
		</div>
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<i class="fa-solid fa-xmark fa-lg text-black cursor-pointer" on:click={closeForm} />
	</div>
	<br />
	<form method="POST" action="/documents/forms?/update" enctype="multipart/form-data">
		<input type="hidden" name="id" value={form.id} />
		<section class="space-y-2">
			<div class="flex space-x-2">
				<span class="flex flex-col w-full space-y-1">
					<label for="fileName">File Name</label>
					<input required type="text" name="fileName" class="input rounded-md" placeholder="Name of file without extension..." value={form.name} />
				</span>
				<span class="flex flex-col space-y-1 grow min-w-fit">
					<label for="aidYear">Aid Year</label>
					<select required class="input rounded-md w-full" name="aidYear" value={form.aidYear.name}>
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
					<select required class="input rounded-md" name="owner" value={form.owner.id}>
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
			<div class="flex space-x-2">
				<span class="flex flex-col space-y-1 flex-grow">
					<label for="rraareq">RRAAREQ Code</label>
					<input required type="text" name="rraareq" class="input rounded-md" placeholder="RRAAREQ Code..." value={form.rraareqCode} />
				</span>
				<span class="flex flex-col space-y-1">
					<label for="bdms" class="mb-2 text-transparent">BDMS?</label>
					<SlideToggle name="bdms" size="sm" checked={form.bdms}>BDMS?</SlideToggle>
				</span>
				<span class="flex flex-col space-y-1">
					<label for="web" class="mb-2 text-transparent">Web?</label>
					<SlideToggle name="web" size="sm" checked={form.web}>Web?</SlideToggle>
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
