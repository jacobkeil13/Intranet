<script lang="ts">
	import { SlideToggle, getModalStore } from '@skeletonlabs/skeleton';
	import Loading from '../../animation/Loading.svelte';
	import { getDateLocal, getTerm } from '$lib/helpers';
	import type { AddressType, AidYear, Application,LetterCode, PopulationSelection,
	  Priority, QueueComment, QueueItem, RequestType, UserProfile
	} from '@prisma/client';
	import UserPicker from '$lib/components/UserPicker.svelte';

	interface FullComment extends QueueComment {
    userProfile: UserProfile
  }

	interface FullPopsel extends PopulationSelection {
		aidYear: AidYear
		application: Application
		letterCode: LetterCode
		addressType: AddressType
		requestedBy: UserProfile
	}

  interface FullRequest extends QueueItem {
    priority: Priority
    requestedBy: UserProfile
    assignedTo: UserProfile
    approvedBy: UserProfile
    requestType: RequestType
    emailTo: UserProfile[]
    comments: FullComment[]
		populationSelection: FullPopsel | null
  }

	let deletedSafety = false;
	let toDelete = false;
	let viewPopsel = false;
	let modalStore = getModalStore();
	let isLoading = false;
	let constants = $modalStore[0].meta.constants;
	let isTeam = $modalStore[0].meta.isTeam[0].userProfile;
	let request: FullRequest = $modalStore[0].meta.request;

	let stringEmailList: string = '';
	
	function closeForm(): void {
		modalStore.close();
	}

	function response(action: "delete" | "update"): void {
		if ($modalStore[0] !== undefined) {
      $modalStore[0].meta.response(action);
    }
		closeForm();
	}

	function toggleSafety() {
		deletedSafety = !deletedSafety;
	}

	async function deletePopsel(id: string | undefined) {
		if (deletedSafety && toDelete) {
			if (id !== undefined) {
				const formData = new FormData();
				formData.append('id', id);
				await fetch("/is_queue?/deletePopsel", {
					method: 'POST',
					body: formData,
				})
			} else if (id === undefined) {
				const formData = new FormData();
				formData.append('id', request.id);
				await fetch("/is_queue?/delete", {
					method: 'POST',
					body: formData,
				})
			}

			response("delete");
		}
	}
</script>
<section class="grid grid-cols-[auto_auto] gap-2 max-h-[calc(100%_-_5rem)]">
	<section class="w-[60rem] overflow-y-auto bg-usfWhite p-4 rounded-md">
		<div class="flex justify-between items-center">
			<div class="flex items-center gap-3">
				<h1 class="text-xl text-usfGreen font-medium">Update IS Queue Request</h1>
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<i class="fa-solid fa-trash-can text-black/60 hover:text-red-600 cursor-pointer" on:click={toggleSafety}></i>
				{#if deletedSafety}
					<div class="flex items-center gap-3 px-3 py-[2px] rounded-md bg-red-600 text-white/90 font-medium">
						{#if request.populationSelection !== null}
							<button on:click={() => { deletePopsel(request.populationSelection?.id) }}>Delete Permanently</button>
						{:else}
							<button on:click={() => { deletePopsel(undefined) }}>Delete Permanently</button>
						{/if}
						<!-- svelte-ignore a11y-click-events-have-key-events -->
						{#if !toDelete}
							<i class="fa-regular fa-square-check text-white/90 cursor-pointer" on:click={() => toDelete = !toDelete} ></i>
						{:else}
							<i class="fa-solid fa-square-check text-white/90 cursor-pointer" on:click={() => toDelete = !toDelete} ></i>
						{/if}
					</div>
				{/if}
			</div>
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<i class="fa-solid fa-xmark fa-lg text-black cursor-pointer" on:click={closeForm}></i>
		</div>
		<br />
		<section class="grid grid-cols-[1fr_2fr] gap-4">
			{#if request.populationSelection !== null && viewPopsel}
				<div class="space-y-1">
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					<h1 class="px-2 py-1 bg-accSlate text-white/90 w-fit rounded-md cursor-pointer" on:click={() => viewPopsel = !viewPopsel}>
						View Comments
					</h1>
					<div class="overflow-y-auto">
						<h1><span class="font-medium">Letter Code -</span> {request.populationSelection.letterCode.name}</h1>
						<h1><span class="font-medium">Letter Count -</span> {request.populationSelection.letterCount}</h1>
						<h1><span class="font-medium">Aid Year -</span> {request.populationSelection.aidYear.name}</h1>
						<h1><span class="font-medium">Application:</span> {request.populationSelection.application.name}</h1>
						<h1><span class="font-medium">Address Type:</span> {request.populationSelection.addressType.name === "Local Address" ? "1ML" : "Requestor"}</h1>
						<h1><span class="font-medium">Selection ID -</span> {request.populationSelection.selectionId}</h1>
						<h1><span class="font-medium">BANNER Creator ID -</span> {request.populationSelection.bannerCreatorId}</h1>
						<h1><span class="font-medium">BANNER User ID -</span> {request.populationSelection.bannerUserId}</h1>
						<h1><span class="font-medium">First Term -</span> {getTerm(request.populationSelection.firstTerm)}</h1>
						<h1><span class="font-medium">Second Term -</span> {getTerm(request.populationSelection.secondTerm)}</h1>
						<h1><span class="font-medium">Third Term -</span> {getTerm(request.populationSelection.thirdTerm)}</h1>
						<h1><span class="font-medium">Prior Aid Year -</span> {request.populationSelection.priorAidYear.split("-")[0].slice(-2) + request.populationSelection.priorAidYear.split("-")[1].slice(-2)}</h1>
						<h1><span class="font-medium">Prior Spring Term -</span> {getTerm(request.populationSelection.priorSpringTerm)}</h1>
						<h1><span class="font-medium">Prior Fall Term -</span> {getTerm(request.populationSelection.priorFallTerm)}</h1>
						<h1><span class="font-medium">Paid Date -</span> {getDateLocal(String(request.populationSelection.paidDate?.toISOString()), "YYYY-MM-DD")}</h1>
						<h1><span class="font-medium">30 Days Date -</span> {getDateLocal(String(request.populationSelection.paidDateThirty?.toISOString()), "YYYY-MM-DD")}</h1>
						<h1><span class="font-medium">60 Days Date -</span> {getDateLocal(String(request.populationSelection.paidDateSixty?.toISOString()), "YYYY-MM-DD")}</h1>
					</div>
				</div>
			{:else}
				<div class="space-y-2">
					{#if request.populationSelection !== null}
						<!-- svelte-ignore a11y-click-events-have-key-events -->
						<h1 class="px-2 py-1 bg-accSlate text-white/90 w-fit rounded-md cursor-pointer" on:click={() => viewPopsel = !viewPopsel}>
							View Popsel
						</h1>
					{:else}
						<h1 class="px-2 py-1 bg-accSlate text-white/90 w-fit rounded-md cursor-pointer">Comments</h1>
					{/if}
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
			{/if}
			<form method="POST" action="/is_queue?/update" enctype="multipart/form-data">
				<input type="hidden" name="id" value={request.id}>
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
								{#each isTeam as user}
									<option value={user.id}>{user.first_name} {user.last_name}</option>
								{/each}
							</select>
						</span>
						<span class="flex flex-col w-full space-y-1">
							<label for="requestType">Request Type</label>
							<select required class="input rounded-md" name="requestType" value={request.requestType.name}>
								<option disabled selected value="">Select one...</option>
								{#each constants.requestTypes as requestType}
									<option value={requestType.name}>{requestType.name}</option>
								{/each}
							</select>
						</span>
						<span class="flex flex-col space-y-1">
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
					<div class="flex flex-col space-y-2">
						<label for="description">Comment</label>
						<textarea required class="input rounded-md" name="description" cols="20" rows="4" placeholder="Why are you making this request..." />
					</div>
				</section>
				<footer class="flex items-center gap-4 float-right mt-3">
					<div class="flex gap-3">
						<span class="flex flex-col space-y-1">
							<SlideToggle name="complete" size="sm" checked={request.complete}>Completed</SlideToggle>
						</span>
						{#if request.populationSelection !== null}
							<span class="flex flex-col space-y-1">
								<SlideToggle name="locked" size="sm" checked={request.locked}>Locked</SlideToggle>
							</span>
						{/if}
					</div>
					<button type="submit" class="btn bg-accSlate text-white/90 rounded-md">
						{#if isLoading}
							<div class="flex items-center space-x-6">
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
