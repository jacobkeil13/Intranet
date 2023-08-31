<script context="module">
	import { localStorageStore, modalStore } from '@skeletonlabs/skeleton';
	let phoneBar = localStorageStore("phoneBar", true);
</script>

<script lang="ts">
	import Search from '$lib/components/Search.svelte';
	import { Table, type PaginationSettings, Paginator, tableMapperValues, toastStore } from '@skeletonlabs/skeleton';
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	export let data;

	let sourceData: any[] = [];
	let filteredSourceData: any[] = [];
	let searchQuery =	'';
	let users = data.users;
	$: gridCols = $phoneBar ? 'grid-cols-[auto_250px]' : 'grid-cols-1';

	onMount(() => {
		users.forEach((user) => {
			let uidRange = " - " + `<span class="font-semibold">(${user.uidRange})</span>`
			let teams = user.team.map(t => {
				return user.uidRange === null ? t.name : t.name + uidRange
			})
			let tr = {
				id: user.id,
				name: user.first_name + " " + user.last_name,
				email: user.netid,
				title: user.title.name,
				team: teams.join("<br>"),
				extension: user.phone
			}
			sourceData.push(tr);
		});
		filteredSourceData = sourceData
	});
	
	function toggleKey() {
		$phoneBar = !$phoneBar;
	}

	$: {
    filteredSourceData = sourceData.filter((user: any) => {
      if (user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
					user.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
					user.team.toLowerCase().includes(searchQuery.toLowerCase())) {
        return user;
      }
    })
		updatePageSettings(filteredSourceData);
  }

	function getTeam(name: string) {
		let filteredUsers = users.map((user) => {
			return {
				netid: user.netid,
				teams: user.team.map(team => { return team.name })
			};
		})

		let teamUsers = filteredUsers.filter(user => {
			if (user.teams.includes(name)) {
				return `${user.netid}@usf.edu;`;
			}
		})

		toastStore.trigger({
		  message: "Copied: " + name,
      background: "bg-accTeal",
      classes: "text-white/90 font-medium"
	  });

		navigator.clipboard.writeText(teamUsers.map(user => user.netid + "@usf.edu").join(";") + ";");
	}

	function sortByTeam(team: string) {
		searchQuery = team;
	}

	const headers: string[] = ['Name', 'Email', 'Title', 'Team', 'Extension'];
	const body: string[] = ['name', 'email', 'title', 'team', 'extension'];
	const meta: string[] = ['id'];
  let state = { firstLast: false, previousNext: true };
	let page = { offset: 0, limit: 10, size: filteredSourceData.length, amounts: [5, 10, 15] } as PaginationSettings;
	$: sourceDataSliced = filteredSourceData.slice(page.offset * page.limit, page.offset * page.limit + page.limit);

	function updatePageSettings(filteredArr: any[]) {
		page.size = filteredArr.length;
		page.offset = 0
	}

	function updateUser(e: CustomEvent) {
		if (data.user.role !== "ADMIN") return;
    modalStore.trigger({
      type: 'component',
      component: 'updateUserProfileModal',
      meta: { userProfile: users.find(user => user.id === e.detail[0]) }
    });
  }
</script>

<section in:fly={{ y: -10, duration: 200 }}>
	<div class="grid {gridCols} auto-rows-min gap-x-4">
		<div class="flex justify-between items-center">
			<h1 class="text-2xl text-usfGreen font-semibold">Phone List</h1>
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<div class="flex justify-center items-center space-x-4">
				<Search bind:value={searchQuery} />
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<div class="flex justify-center items-center bg-accSlate p-[6px] rounded-full cursor-pointer" on:click={toggleKey}>
					<box-icon class="fill-white/90" name={$phoneBar ? 'x' : 'list-check'} />
				</div>
			</div>
		</div>
	</div>
	<br />
	<div class="grid {gridCols} auto-rows-min gap-x-4 gap-y-0" style="align-items: flex-start;">
		<section>
			<Table on:selected={updateUser} interactive={true} source={{ head: headers, body: tableMapperValues(sourceDataSliced, body), meta: tableMapperValues(sourceDataSliced, meta)}} regionHeadCell="bg-accSlate text-white/90" />
			<br />
			<Paginator buttonClasses="bg-accSlate fill-white"  bind:settings={page} showFirstLastButtons={state.firstLast} showPreviousNextButtons={state.previousNext} />
		</section>
		{#if $phoneBar}
				<div class="bg-accSlate rounded-lg p-3 text-white/90">
					<h1 class="font-medium mb-2 text-accApple">Copy Teams:</h1>
					{#each data.teams as team}
						<!-- svelte-ignore a11y-click-events-have-key-events -->
						<div class="flex justify-between items-center space-x-2 group">
							<h1 class="font-medium text-white/90 cursor-pointer">{team.name}</h1>
							<div>
							<box-icon
								on:click={() => sortByTeam(team.name)}
								name='sort-alt'
								type='solid'
								class="opacity-0 group-hover:opacity-100 duration-150 fill-white/90 hover:fill-accApple cursor-pointer"
							></box-icon>
							<box-icon
							on:click={() => getTeam(team.name)}
								name='copy'
								type='solid'
								class="opacity-0 group-hover:opacity-100 duration-150 fill-white/90 hover:fill-accApple cursor-pointer"
							></box-icon>
							</div>
						</div>
					{/each}
				</div>
			{/if}
	</div>
</section>