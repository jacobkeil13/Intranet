<script lang="ts">
	import { writable } from 'svelte/store';
	import type { AidYear } from '@prisma/client';
	import { getModalStore } from '@skeletonlabs/skeleton';
	import { getDateLocal } from '$lib/helpers';
	import UserPicker from '$lib/components/UserPicker.svelte';

	let modalStore = getModalStore();
	let constants = $modalStore[0].meta.constants;
	let isTeam = $modalStore[0].meta.isTeam;
	let aidYears = $modalStore[0].meta.constants.aidYears.filter((year: AidYear) => year.name !== 'Non-Year' && year.name !== 'Administrative');

	let stringEmailList: string = '';

	let aidYear = writable<string>('');
	let date: string = getDateLocal(new Date().toISOString(), 'YYYY-MM-DD');
	let termCode: string;
	let application: string;
	let letterCode: string;
	let selectionId: string;
	let bannerCreatorId: string;
	let bannerUserId: string;
	let letterCount: number;
	let addressType: string;
	let requestedBy: string;
	let paidDate: string;
	let paidDateThirty: string;
	let paidDateSixty: string;
	let firstTerm: string;
	let secondTerm: string;
	let thirdTerm: string;
	let priorAidYear: string;
	let priorFallTerm: string;
	let priorSpringTerm: string;
	let termCodeOptions: string[];

	$: {
		firstTerm = String(`Fall 20${$aidYear.slice(0, 2)}`);
		secondTerm = String(`Spring 20${$aidYear.slice(-2)}`);
		thirdTerm = String(`Summer 20${$aidYear.slice(-2)}`);
		priorAidYear = String(`20${parseInt($aidYear.slice(0, 2)) - 1}-20${$aidYear.slice(0, 2)}`);
		priorFallTerm = String(`Fall 20${parseInt($aidYear.slice(0, 2)) - 1}`);
		priorSpringTerm = String(`Spring 20${$aidYear.slice(0, 2)}`);

		termCodeOptions = [`Summer 20${$aidYear.slice(0, 2)}`, `Fall 20${$aidYear.slice(0, 2)}`, `Spring 20${$aidYear.slice(-2)}`, `Summer 20${$aidYear.slice(-2)}`];
	}

	function closeForm(): void {
		modalStore.close();
	}
</script>

<section class="w-[40rem] max-h-[calc(100%_-_5rem)] overflow-y-auto bg-usfWhite p-4 rounded-md">
	<div class="flex justify-between items-center">
		<h1 class="text-xl text-usfGreen font-medium">Create Population Selection</h1>
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<i class="fa-solid fa-xmark fa-lg text-black cursor-pointer" on:click={closeForm} />
	</div>
	<br />
	<form method="POST" action="/popsel?/create" enctype="multipart/form-data">
		<input type="hidden" name="emailList" bind:value={stringEmailList} />
		<input type="hidden" name="date" bind:value={date} />
		<input type="hidden" name="firstTermFull" bind:value={firstTerm} />
		<input type="hidden" name="secondTermFull" bind:value={secondTerm} />
		<input type="hidden" name="thirdTermFull" bind:value={thirdTerm} />
		<input type="hidden" name="priorAidYearFull" bind:value={priorAidYear} />
		<input type="hidden" name="priorFallTermFull" bind:value={priorFallTerm} />
		<input type="hidden" name="priorSpringTermFull" bind:value={priorSpringTerm} />
		<section class="space-y-2">
			<div class="flex space-x-2">
				<span class="flex flex-col space-y-1 w-fit">
					<label for="date">Date</label>
					<input required disabled type="date" name="date" class="input rounded-md" bind:value={date} />
				</span>
				<span class="flex flex-col space-y-1 grow">
					<label for="aidYear">Aid Year</label>
					<select required class="input rounded-md w-full" name="aidYear" bind:value={$aidYear}>
						<option disabled selected value="">Select one...</option>
						{#each aidYears as aidYear}
							<option value={aidYear.name}>{aidYear.name}</option>
						{/each}
					</select>
				</span>
				<span class="flex flex-col space-y-1 grow">
					<label for="termCodeFull">Term Code</label>
					<select disabled={$aidYear === ''} required class="input rounded-md w-full" name="termCodeFull" bind:value={termCode}>
						<option disabled selected value="">Select one...</option>
						{#each termCodeOptions as termCodeOption}
							<option value={termCodeOption}>{termCodeOption}</option>
						{/each}
					</select>
				</span>
			</div>
			<div class="flex space-x-2">
				<span class="flex flex-col space-y-1 grow">
					<label for="application">Application</label>
					<select required class="input rounded-md w-full" name="application" bind:value={application}>
						<option disabled selected value="">Select one...</option>
						{#each constants.applications as application}
							<option value={application.name}>{application.name}</option>
						{/each}
					</select>
				</span>
				<span class="flex flex-col space-y-1 grow">
					<label for="letterCode">Letter Code</label>
					<select required class="input rounded-md w-full" name="letterCode" bind:value={letterCode}>
						<option disabled selected value="">Select one...</option>
						{#each constants.letterCodes as letterCode}
							<option value={letterCode.name}>{letterCode.name}</option>
						{/each}
					</select>
				</span>
				<span class="flex flex-col w-fit space-y-1">
					<label for="letterCount">Letter Count</label>
					<input required type="number" name="letterCount" class="input rounded-md" placeholder="Number of letters..." bind:value={letterCount} />
				</span>
			</div>
			<div class="flex space-x-2">
				<span class="flex flex-col w-full space-y-1">
					<label for="requestedBy">Requested By</label>
					<select required class="input rounded-md" name="requestedBy" bind:value={requestedBy}>
						<option disabled selected value="">Select one...</option>
						{#each constants.users as user}
							<option value={user.id}>{user.first_name} {user.last_name}</option>
						{/each}
					</select>
				</span>
				<span class="flex flex-col w-full space-y-1">
					<label for="addressTypeFull">Address Type</label>
					<select required class="input rounded-md" name="addressTypeFull" bind:value={addressType}>
						<option disabled selected value="">Select one...</option>
						{#each constants.addressTypes as addressType}
							<option value={addressType.name}>{addressType.name}</option>
						{/each}
					</select>
				</span>
			</div>
			<div class="flex space-x-2">
				<span class="flex flex-col space-y-1 w-full">
					<label for="paidDate">Paid Date</label>
					<input type="date" name="paidDate" class="input rounded-md" bind:value={paidDate} />
				</span>
				<span class="flex flex-col space-y-1 w-full">
					<label for="paidDateThirty">30 Days Date</label>
					<input type="date" name="paidDateThirty" class="input rounded-md" bind:value={paidDateThirty} />
				</span>
				<span class="flex flex-col space-y-1 w-full">
					<label for="paidDateSixty">60 Days Date</label>
					<input type="date" name="paidDateSixty" class="input rounded-md" bind:value={paidDateSixty} />
				</span>
			</div>
			<div class="flex space-x-2">
				<span class="flex flex-col space-y-1 w-full">
					<label for="selectionId">Selection ID</label>
					<input required type="text" name="selectionId" class="input rounded-md" bind:value={selectionId} placeholder="Selection ID..." />
				</span>
				<span class="flex flex-col space-y-1 w-full">
					<label for="bannerCreatorId">BANNER Creator ID</label>
					<input required type="text" name="bannerCreatorId" class="input rounded-md" bind:value={bannerCreatorId} placeholder="BANNER Creator ID..." />
				</span>
				<span class="flex flex-col space-y-1 w-full">
					<label for="bannerUserId">BANNER User ID</label>
					<input required type="text" name="bannerUserId" class="input rounded-md" bind:value={bannerUserId} placeholder="BANNER User ID..." />
				</span>
			</div>
			{#if $aidYear !== ''}
				<div class="flex space-x-2">
					<span class="flex flex-col w-full space-y-1">
						<label for="firstTerm">First Term</label>
						<input required disabled type="text" class="input rounded-md" name="firstTerm" bind:value={firstTerm} />
					</span>
					<span class="flex flex-col w-full space-y-1">
						<label for="secondTerm">Second Term</label>
						<input required disabled type="text" class="input rounded-md" name="secondTerm" bind:value={secondTerm} />
					</span>
					<span class="flex flex-col w-full space-y-1">
						<label for="thirdTerm">Third Term</label>
						<input required disabled type="text" class="input rounded-md" name="thirdTerm" bind:value={thirdTerm} />
					</span>
				</div>
				<div class="flex space-x-2">
					<span class="flex flex-col w-full space-y-1">
						<label for="priorAidYear">Prior Aid Year</label>
						<input required disabled type="text" class="input rounded-md" name="priorAidYear" bind:value={priorAidYear} />
					</span>
					<span class="flex flex-col w-full space-y-1">
						<label for="priorFallTerm">Prior Fall Term</label>
						<input required disabled type="text" class="input rounded-md" name="priorFallTerm" bind:value={priorFallTerm} />
					</span>
					<span class="flex flex-col w-full space-y-1">
						<label for="priorSpringTerm">Prior Spring Term</label>
						<input required disabled type="text" class="input rounded-md" name="priorSpringTerm" bind:value={priorSpringTerm} />
					</span>
				</div>
			{/if}
			<UserPicker team={isTeam[0].userProfile} users={constants.users} bind:stringEmailList />
		</section>
		<footer class="float-right mt-3">
			<button type="submit" class="btn bg-accSlate text-white/90 rounded-md">Create request</button>
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
</style>
