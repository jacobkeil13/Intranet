<script lang="ts">
	import { SlideToggle, modalStore } from '@skeletonlabs/skeleton';
	import Loading from '$lib/components/animation/Loading.svelte';
	import type { Appointment } from '@prisma/client';
	import { getDateLocal } from '$lib/helpers';

	let isLoading = false;
	let constants = $modalStore[0].meta.constants;
  let appt: Appointment = $modalStore[0].meta.appt;

  let timeIn = getDateLocal(String(appt.timeIn?.toISOString()), "HH:mm");
  let timeOut = getDateLocal(String(appt.timeOut?.toISOString()), "HH:mm");
  // console.log(timeIn);
  

	function closeForm(): void {
		modalStore.close();
	}
</script>

<section class="w-[44rem] max-h-[calc(100%_-_5rem)] overflow-y-auto bg-usfWhite p-4 rounded-md">
	<div class="flex justify-between items-center">
		<h1 class="text-xl text-usfGreen font-medium">Update Appointment</h1>
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<box-icon class="fill-black cursor-pointer" name="x" on:click={closeForm} />
	</div>
	<br />
	<form method="POST" action="/appointments?/update" enctype="multipart/form-data">
    <input type="hidden" name="id" value={appt.id} />
    <input type="hidden" name="type" value={appt.type} />
		<section class="space-y-2">
			<div class="flex space-x-2">
				<span class="flex flex-col w-full space-y-1">
					<label for="studentName">Student Name</label>
					<input readonly required type="text" name="studentName" class="rounded-md border border-[#3e4c7a8a]" placeholder="Title..." value={appt.studentName} />
				</span>
				<span class="flex flex-col space-y-1">
					<label for="visitorType">Visitor Type</label>
					<input readonly required type="text" name="visitorType" class="rounded-md" value={appt.visitorType} />
				</span>
        <span class="flex flex-col space-y-1">
					<label for="studentUid">UID</label>
					<input readonly required type="text" name="studentUid" class="rounded-md" value={appt.studentUid} />
				</span>
			</div>
			<div class="flex space-x-2">
				<span class="flex flex-col space-y-1 grow">
					<label for="reason">Reason</label>
					<input readonly required type="text" name="reason" class="rounded-md" value={appt.reason} />
				</span>
				<span class="flex flex-col w-fit space-y-1">
					<label for="date">Date</label>
					<input readonly required type="date" name="date" class="rounded-md border border-[#3e4c7a8a]" placeholder="Title..." value={getDateLocal(appt.createdAt.toISOString(), "YYYY-MM-DD")} />
				</span>
        <span class="flex flex-col space-y-1">
					<label for="studentUid">UID</label>
					<input readonly required type="text" name="studentUid" class="rounded-md" value={appt.studentUid} />
				</span>
			</div>
      <div class="flex space-x-2">
				<span class="flex flex-col space-y-1 grow">
					<label for="advisor">Advisor</label>
					<select required class="input rounded-md w-full" name="advisor" value={appt.advisor ?? ""}>
						<option disabled selected value="">Select one...</option>
						{#each constants.users as user}
							<option value={user.first_name + " " + user.last_name}>{user.first_name} {user.last_name}</option>
						{/each}
					</select>
				</span>
				<span class="flex flex-col space-y-1">
          <label for="timeIn">Time In</label>
				  <input required 
            class="input rounded-md w-fit block" type="time" name="timeIn" id="timeIn"
            value={timeIn}
          >
        </span>
				<span class="flex flex-col space-y-1">
          <label for="timeOut">Time Out</label>
				  <input required={appt.timeIn !== null} 
            class="input rounded-md w-fit block" type="time" name="timeOut" id="timeOut"
            value={timeOut}
          >
        </span>
        <span class="flex flex-col space-y-1">
					<label for="complete" class="mb-2 text-transparent">Completed</label>
					<SlideToggle name="complete" size="sm" checked={appt.completed}>Completed</SlideToggle>
				</span>
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