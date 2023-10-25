<script lang="ts">
	import { getModalStore, type PaginationSettings } from '@skeletonlabs/skeleton';
	import TableWrapper from '../TableWrapper.svelte';
	import Search from '../Search.svelte';
	import moment from 'moment';

	let modalStore = getModalStore();

	let currentAudio: string | null = null;
	let currentAudioDetails: string | null = null;
	let calls: string[] = $modalStore[0].meta.calls;
	let date: string = $modalStore[0].meta.date;
	let constants = $modalStore[0].meta.constants;

	let filteredCalls = calls;
	let searchQuery = '';

	$: {
		filteredCalls = calls.filter((call) => {
			if (call.split(' ')[0].toLowerCase().includes(searchQuery.toLowerCase().trim()) || getUser(call.split(' ')[2].split('@')[0]).toLowerCase().includes(searchQuery.toLowerCase().trim())) {
				return call;
			}
		});
		updatePageSettings(filteredCalls);
	}

	let paginationSettings = {
		page: 0,
		limit: 5,
		size: filteredCalls.length,
		amounts: [5, 10]
	} satisfies PaginationSettings;

	$: paginatedSource = filteredCalls.slice(paginationSettings.page * paginationSettings.limit, paginationSettings.page * paginationSettings.limit + paginationSettings.limit);

	function updatePageSettings(filteredArr: any[]) {
		paginationSettings.size = filteredArr.length;
		paginationSettings.page = 0;
	}

	function closeForm(): void {
		modalStore.close();
	}

	function playAudio(src: string) {
		currentAudio = null;
		currentAudioDetails = null;
		currentAudio = src;
		currentAudioDetails = src.split('/')[src.split('/').length - 1];
	}

	function parseCallTime(time: string) {
		let hour = Number(time.split('_')[0]) > 12 ? String(Number(time.split('_')[0]) - 12) : time.split('_')[0];
		return hour + ':' + time.split('_')[1];
	}

	function parsePhoneNumber(number: string) {
		return number.slice(0, 3) + '-' + number.slice(3, 6) + '-' + number.slice(6, 10);
	}

	function getUser(netid: string) {
		let user = constants.users.find((user: any) => user.netid === netid);
		return user?.first_name + ' ' + user?.last_name;
	}
</script>

<section class="w-[50rem] max-h-[calc(100%_-_5rem)] overflow-y-auto bg-usfWhite p-4 rounded-md">
	<div class="flex justify-between items-center">
		<h1 class="text-xl text-usfGreen font-medium">Search Five9 Calls</h1>
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<i class="fa-solid fa-xmark fa-lg text-black cursor-pointer" on:click={closeForm} />
	</div>
	<br />
	<Search bind:value={searchQuery} width="w-full" />
	<br />
	{#if currentAudio && currentAudioDetails}
		<div>
			<h1 class="mb-2">
				{parsePhoneNumber(currentAudioDetails.split(' ')[0])} - {getUser(currentAudioDetails.split(' ')[2].split('@')[0])}
				at {parseCallTime(currentAudioDetails.split(' ')[4])}{currentAudioDetails.split(' ')[5].split('.')[0]}
			</h1>
			<audio class="w-full border-2 border-[#4C4C4C] bg-accSlate rounded-full" controls autoplay src={currentAudio} />
		</div>
	{/if}
	<br />
	<TableWrapper arrLength={filteredCalls.length} bind:paginationSettings tableCompact="table-compact">
		<svelte:fragment slot="header">
			<thead>
				<tr class="bg-accSlate text-white/90">
					<th>Date & Time</th>
					<th>Number</th>
					<th>Employee</th>
					<th>Time</th>
				</tr>
			</thead>
		</svelte:fragment>
		<svelte:fragment slot="body">
			<tbody>
				{#each paginatedSource as call}
					<tr
						on:click={() => {
							playAudio(`https://tup-ofa.forest.usf.edu/finaid/files/phone/${moment().format('M_D_YYYY')}/${call}?apiKey=API_KEY`);
						}}
						class="cursor-pointer"
					>
						<td>{date}</td>
						<td>{parsePhoneNumber(call.split(' ')[0])}</td>
						<td>{getUser(call.split(' ')[2].split('@')[0])}</td>
						<td>{parseCallTime(call.split(' ')[4])}{call.split(' ')[5].split('.')[0]}</td>
					</tr>
				{/each}
			</tbody>
		</svelte:fragment>
		<svelte:fragment slot="none">
			<p>There are no calls that match your search.</p>
		</svelte:fragment>
	</TableWrapper>
</section>

<style>
	th {
		border: none;
		background-color: white;
		color: #4c4c4c;
	}
</style>
