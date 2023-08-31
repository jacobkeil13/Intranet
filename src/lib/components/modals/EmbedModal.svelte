<script lang="ts">
	import { modalStore } from '@skeletonlabs/skeleton';

	let src: string = $modalStore[0].meta.src;
	let title: string = $modalStore[0].meta.title;

	console.log(src);
	

	const cBase = 'relative w-modal-wide h-[calc(100vh_-_10rem)] shadow-xl';
	const cButton = 'absolute -top-3 -right-3 z-1 btn-icon variant-filled';
	const cIframe = 'bg-black w-full h-full rounded-container-token overflow-hidden';

	function closeForm(): void {
		modalStore.close();
	}
</script>

<div class="modal-example-form {cBase}">
	<button class={cButton} on:click={closeForm}>✕</button>
	<iframe class={cIframe} {src} {title} frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen />
</div>
