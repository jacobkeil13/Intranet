<script lang="ts">
  import { fly } from 'svelte/transition';
  import { RadioGroup, RadioItem, SlideToggle, Step, Stepper, getToastStore, getModalStore  } from '@skeletonlabs/skeleton';
	import { getCampusName, getDateLocal } from '$lib/helpers';
	import type { BannerUser, PrivacyForm } from '$lib/types';
	import Spinner from '$lib/components/animation/Spinner.svelte';
	import { actions, getCurrentAppts, getPrivacyInfo, getUidInfo } from '$lib/stores/counter_duty';
	import moment from 'moment';
	import TimePickerAdvisor from '$lib/components/TimePickerAdvisor.svelte';
	import TimePicker from '$lib/components/TimePicker.svelte';
	import { writable } from 'svelte/store';
	import * as devalue from 'devalue';
	import SuccessCheck from '$lib/components/animation/SuccessCheck.svelte';
	import type { Appointment, Referral } from '@prisma/client';
	import TextareaCopy from '$lib/components/TextareaCopy.svelte';
	import PageWrapper from '$lib/components/PageWrapper.svelte';
  export let data;

	let toastStore = getToastStore();
  let modalStore = getModalStore();
  function errorToast(msg: string) {
    toastStore.trigger({
      message: msg,
      background: "bg-[#930000]",
      classes: "text-white font-medium",
	  });
  }

  enum Actions {
    Referral = "Referral",
    Phone = "Phone Appointment",
    InPerson = "In-person Appointment",
    Walkin = "Walk-in Appointment",
  }

  let visitError = false;
  let completed = false;
  let isLoading = false;
  let currentUser: BannerUser | undefined;
  let currentUserForms: PrivacyForm[] | undefined;
  let hasUID: boolean = true;
  let action: string = "";

  let currentAppts: Appointment[] = [];
  let currentReferrals: Referral[] = [];

  let appointmentForm = writable({
    type: "",
    referralType: "",
    escalatedUser: "",
    researchUser: "",
    visitorType: "Student",
    studentUid: "",
    studentEmail: "",
    studentName: "",
    studentCampus: "",
    reason: "",
    appReason: "",
    referralDetails: "",
    rhacomm: false,
    callbackNumber: "",
    advisorRequested: "",
    date: "",
    time: "",
    bestTimeCallback: "12:00",
    preferredContactMethod: "ROAMESG",
    stPeteAppt: false,
    submittedDocument: false,
    needsFutherAction: false
  })

  $: $appointmentForm.studentUid, $appointmentForm.studentUid = $appointmentForm.studentUid.trim();
  $: matchesUIDForm = /^U?\d{8}$/.test($appointmentForm.studentUid.trim());
  $: action, $appointmentForm.type = action;
  $: action, $appointmentForm.date = "";
  $: minDate = moment().add(action === Actions.Walkin ? 0 : 1, "days").format("YYYY-MM-DD");
  $: maxDate = moment().add(action === Actions.Walkin ? 0 : 1, "years").format("YYYY-MM-DD");

  $: {
    if (matchesUIDForm) {
      isLoading = true;
      getUidInfo($appointmentForm.studentUid).then(res => {
        currentUser = res;
      });
      getPrivacyInfo($appointmentForm.studentUid).then(res => {
        currentUserForms = res;
      });
      getCurrentAppts($appointmentForm.studentUid).then(res => {
        currentAppts = res.appointments;
        currentReferrals = res.referrals;
      });
      setTimeout(() => {
        isLoading = false;
      }, 2000);
    } else {
      currentUser = undefined;
    }
  }

  $: {
    if (!hasUID) {
      currentUser = undefined;
      currentUserForms = undefined;
      $appointmentForm.studentUid = "";
      $appointmentForm.studentEmail = "";
      $appointmentForm.studentName = "";
      $appointmentForm.studentCampus = "";
    }
    if (!$appointmentForm.needsFutherAction) {
      $appointmentForm.date = "";
      $appointmentForm.time = "";
      $appointmentForm.advisorRequested = "";
      $appointmentForm.callbackNumber = "";
      $appointmentForm.bestTimeCallback = "12:00";
      $appointmentForm.referralDetails = "";
      $appointmentForm.appReason = "";
      $appointmentForm.preferredContactMethod = "ROAMESG";
      $appointmentForm.rhacomm = false;
    }
    if (!$appointmentForm.needsFutherAction) {
      action = ""
    }
  }

  async function complete() {
    let timeTaken = false;
    $appointmentForm.studentEmail = String(currentUser?.email);
    $appointmentForm.studentName = String(currentUser?.first_name + " " + currentUser?.last_name);
    $appointmentForm.studentCampus = String(getCampusName(currentUser?.campus));

    if (!$appointmentForm.studentUid.includes("U") && $appointmentForm.studentUid.length > 7) {
      $appointmentForm.studentUid = "U" + $appointmentForm.studentUid;
    } else if ($appointmentForm.studentUid.length < 8) {
      $appointmentForm.studentUid = "";
      $appointmentForm.studentName = "";
      $appointmentForm.studentEmail = "";
      $appointmentForm.studentCampus = "";
    }

    if (action === Actions.Walkin) {
      $appointmentForm.advisorRequested = "";
    }

    if (!$appointmentForm.needsFutherAction) {
      const formData = new FormData();
      formData.append('visitorType', $appointmentForm.visitorType);
      formData.append('studentUid', $appointmentForm.studentUid);
      formData.append('studentEmail', $appointmentForm.studentEmail);
      formData.append('studentName', $appointmentForm.studentName);
      formData.append('studentCampus', $appointmentForm.studentCampus);
      formData.append('reason', $appointmentForm.reason);
      formData.append('submittedDocument', String($appointmentForm.submittedDocument));
      fetch('/counter_duty?/createVisit', {
        method: 'POST',
        body: formData,
      }).then(async (res) => {
        let response = await res.json();
        let parsedRes = devalue.parse(response.data);
        completed = true;
        if (!parsedRes.success) {
          visitError = true;
        } 
      });
      return
    }

    if ($appointmentForm.needsFutherAction && $appointmentForm.stPeteAppt) {
      const formData = new FormData();
      formData.append('visitorType', $appointmentForm.visitorType);
      formData.append('studentUid', $appointmentForm.studentUid);
      formData.append('studentEmail', $appointmentForm.studentEmail);
      formData.append('studentName', $appointmentForm.studentName);
      formData.append('studentCampus', $appointmentForm.studentCampus);
      formData.append('reason', $appointmentForm.reason + " - " + "St. Pete Appt.");
      formData.append('submittedDocument', String($appointmentForm.submittedDocument));
      fetch('/counter_duty?/createVisit', {
        method: 'POST',
        body: formData,
      }).then(async (res) => {
        let response = await res.json();
        let parsedRes = devalue.parse(response.data);
        completed = true;
        if (!parsedRes.success) {
          visitError = true;
        } 
      });
      return
    }
    
    if (action !== "" && (action !== Actions.Referral && action !== Actions.Walkin) && $appointmentForm.advisorRequested === "") {
      errorToast("Please pick an advisor!");
      return
    }
    if (action === Actions.Referral && $appointmentForm.referralDetails === "") {
      errorToast("Please provide a referral description!");
      return
    }
    if (($appointmentForm.date === "" || $appointmentForm.time === "") && action !== Actions.Referral) {
      if ($appointmentForm.date === "") {
        errorToast("Please pick a date");
        return
      }
      if ($appointmentForm.time === "") {
        errorToast("Please pick a time");
        return
      }
    }
    if (action !== "" && $appointmentForm.callbackNumber === "" && action !== Actions.Walkin) {
      errorToast("Please provide a callback number!");
      return
    }
    if ($appointmentForm.appReason === "") {
      errorToast("Please pick a reason!");
      return
    }
    if (action === Actions.Referral && $appointmentForm.referralType === "") {
      errorToast("Please pick a referral type!");
      return
    }
    if (action === Actions.Referral && $appointmentForm.referralType === "Escalated Referral" && $appointmentForm.escalatedUser === "") {
      errorToast("Please pick an escalated user!");
      return
    }
    if (action === Actions.Referral && $appointmentForm.referralType === "Collaboration Referral" && $appointmentForm.researchUser === "") {
      errorToast("Please pick a collaborator!");
      return
    }
    if (!$appointmentForm.rhacomm) {
      errorToast("Please annotate RHACOMM!");
      return
    }

    await fetch(`/api/counter_duty?type=${action}`).then(async (res) => {
      let response = await res.json();
      response.appointments.forEach((appt: Appointment) => {
        let existingApptDate =  moment(appt.dateTime).local().format("YYYY-MM-DDThh:mm:ss") + ".000";
        if (action === Actions.Phone || action === Actions.InPerson) {
          if (appt.advisor === $appointmentForm.advisorRequested 
          && existingApptDate === $appointmentForm.date + "T" + $appointmentForm.time.replace("_", ":") + ":00.000") {
            timeTaken = true;
            return
          }
        }
        if (action === Actions.Walkin) {
          if (existingApptDate === $appointmentForm.date + "T" + $appointmentForm.time.replace("_", ":") + ":00.000") {
            timeTaken = true;
            return
          }
        }
      });
    })

    if (timeTaken) {
      errorToast("Time is already taken. Please pick another!")
      return
    }

    const formData = new FormData();
    formData.append('type', $appointmentForm.type);
    formData.append('referralType', $appointmentForm.referralType);
    formData.append('escalatedUser', $appointmentForm.escalatedUser);
    formData.append('researchUser', $appointmentForm.researchUser);
    formData.append('visitorType', $appointmentForm.visitorType);
    formData.append('studentUid', $appointmentForm.studentUid);
    formData.append('studentEmail', $appointmentForm.studentEmail);
    formData.append('studentName', $appointmentForm.studentName);
    formData.append('studentCampus', $appointmentForm.studentCampus);
    formData.append('reason', $appointmentForm.reason);
    formData.append('appReason', $appointmentForm.appReason);
    formData.append('referralDetails', $appointmentForm.referralDetails);
    formData.append('rhacomm', String($appointmentForm.rhacomm));
    formData.append('callbackNumber', $appointmentForm.callbackNumber);
    formData.append('advisorRequested', $appointmentForm.advisorRequested);
    formData.append('date', $appointmentForm.date);
    formData.append('time', $appointmentForm.time);
    formData.append('bestTimeCallback', $appointmentForm.bestTimeCallback);
    formData.append('preferredContactMethod', $appointmentForm.preferredContactMethod);
    formData.append('submittedDocument', String($appointmentForm.submittedDocument));

    fetch(`/counter_duty?/${action !== Actions.Referral ? "createAppointment" : "createReferral"}`, {
      method: 'POST',
      body: formData,
    }).then(async (res) => {
      let response = await res.json();
      let parsedRes = devalue.parse(response.data);
      completed = true;
      if (!parsedRes.success) {
        visitError = true;
      } 
    });
  }

  function toUpperCase(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    inputElement.value = inputElement.value.toUpperCase();
  }

  function openBookingModal() {
    modalStore.trigger({
      type: 'component',
      component: 'embedModal',
      meta: { src: "https://outlook.office365.com/owa/calendar/USFSPFinancialAid@usfedu.onmicrosoft.com/bookings/" }
    });
  }
</script>

<svelte:head>
	<title>OFA • Counter Duty</title>
</svelte:head>

<section in:fly={{ y: -10, duration: 200 }}>
  <PageWrapper>
    <svelte:fragment slot="title">
			<h1 class="text-2xl text-usfGreen font-semibold">Counter Duty</h1>
		</svelte:fragment>
		<svelte:fragment slot="content">
			<section>
        {#if !completed}
          <Stepper
          on:complete={complete}
          active="rounded-sm bg-accSlate text-white" 
          badge="rounded-sm bg-[#8E98BA] text-white"
          buttonComplete="rounded-md bg-accTeal text-white/90 font-medium"
          buttonNext="rounded-md bg-accSlate text-white"
          buttonBack="rounded-md bg-[#D1D4DD] border border-accSlate/50"
        >
          <section class="p-6 rounded-md border border-accSlate/20">
            <Step locked={isLoading || (!matchesUIDForm && hasUID) || (currentUser === undefined && hasUID)}>
              <svelte:fragment slot="header">Identification</svelte:fragment>
              <section class="space-x-2">
                <RadioGroup background="bg-transparent" active="bg-accSlate text-white/90" class="mt-0" rounded="rounded-md">
                  <RadioItem  bind:group={$appointmentForm.visitorType} name="visitorType" value="Student">Student</RadioItem>
                  <RadioItem bind:group={$appointmentForm.visitorType} name="visitorType" value="Parent">Parent</RadioItem>
                </RadioGroup>
                <RadioGroup background="bg-transparent" active="bg-accSlate text-white/90" rounded="rounded-md">
                  <RadioItem bind:group={hasUID} name="uid_status" value={true}>Has U#</RadioItem>
                  <RadioItem bind:group={hasUID} name="uid_status" value={false}>No U#</RadioItem>
                </RadioGroup>
              </section>
              {#if hasUID}
                <section class="flex items-center space-x-3">
                  <div class="relative w-fit">
                    <div 
                      class="input-group input-group-divider bg-transparent rounded-md grid-cols-[auto_1fr_auto]" 
                    >
                      <div class="input-group-shim font-semibold bg-transparent">UID</div>
                      <input autocomplete="off" type="text" class="w-fit font-semibold" name="uid" placeholder="Student UID..." minlength="8" maxlength="9"
                        bind:value={$appointmentForm.studentUid} on:input={toUpperCase}>
                      {#if !isLoading}
                        <div class="input-group-shim bg-transparent">
                          {#if matchesUIDForm && currentUser != undefined}
                            <i class="fa-solid fa-check fa-lg text-usfGreen cursor-pointer"></i>
                          {:else if matchesUIDForm && currentUser === undefined}
                            <i class="fa-solid fa-xmark fa-lg text-red-700 cursor-pointer"></i>
                          {:else}
                            <i class="fa-solid fa-circle-xmark fa-lg text-black/50 cursor-pointer"></i>
                          {/if}
                        </div>
                      {:else}
                        <div class="input-group-shim bg-transparent"> 
                          <Spinner />
                        </div>
                      {/if}
                    </div>
                  </div>
                  {#if !isLoading && $appointmentForm.visitorType === "Parent" && currentUser !== undefined}
                    <p class="flex items-center bg-red-700 h-[42px] px-4 font-semibold text-white/90 rounded-md">Privacy form is required</p>
                  {/if}
                </section>
              {/if}
              {#if hasUID && currentUser !== undefined && !isLoading}
                <section class="flex space-x-4">
                  <section class="card bg-transparent flex flex-col justify-center p-4 w-fit border border-accSlate/50">
                    <h1><span class="pr-2 font-semibold">Name:</span> {currentUser.first_name} {currentUser.last_name}</h1>
                    <h1><span class="pr-2 font-semibold">Email:</span> {currentUser.email}</h1>
                    <h1><span class="pr-2 font-semibold">Campus:</span> {getCampusName(currentUser?.campus)}</h1>
                  </section> 
                  {#if currentUserForms !== undefined}
                    {#if currentUserForms.length !== 0}
                      <table class="rounded-md border-collapse overflow-hidden">
                        <tr>
                          <th>Aid Year</th>
                          <th>TREQ Code</th>
                          <th>Status</th>
                        </tr>
                        {#each currentUserForms as form}
                          <tr>
                            <td>{form.aidYear}</td>
                            <td>{form.treqCode}</td>
                            <td class:text-red-700={form.status === "N"} class="font-semibold">{form.status}</td>
                          </tr>
                        {/each}
                      </table>
                    {:else}
                      <section class="card bg-transparent flex items-center p-4 w-fit border border-red-700">
                        <h1 class="font-semibold">No privacy forms were found.</h1>
                      </section>
                    {/if}
                  {/if}
                </section>
              {/if}
            </Step>
            <Step locked={$appointmentForm.reason === ""}>
              <svelte:fragment slot="header">Reason</svelte:fragment>
              <select class="input rounded-md bg-transparent w-fit" name="reasons" id="reasons" bind:value={$appointmentForm.reason}>
                <option disabled selected value="">Select one...</option>
                {#each data.visitCounterReasons as visitCounterReason}
                  <option value={visitCounterReason.name}>{visitCounterReason.name}</option>
                {/each}
              </select>
              {#if $appointmentForm.reason !== ""}
                <div 
                  class:border-usfGreen={$appointmentForm.submittedDocument}
                  class="card bg-transparent flex items-center space-x-3 p-4 w-fit border border-accSlate/50"
                >
                  <h1>Visitor submitted a document</h1>
                  <SlideToggle name="document" size="sm" bind:checked={$appointmentForm.submittedDocument} />
                </div>
                <div 
                  class:border-usfGreen={$appointmentForm.needsFutherAction}
                  class="card bg-transparent flex items-center space-x-3 p-4 w-fit border border-accSlate/50"
                >
                  <h1>Visitor needs further action</h1>
                  <SlideToggle name="needsFurtherAction" size="sm" bind:checked={$appointmentForm.needsFutherAction} />
                </div>
                {#if $appointmentForm.needsFutherAction && currentUser?.campus === "P"}
                  <div class="flex gap-2">
                    <div 
                      class:border-usfGreen={$appointmentForm.stPeteAppt}
                      class="card bg-transparent flex items-center space-x-3 p-4 w-fit border border-accSlate/50"
                    >
                      <h1>Visitor needs St. Pete Appointment</h1>
                      <SlideToggle name="stPeteAppt" size="sm" bind:checked={$appointmentForm.stPeteAppt} />
                    </div>
                    {#if $appointmentForm.stPeteAppt}
                      <!-- svelte-ignore a11y-click-events-have-key-events -->
                      <div class="card bg-transparent hover:bg-usfGreen hover:text-white/90 hover:font-medium flex items-center space-x-3 p-4 w-fit border border-accSlate/50 cursor-pointer"
                        on:click={openBookingModal}
                      >
                        Book St. Pete Appointment
                      </div>
                    {/if}
                  </div>
                {/if}
              {/if}
            </Step>
            {#if $appointmentForm.reason !== "" && $appointmentForm.needsFutherAction && !$appointmentForm.stPeteAppt}
              <Step locked={action === ""}>
                <svelte:fragment slot="header">Pick Action</svelte:fragment>
                {#if currentAppts.length > 0}
                  {#each currentAppts as appt}
                    <section class="card bg-transparent flex items-center p-3 w-fit border border-red-700">
                      <h1 class="font-medium">{currentUser?.first_name} has a pending appointment: <span class="font-bold">{appt.reason}</span>.</h1>
                    </section>
                  {/each}
                {/if}
                {#if currentReferrals.length > 0}
                  {#each currentReferrals as ref}
                    <section class="card bg-transparent flex items-center p-3 w-fit border border-red-700">
                      <h1 class="font-medium">{currentUser?.first_name} has a referral: <span class="font-bold">{ref.reason}</span></h1>
                    </section>
                  {/each}
                {/if}
                <ul class="grid w-full gap-2 grid-cols-2">
                  {#each $actions as act}
                    <li>
                      <input
                        type="radio"
                        id={act.name}
                        name="appointmentType"
                        value={act.name}
                        class="hidden peer"
                        bind:group={action}
                        required
                      />
                      <label
                        for={act.name}
                        class="inline-flex items-center justify-between w-full p-5 text-accSlate bg-transparent border border-accSlate/50 rounded-lg cursor-pointer peer-checked:bg-accSlate peer-checked:border-accSlate peer-checked:text-usfWhite/90"
                      >
                        <div class="block">
                          <div class="w-full text-lg font-semibold">{act.name}</div>
                        </div>
                      </label>
                    </li>
                  {/each}
                </ul>
              </Step>
            {/if}
            {#if action !== "" && $appointmentForm.needsFutherAction}
              <Step>
                <svelte:fragment slot="header">Create {action}</svelte:fragment>
                {#if currentUser !== undefined}
                  <div class="input-group input-group-divider grid-cols-[auto_1fr] rounded-md w-fit bg-transparent">
                    <div class="input-group-shim bg-transparent">Name</div>
                    <input disabled type="search" value={currentUser.first_name + " " + currentUser.last_name} />
                  </div>
                  <div class="input-group input-group-divider grid-cols-[auto_1fr] rounded-md w-fit bg-transparent">
                    <div class="input-group-shim bg-transparent">UID</div>
                    <input disabled type="search" value={currentUser.uid.includes("U") ? currentUser.uid : "U" + currentUser.uid } />
                  </div>
                  <div class="input-group input-group-divider grid-cols-[auto_auto_auto] rounded-md w-fit bg-transparent">
                    <div class="input-group-shim bg-transparent">NetID</div>
                    <input disabled type="search" value={currentUser.netid} />
                    <div class="input-group-shim bg-transparent">@usf.edu</div>
                  </div>
                {/if}
                {#if action !== Actions.Walkin && action !== Actions.Referral}
                  <h1 class="text-semibold text-xl">Pick Advisor</h1>
                  <select name="advisor" id="advisor" class="input rounded-md bg-transparent w-fit" bind:value={$appointmentForm.advisorRequested}>
                    <option disabled selected value="">Select one...</option>
                    {#each data.constants.users as user}
                      {#if user.uidRange !== null}
                        <option value={user.first_name + " " + user.last_name}>{user.first_name} {user.last_name} - ({user.uidRange})</option>
                      {/if}
                    {/each}
                  </select>
                {/if}
                {#if action !== Actions.Referral}
                  <h1 class="text-semibold text-xl">Time & Date</h1>
                {:else}
                  <h1 class="text-semibold text-xl">Contact Method</h1>
                {/if}
                <div class="flex space-x-2">
                  {#if action !== Actions.Referral}
                    <input class="input bg-transparent rounded-md w-fit" type="date" name="date" id="date" 
                      min={minDate}
                      max={maxDate}
                      bind:value={$appointmentForm.date}
                    >
                  {:else}
                    <RadioGroup background="bg-transparent" active="bg-accSlate text-white/90 w-fit block" rounded="rounded-md">
                      <RadioItem bind:group={$appointmentForm.preferredContactMethod} name="preferredContactMethod" value="ROAMESG">ROAMESG</RadioItem>
                      <RadioItem bind:group={$appointmentForm.preferredContactMethod} name="preferredContactMethod" value="Phone">Phone</RadioItem>
                      <RadioItem bind:group={$appointmentForm.preferredContactMethod} name="preferredContactMethod" value="Email">Email</RadioItem>
                    </RadioGroup>
                  {/if}
                </div>
                {#if action === Actions.InPerson || action === Actions.Phone}
                  <TimePickerAdvisor currentDate={$appointmentForm.date} requestedAdvisor={$appointmentForm.advisorRequested} bind:timeChosen={$appointmentForm.time} />
                {:else if action === Actions.Walkin}
                  <TimePicker currentDate={$appointmentForm.date} bind:timeChosen={$appointmentForm.time} />
                {/if}
                <h1 class="text-semibold text-xl">Other Info</h1>
                <div class="flex space-x-2">
                  {#if action !== Actions.Walkin}
                    <div class="space-y-1">
                      <label for="phone">Callback Number</label>
                      <input class="input rounded-md bg-transparent w-fit" type="tel" name="phone" id="phone" 
                        placeholder="Callback number..." bind:value={$appointmentForm.callbackNumber}
                        pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
                      >
                    </div>
                  {/if}
                  <div class="space-y-1">
                    <label for="reasons">Reason</label>
                    <select class="input rounded-md bg-transparent w-fit" name="reasons" id="reasons" bind:value={$appointmentForm.appReason}>
                      <option disabled selected value="">Select one...</option>
                      {#each data.appointmentReasons as appointmentReason}
                        <option value={appointmentReason.name}>{appointmentReason.name}</option>
                      {/each}
                    </select>
                  </div>
                </div>
                {#if action === Actions.Referral}
                  <div class="flex space-x-2">
                    <div class="space-y-1">
                      <label for="description">Description</label>
                      <TextareaCopy bind:content={$appointmentForm.referralDetails}>
                        <svelte:fragment slot="textarea">
                          <textarea required class="input bg-transparent rounded-md min-h-[100px] max-h-[150px] max-w-[500px]" 
                            name="description" cols="100" rows="4" placeholder="Why are you making this request..." 
                            bind:value={$appointmentForm.referralDetails} />
                        </svelte:fragment>
                      </TextareaCopy>
                    </div>
                  </div>
                {/if}
                <div class="flex space-x-2">
                  {#if action === Actions.Referral}
                    <div class="space-y-1">
                      <label for="referralType">Referral Type</label>
                      <select class="input rounded-md bg-transparent w-fit" name="referralType" id="referralType" bind:value={$appointmentForm.referralType}>
                        <option disabled selected value="">Select one...</option>
                        <option value="Self Referral">Self Referral</option>
                        <option value="Collaboration Referral">Collaboration Referral</option>
                        <option value="Escalated Referral">Escalated Referral</option>
                      </select>
                    </div>
                    {#if $appointmentForm.referralType === "Collaboration Referral"}
                      <div class="space-y-1">
                        <label for="researchUser">Collaborator</label>
                        <select class="input rounded-md bg-transparent w-fit" name="researchUser" id="researchUser" bind:value={$appointmentForm.researchUser}>
                          <option disabled selected value="">Select one...</option>
                          {#each data.constants.users as user}
                            <option value={user.first_name + " " + user.last_name}>{user.first_name + " " + user.last_name}</option>
                          {/each}
                        </select>
                      </div>
                    {/if}
                    {#if $appointmentForm.referralType === "Escalated Referral"}
                      <div class="space-y-1">
                        <label for="escalatedUser">Escalated User</label>
                        <select class="input rounded-md bg-transparent w-fit" name="escalatedUser" id="escalatedUser" bind:value={$appointmentForm.escalatedUser}>
                          <option disabled selected value="">Select one...</option>
                          {#each data.managementTeam[0].userProfile as user}
                            <option value={user.first_name + " " + user.last_name}>{user.first_name + " " + user.last_name}</option>
                          {/each}
                        </select>
                      </div>
                    {/if}
                  {/if}
                </div>
                <div class="flex space-x-2">
                  <div 
                    class:border-usfGreen={$appointmentForm.rhacomm}
                    class="card bg-transparent flex items-center space-x-3 p-4 w-fit border border-accSlate/50"
                  >
                    <h1>RHACOMM Annotated</h1>
                    <SlideToggle name="document" size="sm" bind:checked={$appointmentForm.rhacomm} />
                  </div>
                </div>
              </Step>
            {/if}
          </section>
        </Stepper>
        {:else}
          <section class="flex flex-col justify-center items-center p-6 rounded-md border border-accSlate/20 space-y-4">
            {#if !visitError}
              <div class="flex items-center space-x-4">
                <h1 class="text-2xl font-bold text-usfGreen">Successfully Created {$appointmentForm.type === "" ? "Visit" : $appointmentForm.type}</h1>
                <SuccessCheck />
              </div>
            {:else}
              <h1 class="text-2xl font-bold text-red-700">Failed to Create {$appointmentForm.type === "" ? "Visit" : $appointmentForm.type}</h1>
            {/if}
            <button class="btn bg-accSlate text-white/90 rounded-md font-medium" on:click={() => {
              location.replace("/counter_duty")
            }}>{visitError ? "Try Again" : "Start New Counter Visit"}</button>
          </section>
        {/if}
      </section>
		</svelte:fragment>
  </PageWrapper>
</section>

<style>
  th {
    background: #293A40;
    color: white;
    padding: 0 20px;
    border: 1px #293A40 solid;
    border-color: #293A40;
  }
  td {
    border: 1px #293A40 solid;
    border-color: #2e354c36;
    padding: 0px 20px;
  }
  tr {
    background: transparent;
  }
</style>