<script lang="ts">
	import { type PaginationSettings, type ModalSettings, getModalStore, getToastStore } from '@skeletonlabs/skeleton';
	import { PageWrapper, Popup, Search, TableWrapper, HeaderSort } from '$lib/components';
	import { pageOptions } from '$lib/stores/filters.js';
	import { fly } from 'svelte/transition';
	export let data;

	let modalStore = getModalStore();
	let toastStore = getToastStore();

	type HeaderTypes = 'name' | 'netid' | 'title' | 'team' | 'extension';
	let currentSortField: HeaderTypes = 'name';
	let currentSortOrder: 'asc' | 'dsc' = 'asc';

	let searchQuery = '';
	let phoneBar = false;
	$: teamFilter = '';
	$: users = data.users;
	let filteredUsers = data.users;
	$: gridCols = phoneBar ? 'grid-cols-[auto_250px]' : 'grid-cols-1';

	$: {
		filteredUsers = users.filter((user) => {
			let name = user.first_name + ' ' + user.last_name;
			let teams = user.team.map((t) => {
				return t.name;
			});
			if (teamFilter !== '') {
				if (
					name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
					user.title.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
					user.netid.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
					teams.join(' ').toLowerCase().includes(searchQuery.toLowerCase().trim())
				) {
					if (teams.includes(teamFilter)) {
						return user;
					}
				}
			} else {
				if (
					name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
					user.title.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
					user.netid.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
					teams.join(' ').toLowerCase().includes(searchQuery.toLowerCase().trim())
				) {
					return user;
				}
			}
		});
		updatePageSettings(filteredUsers);
		teamFilter = '';
	}

	let paginationSettings = {
		page: 0,
		limit: 10,
		size: filteredUsers.length,
		amounts: pageOptions
	} satisfies PaginationSettings;

	$: paginatedSource = filteredUsers.slice(paginationSettings.page * paginationSettings.limit, paginationSettings.page * paginationSettings.limit + paginationSettings.limit);

	function updatePageSettings(filteredArr: any[]) {
		paginationSettings.size = filteredArr.length;
		paginationSettings.page = 0;
	}

	function getTeam(name: string) {
		let filteredUsers = users.map((user) => {
			return {
				netid: user.netid,
				teams: user.team.map((team) => {
					return team.name;
				})
			};
		});

		let teamUsers = filteredUsers.filter((user) => {
			if (user.teams.includes(name)) {
				return `${user.netid}@usf.edu;`;
			}
		});

		toastStore.trigger({
			message: 'Copied: ' + name,
			background: 'bg-accTeal',
			classes: 'text-white/90 font-medium'
		});

		navigator.clipboard.writeText(teamUsers.map((user) => user.netid + '@usf.edu').join(';') + ';');
	}

	function updateUser(id: string) {
		if (data.user.role !== 'ADMIN') return;
		modalStore.trigger({
			type: 'component',
			component: 'updateUserProfileModal',
			meta: {
				userProfile: users.find((user) => user.id === id),
				constants: data.constants,
				response: async (action: 'delete' | 'update') => {
					if (action === 'delete') {
						users = users.filter((user) => user.id !== id);
						modalStore.close();
						toastStore.trigger({
							message: String('User deleted successfully!'),
							background: 'bg-accTeal',
							classes: 'text-white/90 font-medium'
						});
						return;
					}

					toastStore.trigger({
						message: 'User updated successfully!',
						background: 'bg-accTeal',
						classes: 'text-white/90 font-medium'
					});

					let res = await fetch('/api/user?id=' + id);
					let resp = await res.json();
					let newUser = resp.users;

					users = users.map((user) => (user.id === newUser.id ? newUser : user));
				}
			}
		});
	}

	function openModal(modal: ModalSettings) {
		modalStore.trigger(modal);
	}

	const userProfileModal: ModalSettings = {
		type: 'component',
		component: 'userProfileModal',
		meta: { constants: data.constants }
	};

	function resetFilters() {
		teamFilter = '';
		searchQuery = '';
		filteredUsers = users;
		currentSortField = 'name';
		currentSortOrder = 'asc';
		sort();
	}

	let tableHeaders = [
		{ sortable: true, title: 'Name', field: 'name' },
		{ sortable: true, title: 'Net ID', field: 'netid' },
		{ sortable: true, title: 'Title', field: 'title' },
		{ sortable: true, title: 'Team', field: 'team' },
		{ sortable: true, title: 'Extension', field: 'extension' }
	];

	function sort() {
		filteredUsers = users.sort((a, b) => {
			const getField = (obj: typeof a, field: HeaderTypes) => {
				const fieldsMap = {
					name: obj.first_name + ' ' + obj.last_name,
					netid: obj.netid,
					title: obj.title.name,
					team: obj.team.map((team) => team.name).join(','),
					extension: obj.phone
				};
				return fieldsMap[field] || obj.first_name + ' ' + obj.last_name;
			};

			let aSortBy = getField(a, currentSortField);
			let bSortby = getField(b, currentSortField);

			const compareValues = (a: string, b: string) => {
				if (currentSortOrder === 'asc') return a < b ? -1 : a > b ? 1 : 0;
				return a > b ? -1 : a < b ? 1 : 0;
			};

			return compareValues(aSortBy, bSortby);
		});
	}
</script>

<svelte:head>
	<title>OFA • Phone List</title>
</svelte:head>

<section in:fly={{ y: -10, duration: 200 }}>
	<PageWrapper>
		<svelte:fragment slot="title">
			<h1 class="text-2xl text-usfGreen font-semibold">Phone List</h1>
		</svelte:fragment>
		<svelte:fragment slot="title-right">
			<Search bind:value={searchQuery} />
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			{#if data.profile?.role.name === 'ADMIN'}
				<div
					class="flex justify-center items-center bg-accSlate w-10 h-10 rounded-full cursor-pointer"
					on:click={() => {
						openModal(userProfileModal);
					}}
				>
					<i class="fa-solid fa-plus fa-lg text-white/90" />
				</div>
			{/if}
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<div
				class="flex justify-center items-center bg-accSlate w-10 h-10 rounded-full cursor-pointer"
				on:click={() => {
					phoneBar = !phoneBar;
				}}
			>
				<i class="text-white/90 fa-solid {phoneBar ? 'fa-xmark fa-lg' : 'fa-ellipsis'}" />
			</div>
		</svelte:fragment>
		<svelte:fragment slot="filters">
			<button class="bg-accSlate/80 text-white/90 font-medium rounded-md px-4 py-2" on:click={resetFilters}> Reset Filters </button>
		</svelte:fragment>
		<svelte:fragment slot="content">
			<div class="grid {gridCols} auto-rows-min gap-x-4 gap-y-0" style="align-items: flex-start;">
				<section>
					<TableWrapper arrLength={filteredUsers.length} bind:paginationSettings>
						<svelte:fragment slot="header">
							<thead>
								<tr class="bg-accSlate text-white/90">
									{#each tableHeaders as header}
										<HeaderSort sortable={header.sortable} title={header.title} field={header.field} bind:currentSortField bind:currentSortOrder on:sort={sort} />
									{/each}
								</tr>
							</thead>
						</svelte:fragment>
						<svelte:fragment slot="body">
							<tbody>
								{#each paginatedSource as user}
									<tr on:click={() => updateUser(user.id)} class="cursor-pointer">
										<td>{user.first_name + ' ' + user.last_name}</td>
										<td>{user.netid}</td>
										<td>{user.title.name}</td>
										<td>
											{#if user.team.length > 1}
												<Popup bgColor="bg-accSlate">
													<svelte:fragment slot="content">
														<p>{user.team[0].name} • <span class="font-semibold">+{user.team.slice(1).length}</span></p>
													</svelte:fragment>
													<svelte:fragment slot="popup">
														{#each user.team as team}
															<p class="text-white/90 font-medium">{team.name}</p>
														{/each}
													</svelte:fragment>
												</Popup>
											{:else}
												<p>{user.team[0].name}</p>
											{/if}
										</td>
										<td>{user.phone}</td>
									</tr>
								{/each}
							</tbody>
						</svelte:fragment>
						<svelte:fragment slot="none">
							<p>There are no referrals that match your search.</p>
						</svelte:fragment>
					</TableWrapper>
				</section>
				{#if phoneBar}
					<div class="bg-accSlate rounded-lg p-3 text-white/90">
						<h1 class="font-medium mb-2 text-accApple">Copy Teams:</h1>
						{#each data.teams as team}
							<!-- svelte-ignore a11y-click-events-have-key-events -->
							<div class="flex justify-between items-center group">
								<h1 class="font-medium text-white/90 cursor-pointer">{team.name}</h1>
								<div>
									<i
										class="fa-solid fa-filter opacity-0 group-hover:opacity-100 duration-150 text-white/90 hover:text-accApple cursor-pointer"
										on:click={() => {
											teamFilter = team.name;
											filteredUsers = users;
										}}
									/>
									<i class="fa-solid fa-copy opacity-0 group-hover:opacity-100 duration-150 text-white/90 hover:text-accApple cursor-pointer" on:click={() => getTeam(team.name)} />
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</svelte:fragment>
	</PageWrapper>
</section>
