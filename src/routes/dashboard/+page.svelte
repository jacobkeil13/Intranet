<script lang="ts">
	import { DashboardAction, DashboardCard, FixesAndFeatures, UpcomingTraining } from '$lib/components';
	import { getModalStore } from '@skeletonlabs/skeleton';
	import { fly } from 'svelte/transition';
	import moment from 'moment';
	import { scaleTime } from 'd3';
	import { Chart, Svg, Axis, Area, Highlight, Tooltip, RectClipPath, LinearGradient } from 'layerchart';
	import { PeriodType, format } from 'svelte-ux';
	export let data;

	let modalStore = getModalStore();
	let clientX: number;

	let constants = data.constants;
	let isTeam = data.isTeam;
	let eptTeam = data.eptTeam;
	let managementTeam = data.managementTeam;
	let currentUserTeams: string[] | undefined = data.profile?.team.map((team) => team.name);
	let fiveNineCallCount: number = 0;
	let fiveNineCalls: string[] = [];

	function openModal(modal: string, meta: object) {
		modalStore.trigger({
			type: 'component',
			component: modal,
			meta
		});
	}
</script>

<svelte:head>
	<title>OFA • Dashboard</title>
	<meta name="description" content="Main dashboard for the Office of Financial Aid Intranet." />
</svelte:head>

<svelte:window bind:innerWidth={clientX} />

<article in:fly={{ y: -10, duration: 200 }}>
	<div class="flex items-center justify-between mb-4">
		<h1 class="text-xl font-medium text-usfGreen mb-2"><span>Hi, {data.profile?.first_name}</span> • Happy {moment().format('dddd')}!</h1>
		<h1 class="hidden mobile:block font-medium">{moment().format('LL')}</h1>
	</div>
	{#if data.nextTraining}
		<UpcomingTraining training={data.nextTraining} />
	{/if}
	<FixesAndFeatures />
	<hr class="my-8" />
	<section class="grid grid-cols-1 mobile:grid-cols-2 tablet:grid-cols-3 desktop:grid-cols-4 gap-2">
		<DashboardCard line={true} icon="fa-phone" stat={data.counts.phone_appt.total_open} iconColor="text-accTeal/80" label="Pending Phone Appts." href="/appointments?tab=0&filter=my">
			<svelte:fragment slot="content">
				<h1 class="font-medium"><span class="font-semibold">{data.counts.phone_appt.user_assigned} assigned to me</span></h1>
			</svelte:fragment>
		</DashboardCard>
		<DashboardCard
			line={true}
			icon="fa-person-arrow-down-to-line"
			iconColor="text-accApple"
			stat={data.counts.inperson_appt.total_open}
			label="Pending In-person Appts."
			href="/appointments?tab=1&filter=my"
		>
			<svelte:fragment slot="content">
				<h1 class="font-medium"><span class="font-semibold">{data.counts.inperson_appt.user_assigned} assigned to me</span></h1>
			</svelte:fragment>
		</DashboardCard>
		<DashboardCard line={true} icon="fa-person-circle-question" iconColor="text-accStorm/80" stat={data.counts.referral.total_open} label="Pending Referrals" href="/referrals?filter=my">
			<svelte:fragment slot="content">
				<h1 class="font-medium"><span class="font-semibold">{data.counts.referral.user_assigned} assigned to me</span></h1>
			</svelte:fragment>
		</DashboardCard>
		<DashboardCard line={true} icon="fa-person-walking-arrow-right" iconColor="text-[#b7ac7c]" stat={data.counts.walkin_appt.total_open} label="Pending Walk-ins" href="/appointments?tab=2" />
	</section>
	<hr class="my-8" />
	<section class="grid grid-cols-1 desktop:grid-cols-[2fr_200px] wide:grid-cols-[2fr_500px] gap-8">
		{#if data.profile?.role.name !== 'STUDENT'}
			<div>
				<h1 class="text-2xl font-medium text-usfGreen mb-2">Quick Actions</h1>
				<section class="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-2">
					<DashboardAction href="/counter_duty" label="Counter Duty" />
					<DashboardAction
						label="Create Appointment / Referral"
						on:click={() => {
							openModal('appointmentModal', { constants, appointmentReasons: data.appointmentReasons, visitCounterReasons: data.visitCounterReasons, managementTeam: managementTeam[0].userProfile });
						}}
					/>
					<DashboardAction
						label="IS Queue Request"
						on:click={() => {
							openModal('isQueueModal', { constants, isTeam, managementTeam, profile: data.profile });
						}}
					/>
					<DashboardAction
						label="DR Queue Request"
						on:click={() => {
							openModal('drQueueModal', { constants, eptTeam, profile: data.profile });
						}}
					/>
					<DashboardAction
						label="Create Popsel"
						on:click={() => {
							openModal('popselModal', { constants, isTeam });
						}}
					/>
					<DashboardAction
						label="Search UID / Visits"
						on:click={() => {
							openModal('searchUidModal', {});
						}}
					/>
				</section>
			</div>
			<div class:row-span-2={data.profile?.role.name === 'ADMIN'} class="desktop:border-l desktop:border-l-[#BFC4D7] desktop:pl-8">
				<h1 class="text-2xl font-medium text-usfGreen mb-2">Apps</h1>
				<section class="grid grid-cols-3 mobile:grid-cols-4 desktop:grid-cols-1 gap-2">
					<DashboardAction href="https://oasisappnav.usf.edu:8443/applicationNavigator" target="_blank" label="Banner" />
					<DashboardAction href="https://appxprod.it.usf.edu/AppXtender/DataSources/PROD/?DSN=PROD&sso=true" target="_blank" label="BDMS" />
					<DashboardAction href="https://login.five9.com/" target="_blank" label="Five 9" />
				</section>
			</div>
		{:else}
			<div>
				<h1 class="text-2xl font-medium text-usfGreen mb-2">Apps</h1>
				<section class="grid grid-cols-4 gap-2">
					<DashboardAction href="https://oasisappnav.usf.edu:8443/applicationNavigator" target="_blank" label="Banner" />
					<DashboardAction href="https://appxprod.it.usf.edu/AppXtender/DataSources/PROD/?DSN=PROD&sso=true" target="_blank" label="BDMS" />
					<DashboardAction href="https://login.five9.com/" target="_blank" label="Five 9" />
				</section>
			</div>
		{/if}
		{#if data.profile?.role.name === 'ADMIN'}
			<div>
				<h1 class="text-2xl font-medium text-usfGreen mb-2">Admin Actions</h1>
				<section class="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-2">
					<DashboardAction
						label="Create Form"
						on:click={() => {
							openModal('formModal', { constants });
						}}
					/>
					<DashboardAction
						label="Create S&P"
						on:click={() => {
							openModal('standardProcedureModal', { constants });
						}}
					/>
					<DashboardAction
						label="Create Letter"
						on:click={() => {
							openModal('letterModal', { constants });
						}}
					/>
					<DashboardAction
						label="Create Training"
						on:click={() => {
							openModal('trainingModal', { constants });
						}}
					/>
					<DashboardAction
						label="Create Library Training"
						on:click={() => {
							openModal('libraryModal', { constants });
						}}
					/>
				</section>
			</div>
		{/if}
	</section>
	<hr class="my-8" />
	<section>
		<!-- <h1 class="text-2xl font-medium text-usfGreen mb-2">Applications</h1> -->
		<section class="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-4 gap-2">
			<DashboardCard line={true} icon="fa-file-lines" label="IS Queue • Pending" stat={data.counts.is_queue.total} href="/is_queue?filter=my">
				<svelte:fragment slot="content">
					<h1 class:text-red-700={data.counts.is_queue.overdue_date > 0} class:text-usfGreen={data.counts.is_queue.overdue_date === 0} class="font-medium">
						<span class="font-semibold">{data.counts.is_queue.overdue_date}</span>
						past date needed
					</h1>
				</svelte:fragment>
			</DashboardCard>
			<DashboardCard line={true} icon="fa-database" label="DR Queue • Pending" stat={data.counts.dr_queue.total} href="/dr_queue?filter=my">
				<svelte:fragment slot="content">
					<h1 class:text-red-700={data.counts.dr_queue.overdue_date > 0} class:text-usfGreen={data.counts.dr_queue.overdue_date === 0} class="font-medium">
						<span class="font-semibold">{data.counts.is_queue.overdue_date}</span>
						past date needed
					</h1>
				</svelte:fragment>
			</DashboardCard>
			<DashboardCard line={true} icon="fa-calendar-days" label="Master Calendar • This Week" stat={data.counts.master_calendar.total_week} href="/master_calendar?filter=my">
				<svelte:fragment slot="content">
					<h1 class:text-red-700={data.counts.master_calendar.overdue_week > 0} class:text-usfGreen={data.counts.master_calendar.overdue_week === 0} class="font-medium">
						<span class="font-semibold">{data.counts.master_calendar.overdue_week}</span>
						overdue
					</h1>
				</svelte:fragment>
			</DashboardCard>
		</section>
	</section>
	<hr class="my-8" />
	<section class="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-4 gap-2">
		<DashboardCard line={true} icon="fa-circle-info" label="My Forms" stat={data.counts.forms.total} href="/documents/forms?filter=my">
			<svelte:fragment slot="content">
				<h1 class:text-red-700={data.counts.forms.needs_update > 0} class:text-usfGreen={data.counts.forms.needs_update === 0} class="font-medium">
					<span class="font-semibold">{data.counts.forms.needs_update}</span>
					needs updating
				</h1>
			</svelte:fragment>
		</DashboardCard>
		<DashboardCard line={true} icon="fa-envelope" label="My Letters" stat={data.counts.letters.total} href="/documents/letters?filter=my">
			<svelte:fragment slot="content">
				<h1 class:text-red-700={data.counts.letters.needs_update > 0} class:text-usfGreen={data.counts.letters.needs_update === 0} class="font-medium">
					<span class="font-semibold">{data.counts.letters.needs_update}</span>
					needs updating
				</h1>
			</svelte:fragment>
		</DashboardCard>
		<DashboardCard line={true} icon="fa-file-word" label="My S&P's" stat={data.counts.procedures.total} href="/documents/procedures?filter=my">
			<svelte:fragment slot="content">
				<h1 class:text-red-700={data.counts.procedures.needs_update > 0} class:text-usfGreen={data.counts.procedures.needs_update === 0} class="font-medium">
					<span class="font-semibold">{data.counts.procedures.needs_update}</span>
					needs updating
				</h1>
			</svelte:fragment>
		</DashboardCard>
	</section>
	{#if currentUserTeams?.includes('Management') || currentUserTeams?.includes('Information Systems')}
		<hr class="my-8" />
		<h1 class="text-2xl font-medium text-usfGreen mb-2">Today's Stats</h1>
		<section class="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-4 gap-2">
			<DashboardCard icon="fa-eye" label="Counter Visits" stat={data.counts.counter_visits.total} href="/visitor_stats" />
			<DashboardCard icon="fa-phone" label="Phone Appts." stat={data.counts.phone_appt.today} href="/appointments?tab=0" />
			<DashboardCard icon="fa-person-arrow-down-to-line" label="In-person Appts." stat={data.counts.inperson_appt.today} href="/appointments?tab=1" />
			<DashboardCard icon="fa-person-walking-arrow-right" label="Walk-in Appts." stat={data.counts.walkin_appt.today} href="/appointments?tab=2" />
			<DashboardCard icon="fa-person-circle-question" label="Referrals" stat={data.counts.referral.today} href="/referrals" />
			<DashboardCard
				on:click={() => {
					openModal('searchPhoneCall', { calls: fiveNineCalls, constants: data.constants, date: moment().format('YYYY-MM-DD') });
				}}
				icon="fa-voicemail"
				label="Five9 Calls"
				stat={fiveNineCallCount}
				href="/"
				modal="searchPhoneCall"
			/>
			<!-- <a class="flex flex-col items-center justify-center rounded py-3 px-4 border border-accSlate/20 shadow-lg hover:-translate-y-[2px] duration-150" href="/">
				High Traffic Alert
			</a> -->
		</section>
		<br />
		<section class="grid grid-cols-1 pl-5 desktop:grid-cols-2 gap-8">
			<div>
				<h1 class="text-lg font-medium text-usfGreen mb-2">Visits - Last 6 Months</h1>
				<div class="h-[200px] border rounded">
					<Chart
						data={data.counts.counter_visits.pastWeekVisits}
						x="date"
						xScale={scaleTime()}
						y="value"
						yDomain={[0, null]}
						yNice
						padding={{ top: 0, bottom: 24 }}
						tooltip
						let:width
						let:height
						let:padding
						let:tooltip
					>
						<Svg>
							<Axis placement="left" grid rule />
							<LinearGradient class="from-accent-500/50 to-accent-500/5" vertical let:url>
								<Area line={{ class: 'stroke-2 stroke-accent-500 opacity-20' }} fill={url} />
								<RectClipPath x={0} y={0} width={tooltip.data ? tooltip.x : width} {height} spring>
									<Area line={{ class: 'stroke stroke-accent-500' }} fill={url} />
								</RectClipPath>
							</LinearGradient>
							<Highlight points lines={{ class: 'stroke-accent-500/50 [stroke-dasharray:2]' }} />
							<Axis placement="bottom" />
						</Svg>

						<Tooltip y={48} xOffset={15} variant="none" class="text-sm font-semibold text-accent-700 leading-3" let:data>
							{format(data.value, 'integer')} Visits
						</Tooltip>

						<Tooltip x={16} y={16} variant="none" class="text-sm font-semibold leading-3" let:data>
							{format(data.date, PeriodType.Day)}
						</Tooltip>

						<Tooltip x="data" y={height + padding.top + 2} anchor="top" variant="none" class="text-sm font-semibold bg-accent-500 text-white leading-3 px-2 py-1 rounded whitespace-nowrap" let:data>
							{format(data.date, PeriodType.Day)}
						</Tooltip>
					</Chart>
				</div>
			</div>
			<div>
				<h1 class="text-lg font-medium text-usfGreen mb-2">Appointments - Last 3 Months</h1>
				<div class="h-[200px] border rounded">
					<Chart
						data={data.counts.counter_visits.pastWeekAppt}
						x="date"
						xScale={scaleTime()}
						y="value"
						yDomain={[0, null]}
						yNice
						padding={{ top: 0, bottom: 24 }}
						tooltip
						let:width
						let:height
						let:padding
						let:tooltip
					>
						<Svg>
							<Axis placement="left" grid rule />
							<LinearGradient class="from-secondary-500/50 to-secondary-500/5" vertical let:url>
								<Area line={{ class: 'stroke stroke-secondary-500 opacity-20' }} fill={url} />
								<RectClipPath x={0} y={0} width={tooltip.data ? tooltip.x : width} {height} spring>
									<Area line={{ class: 'stroke stroke-secondary-500' }} fill={url} />
								</RectClipPath>
							</LinearGradient>
							<Highlight points lines={{ class: 'stroke-secondary-500/50 [stroke-dasharray:2]' }} />
							<Axis placement="bottom" />
						</Svg>

						<Tooltip y={48} xOffset={15} variant="none" class="text-sm font-semibold text-secondary-700 leading-3" let:data>
							{format(data.value, 'integer')} Appointments
						</Tooltip>

						<Tooltip x={16} y={16} variant="none" class="text-sm font-semibold leading-3" let:data>
							{format(data.date, PeriodType.Day)}
						</Tooltip>

						<Tooltip x="data" y={height + padding.top + 2} anchor="top" variant="none" class="text-sm font-semibold bg-secondary-500 text-white leading-3 px-2 py-1 rounded whitespace-nowrap" let:data>
							{format(data.date, PeriodType.Day)}
						</Tooltip>
					</Chart>
				</div>
			</div>
			<div>
				<h1 class="text-lg font-medium text-usfGreen mb-2">Referrals - Last 3 Months</h1>
				<div class="h-[200px] border rounded">
					<Chart
						data={data.counts.counter_visits.pastWeekRef}
						x="date"
						xScale={scaleTime()}
						y="value"
						yDomain={[0, null]}
						yNice
						padding={{ top: 0, bottom: 24 }}
						tooltip
						let:width
						let:height
						let:padding
						let:tooltip
					>
						<Svg>
							<Axis placement="left" grid rule />
							<LinearGradient class="from-tertiary-500/50 to-tertiary-500/5" vertical let:url>
								<Area line={{ class: 'stroke stroke-tertiary-500 opacity-20' }} fill={url} />
								<RectClipPath x={0} y={0} width={tooltip.data ? tooltip.x : width} {height} spring>
									<Area line={{ class: 'stroke stroke-tertiary-500' }} fill={url} />
								</RectClipPath>
							</LinearGradient>
							<Highlight points lines={{ class: 'stroke-tertiary-500/50 [stroke-dasharray:2]' }} />
							<Axis placement="bottom" />
						</Svg>

						<Tooltip y={48} xOffset={15} variant="none" class="text-sm font-semibold text-tertiary-700 leading-3" let:data>
							{format(data.value, 'integer')} Referrals
						</Tooltip>

						<Tooltip x={16} y={16} variant="none" class="text-sm font-semibold leading-3" let:data>
							{format(data.date, PeriodType.Day)}
						</Tooltip>

						<Tooltip x="data" y={height + padding.top + 2} anchor="top" variant="none" class="text-sm font-semibold bg-tertiary-500 text-white leading-3 px-2 py-1 rounded whitespace-nowrap" let:data>
							{format(data.date, PeriodType.Day)}
						</Tooltip>
					</Chart>
				</div>
			</div>
		</section>
	{/if}
</article>
