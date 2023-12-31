<script lang="ts">
	import type { Letter, LetterCode, LetterGroup, LetterType, UserProfile } from '@prisma/client';
	import { Loading } from '$lib/components';
	import { SlideToggle, getModalStore } from '@skeletonlabs/skeleton';
	import { getLetterURL } from '$lib/helpers';

	interface FullLetter extends Letter {
		letterCode: LetterCode;
		letterType: LetterType;
		letterGroup: LetterGroup;
		owner: UserProfile;
	}

	let modalStore = getModalStore();
	let isLoading = false;
	let constants = $modalStore[0].meta.constants;
	let letter: FullLetter = $modalStore[0].meta.letter;

	function closeForm(): void {
		modalStore.close();
	}

	function openLetter(): void {
		window.open(getLetterURL(letter), '_newtab');
	}
</script>

<section class="w-[40rem] max-h-[calc(100%_-_5rem)] overflow-y-auto bg-usfWhite p-4 rounded-md">
	<div class="flex justify-between items-center">
		<div class="flex items-center gap-3">
			<h1 class="text-xl text-usfGreen font-medium">Update Letter</h1>
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<div class="bg-accSlate text-white/90 font-medium rounded-md px-4 py-1 cursor-pointer" on:click={openLetter}>View</div>
		</div>
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<i class="fa-solid fa-xmark fa-lg text-black cursor-pointer" on:click={closeForm} />
	</div>
	<br />
	<form method="POST" action="/documents/letters?/update" enctype="multipart/form-data">
		<input type="hidden" name="id" value={letter.id} />
		<section class="space-y-2">
			<div class="flex space-x-2">
				<span class="flex flex-col w-full space-y-1">
					<label for="letterCode">Letter Code</label>
					<input disabled required type="text" name="letterCode" class="input rounded-md" placeholder="New letter code..." value={letter.letterCode.name} />
				</span>
				<span class="flex flex-col w-full space-y-1">
					<label for="letterType">Letter Type</label>
					<select required class="input rounded-md w-full" name="letterType" value={letter.letterType.name}>
						<option disabled selected value="">Select one...</option>
						{#each constants.letterTypes as letterType}
							<option value={letterType.name}>{letterType.name}</option>
						{/each}
					</select>
				</span>
			</div>
			<div class="flex space-x-2">
				<span class="flex flex-col space-y-1 flex-grow">
					<label for="letterGroup">Letter Group</label>
					<select required class="input rounded-md w-full" name="letterGroup" value={letter.letterGroup.name}>
						<option disabled selected value="">Select one...</option>
						{#each constants.letterGroups as letterGroup}
							<option value={letterGroup.name}>{letterGroup.name}</option>
						{/each}
					</select>
				</span>
				<span class="flex flex-col space-y-1">
					<label for="tape" class="mb-2 text-transparent">Weekly Tape Load?</label>
					<SlideToggle name="tape" size="sm" checked={letter.weeklyTapeLoad}>Weekly Tape Load?</SlideToggle>
				</span>
				<span class="flex flex-col space-y-1">
					<label for="ruamail" class="mb-2 text-transparent">Staff in RUAMAIL?</label>
					<SlideToggle name="ruamail" size="sm" checked={letter.staffInRuamail}>Staff in RUAMAIL?</SlideToggle>
				</span>
			</div>
			<div class="flex space-x-2">
				<span class="flex flex-col w-full space-y-1">
					<label for="owner">Owner</label>
					<select required class="input rounded-md" name="owner" value={letter.owner.id}>
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
			<div class="flex flex-col">
				<label for="description">Description</label>
				<textarea required class="input rounded-md" name="description" cols="20" rows="4" placeholder="What is the letter for..." value={letter.description} />
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

	textarea {
		background-color: #ffffff;
		border-color: #3e4c7a8a;
	}
</style>
