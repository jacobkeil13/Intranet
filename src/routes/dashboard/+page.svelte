<script lang="ts">
	import { getDateLocal, openModal } from '$lib/helpers.js';
	import { fly } from 'svelte/transition';
	import chartData from '$lib/components/charts/data.json';
	import D3Chart from '$lib/components/charts/D3Chart.svelte';
	import { ProgressRadial } from '@skeletonlabs/skeleton';
	export let data;

	let todaysDate = getDateLocal(new Date().toISOString(), "YYYY-MM-DD");	
	let clientX: number;

	let constants = data.constants;
	let isTeam = data.isTeam;
	let eptTeam = data.eptTeam;
	let managementTeam = data.managementTeam;
	let currentUserTeams: string[] | undefined = data.profile?.team.map(team => team.name);

	let phoneAppointments = data.appointments.filter(appt => appt.type === "Phone Appointment" && !appt.completed);
	let inPersonAppointments = data.appointments.filter(appt => appt.type === "In-person Appointment" && !appt.completed);
	let walkinAppointments = data.appointments.filter(appt => appt.type === "Walk-in Appointment" && !appt.completed);
	let referrals = data.referrals.filter(referral => !referral.completed);
	
	let todayPhoneAppt = data.appointments.filter(appt => {
		if (getDateLocal(appt.createdAt.toISOString(), "YYYY-MM-DD") === todaysDate && appt.type === "Phone Appointment") {
			return appt;
		}
	}).length;

	let todayInPersonAppt = data.appointments.filter(appt => {
		if (getDateLocal(appt.createdAt.toISOString(), "YYYY-MM-DD") === todaysDate && appt.type === "In-person Appointment") {
			return appt;
		}
	}).length;

	let todayWalkinAppt = data.appointments.filter(appt => {
		if (getDateLocal(appt.createdAt.toISOString(), "YYYY-MM-DD") === todaysDate && appt.type === "Walk-in Appointment") {
			return appt;
		}
	}).length;

	let todayReferral = data.referrals.filter(referral => {
		if (getDateLocal(referral.createdAt.toISOString(), "YYYY-MM-DD") === todaysDate) {
			return referral;
		}
	}).length;

	let profileName = data.profile?.first_name + " " + data.profile?.last_name;
</script>

<svelte:head>
	<title>OFA • Dashboard</title>
	<meta name="description" content="Main dashboard for the Office of Financial Aid Intranet.">
</svelte:head>

<svelte:window bind:innerWidth={clientX} />

<article in:fly={{ y: -10, duration: 200 }}>
	<h1 class="text-2xl font-medium text-usfGreen mb-2">My Pending Appointments & Referrals</h1>
	<section class="grid grid-cols-4 gap-2">
		<a class="block rounded py-1 px-4 border border-accSlate/20 shadow-lg group" href={`/appointments?tab=0&search=${profileName}`}>
			<div class="flex justify-between items-center">
				<h1 class="text-6xl text-black/70">
					{phoneAppointments.filter(appt => appt.advisor === profileName).length}
					<span class="text-lg">of {phoneAppointments.length}</span>
				</h1>
				<box-icon name='phone-call' type='solid' class="w-12 h-12 mt-2 fill-accTeal/80" ></box-icon>
			</div>
			<div class="flex justify-between items-center">
				<h1 class="text-lg">Phone</h1>
				<box-icon name='arrow-to-right' type='solid' class="hidden group-hover:block fill-black/70" ></box-icon>
			</div>
		</a>
		<a class="block rounded py-1 px-4 border border-accSlate/20 shadow-lg group" href={`/appointments?tab=1&search=${profileName}`}>
			<div class="flex justify-between items-center">
				<h1 class="text-6xl text-black/70">
					{inPersonAppointments.filter(appt => appt.advisor === profileName).length}
					<span class="text-lg">of {inPersonAppointments.length}</span>
				</h1>
				<box-icon name='buildings' type='solid' class="w-12 h-12 mt-2 fill-accApple" ></box-icon>
			</div>
			<div class="flex justify-between items-center">
				<h1 class="text-lg">In-person</h1>
				<box-icon name='arrow-to-right' type='solid' class="hidden group-hover:block fill-black/70" ></box-icon>
			</div>
		</a>
		<a class="block rounded py-1 px-4 border border-accSlate/20 shadow-lg group" href={`/appointments?tab=2`}>
			<div class="flex justify-between items-center">
				<h1 class="text-6xl text-black/70">{walkinAppointments.length}</h1>
				<box-icon name='walk' class="w-12 h-12 mt-2 fill-[#b7ac7c]" ></box-icon>
			</div>
			<div class="flex justify-between items-center">
				<h1 class="text-lg">Walk-in</h1>
				<box-icon name='arrow-to-right' type='solid' class="hidden group-hover:block fill-black/70" ></box-icon>
			</div>
		</a>
		<a class="block rounded py-1 px-4 border border-accSlate/20 shadow-lg group" href={`/referrals?search=${profileName}`}>
			<div class="flex justify-between items-center">
				<h1 class="text-6xl text-black/70">
					{referrals.filter(appt => appt.counterUser === profileName).length}
					<span class="text-lg">of {referrals.length}</span>
				</h1>
				<box-icon name='group' type='solid' class="w-12 h-12 mt-2 fill-accStorm/80" ></box-icon>
			</div>
			<div class="flex justify-between items-center">
				<h1 class="text-lg">Referrals</h1>
				<box-icon name='arrow-to-right' type='solid' class="hidden group-hover:block fill-black/70" ></box-icon>
			</div>
		</a>
	</section>
	<hr class="my-8"/>
	<section class="grid grid-cols-2 gap-8">
		<div>
			<h1 class="text-2xl font-medium text-usfGreen mb-2">Quick Actions</h1>
			<section class="grid grid-cols-2 gap-2">
				<a class="flex justify-center items-center rounded p-4 border border-accSlate/20 shadow-md" href="/counter_duty">
					<h1>Counter Duty</h1>
				</a>
				<a class="flex justify-center items-center rounded p-4 border border-accSlate/20 shadow-md" href="/"
					on:click={() => { openModal("appointmentModal", { constants, appointmentReasons: data.appointmentReasons, visitCounterReasons: data.visitCounterReasons }); }}
				>
					<h1>Create Appointment / Referral</h1>
				</a>
				<a class="flex justify-center items-center rounded p-4 border border-accSlate/20 shadow-md" href="/"
					on:click={() => { openModal("isQueueModal", { constants, isTeam, managementTeam }); }}
				>
					<h1>Create IS Queue</h1>
				</a>
				<a class="flex justify-center items-center rounded p-4 border border-accSlate/20 shadow-md" href="/"
					on:click={() => { openModal("drQueueModal", { constants, eptTeam }); }}
				>
					<h1>Create DR Queue</h1>
				</a>
				<a class="flex justify-center items-center rounded p-4 border border-accSlate/20 shadow-md" href="/"
					on:click={() => { openModal("popselModal", { constants, isTeam }); }}
				>
					<h1>Create Popsel</h1>
				</a>
			</section>
		</div>
		<div class:row-span-2={data.profile?.role.name === "ADMIN"} class="border-l border-l-[#BFC4D7] pl-8">
			<h1 class="text-2xl font-medium text-usfGreen mb-2">Announcements</h1>
			<section class="grid grid-cols-2 gap-2">
				<a class="flex flex-col justify-center items-center rounded p-4 border border-accSlate/20 shadow-md col-span-2" href="/training">
					<h1>Upcoming Training • {getDateLocal(String(data.nextTraining?.date.toISOString()), "MMMM Do, YYYY")}</h1>
					<p class="font-medium">{data.nextTraining?.name} <span class="font-normal">presented by</span> {data.nextTraining?.trainers[0].first_name}</p>
				</a>
				<a class="flex justify-center items-center rounded p-4 border border-accSlate/20 shadow-md" href="/">
					<h1>News</h1>
				</a>
				<a class="flex justify-center items-center rounded p-4 border border-accSlate/20 shadow-md"  href="/">
					<h1>Rush</h1>
				</a>
			</section>
		</div>
		{#if data.profile?.role.name === "ADMIN"}
			<div>
				<h1 class="text-2xl font-medium text-usfGreen mb-2">Admin Actions</h1>
				<section class="grid grid-cols-2 gap-2">
					<a class="flex justify-center items-center rounded p-4 border border-accSlate/20 shadow-md" href="/" 
						on:click={() => { openModal("formModal", { constants }); }}
					>
						<h1>Create Form</h1>
					</a>
					<a class="flex justify-center items-center rounded p-4 border border-accSlate/20 shadow-md" href="/"
						on:click={() => { openModal("standardProcedureModal", { constants }); }}
					>
						<h1>Create S&P</h1>
					</a>
					<a class="flex justify-center items-center rounded p-4 border border-accSlate/20 shadow-md"  href="/"
						on:click={() => { openModal("letterModal", { constants }); }}
					>
						<h1>Create Letter</h1>
					</a>
				</section>
			</div>
		{/if}
	</section>
	<hr class="my-8"/>
	<h1 class="text-2xl font-medium text-usfGreen mb-2">My Documents</h1>
	<section class="grid grid-cols-4 gap-2">
		<a class="block rounded py-1 px-4 border border-accSlate/20 shadow-lg group" href="{`/documents/forms?search=${profileName}`}">
			<div class="flex justify-between items-center">
				<h1 class="text-6xl text-black/70">{data.formCount}</h1>
				<box-icon name='file' type='solid' class="w-12 h-12 mt-2 fill-black/70" ></box-icon>
			</div>
			<div class="flex justify-between items-center">
				<h1 class="text-lg">Forms</h1>
				<box-icon name='arrow-to-right' type='solid' class="hidden group-hover:block fill-black/70" ></box-icon>
			</div>
		</a>
		<a class="block rounded py-1 px-4 border border-accSlate/20 shadow-lg group" href={`/documents/letters?search=${profileName}`}>
			<div class="flex justify-between items-center">
				<h1 class="text-6xl text-black/70">{data.letterCount}</h1>
				<box-icon name='envelope' type='solid' class="w-12 h-12 mt-2 fill-black/70" ></box-icon>
			</div>
			<div class="flex justify-between items-center">
				<h1 class="text-lg">Letters</h1>
				<box-icon name='arrow-to-right' type='solid' class="hidden group-hover:block fill-black/70" ></box-icon>
			</div>
		</a>
		<a class="block rounded py-1 px-4 border border-accSlate/20 shadow-lg group" href={`/documents/procedures?search=${profileName}`}>
			<div class="flex justify-between items-center">
				<h1 class="text-6xl text-black/70">{data.procedureCount}</h1>
				<box-icon name='file-doc' type='solid' class="w-12 h-12 mt-2 fill-black/70" ></box-icon>
			</div>
			<div class="flex justify-between items-center">
				<h1 class="text-lg">Standards / Procedures</h1>
				<box-icon name='arrow-to-right' type='solid' class="hidden group-hover:block fill-black/70" ></box-icon>
			</div>
		</a>
	</section>
	<hr class="my-8"/>
	<section>
		<h1 class="text-2xl font-medium text-usfGreen mb-2">Applications</h1>
		<section class="grid grid-cols-4 gap-2">
			<a class="block rounded py-1 px-4 border border-accSlate/20 shadow-lg group" href={`/is_queue`}>
				<div class="flex justify-between items-center">
					<h1 class="text-6xl text-black/70">{data.isQueueCount}</h1>
					<box-icon name='info-circle' type='solid' class="w-12 h-12 mt-2 fill-black/70" ></box-icon>
				</div>
				<div class="flex justify-between items-center">
					<h1 class="text-lg">IS Queue</h1>
					<box-icon name='arrow-to-right' type='solid' class="hidden group-hover:block fill-black/70" ></box-icon>
				</div>
			</a>
			<a class="block rounded py-1 px-4 border border-accSlate/20 shadow-lg group" href={`/dr_queue`}>
				<div class="flex justify-between items-center">
					<h1 class="text-6xl text-black/70">{data.drQueueCount}</h1>
					<box-icon name='data' type='solid' class="w-12 h-12 mt-2 fill-black/70" ></box-icon>
				</div>
				<div class="flex justify-between items-center">
					<h1 class="text-lg">DR Queue</h1>
					<box-icon name='arrow-to-right' type='solid' class="hidden group-hover:block fill-black/70" ></box-icon>
				</div>
			</a>
			<a class="block rounded py-1 px-4 border border-accSlate/20 shadow-lg group" href={`/master_calendar`}>
				<div class="flex justify-between items-center">
					<h1 class="text-6xl text-black/70">{data.drQueueCount}</h1>
					<box-icon name='calendar' type='solid' class="w-12 h-12 mt-2 fill-black/70" ></box-icon>
				</div>
				<div class="flex justify-between items-center">
					<h1 class="text-lg">Master Calendar</h1>
					<box-icon name='arrow-to-right' type='solid' class="hidden group-hover:block fill-black/70" ></box-icon>
				</div>
			</a>
		</section>
	</section>
	{#if currentUserTeams?.includes("Management") || currentUserTeams?.includes("Information Systems")}
	  <hr class="my-8"/>
		<h1 class="text-2xl font-medium text-usfGreen mb-2">Today's Visitor Stats</h1>
		<section class="grid grid-cols-5 gap-2">
			<a class="flex flex-col justify-between rounded py-1 px-4 border border-accSlate/20 shadow-lg group" href="/visitor_stats">
				<div class="flex justify-between items-center">
					<h1 class="text-6xl text-black/70">{data.counterVisits}</h1>
					<box-icon name='support' class="w-12 h-12 mt-2 fill-black/70" ></box-icon>
				</div>
				<div class="flex justify-between items-center">
					<h1 class="text-md">Counter Visits</h1>
					<box-icon name='arrow-to-right' type='solid' class="hidden group-hover:block fill-black/70" ></box-icon>
				</div>
			</a>
			<a class="flex flex-col justify-between rounded py-1 px-4 border border-accSlate/20 shadow-lg group" href={`/appointments?tab=0`}>
				<div class="flex justify-between items-center">
					<h1 class="text-6xl text-black/70">{todayPhoneAppt}</h1>
					<box-icon name='phone-call' type='solid' class="w-12 h-12 mt-2 fill-black/70" ></box-icon>
				</div>
				<div class="flex justify-between items-center">
					<h1 class="text-md">Phone Appts.</h1>
					<box-icon name='arrow-to-right' type='solid' class="hidden group-hover:block fill-black/70" ></box-icon>
				</div>
			</a>
			<a class="flex flex-col justify-between rounded py-1 px-4 border border-accSlate/20 shadow-lg group" href={`/appointments?tab=1`}>
				<div class="flex justify-between items-center">
					<h1 class="text-6xl text-black/70">{todayInPersonAppt}</h1>
					<box-icon name='buildings' type='solid' class="w-12 h-12 mt-2 fill-black/70" ></box-icon>
				</div>
				<div class="flex justify-between items-center">
					<h1 class="text-md">In-person Appts.</h1>
					<box-icon name='arrow-to-right' type='solid' class="hidden group-hover:block fill-black/70" ></box-icon>
				</div>
			</a>
			<a class="flex flex-col justify-between rounded py-1 px-4 border border-accSlate/20 shadow-lg group" href={`/appointments?tab=2`}>
				<div class="flex justify-between items-center">
					<h1 class="text-6xl text-black/70">{todayWalkinAppt}</h1>
					<box-icon name='walk' class="w-12 h-12 mt-2 fill-black/70" ></box-icon>
				</div>
				<div class="flex justify-between items-center">
					<h1 class="text-md">Walk-in Appts.</h1>
					<box-icon name='arrow-to-right' type='solid' class="hidden group-hover:block fill-black/70" ></box-icon>
				</div>
			</a>
			<a class="flex flex-col justify-between rounded py-1 px-4 border border-accSlate/20 shadow-lg group" href={`/referrals`}>
				<div class="flex justify-between items-center">
					<h1 class="text-6xl text-black/70">{todayReferral}</h1>
					<box-icon name='group' type='solid' class="w-12 h-12 mt-2 fill-black/70" ></box-icon>
				</div>
				<div class="flex justify-between items-center">
					<h1 class="text-md">Referrals Created</h1>
					<box-icon name='arrow-to-right' type='solid' class="hidden group-hover:block fill-black/70" ></box-icon>
				</div>
			</a>
		</section>
		<br>
		<!-- <Chart /> -->
		<section class="grid grid-cols-2 gap-4">
			<D3Chart height={400} width={700} data={chartData} />
			<!-- <section class="flex items-center justify-center gap-4">
				<ProgressRadial value={50} width="w-[250px]">{50}%</ProgressRadial>
			</section> -->
		</section>
	{/if}
</article>

<style>
	a {
		transition: transform .15s ease-in-out;
	}

	a:hover {
		transform: translateY(-2px);
	}
</style>
