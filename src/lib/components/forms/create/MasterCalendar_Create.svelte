<script lang="ts">
	import type { UserProfile } from '@prisma/client';
	import { Autocomplete, InputChip, modalStore, type AutocompleteOption } from '@skeletonlabs/skeleton';
	import Loading from '../../animation/Loading.svelte';

	let isLoading = false;
	let constants = $modalStore[0].meta.constants;

	let emailInput = '';
	let stringEmailList: string = '';
	let userEmails: AutocompleteOption[] = [];
	let emailList: string[] = [];

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
			value: user.netid,
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
		<h1 class="text-xl text-usfGreen font-medium">Create Master Calendar Item</h1>
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<box-icon class="fill-black cursor-pointer" name="x" on:click={closeForm} />
	</div>
	<br />
	<form method="POST" action="/master_calendar?/create" enctype="multipart/form-data">
		<input type="hidden" name="secondaryOwners" bind:value={stringEmailList} />
		<section class="space-y-2">
			<div class="flex space-x-2">
				<span class="flex flex-col w-full space-y-1">
					<label for="title">Title</label>
					<input required type="text" name="title" class="input rounded-md" placeholder="Title..." />
				</span>
				<span class="flex flex-col space-y-1">
					<label for="dueDate">Due Date</label>
					<input required type="date" name="dueDate" class="input rounded-md" />
				</span>
			</div>
			<div class="flex space-x-2">
        <span class="flex flex-col w-full space-y-1">
					<label for="primaryOwner">Primary Owner</label>
					<select required class="input rounded-md" name="primaryOwner">
						<option disabled selected value="">Select one...</option>
						{#each constants.users as user}
							<option value={user.id}>{user.first_name} {user.last_name}</option>
						{/each}
					</select>
				</span>
				<span class="flex flex-col w-full space-y-1">
					<label for="requestType">Type</label>
					<select required class="input rounded-md" name="type">
						<option disabled selected value="">Select one...</option>
						{#each constants.masterCalendarTypes as masterCalendarType}
							<option value={masterCalendarType.type}>{masterCalendarType.name}</option>
						{/each}
					</select>
				</span>	
			</div>
			<div class="space-y-2">
				<label for="chips">Secondary Owners</label>
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
				<textarea required class="input rounded-md" name="description" cols="20" rows="4" placeholder="Why are you making this item..." />
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