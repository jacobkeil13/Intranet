<script lang="ts">
	import { getDateLocal } from '$lib/helpers';
	import type { Appointment, Referral, VisitCounter } from '@prisma/client';
	import { SlideToggle, Tab, TabGroup, getModalStore, type PaginationSettings, Paginator } from '@skeletonlabs/skeleton';
	import moment from 'moment';
	import { onMount } from 'svelte';
	import Search from '$lib/components/Search.svelte';
	import D3Chart from '../charts/D3Chart.svelte';
	import { fly } from 'svelte/transition';
	import Popup from '../Popup.svelte';
	import TableWrapper from '../TableWrapper.svelte';

	enum Stat {
		Visits = 0,
		Phone = 1,
		InPerson = 2,
		Walkin = 3,
		Referral = 4,
		Staff = 5,
		Reasons = 6
	}

	interface FullVisit extends VisitCounter {
		appointment: Appointment | null;
		referral: Referral | null;
	}

	interface ChartData {
		date: string;
		visits: number;
	}

	let modalStore = getModalStore();
	let graphView = false;
	let graphData: ChartData[] = [];
	let tabSet: number = 0;
	let searchQuery: string = '';
	$: timePicked = '';
	let staffVisits: { name: string; visits: number }[] = [];
	let times: { time: string; visits: number }[] = [];
	let visits: FullVisit[] = $modalStore[0].meta.visits.sort((a: VisitCounter, b: VisitCounter) => a.createdAt.toISOString().localeCompare(b.createdAt.toISOString()));
	let filteredVisits = visits;
	let date = $modalStore[0].meta.date;

	onMount(() => {
		let visitsPerHour: { [key: string]: { visits: number; iso: string } } = {};
		for (let visit of visits) {
			let time = getDateLocal(visit.createdAt.toISOString(), 'hA');
			if (visitsPerHour[time] === undefined) {
				visitsPerHour[time] = { visits: 0, iso: '' };
			}
			visitsPerHour[time].visits++;
			visitsPerHour[time].iso = visit.createdAt.toISOString();
		}

		Object.keys(visitsPerHour).forEach((time) => {
			times.push({ time, visits: visitsPerHour[time].visits });

			graphData.push({
				date: visitsPerHour[time].iso,
				visits: visitsPerHour[time].visits
			});
		});
		timePicked = 'All';
	});

	$: {
		const doesIncludeSearch = (field: string | null, searchQuery: string) => field?.toLowerCase().includes(searchQuery.toLowerCase().trim());

		const matchTime = (visit: FullVisit, timePicked: string) => timePicked === 'All' || (timePicked && getDateLocal(visit.createdAt.toISOString(), 'hA') === timePicked);

		filteredVisits = visits.filter((visit) => {
			const searchLowered = searchQuery.toLowerCase().trim();
			switch (tabSet) {
				case Stat.Visits:
					if (doesIncludeSearch(visit.studentUid, searchLowered) || doesIncludeSearch(visit.studentName, searchLowered) || doesIncludeSearch(visit.counterUser, searchLowered)) {
						return matchTime(visit, timePicked);
					}
					break;

				case Stat.Phone:
				case Stat.InPerson:
				case Stat.Walkin:
					if (visit.appointment && doesIncludeSearch(visit.studentUid, searchLowered)) {
						if (
							(tabSet === Stat.Phone && visit.appointment.type === 'Phone Appointment') ||
							(tabSet === Stat.InPerson && visit.appointment.type === 'In-person Appointment') ||
							(tabSet === Stat.Walkin && visit.appointment.type === 'Walk-in Appointment')
						) {
							if (doesIncludeSearch(visit.appointment.advisor, searchLowered)) {
								return matchTime(visit, timePicked);
							}
						}
					}
					break;

				case Stat.Referral:
					if (visit.referral && doesIncludeSearch(visit.studentUid, searchLowered)) {
						if (doesIncludeSearch(visit.referral.counterUser, searchLowered)) {
							return matchTime(visit, timePicked);
						}
					}
					break;

				default:
					break;
			}
			return false;
		});

		updatePageSettings(filteredVisits);
	}

	$: {
		staffVisits = [];
		for (let visit of visits) {
			let hourCreated = getDateLocal(visit.createdAt.toISOString(), 'hA');
			let user = staffVisits.find((user) => user.name === visit.counterUser);
			if (user === undefined) {
				staffVisits.push({ name: visit.counterUser, visits: 0 });
			}
			if (timePicked === 'All') {
				let visitUser = staffVisits.find((user) => user.name === visit.counterUser);
				if (visitUser !== undefined) visitUser.visits++;
			} else {
				if (timePicked === hourCreated) {
					let visitUser = staffVisits.find((user) => user.name === visit.counterUser);
					if (visitUser !== undefined) visitUser.visits++;
				}
			}
		}

		staffVisits = staffVisits.filter((user) => user.visits !== 0);
	}

	function closeForm(): void {
		modalStore.close();
	}

	let paginationSettings = {
		page: 0,
		limit: 5,
		size: filteredVisits.length,
		amounts: [5, 10]
	} satisfies PaginationSettings;

	$: paginatedSource = filteredVisits.slice(paginationSettings.page * paginationSettings.limit, paginationSettings.page * paginationSettings.limit + paginationSettings.limit);

	function updatePageSettings(filteredArr: any[]) {
		paginationSettings.size = filteredArr.length;
		paginationSettings.page = 0;
	}

	function downloadCSV() {
		const rows: any = [];
		const headerRow: string[] = ['UID', 'Student Name', 'Student Email', 'Reason', 'Visitor Type', 'Counter User', 'Submitted Document', 'Appointment', 'Referral', 'Time'];
		rows.push(headerRow);

		visits.forEach((visit) => {
			let row: any = [];
			row.push(String(visit.studentUid === null || visit.studentUid.includes('#') ? '-' : visit.studentUid));
			row.push(String(visit.studentName ?? '-'));
			row.push(String(visit.studentEmail ?? '-'));
			row.push(String(visit.reason.replaceAll(', ', ' / ')));
			row.push(String(visit.visitorType));
			row.push(String(visit.counterUser));
			row.push(String(visit.submittedDocument));
			row.push(String(visit.appointment ? true : false));
			row.push(String(visit.referral ? true : false));
			row.push(String(getDateLocal(visit.createdAt.toISOString(), 'YYYY-MM-DD hh:mmA')));
			rows.push(row);
		});

		let csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e: any) => e.join(',')).join('\n');

		var encodedUri = encodeURI(csvContent);
		var link = document.createElement('a');
		link.setAttribute('href', encodedUri);
		link.setAttribute('download', `Visits_${date}.csv`);
		document.body.appendChild(link);
		link.click();
	}
</script>

<section class="w-[70rem] min-h-[500px] max-h-[calc(100%_-_5rem)] overflow-y-auto bg-usfWhite p-4 rounded-md">
	<div class="flex justify-between items-center">
		<div class="flex items-center space-x-2">
			<h1 class="text-xl text-usfGreen font-medium">{moment(date).format('MMMM Do, YYYY')}</h1>
			<Popup pointer="" offset={0} placement="right">
				<svelte:fragment slot="content">
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					<i class="fa-solid fa-file-export text-usfGreen/50 hover:text-usfGreen fa-lg cursor-pointer" on:click={downloadCSV} />
				</svelte:fragment>
				<svelte:fragment slot="popup">
					<p class="text-white/80 font-semibold">Download as CSV</p>
				</svelte:fragment>
			</Popup>
		</div>
		<div class="flex justify-center items-center space-x-4">
			<div class="flex items-center space-x-3">
				<h1 class="font-semibold">Graph View</h1>
				<SlideToggle name="graph" size="sm" bind:checked={graphView} />
			</div>
			<Search bind:value={searchQuery} />
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<i class="fa-solid fa-xmark fa-lg text-black cursor-pointer" on:click={closeForm} />
		</div>
	</div>
	<br />
	<TabGroup>
		<Tab bind:group={tabSet} name="visits" value={0}>Visits</Tab>
		<Tab bind:group={tabSet} name="phone" value={1}>Phone Appts</Tab>
		<Tab bind:group={tabSet} name="inperson" value={2}>In-person Appts</Tab>
		<Tab bind:group={tabSet} name="walkin" value={3}>Walk-in Appts</Tab>
		<Tab bind:group={tabSet} name="referrals" value={4}>Referrals</Tab>
		<Tab bind:group={tabSet} name="staff" value={5}>Staff</Tab>
		<svelte:fragment slot="panel">
			<section class="grid grid-cols-[200px_2fr] gap-4">
				<div class="space-y-1">
					<h1 class="font-semibold">Visits by Time</h1>
					<div class="space-y-1 max-h-[430px] overflow-auto">
						<ul class="flex flex-col gap-1">
							<li>
								<input type="radio" id="All" value="All" class="hidden peer" bind:group={timePicked} />
								<label
									for="All"
									class="inline-flex items-center justify-between w-full py-1 px-3 text-accSlate bg-white border border-accSlate/20 rounded-md cursor-pointer
                      peer-checked:bg-accSlate peer-checked:border-accSlate peer-checked:text-usfWhite/90"
								>
									<div class="flex justify-between w-full text-lg font-semibold">
										<h1>All</h1>
										<h1>{visits.length}</h1>
									</div>
								</label>
							</li>
							{#each times as t}
								<li>
									<input type="radio" id={t.time} value={t.time} class="hidden peer" bind:group={timePicked} />
									<label
										for={t.time}
										class="inline-flex items-center justify-between w-full py-1 px-3 text-accSlate bg-white border border-accSlate/20 rounded-md cursor-pointer
                        peer-checked:bg-accSlate peer-checked:border-accSlate peer-checked:text-usfWhite/90"
									>
										<div class="flex justify-between w-full text-lg font-semibold">
											<h1>{t.time}</h1>
											<h1>{t.visits}</h1>
										</div>
									</label>
								</li>
							{/each}
						</ul>
					</div>
				</div>
				<div>
					{#if graphView}
						{#if graphData.length > 2}
							<section in:fly={{ y: -10, duration: 250 }}>
								<D3Chart width={800} height={400} data={graphData} />
							</section>
						{:else}
							<h1>Graph needs more data before it can be rendered</h1>
						{/if}
					{:else}
						<section in:fly={{ y: -10, duration: 250 }}>
							{#if tabSet !== Stat.Staff}
								<TableWrapper arrLength={filteredVisits.length} bind:paginationSettings>
									<svelte:fragment slot="header">
										{#if tabSet === Stat.Visits}
											<tr class="bg-accSlate/10 text-black/70">
												<th>UID</th>
												<th>Reason</th>
												<th>Counter User</th>
												<th>Appt.</th>
												<th>Referral</th>
											</tr>
										{:else if tabSet === Stat.Phone || tabSet === Stat.InPerson || tabSet === Stat.Walkin}
											<tr class="bg-accSlate/10 text-black/70">
												<th>UID</th>
												<th>Reason</th>
												<th>Advisor</th>
												<th>Source</th>
											</tr>
										{:else if tabSet === Stat.Referral}
											<tr class="bg-accSlate/10 text-black/70">
												<th>UID</th>
												<th>Reason</th>
												<th>Owner</th>
												<th>Source</th>
											</tr>
										{/if}
									</svelte:fragment>
									<svelte:fragment slot="body">
										{#if tabSet === Stat.Visits}
											{#each paginatedSource as visit}
												<tr>
													<td>
														{#if visit.studentUid !== null}
															<Popup bgColor="bg-accSlate" placement="right">
																<svelte:fragment slot="content">
																	{visit.studentUid.toUpperCase()}
																</svelte:fragment>
																<svelte:fragment slot="popup">
																	<p class="text-white/80 font-semibold">{visit.studentName ?? visit.studentUid}</p>
																</svelte:fragment>
															</Popup>
														{:else}
															<p>-</p>
														{/if}
													</td>
													<td>
														{#if visit.reason.split('/').length > 1}
															<Popup bgColor="bg-accSlate" placement="right">
																<svelte:fragment slot="content">
																	{visit.reason.split('/')[0]}
																</svelte:fragment>
																<svelte:fragment slot="popup">
																	<p class="text-white/80 font-semibold">Additional Reasons</p>
																	{#each visit.reason.split('/').slice(1) as reason}
																		<p class="text-white/80 font-semibold">• {reason}</p>
																	{/each}
																</svelte:fragment>
															</Popup>
														{:else}
															{visit.reason.split('/')[0]}
														{/if}
													</td>
													<td>{visit.counterUser}</td>
													<td>
														{#if visit.appointment !== null}
															<Popup bgColor="bg-accSlate" eventType="click">
																<svelte:fragment slot="content">
																	<i class="fa-solid fa-check fa-lg text-usfGreen" />
																</svelte:fragment>
																<svelte:fragment slot="popup">
																	<p class="text-white/80 font-semibold">{visit.appointment.advisor}</p>
																	<p class="flex items-center font-semibold {visit.appointment.completed ? 'text-green-500' : 'text-orange-300'}">
																		{visit.appointment.completed ? 'Completed' : 'Pending'}
																	</p>
																	<p class="text-white/80 font-semibold">{getDateLocal(visit.appointment.createdAt.toISOString(), 'MMMM Do, YYYY')}</p>
																	<hr class="!border-dashed my-2" />
																	<p class="text-white/80 font-semibold">{visit.appointment.studentName}</p>
																	<p class="text-white/80 font-semibold">{visit.appointment.type}</p>
																</svelte:fragment>
															</Popup>
														{:else}
															<i class="fa-solid fa-xmark fa-lg text-black/50" />
														{/if}
													</td>
													<td>
														{#if visit.referral !== null}
															<Popup bgColor="bg-accSlate" width="max-w-xs" eventType="click">
																<svelte:fragment slot="content">
																	<i class="fa-solid fa-check fa-lg text-usfGreen" />
																</svelte:fragment>
																<svelte:fragment slot="popup">
																	<p class="text-white/80 font-semibold">{visit.referral.counterUser}</p>
																	<p class="flex items-center font-semibold {visit.referral.completed ? 'text-green-400' : 'text-orange-300'}">
																		{visit.referral.completed ? 'Completed' : 'Pending'}
																	</p>
																	<p class="text-white/80 font-semibold">{getDateLocal(visit.referral.bestTimeCallback.toISOString(), 'MMMM Do, YYYY')}</p>
																	<hr class="!border-dashed my-2" />
																	<p class="text-white/80 font-semibold">{visit.referral.details}</p>
																	<hr class="!border-dashed my-2" />
																	<p class="text-white/80 font-semibold">{visit.referral.referralType}</p>
																</svelte:fragment>
															</Popup>
														{:else}
															<i class="fa-solid fa-xmark fa-lg text-black/50" />
														{/if}
													</td>
												</tr>
											{/each}
										{:else if tabSet === Stat.Phone || tabSet === Stat.InPerson || tabSet === Stat.Walkin}
											{#each paginatedSource as visit}
												<tr>
													<td>{visit.studentUid ?? '-'}</td>
													<td>{visit.reason}</td>
													<td>{visit.appointment?.advisor}</td>
													<td>{visit.appointment?.source}</td>
												</tr>
											{/each}
										{:else if tabSet === Stat.Referral}
											{#each paginatedSource as visit}
												<tr>
													<td>{visit.studentUid ?? '-'}</td>
													<td>{visit.reason}</td>
													<td>{visit.referral?.counterUser}</td>
													<td>{visit.referral?.source}</td>
												</tr>
											{/each}
										{/if}
									</svelte:fragment>
									<svelte:fragment slot="none">
										<p>There are no visits that match this search.</p>
									</svelte:fragment>
								</TableWrapper>
							{:else}
								<TableWrapper arrLength={staffVisits.length} bind:paginationSettings>
									<svelte:fragment slot="header">
										<tr class="bg-accSlate/10 text-black/70">
											<th>Counter User</th>
											<th>Visits</th>
										</tr>
									</svelte:fragment>
									<svelte:fragment slot="body">
										{#each staffVisits as user}
											<tr>
												<td>{user.name}</td>
												<td>{user.visits}</td>
											</tr>
										{/each}
									</svelte:fragment>
									<svelte:fragment slot="none">
										<p>There are no staff that match this search.</p>
									</svelte:fragment>
								</TableWrapper>
							{/if}
						</section>
					{/if}
				</div>
			</section>
		</svelte:fragment>
	</TabGroup>
</section>

<style>
	th {
		text-align: left;
		background: white;
		color: #293a40;
		padding: 10px 20px;
		border: 1px #293a40 solid;
		border-color: #293a40;
	}

	td {
		padding: 10px 20px;
	}

	tr {
		border-bottom: 1px #293a40 solid;
		border-color: #293a402a;
		padding: 10px 20px;
	}

	tr:nth-last-child(1) {
		border: none;
		border-color: white;
	}
</style>
