<script lang="ts">
  import { fly } from 'svelte/transition';
  import { RadioGroup, RadioItem, SlideToggle, Step, Stepper, toastStore  } from '@skeletonlabs/skeleton';
	import { getCampusName } from '$lib/helpers';
	import type { BannerUser, PrivacyForm } from '$lib/types';
	import Spinner from '$lib/components/animation/Spinner.svelte';
	import { actions, getPrivacyInfo, getUidInfo } from '$lib/stores/counter_duty';
	import moment from 'moment';
	import TimePickerAdvisor from '$lib/components/TimePickerAdvisor.svelte';
	import TimePicker from '$lib/components/TimePicker.svelte';
	import { writable } from 'svelte/store';
	import * as devalue from 'devalue';
	import SuccessCheck from '$lib/components/animation/SuccessCheck.svelte';
	import type { Appointment } from '@prisma/client';
  export let data;

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

  let appointmentForm = writable({
    type: "",
    referralType: "",
    escalatedUser: "",
    researchUser: "",
    visitorType: "Student",
    studentUid: "",
    studentEmail: "",
    studentName: "",
    reason: "",
    appReason: "",
    referralDetails: "",
    rhacomm: false,
    callbackNumber: "",
    advisorRequested: "",
    date: "",
    time: "",
    bestTimeCallback: "",
    preferredContactMethod: "Phone",
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
        // console.log(res);
        currentUser = res;
      })
      getPrivacyInfo($appointmentForm.studentUid).then(res => {
        // console.log(res);
        currentUserForms = res;
      })
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
    }
    if (!$appointmentForm.needsFutherAction) {
      $appointmentForm.date = "";
      $appointmentForm.time = "";
      $appointmentForm.advisorRequested = "";
      $appointmentForm.callbackNumber = "";
      $appointmentForm.bestTimeCallback = "";
      $appointmentForm.referralDetails = "";
      $appointmentForm.appReason = "";
      $appointmentForm.preferredContactMethod = "Phone";
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

    if (!$appointmentForm.studentUid.includes("U") && $appointmentForm.studentUid.length > 7) {
      $appointmentForm.studentUid = "U" + $appointmentForm.studentUid;
    } else if ($appointmentForm.studentUid.length < 8) {
      $appointmentForm.studentUid = "";
      $appointmentForm.studentName = "";
      $appointmentForm.studentEmail = "";
    }

    if (!$appointmentForm.needsFutherAction) {
      const formData = new FormData();
      formData.append('visitorType', $appointmentForm.visitorType);
      formData.append('studentUid', $appointmentForm.studentUid);
      formData.append('studentEmail', $appointmentForm.studentEmail);
      formData.append('studentName', $appointmentForm.studentName);
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
    if (action !== "" && (action !== Actions.Referral && action !== Actions.Walkin) && $appointmentForm.advisorRequested === "") {
      errorToast("Please pick an advisor!");
      return
    }
    if (action === Actions.Referral && $appointmentForm.bestTimeCallback === "") {
      errorToast("Please pick a preferred callback time!");
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
    if (action === Actions.Referral && $appointmentForm.referralType === "Research Referral" && $appointmentForm.researchUser === "") {
      errorToast("Please pick a research user!");
      return
    }

    await fetch(`/api/counter_duty?type=${action}`).then(async (res) => {
      let response = await res.json();
      response.appointments.forEach((appt: Appointment) => {
        console.log(appt);
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
</script>

<svelte:head>
	<title>OFA • Counter Duty</title>
</svelte:head>

<section in:fly={{ y: -10, duration: 200 }}>
  <div class="flex justify-between items-center">
    <h1 class="text-2xl text-usfGreen font-semibold">Counter Duty</h1>
  </div>
  <br>
  <br>
  <section class="grid grid-cols-[3fr_1fr] gap-6">
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
            <RadioGroup active="bg-accSlate text-white/90" class="mt-0" rounded="rounded-md">
              <RadioItem  bind:group={$appointmentForm.visitorType} name="visitorType" value="Student">Student</RadioItem>
              <RadioItem bind:group={$appointmentForm.visitorType} name="visitorType" value="Parent">Parent</RadioItem>
            </RadioGroup>
            <RadioGroup active="bg-accSlate text-white/90" rounded="rounded-md">
              <RadioItem bind:group={hasUID} name="uid_status" value={true}>Has U#</RadioItem>
              <RadioItem bind:group={hasUID} name="uid_status" value={false}>No U#</RadioItem>
            </RadioGroup>
          </section>
          {#if hasUID}
            <section class="flex items-center space-x-3">
              <div class="relative w-fit">
                <div 
                  class="input-group input-group-divider rounded-md grid-cols-[auto_1fr_auto]" 
                >
                  <div class="input-group-shim font-semibold">UID</div>
                  <input type="text" class="w-fit font-semibold" name="uid" placeholder="Student UID..." minlength="8" maxlength="9" bind:value={$appointmentForm.studentUid}>
                  {#if !isLoading}
                    <div class="input-group-shim">
                      {#if matchesUIDForm && currentUser != undefined}
                        <box-icon name='check' class="fill-green-700 cursor-pointer" ></box-icon>
                      {:else if matchesUIDForm && currentUser === undefined}
                        <box-icon name='x' class="fill-red-700 cursor-pointer" ></box-icon>
                      {:else}
                        <box-icon type='solid' name='x-circle' class="fill-black/50"></box-icon>
                      {/if}
                    </div>
                  {:else}
                    <div class="input-group-shim"> 
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
              <section class="card flex flex-col justify-center p-4 w-fit border border-accSlate/50">
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
                  <section class="card flex items-center p-4 w-fit border border-red-700">
                    <h1 class="font-semibold">No privacy forms were found.</h1>
                  </section>
                {/if}
              {/if}
            </section>
          {/if}
        </Step>
        <Step locked={$appointmentForm.reason === ""}>
          <svelte:fragment slot="header">Reason</svelte:fragment>
          <select class="select w-fit" name="reasons" id="reasons" bind:value={$appointmentForm.reason}>
            <option disabled selected value="">Select one...</option>
            {#each data.visitCounterReasons as visitCounterReason}
              <option value={visitCounterReason.name}>{visitCounterReason.name}</option>
            {/each}
          </select>
          {#if $appointmentForm.reason !== ""}
            <div 
              class:border-usfGreen={$appointmentForm.submittedDocument}
              class="card flex items-center space-x-3 p-4 w-fit border border-accSlate/50"
            >
              <h1>Visitor submitted a document</h1>
              <SlideToggle name="document" size="sm" bind:checked={$appointmentForm.submittedDocument} />
            </div>
            <div 
              class:border-usfGreen={$appointmentForm.needsFutherAction}
              class="card flex items-center space-x-3 p-4 w-fit border border-accSlate/50"
            >
              <h1>Visitor needs further action</h1>
              <SlideToggle name="needsFurtherAction" size="sm" bind:checked={$appointmentForm.needsFutherAction} />
            </div>
          {/if}
        </Step>
        {#if $appointmentForm.reason !== "" && $appointmentForm.needsFutherAction}
          <Step locked={action === ""}>
            <svelte:fragment slot="header">Pick Action</svelte:fragment>
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
                    class="inline-flex items-center justify-between w-full p-5 text-accSlate bg-[#DFE2EB] border border-accSlate/50 rounded-lg cursor-pointer peer-checked:bg-accSlate peer-checked:border-accSlate peer-checked:text-usfWhite/90"
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
              <div class="input-group input-group-divider grid-cols-[auto_1fr] rounded-md w-fit">
                <div class="input-group-shim">Name</div>
                <input disabled type="search" value={currentUser.first_name + " " + currentUser.last_name} />
              </div>
              <div class="input-group input-group-divider grid-cols-[auto_1fr] rounded-md w-fit">
                <div class="input-group-shim">UID</div>
                <input disabled type="search" value={currentUser.uid.includes("U") ? currentUser.uid : "U" + currentUser.uid } />
              </div>
              <div class="input-group input-group-divider grid-cols-[auto_auto_auto] rounded-md w-fit">
                <div class="input-group-shim">NetID</div>
                <input disabled type="search" value={currentUser.netid} />
                <div class="input-group-shim">@usf.edu</div>
              </div>
            {/if}
            {#if action !== Actions.Walkin && action !== Actions.Referral}
              <h1 class="text-semibold text-xl">Pick Advisor</h1>
              <select name="advisor" id="advisor" class="select w-fit" bind:value={$appointmentForm.advisorRequested}>
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
              <h1 class="text-semibold text-xl">Best Callback Time & Preferred Contact Method</h1>
            {/if}
            <div class="flex space-x-2">
              {#if action !== Actions.Referral}
                <input class="input rounded-md w-fit" type="date" name="date" id="date" 
                  min={minDate}
                  max={maxDate}
                  bind:value={$appointmentForm.date}
                >
              {:else}
                <RadioGroup active="bg-accSlate text-white/90 w-fit block" rounded="rounded-md">
                  <RadioItem bind:group={$appointmentForm.preferredContactMethod} name="preferredContactMethod" value="Phone">Phone</RadioItem>
                  <RadioItem bind:group={$appointmentForm.preferredContactMethod} name="preferredContactMethod" value="Email">Email</RadioItem>
                </RadioGroup>
                <input class="input rounded-md w-fit block" type="time" name="time" id="time"
                  min={minDate}
                  max={maxDate}
                  bind:value={$appointmentForm.bestTimeCallback}
                >
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
                  <input class="input rounded-md w-fit" type="tel" name="phone" id="phone" 
                    placeholder="Callback number..." bind:value={$appointmentForm.callbackNumber}
                    pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
                  >
                </div>
              {/if}
              <div class="space-y-1">
                <label for="reasons">Reason</label>
                <select class="select w-fit" name="reasons" id="reasons" bind:value={$appointmentForm.appReason}>
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
                  <textarea required class="input rounded-md min-h-[100px] max-h-[150px] max-w-[500px]" name="description" cols="100" rows="4" placeholder="Why are you making this request..." bind:value={$appointmentForm.referralDetails} />
                </div>
              </div>
            {/if}
            <div class="flex space-x-2">
              {#if action === Actions.Referral}
                <div class="space-y-1">
                  <label for="referralType">Referral Type</label>
                  <select class="select w-fit" name="referralType" id="referralType" bind:value={$appointmentForm.referralType}>
                    <option disabled selected value="">Select one...</option>
                    <option value="Self Referral">Self Referral</option>
                    <option value="Research Referral">Research Referral</option>
                    <option value="Escalated Referral">Escalated Referral</option>
                  </select>
                </div>
                {#if $appointmentForm.referralType === "Research Referral"}
                  <div class="space-y-1">
                    <label for="researchUser">Research User</label>
                    <select class="select w-fit" name="researchUser" id="researchUser" bind:value={$appointmentForm.researchUser}>
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
                    <select class="select w-fit" name="escalatedUser" id="escalatedUser" bind:value={$appointmentForm.escalatedUser}>
                      <option disabled selected value="">Select one...</option>
                      {#each data.constants.users as user}
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
                class="card flex items-center space-x-3 p-4 w-fit border border-accSlate/50"
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
    <div class="flex flex-col space-y-2">
      <div class="bg-accSlate rounded-lg p-3 text-white/90">
        <h1 class="font-semibold mb-2 text-white">Other Actions</h1>
        <p class="">Create Appointment</p>
        <p>Take Referral</p>
      </div>
      <div class="bg-accSlate rounded-lg p-3 text-white/90">
        <h1 class="font-semibold mb-2 text-white">Other Actions</h1>
        <p class="">Create Appointment</p>
        <p>Take Referral</p>
      </div>
    </div>
  </section>
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
    border-color: #2e354c15;
    padding: 0px 20px;
  }
  tr {
    background: #2e354c15;
  }
</style>