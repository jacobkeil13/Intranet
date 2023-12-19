<script lang="ts">
	import { Loading } from '$lib/components';
	import { getModalStore } from '@skeletonlabs/skeleton';

	let modalStore = getModalStore();
	let isLoading = false;
	let constants = $modalStore[0].meta.constants;

	function closeForm(): void {
		modalStore.close();
	}
</script>

<section class="w-[40rem] max-h-[calc(100%_-_5rem)] overflow-y-auto bg-usfWhite p-4 rounded-md">
	<div class="flex justify-between items-center">
		<h1 class="text-xl text-usfGreen font-medium">Create Temporary Student Profile</h1>
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<i class="fa-solid fa-xmark fa-lg text-black cursor-pointer" on:click={closeForm} />
	</div>
	<br />
	<form method="POST" action="/phone_list?/create" enctype="multipart/form-data">
		<input type="hidden" name="uidRange" value="" />
		<input type="hidden" name="userType" value="Student" />
		<section class="space-y-2">
			<div class="flex space-x-2">
				<span class="flex flex-col w-full space-y-1">
					<label for="firstName">First Name</label>
					<input required type="text" name="firstName" class="input rounded-md" placeholder="First name..." />
				</span>
				<span class="flex flex-col w-full space-y-1">
					<label for="lastName">Last Name</label>
					<input required type="text" name="lastName" class="input rounded-md" placeholder="Last name..." />
				</span>
			</div>
			<div class="flex space-x-2">
				<span class="flex flex-col w-full space-y-1">
					<label for="netId">Net ID</label>
					<input required type="text" name="netId" class="input rounded-md" placeholder="Net ID..." />
				</span>
				<span class="flex flex-col w-full space-y-1">
					<label for="directReport">Direct Report</label>
					<select class="input rounded-md" name="directReport">
						<option disabled selected value="">Select one...</option>
						{#each constants.users as user}
							<option value={user.id}>{user.first_name + ' ' + user.last_name}</option>
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
