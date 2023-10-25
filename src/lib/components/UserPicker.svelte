<script lang="ts">
	import type { UserProfile } from '@prisma/client';
	import { type AutocompleteOption, InputChip, Autocomplete } from '@skeletonlabs/skeleton';
	export let label: string = 'Email List';
	export let stringEmailList: string;
	export let users: UserProfile[];
	export let team: UserProfile[] | null = null;
	export let currentList: UserProfile[] | null = null;

	let teamIds = team ? team.map((user) => user.id) : [];

	let emailInput = '';
	let userEmails: AutocompleteOption[] = [];
	let emailList: string[] = currentList
		? currentList
				.filter((user: UserProfile) => !teamIds.includes(user.id)) // Filter out team members
				.map((user: UserProfile) => user.first_name + ' ' + user.last_name)
		: [];

	users.forEach((user) => {
		if (team === null || !team.some((usr) => user.id === usr.id)) {
			let userName = user.first_name + ' ' + user.last_name;
			let tempObj = {
				label: userName,
				value: userName,
				meta: { id: user.id }
			};
			userEmails.push(tempObj);
		}
	});

	$: {
		let list = userEmails.filter((tr: AutocompleteOption) => {
			return emailList.includes(String(tr.label));
		});
		stringEmailList = JSON.stringify(list);
	}

	function onEmailInput(event: any): void {
		if (emailList.includes(event.detail.label) === false) {
			emailList = [...emailList, event.detail.label];
			emailInput = '';
		}
	}

	function handleRemove(e: CustomEvent) {
		userEmails = userEmails;
	}
</script>

<div class="space-y-2">
	<label for="chips">{label}</label>
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
