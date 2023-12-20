<script>
	import { Hierarchy, PageWrapper } from '$lib/components';
	import { fly } from 'svelte/transition';
</script>

<svelte:head>
	<title>OFA • Org Chart</title>
</svelte:head>

<section in:fly={{ y: -10, duration: 200 }}>
	<PageWrapper>
		<svelte:fragment slot="title">
			<h1 class="text-2xl text-usfGreen font-semibold">Organizational Chart</h1>
		</svelte:fragment>
		<svelte:fragment slot="content">
			<div class="grid grid-cols-4 gap-2">
				<Hierarchy />
			</div>
		</svelte:fragment>
	</PageWrapper>
</section>
