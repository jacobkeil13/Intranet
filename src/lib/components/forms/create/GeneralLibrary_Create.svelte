<script lang="ts">
	import { modalStore, type AutocompleteOption, Autocomplete, InputChip } from '@skeletonlabs/skeleton';
	import Loading from '$lib/components/animation/Loading.svelte';
	import type { UserProfile } from '@prisma/client';

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
		<h1 class="text-xl text-usfGreen font-medium">Create General Library Video</h1>
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<box-icon class="fill-black cursor-pointer" name="x" on:click={closeForm} />
	</div>
	<br />
	<form method="POST" action="/training?/createLibrary" enctype="multipart/form-data">
    <input type="hidden" name="trainerList" bind:value={stringEmailList} />
		<section class="space-y-2">
			<div class="flex space-x-2">
				<span class="flex flex-col w-full space-y-1">
					<label for="title">Title</label>
					<input required type="text" name="title" class="input rounded-md" placeholder="Title..." />
				</span>
				<span class="flex flex-col space-y-1">
					<label for="date">Date</label>
					<input required type="date" name="date" class="input rounded-md" />
				</span>
			</div>
      <div class="space-y-2">
				<label for="chips">Trainer(s)</label>
				<div class="flex">
					<InputChip
						on:remove={handleRemove}
						placeholder="Search names..."
						class="bg-usfWhite border-[#3e4c7a8a] min-h-[150px]"
						bind:input={emailInput}
						bind:value={emailList}
						name="chips"
						chips="rounded bg-accSlate/90 text-white/90"
					/>
					<div class="card w-full max-h-40 px-1 overflow-y-auto bg-usfWhite text-black min-h-[150px]" tabindex="-1">
						<Autocomplete emptyState="No users found..." regionItem="bg-white" bind:input={emailInput} options={userEmails} denylist={emailList} on:selection={onEmailInput} />
					</div>
				</div>
			</div>
			<div class="space-y-2">
				<div class="flex items-center space-x-2">
					<label for="video">Training Video</label>
				</div>
				<section class="space-y-2">
					<div class="flex items-center space-x-2">
						<input required name="url" type="text" class="input rounded-md" placeholder="Video URL..." />
					</div>
				</section>
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
</style>