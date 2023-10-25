<script lang="ts">
	import PageWrapper from '$lib/components/PageWrapper.svelte';
	import { page } from '$app/stores';
	import { fly } from 'svelte/transition';
	import moment from 'moment';
	export let data;
</script>

<section class="page" in:fly={{ y: -10, duration: 200 }}>
	<PageWrapper>
		<svelte:fragment slot="title">
			<h1 class="text-2xl text-usfGreen font-semibold">Student Employee Evaluation</h1>
		</svelte:fragment>
		<svelte:fragment slot="content">
			<div class="flex gap-2">
				<span class="flex flex-col w-auto space-y-1">
					<label for="fileName" class="font-medium">Current Date</label>
					<input type="date" name="fileName" class="input rounded-md" value={moment().format('YYYY-MM-DD')} />
				</span>
				<span class="flex flex-col w-fit space-y-1">
					<label for="fileName" class="font-medium">Supervisor</label>
					<select required class="input rounded-md max-w-[500px]" name="owner">
						<option disabled selected value="">Select one...</option>
						{#each data.users as user}
							<option value={user.id}>{user.first_name} {user.last_name}</option>
						{/each}
					</select>
				</span>
			</div>
			<br />
			<div class="flex gap-2">
				<span class="flex flex-col w-[438px] space-y-1">
					<label for="fileName" class="font-medium">Student Name</label>
					<input type="text" name="fileName" class="input rounded-md" placeholder="Student Name..." />
				</span>
				<span class="flex flex-col w-fit space-y-1">
					<label for="fileName" class="font-medium">Start Working Date</label>
					<input type="date" name="fileName" class="input rounded-md" />
				</span>
				<span class="flex flex-col w-fit space-y-1">
					<label for="fileName" class="font-medium">Date of Evaluation</label>
					<input type="date" name="fileName" class="input rounded-md" />
				</span>
			</div>
			<br />
			<h1 class="text-2xl font-medium">Instructions</h1>
			<br />
			<ul class="list-disc list-inside pl-5">
				<li>Conduct an evaluation, using this form, with your student employee at the end of each semester.</li>
				<li>Offer an accurate assessment so the student employee can learn from their work experience. Be sure to note the positive as well as areas for improvement.</li>
			</ul>
			<hr class="my-6" />
			<section>
				<table class="w-full">
					<tr class="bg-accSlate text-white/90 print:text-black">
						<th class="p-3 text-start"><h1 class="font-medium">Job Skills</h1></th>
						<th class="p-3 text-start"><h1 class="font-medium"><pre>Performance Level</pre></h1></th>
					</tr>
					<tr>
						<td class="p-3">
							<h1>Quality of Work Performed</h1>
							<ul class="list-disc list-inside pl-5">
								<li>Completed assignments are accurate.</li>
								<li>Carries out assignments to completion</li>
							</ul>
						</td>
						<td>
							<select required class="input rounded-md w-fit" name="owner">
								<option disabled selected value="">Select one...</option>
								<option value="">Excellent</option>
								<option value="">Good</option>
								<option value="">Satisfactory</option>
								<option value="">Unsatisfactory</option>
							</select>
						</td>
					</tr>
					<tr>
						<td class="p-3">
							<h1>Interest and Attitude Toward Work</h1>
							<ul class="list-disc list-inside pl-5">
								<li>Demonstrates interest and enthusiasm</li>
								<li>Positive attitude towarding learning new skills</li>
							</ul>
						</td>
						<td>
							<select required class="input rounded-md w-fit" name="owner">
								<option disabled selected value="">Select one...</option>
								<option value="">Excellent</option>
								<option value="">Good</option>
								<option value="">Satisfactory</option>
								<option value="">Unsatisfactory</option>
							</select>
						</td>
					</tr>
					<tr>
						<td class="p-3">
							<h1>Knowledge and Use of Required Skills to Perform the Job</h1>
							<ul class="list-disc list-inside pl-5">
								<li>Knowledge in using office equipment</li>
								<li>Understands skills and necessary procedures to perform daily duties</li>
							</ul>
						</td>
						<td>
							<select required class="input rounded-md w-fit" name="owner">
								<option disabled selected value="">Select one...</option>
								<option value="">Excellent</option>
								<option value="">Good</option>
								<option value="">Satisfactory</option>
								<option value="">Unsatisfactory</option>
							</select>
						</td>
					</tr>
					<tr>
						<td class="p-3">
							<h1>Productivity</h1>
							<ul class="list-disc list-inside pl-5">
								<li>Amount of work performed consistent with job expectations</li>
							</ul>
						</td>
						<td>
							<select required class="input rounded-md w-fit" name="owner">
								<option disabled selected value="">Select one...</option>
								<option value="">Excellent</option>
								<option value="">Good</option>
								<option value="">Satisfactory</option>
								<option value="">Unsatisfactory</option>
							</select>
						</td>
					</tr>
					<tr>
						<td class="p-3">
							<h1>Dependability</h1>
							<ul class="list-disc list-inside pl-5">
								<li>Can be counted on to finish assignments and follow through on commitments</li>
							</ul>
						</td>
						<td>
							<select required class="input rounded-md w-fit" name="owner">
								<option disabled selected value="">Select one...</option>
								<option value="">Excellent</option>
								<option value="">Good</option>
								<option value="">Satisfactory</option>
								<option value="">Unsatisfactory</option>
							</select>
						</td>
					</tr>
					<tr>
						<td class="p-3">
							<h1>Interpersonal Skills</h1>
							<ul class="list-disc list-inside pl-5">
								<li>Pleasant personality, able to effectively communicate with co-workers and others served by the office</li>
							</ul>
						</td>
						<td>
							<select required class="input rounded-md w-fit" name="owner">
								<option disabled selected value="">Select one...</option>
								<option value="">Excellent</option>
								<option value="">Good</option>
								<option value="">Satisfactory</option>
								<option value="">Unsatisfactory</option>
							</select>
						</td>
					</tr>
					<tr>
						<td class="p-3">
							<h1>Punctuality/Regular Work Attendance</h1>
							<ul class="list-disc list-inside pl-5">
								<li>Routinely reports to work on time</li>
								<li>Routinely shows up to work as scheduled</li>
							</ul>
						</td>
						<td>
							<select required class="input rounded-md w-fit" name="owner">
								<option disabled selected value="">Select one...</option>
								<option value="">Excellent</option>
								<option value="">Good</option>
								<option value="">Satisfactory</option>
								<option value="">Unsatisfactory</option>
							</select>
						</td>
					</tr>
					<tr>
						<td class="p-3">
							<h1>Appropriate Appearance/Dress for the Position</h1>
							<ul class="list-disc list-inside pl-5">
								<li>Adheres to office dress code</li>
								<li>Dresses appropriately for the job</li>
							</ul>
						</td>
						<td>
							<select required class="input rounded-md w-fit" name="owner">
								<option disabled selected value="">Select one...</option>
								<option value="">Excellent</option>
								<option value="">Good</option>
								<option value="">Satisfactory</option>
								<option value="">Unsatisfactory</option>
							</select>
						</td>
					</tr>
					<tr>
						<td class="p-3">
							<h1>Adherence to Office and University Policies & Procedures</h1>
							<ul class="list-disc list-inside pl-5">
								<li>Demonstrates adherence to performing duties that are consistent with stated office and USF policies.</li>
							</ul>
						</td>
						<td>
							<select required class="input rounded-md w-fit" name="owner">
								<option disabled selected value="">Select one...</option>
								<option value="">Excellent</option>
								<option value="">Good</option>
								<option value="">Satisfactory</option>
								<option value="">Unsatisfactory</option>
							</select>
						</td>
					</tr>
					<tr>
						<td class="p-3">
							<h1 class="font-medium">Overall Evaluation of Work Performance for the Semester</h1>
						</td>
						<td>
							<select required class="input rounded-md w-fit" name="owner">
								<option disabled selected value="">Select one...</option>
								<option value="">Excellent</option>
								<option value="">Good</option>
								<option value="">Satisfactory</option>
								<option value="">Unsatisfactory</option>
							</select>
						</td>
					</tr>
				</table>
				<br />
				<div class="flex flex-col w-full space-y-1">
					<label for="description" class="font-medium"
						>Please provide any additional comments such as the student employee's stengths, weaknesses, and contributions the student has made to our office this semester:
					</label>
					<textarea required class="input rounded-md max-w-[800px]" name="description" cols="20" rows="4" placeholder="Comments..." />
				</div>
				<br />
				<h1 class="text-2xl font-medium mb-2">Supervisor</h1>
				<div class="flex gap-2 items-center mb-2">
					<input type="checkbox" />
					<h1>I certify that I have gone over this evaluation with the above-named employee and have provided a copy to him/her.</h1>
				</div>
				<span class="flex flex-col w-fit space-y-1">
					<label for="fileName" class="font-medium">Supervisor</label>
					<select required class="input rounded-md max-w-[500px]" name="owner">
						<option disabled selected value="">Select one...</option>
						{#each data.users as user}
							<option value={user.id}>{user.first_name} {user.last_name}</option>
						{/each}
					</select>
				</span>
				<br />
				<br />
				<div class="flex gap-16">
					<h1>Signature: ____________________________________________________</h1>
					<h1>Date: _______/_______/_______</h1>
				</div>
			</section>
			<br />
			<button
				class="bg-accSlate text-white/90 py-2 rounded-md w-[150px] text-lg no-print"
				on:click={() => {
					window.print();
				}}>Print</button
			>
		</svelte:fragment>
	</PageWrapper>
</section>

<style>
	option:hover {
		background-color: white;
	}

	input {
		background-color: transparent;
		color: black;
		border-color: #3e4c7a8a;
	}

	select {
		color: black;
		background-color: transparent;
	}

	textarea {
		background-color: transparent;
		border-color: #3e4c7a8a;
	}

	@media print {
		.page {
			overflow: visible !important;
		}
		.no-print {
			display: none;
		}
	}
</style>
