<script lang="ts">
	import { FileDropzone, getModalStore } from '@skeletonlabs/skeleton';
	import Loading from '../../animation/Loading.svelte';
	import UserPicker from '$lib/components/UserPicker.svelte';
	import type { UserProfile } from '@prisma/client';
	import { writable } from 'svelte/store';
	import FileAttachment from '$lib/components/FileAttachment.svelte';

	interface UploadedFile {
		fileName: string;
		content: string;
	}

	interface FileErrors {
		messages: string[];
		size: {
			total: number;
			limit: number;
		};
		number: {
			limit: number;
		};
	}

	let modalStore = getModalStore();
	let isLoading = false;
	let delayPost = false;
	let constants = $modalStore[0].meta.constants;
	let eptTeam: UserProfile[] = $modalStore[0].meta.eptTeam[0].userProfile;
	let users: UserProfile[] = $modalStore[0].meta.constants.users;
	let loggedInUserId = $modalStore[0].meta.profile.id;
	let loggedInUser = $modalStore[0].meta.profile;

	let stringEmailList: string = '';
	let stringFileList: string = '';

	function closeForm(): void {
		modalStore.close();
	}

	let fileNames = writable<string[]>([]);
	let files: UploadedFile[] = []; // Initialize as an array to hold file objects

	let errors: FileErrors = {
		messages: [],
		size: {
			total: 0,
			limit: 3145728
		},
		number: {
			limit: 3
		}
	};

	function arrayBufferToBase64(buffer: ArrayBuffer) {
		let binary = '';
		const bytes = new Uint8Array(buffer);
		const len = bytes.byteLength;
		for (let i = 0; i < len; i++) {
			binary += String.fromCharCode(bytes[i]);
		}
		return btoa(binary);
	}

	function handleFileChange(event: Event) {
		isLoading = true;
		errors.size.total = 0;
		errors.messages = [];
		const selectedFiles = (event.target as HTMLInputElement).files;

		if (selectedFiles) {
			fileNames.set([]);
			files = [];
			const filePromises = Array.from(selectedFiles).map((file) => {
				return new Promise<UploadedFile | null>((resolve, reject) => {
					errors.size.total += file.size;
					const reader = new FileReader();

					reader.onload = (e) => {
						if (e.target && e.target.result instanceof ArrayBuffer) {
							const base64Content = arrayBufferToBase64(e.target.result);
							resolve({
								fileName: file.name,
								content: base64Content
							});
						} else {
							resolve(null);
						}
					};

					reader.onerror = (e) => {
						console.error('An error occurred while reading the file:', e);
						reject(e);
					};

					reader.readAsArrayBuffer(file);
				});
			});

			Promise.all(filePromises)
				.then((results) => {
					files = results.filter((file) => file !== null) as UploadedFile[];
					fileNames.set(files.map((file) => file.fileName));
					stringFileList = files.length > 0 ? JSON.stringify(files) : '';
					isLoading = false;
					handleErrors();
				})
				.catch((error) => {
					console.error('An error occurred while processing the files:', error);
				});
		}
	}

	function handleErrors() {
		if (errors.size.total > errors.size.limit) {
			errors.messages.push('Combined file size cannot exceed 3MB.');
		}
		if (files.length > errors.number.limit) {
			errors.messages.push('File limit is 3 or less.');
		}
		if (errors.messages.length > 0) {
			files = [];
			fileNames.set([]);
		}
	}
</script>

<section class="w-[40rem] max-h-[calc(100%_-_5rem)] overflow-y-auto bg-usfWhite p-4 rounded-md">
	<div class="flex justify-between items-center">
		<h1 class="text-xl text-usfGreen font-medium">Create DR Queue Request</h1>
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<i class="fa-solid fa-xmark fa-lg text-black cursor-pointer" on:click={closeForm} />
	</div>
	<br />
	<form method="POST" action="/dr_queue?/create" enctype="multipart/form-data">
		<input type="hidden" name="emailList" bind:value={stringEmailList} />
		<input type="hidden" name="files" bind:value={stringFileList} />
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
					<select class="input rounded-md w-full" name="priority">
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
			<h1>Default Email List</h1>
			<div class="flex gap-2 flex-wrap">
				{#each eptTeam as user}
					{#if !user.netid.startsWith('tbd')}
						<span class="badge bg-accSlate text-white/90 rounded-sm">{user.first_name} {user.last_name}</span>
					{/if}
				{/each}
				{#if eptTeam.filter((user) => user.id === loggedInUserId).length < 1}
					<span class="badge bg-accSlate text-white/90 rounded-sm">{loggedInUser.first_name} {loggedInUser.last_name}</span>
				{/if}
			</div>
			<UserPicker team={eptTeam} users={users.filter((user) => user.id !== loggedInUserId)} bind:stringEmailList />
			<div class="grid grid-cols-[1.25fr_1fr] gap-2">
				<div class="flex flex-col space-y-2">
					<label for="description">Description</label>
					<textarea required class="input rounded-md" name="description" cols="20" rows="5" placeholder="Why are you making this request..." />
				</div>
				<div class="flex flex-col space-y-2">
					<label for="description" class="opacity-0">Description</label>
					<FileDropzone
						name="fileDrop"
						regionInterface="bg-white"
						padding="py-3"
						border="border"
						rounded="rounded-md"
						multiple
						on:change={(event) => {
							handleFileChange(event);
						}}
					>
						<svelte:fragment slot="lead"><i class="fa-solid fa-upload text-black/80" /></svelte:fragment>
						<svelte:fragment slot="message"><span class="font-medium">Upload a file</span> or drag and drop</svelte:fragment>
						<svelte:fragment slot="meta"
							>Combined size of 3MB or less <p class="font-medium">Max of 3 Files</p></svelte:fragment
						>
					</FileDropzone>
				</div>
			</div>
			{#if $fileNames.length > 0}
				<h1>Attachments</h1>
				<div class="flex gap-2 flex-wrap mt-2">
					{#each $fileNames as file}
						<FileAttachment {file} />
					{/each}
				</div>
			{/if}
			{#if errors.messages.length > 0}
				<div class="flex gap-2 flex-wrap mt-2">
					{#each errors.messages as msg}
						<div class="border border-red-700 px-3 py-1 rounded-md">
							<span class="font-medium">{msg}</span>
						</div>
					{/each}
				</div>
			{/if}
		</section>
		<footer class="float-right mt-3">
			<button disabled={isLoading} type="submit" class="btn bg-accSlate text-white/90 rounded-md">
				{#if isLoading}
					<div class="flex items-center space-x-6">
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
