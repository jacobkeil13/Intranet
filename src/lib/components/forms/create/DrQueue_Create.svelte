<script lang="ts">
	import type { UserProfile } from '@prisma/client';
	import { Autocomplete, InputChip, modalStore, type AutocompleteOption } from '@skeletonlabs/skeleton';
	import Loading from '../../animation/Loading.svelte';

	let isLoading = false;
	let delayPost = false;
	let constants = $modalStore[0].meta.constants;
	let eptTeam = $modalStore[0].meta.eptTeam;

	let emailInput = '';
	let stringEmailList: string = '';
	let userEmails: AutocompleteOption[] = [];
	let emailList: string[] = eptTeam[0].userProfile.map((user: UserProfile) => { return user.first_name + ' ' + user.last_name })

	$: {
		let list	= userEmails.filter((tr: AutocompleteOption) => {
			return emailList.includes(String(tr.label));
		})
		stringEmailList = JSON.stringify(list);
	}

	constants.users.forEach((user: UserProfile) => {
		let userName = user.first_name + ' ' + user.last_name;
		let tempObj = {
			label: userName,
			value: userName,
			meta: { id: user.id }
		};
		userEmails.push(tempObj);
	});

	function closeForm(): void {
		modalStore.close();
	}

	function onEmailInput(event: any): void {
		if (emailList.includes(event.detail.label) === false) {
			emailList = [...emailList, event.detail.label];
			emailInput = '';
		}
	}

	function handleRemove(event: any) {
		console.log(event.detail);
		userEmails = userEmails
	}
</script>

<section class="w-[40rem] max-h-[calc(100%_-_5rem)] overflow-y-auto bg-usfWhite p-4 rounded-md">
	<div class="flex justify-between items-center">
		<h1 class="text-xl text-usfGreen font-medium">Create DR Queue Request</h1>
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<box-icon class="fill-black cursor-pointer" name="x" on:click={closeForm} />
	</div>
	<br />
	<form method="POST" action="/dr_queue?/create" enctype="multipart/form-data">
		<input type="hidden" name="emailList" bind:value={stringEmailList} />
		<section class="space-y-2">
			<div class="flex space-x-2">
				<span class="flex flex-col w-full space-y-1">
					<label for="title">Title</label>
					<input required type="text" name="title" class="input rounded-md" placeholder="Title..." />
				</span>
				<span class="flex flex-col space-y-1">
					<label for="dateNeeded">Date Needed</label>
					<input required type="date" name="dateNeeded" class="input rounded-md" />
				</span>
			</div>
			<div class="flex space-x-2">
				<span class="flex flex-col space-y-1 grow">
					<label for="priority">Priority</label>
					<select required class="input rounded-md w-full" name="priority">
						<option disabled selected value="">Select one...</option>
						{#each constants.priorities as priority}
							<option value={priority.name}>{priority.name}</option>
						{/each}
					</select>
				</span>
				<span class="flex flex-col space-y-1">
					<label for="delayPost">Delay</label>
					<select class="input rounded-md w-fit" name="delayPost" value={delayPost ? 'yes' : 'no'} on:change={() => (delayPost = !delayPost)}>
						<option value="no">No</option>
						<option value="yes">Yes</option>
					</select>
				</span>
				{#if delayPost}
					<span class="flex flex-col space-y-1">
						<label for="delayBatchPost">Post Date</label>
						<input required type="date" name="delayBatchPost" class="input rounded-md w-fit" />
					</span>
				{/if}
			</div>
			<div class="flex space-x-2">
				<span class="flex flex-col w-full space-y-1">
					<label for="requestType">Request Type</label>
					<select required class="input rounded-md" name="requestType">
						<option disabled selected value="">Select one...</option>
						{#each constants.dataRequestTypes as dataRequestType}
							<option value={dataRequestType.name}>{dataRequestType.name}</option>
						{/each}
					</select>
				</span>
			</div>
			<div class="space-y-2">
				<label for="chips">Email List</label>
				<div class="flex">
					<InputChip
					  on:remove={handleRemove}
						placeholder="Search names..."
						class="bg-usfWhite border-[#3e4c7a8a] min-h-[150px]"
						bind:input={emailInput}
						bind:value={emailList}
						name="chips"
						chips="rounded bg-accSlate text-white/90"
					/>
					<div class="card w-full max-h-40 px-1 overflow-y-auto bg-usfWhite text-black min-h-[150px]" tabindex="-1">
						<Autocomplete emptyState="No users found..." regionItem="bg-white" bind:input={emailInput} options={userEmails} denylist={emailList} on:selection={onEmailInput} />
					</div>
				</div>
			</div>
			<div class="flex flex-col">
				<label for="description">Description</label>
				<textarea required class="input rounded-md" name="description" cols="20" rows="4" placeholder="Why are you making this request..." />
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
					Create request
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
