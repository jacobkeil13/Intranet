<script lang="ts">
	import { getDateLocal } from '$lib/helpers.js';
	import { fly } from 'svelte/transition';
	import { getModalStore } from '@skeletonlabs/skeleton';
	import { onMount } from 'svelte';
	import { getFiveNineDir } from '$lib/stores/counter_duty.js';
	import moment from 'moment';
	import DashboardCard from '$lib/components/DashboardCard.svelte';
	import DashboardAction from '$lib/components/DashboardAction.svelte';
	import FixesAndFeatures from '$lib/components/FixesAndFeatures.svelte';
	import UpcomingTraining from '$lib/components/UpcomingTraining.svelte';
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

	// onMount(async () => {
	// 	getFiveNineDir(moment().format("M_D_YYYY")).then(res => {
	// 		if (res.files) {
	// 			fiveNineCallCount = res.files.length;
	// 			fiveNineCalls = res.files;
	// 		} else {
	// 			fiveNineCallCount = 0;
	// 			fiveNineCalls = [];
	// 		}
	//   });
	// })
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
						href="/"
						label="Create Appointment / Referral"
						on:click={() => {
							openModal('appointmentModal', { constants, appointmentReasons: data.appointmentReasons, visitCounterReasons: data.visitCounterReasons, managementTeam: managementTeam[0].userProfile });
						}}
					/>
					<DashboardAction
						href="/"
						label="IS Queue Request"
						on:click={() => {
							openModal('isQueueModal', { constants, isTeam, managementTeam, profile: data.profile });
						}}
					/>
					<DashboardAction
						href="/"
						label="DR Queue Request"
						on:click={() => {
							openModal('drQueueModal', { constants, eptTeam, profile: data.profile });
						}}
					/>
					<DashboardAction
						href="/"
						label="Create Popsel"
						on:click={() => {
							openModal('popselModal', { constants, isTeam });
						}}
					/>
					<DashboardAction
						href="/"
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
					<DashboardAction href="https://oasisappnav.usf.edu:8443/applicationNavigator" label="Banner" />
					<DashboardAction href="https://edocs.usf.edu/appxtender/login.aspx?sso=true" label="BDMS" />
					<DashboardAction href="https://login.five9.com/" label="Five 9" />
				</section>
			</div>
		{:else}
			<div>
				<h1 class="text-2xl font-medium text-usfGreen mb-2">Apps</h1>
				<section class="grid grid-cols-4 gap-2">
					<DashboardAction href="https://oasisappnav.usf.edu:8443/applicationNavigator" label="Banner" />
					<DashboardAction href="https://edocs.usf.edu/appxtender/login.aspx?sso=true" label="BDMS" />
					<DashboardAction href="https://login.five9.com/" label="Five 9" />
				</section>
			</div>
		{/if}
		{#if data.profile?.role.name === 'ADMIN'}
			<div>
				<h1 class="text-2xl font-medium text-usfGreen mb-2">Admin Actions</h1>
				<section class="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-2">
					<DashboardAction
						href="/"
						label="Create Form"
						on:click={() => {
							openModal('formModal', { constants });
						}}
					/>
					<DashboardAction
						href="/"
						label="Create S&P"
						on:click={() => {
							openModal('standardProcedureModal', { constants });
						}}
					/>
					<DashboardAction
						href="/"
						label="Create Letter"
						on:click={() => {
							openModal('letterModal', { constants });
						}}
					/>
					<DashboardAction
						href="/"
						label="Create Training"
						on:click={() => {
							openModal('trainingModal', { constants });
						}}
					/>
					<DashboardAction
						href="/"
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
		<!-- <Chart /> -->
		<!-- <section class="hidden desktop:grid grid-cols-2 gap-4">
			<D3Chart height={400} width={700} data={chartData} />
		</section> -->
	{/if}
</article>
