<script lang="ts">
	import { getModalStore } from '@skeletonlabs/skeleton';
	import Loading from '$lib/components/animation/Loading.svelte';
	import type { Role, UserProfile } from '@prisma/client';
	import { enhance } from '$app/forms';

	interface FullProfile extends UserProfile {
		role: Role
		directReport: UserProfile
	}

	let deletedSafety = false;
	let toDelete = false;
	let modalStore = getModalStore();
	let isLoading = false;
	let userProfile: FullProfile = $modalStore[0].meta.userProfile;
	
	let constants = $modalStore[0].meta.constants;
  
	function closeForm(): void {
		modalStore.close();
	}

	function response(action: "delete" | "update"): void {
		if ($modalStore[0] !== undefined) {
      $modalStore[0].meta.response(action);
    }
		closeForm();
	}

	function toggleSafety() {
		deletedSafety = !deletedSafety;
	}

	async function deleteUser(id: string) {
		if (deletedSafety && toDelete) {
			const formData = new FormData();
			formData.append('id', id);
			await fetch("/phone_list?/delete", {
				method: 'POST',
				body: formData,
			})

			response("delete");
		}
	}
</script>

<section class="w-[40rem] max-h-[calc(100%_-_5rem)] overflow-y-auto bg-usfWhite p-4 rounded-md">
	<div class="flex justify-between items-center">
		<div class="flex items-center gap-3">
			<h1 class="text-xl text-usfGreen font-medium">Update User Profile</h1>
			{#if userProfile.role.name === "STUDENT"}
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<i class="fa-solid fa-trash-can text-black/60 hover:text-red-600 cursor-pointer" on:click={toggleSafety} ></i>
				{#if deletedSafety}
					<div class="flex items-center gap-3 px-3 py-[2px] rounded-md bg-red-600 text-white/90 font-medium">
						<button on:click={() => { deleteUser(userProfile.id) }}>Delete Permanently</button>
						<!-- svelte-ignore a11y-click-events-have-key-events -->
						{#if !toDelete}
							<i class="fa-regular fa-square-check text-white/90 cursor-pointer" on:click={() => toDelete = !toDelete} ></i>
						{:else}
							<i class="fa-solid fa-square-check text-white/90 cursor-pointer" on:click={() => toDelete = !toDelete} ></i>
						{/if}
					</div>
				{/if}
			{/if}
		</div>
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<i class="fa-solid fa-xmark fa-lg text-black cursor-pointer" on:click={closeForm}></i>
	</div>
	<br />
	<form use:enhance={() => { response("update") }} method="POST" action="/phone_list?/update" enctype="multipart/form-data">
    <input type="hidden" name="id" value={userProfile.id}>
		<section class="space-y-2">
			<div class="flex space-x-2">
				<span class="flex flex-col w-full space-y-1">
					<label for="firstName">First Name</label>
					<input required type="text" name="firstName" class="input rounded-md" placeholder="Name of file without extension..." value={userProfile.first_name} />
				</span>
        <span class="flex flex-col w-full space-y-1">
					<label for="lastName">Last Name</label>
					<input required type="text" name="lastName" class="input rounded-md" placeholder="Name of file without extension..." value={userProfile.last_name} />
				</span>
				<span class="flex flex-col w-full space-y-1">
					<label for="directReport">Direct Report</label>
					<select class="input rounded-md" name="directReport" value={userProfile.directReport === null ? "" : userProfile.directReport.id}>
						<option disabled selected value="">Select one...</option>
						{#each constants.users as user}
							<option value={user.id}>{user.first_name + " " + user.last_name}</option>
						{/each}
					</select>
				</span>
			</div>
			<div class="flex space-x-2">
        <span class="flex flex-col w-full space-y-1">
					<label for="netId">Net ID</label>
					<input required type="text" name="netId" class="input rounded-md" placeholder="Name of file without extension..." value={userProfile.netid} />
				</span>
        <span class="flex flex-col w-full space-y-1 flex-grow">
					<label for="uidRange">UID Range (For Advisors)</label>
					<input type="text" name="uidRange" class="input rounded-md" placeholder="UID Range ex.(1249-2500)" value={userProfile.uidRange} />
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