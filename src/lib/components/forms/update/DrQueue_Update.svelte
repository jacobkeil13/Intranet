<script lang="ts">
	import { SlideToggle, getModalStore, type AutocompleteOption, Autocomplete, InputChip } from '@skeletonlabs/skeleton';
	import Loading from '../../animation/Loading.svelte';
	import { getDateLocal } from '$lib/helpers';
	import type { DataQueueComment, DataQueueItem, DataRequestType, Priority, UserProfile } from '@prisma/client';
	import UserPicker from '$lib/components/UserPicker.svelte';

  interface FullComment extends DataQueueComment {
    userProfile: UserProfile
  }

  interface FullRequest extends DataQueueItem {
    priority: Priority
    requestedBy: UserProfile
    assignedTo: UserProfile
    approvedBy: UserProfile
    requestType: DataRequestType
    emailTo: UserProfile[]
    comments: FullComment[]
  }

  let modalStore = getModalStore();
	let isLoading = false;
	let constants = $modalStore[0].meta.constants;
	let eptTeam = $modalStore[0].meta.eptTeam;
  let request: FullRequest = $modalStore[0].meta.request;

	let stringEmailList: string = '';

	function closeForm(): void {
		modalStore.close();
	}
</script>

<section class="w-[60rem] max-h-[calc(100%_-_5rem)] overflow-y-auto bg-usfWhite p-4 rounded-md">
	<div class="flex justify-between items-center">
		<h1 class="text-xl text-usfGreen font-medium">Update DR Queue Request</h1>
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<i class="fa-solid fa-xmark fa-lg text-black cursor-pointer" on:click={closeForm}></i>
	</div>
	<br />
  <section class="grid grid-cols-[1fr_2fr] gap-4">
    <div class="space-y-1">
			<h1>Comments</h1>
			<div class="space-y-1 max-h-[400px] overflow-auto">
				{#each request.comments as comment}
        <div class="rounded p-2 border border-accSlate/20 shadow-sm">
          <h1 class="text-sm">
            <span class="text-usfGreen font-semibold">
              {comment.userProfile.first_name} {comment.userProfile.last_name}
            </span> - {getDateLocal(comment.createdAt.toISOString(), "MMM Do h:mmA")}</h1>
          <p class="text-sm">{comment.content}</p>
        </div>
				{/each}
			</div>
		</div>
    <form method="POST" action="/dr_queue?/update" enctype="multipart/form-data">
      <input type="hidden" name="id" value={request.id} />
      <input type="hidden" name="emailList" bind:value={stringEmailList} />
      <section class="space-y-2">
        <div class="flex space-x-2">
          <span class="flex flex-col w-full space-y-1">
            <label for="title">Title</label>
            <input required type="text" name="title" class="input rounded-md" placeholder="Title..." value={request.title} />
          </span>
          <span class="flex flex-col space-y-1">
            <label for="dateNeeded">Date Needed</label>
            <input required type="date" name="dateNeeded" class="input rounded-md" value={getDateLocal(request.dateNeeded.toISOString(), "YYYY-MM-DD")} />
          </span>
        </div>
        <div class="flex space-x-2">
          <span class="flex flex-col w-full space-y-1">
            <label for="assignedToId">Assigned User</label>
            <select required class="input rounded-md" name="assignedToId" value={request.assignedTo === null ? "" : request.assignedTo.id}>
              <option disabled selected value="">Select one...</option>
              {#each eptTeam[0].userProfile as user}
                <option value={user.id}>{user.first_name} {user.last_name}</option>
              {/each}
            </select>
          </span>
          <span class="flex flex-col w-full space-y-1">
            <label for="requestType">Request Type</label>
            <select required class="input rounded-md" name="requestType" value={request.requestType.name}>
              <option disabled selected value="">Select one...</option>
              {#each constants.dataRequestTypes as dataRequestType}
                <option value={dataRequestType.name}>{dataRequestType.name}</option>
              {/each}
            </select>
          </span>
          <span class="flex flex-col space-y-1 grow">
            <label for="priority">Priority</label>
            <select required class="input rounded-md w-fit" name="priority" value={request.priority.name}>
              <option disabled selected value="">Select one...</option>
              {#each constants.priorities as priority}
                <option value={priority.name}>{priority.name}</option>
              {/each}
            </select>
          </span>
        </div>
        <UserPicker team={request.emailTo} users={constants.users} bind:stringEmailList={stringEmailList} />
        <div class="flex flex-col">
          <label for="description">Comment</label>
          <textarea required class="input rounded-md" name="description" cols="20" rows="4" placeholder="Why are you making this request..." />
        </div>
      </section>
      <footer class="flex items-center gap-4 float-right mt-3">
        <span class="flex flex-col space-y-1">
          <SlideToggle name="complete" size="sm" checked={request.complete}>Completed</SlideToggle>
        </span>
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
