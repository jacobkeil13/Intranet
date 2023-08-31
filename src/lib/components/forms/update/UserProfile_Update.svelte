<script lang="ts">
	import { modalStore } from '@skeletonlabs/skeleton';
	import Loading from '$lib/components/animation/Loading.svelte';
	import type { UserProfile } from '@prisma/client';

	let isLoading = false;
	let userProfile: UserProfile = $modalStore[0].meta.userProfile;
  
	function closeForm(): void {
		modalStore.close();
	}
</script>

<section class="w-[40rem] max-h-[calc(100%_-_5rem)] overflow-y-auto bg-usfWhite p-4 rounded-md">
	<div class="flex justify-between items-center">
		<h1 class="text-xl text-usfGreen font-medium">Update User Profile</h1>
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<box-icon class="fill-black cursor-pointer" name="x" on:click={closeForm} />
	</div>
	<br />
	<form method="POST" action="/phone_list?/update" enctype="multipart/form-data">
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
</style>