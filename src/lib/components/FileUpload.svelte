<script lang="ts">
	import type { FileErrors, UploadedFile } from '$lib/types';
	import { FileAttachment, Popup } from '$lib/components';
	import { FileDropzone } from '@skeletonlabs/skeleton';
	import { writable, type Writable } from 'svelte/store';

	export let stringFileList: string;
	export let isLoading: boolean;

	let errors: FileErrors = {
		messages: [],
		size: {
			total: 0,
			limit: 1024 * 200
		},
		number: {
			limit: 10
		}
	};

	let fileNames: Writable<string[]> = writable<string[]>([]);
	let files: UploadedFile[] = [];

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
					console.log(files);
				})
				.catch((error) => {
					console.error('An error occurred while processing the files:', error);
				});
		}
	}

	function handleErrors() {
		if (errors.size.total > errors.size.limit) {
			errors.messages.push('Combined file size cannot exceed 200KB. This is temporary and will be changed back to 3MB soon.');
		}
		if (files.length > errors.number.limit) {
			errors.messages.push('File limit is 10 or less.');
		}
		if (errors.messages.length > 0) {
			files = [];
			fileNames.set([]);
		}
	}

	function removeAttachments() {
		console.log('Deleted');

		stringFileList = '';
		$fileNames = [];
		files = [];

		$fileNames = $fileNames;
	}
</script>

<div class="grid grid-cols-[1.25fr_1fr] gap-2">
	<slot name="description" />
	<div class="flex flex-col space-y-2">
		<label for="files" class="opacity-0">Files</label>
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
				>Combined size of 200KB or less <p class="font-medium">Max 10 files or less</p></svelte:fragment
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
		<Popup pointer="" placement="right" bgColor="bg-accSlate">
			<svelte:fragment slot="content">
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<div on:click={removeAttachments} class="cursor-pointer flex items-center gap-3 bg-accSlate h-8 px-3 rounded-md">
					<i class="fa-solid fa-trash-can text-white/90" />
				</div>
			</svelte:fragment>
			<svelte:fragment slot="popup">
				<p class="text-white/80 font-semibold">Remove attachments</p>
			</svelte:fragment>
		</Popup>
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
