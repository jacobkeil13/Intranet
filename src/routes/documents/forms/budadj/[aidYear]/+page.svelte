<script lang="ts">
	import PageWrapper from '$lib/components/PageWrapper.svelte';
	import { page } from '$app/stores';
	import { fly } from 'svelte/transition';
	import { writable } from 'svelte/store';

	const aidYear = $page.params.aidYear;
	let currentAidYear = '20' + aidYear.slice(0, 2);
	let nextAidYear = '20' + aidYear.slice(-2);
	let fullAidYear = `${currentAidYear}-${nextAidYear}`;

	let term = '';
	let adj = '';

	$: adjustments = writable<string[]>([]);

	function addAdj() {
		if ($adjustments.includes(adj)) {
			adj = '';
			return;
		}
		$adjustments.push(adj);
		$adjustments = $adjustments;
		adj = '';
	}

	function removeAdj(adjst: string) {
		let index = $adjustments.indexOf(adjst);
		if (index !== -1) {
			$adjustments.splice(index, 1);
		}
		$adjustments = $adjustments;
	}
</script>

<section class="page" in:fly={{ y: -10, duration: 200 }}>
	<PageWrapper>
		<svelte:fragment slot="title">
			<h1 class="text-2xl text-usfGreen font-semibold">{aidYear} Budget Adjustment Form (BUDADJ)</h1>
		</svelte:fragment>
		<svelte:fragment slot="content">
			<section class="flex flex-col space-y-4">
				<div class="grid grid-cols-[2fr_1fr] gap-2">
					<span class="flex flex-col w-full space-y-1">
						<label for="fileName" class="font-medium">Student Name</label>
						<input required type="text" name="fileName" class="input rounded-md" placeholder="Student Name..." />
					</span>
					<span class="flex flex-col w-full space-y-1">
						<label for="fileName" class="font-medium">UID</label>
						<input required type="text" name="fileName" class="input rounded-md" placeholder="UID..." />
					</span>
				</div>
				<br />
				<h1 class="text-2xl font-medium">Guidelines & Instructions</h1>
				<p>
					Financial aid budgets only reflect costs for the student only, because the federal need analysis formula accounts for expenses of family members. Budget adjustments are not a required
					process, and are only considered in certain situations. Restrictions apply to what will be processed.
				</p>
				<p>Before submitting the request form, be sure that you have read and understand the following:</p>
				<br />
				<ul class="list-disc list-inside">
					<li>Only costs incurred during the {fullAidYear} academic year <span class="underline font-medium">and</span> during periods of active enrollment will be considered.</li>
					<li>You must attach the required documentation (listed below) that clearly verifies the expenses <span class="underline font-medium">paid</span>. Unpaid expenses will not be considered.</li>
					<li>The minimum adjustment amount that will be considered is $100 per term.</li>
					<li>
						The only source of additional financial assistance from this process is loans.
						<ul class="list-disc list-inside pl-5">
							<li>
								If you do you not have remaining federal direct loan eligibility, you will need to apply for a PLUS/Grad PLUS loan or a private education loan if your adjustment is approved in order
								to receive additional funds.
							</li>
							<li>Federal direct loans cannot be increased after the last day of the term.</li>
						</ul>
					</li>
					<li>
						The documentation must have the date paid and the amount <span class="underline font-medium">circled in black ink</span>.
						<ul class="list-disc list-inside pl-5">
							<li><span class="underline font-medium">Do not use highlighters.</span></li>
						</ul>
					</li>
					<li>Additional documentation may be requested upon review of the budget adjustment request before the decision is determined.</li>
					<li>Documentation must be complete and your USF ID and name should be printed neatly at the top-right corner of each page.</li>
				</ul>
				<br />
				<div class="text-xl font-medium">
					<span class="text-xl font-medium">1.)</span> Select term for which budget adjustment is intended -
				</div>
				<span class="flex flex-col w-full space-y-1 no-print">
					<select required class="input rounded-md max-w-[500px]" name="owner" bind:value={term}>
						<option disabled selected value="">Select one...</option>
						<option value="Fall">Fall {currentAidYear}</option>
						<option value="Spring">Spring {nextAidYear}</option>
						<option value="Summer">Summer {nextAidYear}</option>
						<option value="USF Health COM">USF Health COM</option>
						<option value="Alternative">Alternative</option>
					</select>
				</span>
				{#if term !== ''}
					<div class="flex gap-2 items-center border border-[#3e4c7a8a] rounded-md px-3 py-2 w-fit">
						{#if term === 'Fall'}
							Fall {currentAidYear} - Submission Deadline: <span>November 18th, {currentAidYear}</span>
						{:else if term === 'Spring'}
							Spring {nextAidYear} - Submission Deadline: <span>April 14th, {nextAidYear}</span>
						{:else if term === 'Summer'}
							Summer {nextAidYear} - Submission Deadline: <span>July 15th, {nextAidYear}</span>
						{:else if term === 'USF Health COM'}
							USF Health COM - Submission Deadline: <span>April 3rd, {nextAidYear}</span>
						{:else if term === 'Alternative'}
							Submission Deadline:
							<input type="date" name="date" class="input rounded-md w-fit" />
							(21 days prior to end of term)
						{/if}
					</div>
				{/if}
				<br />
				<div class="text-xl font-medium">
					<span class="text-xl font-medium">2.)</span> Adjustments Requested -
				</div>
				<span class="flex flex-col w-full space-y-1 no-print">
					<select required class="input rounded-md max-w-[500px]" name="owner" bind:value={adj} on:change={addAdj}>
						<option disabled selected value="">Select one...</option>
						<option value="Excess Books & Supplies">(BKSA) Excess Books & Supplies</option>
						<option value="Reasonable and Necessary Auto Repairs">(CARA) Reasonable and Necessary Auto Repairs</option>
						<option value="Computer Adjustment">(CMPA) Computer Adjustment</option>
						<option value="Disability Expenses">(DISA) Disability Expenses</option>
						<option value="Dependent Care Expenses">(DPCA) Dependent Care Expenses</option>
						<option value="Independent Student Medical/Dental Expenses">(MEDA) Independent Student Medical/Dental Expenses</option>
						<option value="Professional Attire Expense">(PRAA) Professional Attire Expense</option>
						<option value="Professional License">(PRLA) Professional License</option>
						<option value="Emergency Travel Home">(TRNA) Emergency Travel Home</option>
						<option value="Required Travel for Program of Study">(TRNA) Required Travel for Program of Study</option>
						<option value="Unusual Cost of Commute">(TRNA) Unusual Cost of Commute</option>
						<option value="Tuition Adjustment">(TUIA) Tuition Adjustment</option>
						<option value="Administrative Adjustment">(ADMA) Administrative Adjustment</option>
					</select>
				</span>
				{#if $adjustments.length > 0}
					{#if $adjustments.includes('Excess Books & Supplies')}
						<div class="flex flex-col border border-[#3e4c7a8a] rounded-md px-3 py-2 w-[800px] print:w-full">
							<div class="flex items-center justify-between">
								<h1 class="font-medium">(BKSA) Excess Books & Supplies</h1>
								<!-- svelte-ignore a11y-click-events-have-key-events -->
								<i class="fa-solid fa-xmark fa-lg text-red-700 cursor-pointer no-print" on:click={() => removeAdj('Excess Books & Supplies')} />
							</div>
							<ul class="list-disc list-inside pl-5">
								<li>A statement itemizing the necessary supplies and cost, as well as the reason the supplies are necessary</li>
								<li>
									Copies of paid receipts with the following information <span class="underline font-medium">circled</span>:
									<ul class="list-disc list-inside pl-5">
										<li>Date purchased</li>
										<li>Item necessary</li>
										<li>Amount paid</li>
									</ul>
								</li>
								<li>Copy of the course syllabus or letter, on letterhead, from the professor listing the necessary supplies.</li>
								<li>
									If the purchased items could have been purchased utilizing a less expense alternative:
									<ul class="list-disc list-inside pl-5">
										<li>Information should be provided as to why the more expensive item is required.</li>
									</ul>
								</li>
							</ul>
						</div>
					{/if}
					{#if $adjustments.includes('Reasonable and Necessary Auto Repairs')}
						<div class="flex flex-col border border-[#3e4c7a8a] rounded-md px-3 py-2 w-[800px] print:w-full">
							<div class="flex items-center justify-between">
								<h1 class="font-medium">(CARA) Reasonable and Necessary Auto Repairs</h1>
								<!-- svelte-ignore a11y-click-events-have-key-events -->
								<i class="fa-solid fa-xmark fa-lg text-red-700 cursor-pointer no-print" on:click={() => removeAdj('Reasonable and Necessary Auto Repairs')} />
							</div>
							<ul class="list-disc list-inside pl-5">
								<li>
									Statement indicating the repairs needed and why the repairs were necessary for the functioning of the vehicle.
									<ul class="list-disc list-inside pl-5">
										<li>Routine procedures and repairs such as oil changes will not be included.</li>
									</ul>
								</li>
							</ul>
							<ul class="list-disc list-inside pl-5">
								<li>
									Copies of paid receipts that clearly show the maintenance performed with the following <span class="underline font-medium">circled</span>:
									<ul class="list-disc list-inside pl-5">
										<li>Date purchased</li>
										<li>Amount paid</li>
										<li>Note: handwritten confirmation of payment is not an acceptable form of proof of payment</li>
									</ul>
								</li>
							</ul>
						</div>
					{/if}
					{#if $adjustments.includes('Computer Adjustment')}
						<div class="flex flex-col border border-[#3e4c7a8a] rounded-md px-3 py-2 w-[800px] print:w-full">
							<div class="flex items-center justify-between">
								<h1 class="font-medium">(CMPA) Reasonable and Necessary Auto Repairs</h1>
								<!-- svelte-ignore a11y-click-events-have-key-events -->
								<i class="fa-solid fa-xmark fa-lg text-red-700 cursor-pointer no-print" on:click={() => removeAdj('Computer Adjustment')} />
							</div>
							<ul class="list-disc list-inside pl-5">
								<li>
									Copies of paid receipts with the following <span class="underline font-medium">circled</span>:
									<ul class="list-disc list-inside pl-5">
										<li>Date purchased</li>
										<li>Item purchased</li>
										<li>Amount paid</li>
									</ul>
								</li>
							</ul>
						</div>
					{/if}
					{#if $adjustments.includes('Disability Expenses')}
						<div class="flex flex-col border border-[#3e4c7a8a] rounded-md px-3 py-2 w-[800px] print:w-full">
							<div class="flex items-center justify-between">
								<h1 class="font-medium">(DISA) Disability Expenses</h1>
								<!-- svelte-ignore a11y-click-events-have-key-events -->
								<i class="fa-solid fa-xmark fa-lg text-red-700 cursor-pointer no-print" on:click={() => removeAdj('Disability Expenses')} />
							</div>
							<ul class="list-disc list-inside pl-5">
								<li>Letter from the USF Disability Services Office indicating you have a registered disability with their office.</li>
								<li>
									Personal statement explaining
									<ul class="list-disc list-inside pl-5">
										<li>The nature of the disability</li>
										<li>The need for the items requested</li>
										<li>If you have other assistance that is helping to provide the services or offset the cost</li>
									</ul>
								</li>
								<li>
									Copies of paid receipts that have the following <span class="underline font-medium">circled</span>:
									<ul class="list-disc list-inside pl-5">
										<li>Date purchased</li>
										<li>Item/service purchased</li>
										<li>Amount paid</li>
									</ul>
								</li>
								<li>
									If the item/services requested has a comparable alternative available at a lesser expense:
									<ul class="list-disc list-inside pl-5">
										<li>A letter from a knowledgeable professional, on letterhead, that confirms the necessity for the more expensive service/item.</li>
									</ul>
								</li>
							</ul>
						</div>
					{/if}
					{#if $adjustments.includes('Dependent Care Expenses')}
						<div class="flex flex-col border border-[#3e4c7a8a] rounded-md px-3 py-2 w-[800px] print:w-full">
							<div class="flex items-center justify-between">
								<h1 class="font-medium">(DPCA) Dependent Care Expenses</h1>
								<!-- svelte-ignore a11y-click-events-have-key-events -->
								<i class="fa-solid fa-xmark fa-lg text-red-700 cursor-pointer no-print" on:click={() => removeAdj('Dependent Care Expenses')} />
							</div>
							<ul class="list-disc list-inside pl-5">
								<li>
									A statement on letterhead from the licensed child care facility indicating your dependent's:
									<ul class="list-disc list-inside pl-5">
										<li>Name(s)</li>
										<li>Age(s)</li>
										<li>Weekly cost(s)</li>
										<li>Dates of enrollment at their facility</li>
									</ul>
								</li>
								<li>If the childcare is provided by a homecare provider, they must provide a notarized letter with the aforementioned information and their license number.</li>
							</ul>
						</div>
					{/if}
					{#if $adjustments.includes('Independent Student Medical/Dental Expenses')}
						<div class="flex flex-col border border-[#3e4c7a8a] rounded-md px-3 py-2 w-[800px] print:w-full">
							<div class="flex items-center justify-between">
								<h1 class="font-medium">(MEDA) Independent Student Medical/Dental Expenses</h1>
								<!-- svelte-ignore a11y-click-events-have-key-events -->
								<i class="fa-solid fa-xmark fa-lg text-red-700 cursor-pointer no-print" on:click={() => removeAdj('Independent Student Medical/Dental Expenses')} />
							</div>
							<ul class="list-disc list-inside pl-5">
								<li>The Budget Adjustment Medical/Dental Addendum</li>
								<li>Required documentation (paid receipts) in accordance with the instructions on that form</li>
							</ul>
						</div>
					{/if}
					{#if $adjustments.includes('Professional Attire Expense')}
						<div class="flex flex-col border border-[#3e4c7a8a] rounded-md px-3 py-2 w-[800px] print:w-full">
							<div class="flex items-center justify-between">
								<h1 class="font-medium">(PRAA) Professional Attire Expense</h1>
								<!-- svelte-ignore a11y-click-events-have-key-events -->
								<i class="fa-solid fa-xmark fa-lg text-red-700 cursor-pointer no-print" on:click={() => removeAdj('Professional Attire Expense')} />
							</div>
							<ul class="list-disc list-inside pl-5">
								<li>
									Personal statement indicating
									<ul class="list-disc list-inside pl-5">
										<li>The need for the adjustment</li>
										<li>Itemizing all items purchased and the amounts paid</li>
									</ul>
								</li>
								<li>
									Copies of paid receipts showing you purchased the items with the following <span class="underline font-medium">circled</span>:
									<ul class="list-disc list-inside pl-5">
										<li>Date purchased</li>
										<li>Item purchased</li>
										<li>Amount paid</li>
									</ul>
								</li>
								<li>
									A statement, on letterhead, from an academic advisor or professor confirming that
									<ul class="list-disc list-inside pl-5">
										<li>That you have been accepted to the internship/practicum site</li>
									</ul>
								</li>
							</ul>
						</div>
					{/if}
					{#if $adjustments.includes('Professional License')}
						<div class="flex flex-col border border-[#3e4c7a8a] rounded-md px-3 py-2 w-[800px] print:w-full">
							<div class="flex items-center justify-between">
								<h1 class="font-medium">(PRLA) Professional License</h1>
								<!-- svelte-ignore a11y-click-events-have-key-events -->
								<i class="fa-solid fa-xmark fa-lg text-red-700 cursor-pointer no-print" on:click={() => removeAdj('Professional License')} />
							</div>
							<ul class="list-disc list-inside pl-5">
								<li>
									Typewritten Statement indicating
									<ul class="list-disc list-inside pl-5">
										<li>Your major</li>
										<li>The professional license</li>
									</ul>
								</li>
								<li>Copy of Published Degree Requirement</li>
								<li>
									Copies of paid receipts showing you purchased the items with the following <span class="underline font-medium">circled</span>:
									<ul class="list-disc list-inside pl-5">
										<li>Date purchased</li>
										<li>Item purchased</li>
										<li>Amount paid</li>
									</ul>
								</li>
								<li>
									A statement, on letterhead, from an academic advisor or professor confirming that
									<ul class="list-disc list-inside pl-5">
										<li>That the professional license is required for <span class="font-medium">degree completion</span></li>
									</ul>
								</li>
							</ul>
						</div>
					{/if}
					{#if $adjustments.includes('Emergency Travel Home')}
						<div class="flex flex-col border border-[#3e4c7a8a] rounded-md px-3 py-2 w-[800px] print:w-full">
							<div class="flex items-center justify-between">
								<h1 class="font-medium">(TRNA) Emergency Travel Home</h1>
								<!-- svelte-ignore a11y-click-events-have-key-events -->
								<i class="fa-solid fa-xmark fa-lg text-red-700 cursor-pointer no-print" on:click={() => removeAdj('Emergency Travel Home')} />
							</div>
							<ul class="list-disc list-inside pl-5">
								<li>
									Personal statement explaining
									<ul class="list-disc list-inside pl-5">
										<li>The nature of the emergency</li>
										<li>The necessity for travel home</li>
									</ul>
								</li>
								<li>Supporting documentation confirming the emergency</li>
								<li>
									Copies of paid receipts for airfare with the following <span class="underline font-medium">circled</span>:
									<ul class="list-disc list-inside pl-5">
										<li>Date purchased</li>
										<li>Amount paid</li>
									</ul>
								</li>
							</ul>
						</div>
					{/if}
					{#if $adjustments.includes('Required Travel for Program of Study')}
						<div class="flex flex-col border border-[#3e4c7a8a] rounded-md px-3 py-2 w-[800px] print:w-full">
							<div class="flex items-center justify-between">
								<h1 class="font-medium">(TRNA) Required Travel for Program of Study</h1>
								<!-- svelte-ignore a11y-click-events-have-key-events -->
								<i class="fa-solid fa-xmark fa-lg text-red-700 cursor-pointer no-print" on:click={() => removeAdj('Required Travel for Program of Study')} />
							</div>
							<ul class="list-disc list-inside pl-5">
								<li>Required Travel Addendum</li>
								<li>A statement, on letterhead, from the USF Offical overseeing the travel that the travel is required for the course, student's program, or other degree requirement</li>
							</ul>
						</div>
					{/if}
					{#if $adjustments.includes('Unusual Cost of Commute')}
						<div class="flex flex-col border border-[#3e4c7a8a] rounded-md px-3 py-2 w-[800px] print:w-full">
							<div class="flex items-center justify-between">
								<h1 class="font-medium">(TRNA) Unusual Cost of Commute</h1>
								<!-- svelte-ignore a11y-click-events-have-key-events -->
								<i class="fa-solid fa-xmark fa-lg text-red-700 cursor-pointer no-print" on:click={() => removeAdj('Unusual Cost of Commute')} />
							</div>
							<ul class="list-disc list-inside pl-5">
								<li>
									A personal statement indicating
									<ul class="list-disc list-inside pl-5">
										<li>Your address</li>
										<li>The number of days you come to campus, or are required to attend other published class requirements (e.g. clinical rotations)</li>
										<li>The number of miles that you commute to each location</li>
										<li>A computer printout confirming the mileage for each location</li>
									</ul>
								</li>
								<li>
									If you commute somewhere other than USF for class
									<ul class="list-disc list-inside pl-5">
										<li>Statement must include the location's address</li>
										<li>
											A statement, on letterhead, from the professor or advisor in charge of the requirement confirming
											<ul class="list-disc list-inside pl-5">
												<li>The location</li>
												<li>The days travelled to that location</li>
												<li>The reason for travelling to that location</li>
											</ul>
										</li>
									</ul>
								</li>
							</ul>
						</div>
					{/if}
					{#if $adjustments.includes('Tuition Adjustment')}
						<div class="flex flex-col border border-[#3e4c7a8a] rounded-md px-3 py-2 w-[800px] print:w-full">
							<div class="flex items-center justify-between">
								<h1 class="font-medium">(TUIA) Tuition Adjustment</h1>
								<!-- svelte-ignore a11y-click-events-have-key-events -->
								<i class="fa-solid fa-xmark fa-lg text-red-700 cursor-pointer no-print" on:click={() => removeAdj('Tuition Adjustment')} />
							</div>
							<ul class="list-disc list-inside pl-5">
								<li>No documentation necessary unless annotated below</li>
							</ul>
						</div>
					{/if}
					{#if $adjustments.includes('Administrative Adjustment')}
						<div class="flex flex-col border border-[#3e4c7a8a] rounded-md px-3 py-2 w-[800px] print:w-full">
							<div class="flex items-center justify-between">
								<h1 class="font-medium">(ADMA) Administrative Adjustment</h1>
								<!-- svelte-ignore a11y-click-events-have-key-events -->
								<i class="fa-solid fa-xmark fa-lg text-red-700 cursor-pointer no-print" on:click={() => removeAdj('Administrative Adjustment')} />
							</div>
							<ul class="list-disc list-inside pl-5">
								<li>Please see the Additional Notes and Requirements section for details.</li>
								<li>Contact your Financial Aid Advisor with additional questions.</li>
							</ul>
						</div>
					{/if}
				{/if}
				<div class="flex flex-col w-full space-y-1">
					<label for="description" class="font-medium">Additional Notes & Requirements</label>
					<textarea required class="input rounded-md max-w-[600px]" name="description" cols="20" rows="4" placeholder="Notes..." />
				</div>
				<br />
				<div class="text-xl font-medium">
					<span class="text-xl font-medium">3.)</span> Loan Adjustment -
				</div>
				<table class="w-full text-left text-md font-light border-[1px] border-black/20 table-fixed">
					<thead class="border-b font-medium border-b-black/20">
						<tr class="text-center">
							<th scope="col" class="px-6 py-4 border-l border-l-black/20 font-semibold">
								<input type="checkbox" name="" id="" />
								Increase my subsidized / unsubsidized loan to
							</th>
							<th scope="col" class="px-6 py-4 border-l border-l-black/20 font-semibold">
								<input type="checkbox" name="" id="" />
								Increase my PLUS loan to
							</th>
							<th scope="col" class="px-6 py-4 border-l border-l-black/20 font-semibold">
								<input type="checkbox" name="" id="" />
								Increase my private education loan to
							</th>
						</tr>
					</thead>
					<tbody>
						<tr class="text-center">
							<td class="px-6 py-4 border border-black/20 font-semibold">
								<input type="checkbox" name="" id="" />
								Maximum I am able to receive
							</td>
							<td class="px-6 py-4 border border-black/20 font-semibold">
								<input type="checkbox" name="" id="" />
								Maximum I am able to receive
							</td>
							<td class="px-6 py-4 border border-black/20 font-semibold">
								<input type="checkbox" name="" id="" />
								Maximum I am able to receive
							</td>
						</tr>
						<tr class="text-center">
							<td class="px-6 py-4 border border-black/20 font-semibold">
								<input type="checkbox" name="" id="" />
								$_______________ in additional loans
							</td>
							<td class="px-6 py-4 border border-black/20 font-semibold">
								<input type="checkbox" name="" id="" />
								$_______________ in additional loans
							</td>
							<td class="px-6 py-4 border border-black/20 font-semibold">
								<input type="checkbox" name="" id="" />
								$_______________ in additional loans
							</td>
						</tr>
					</tbody>
				</table>
				<br />
				<div class="text-xl font-medium">
					<span class="text-xl font-medium">4.)</span> Student Certification -
				</div>
				<p>
					All of the expenses on this form, and related costs as evidenced by the attached documentation, are true to the best of my knowledge. I understand that additional documentation may be
					required in order to process this form at the discretion of the Office of Financial Aid and that submission of this form does not guarantee it will be approved nor does it guarantee that
					requested increases to loans can be processed.
				</p>
				<p>Signatures should be written in black ink or signed via DocuSign. Electronic signatures and/or those generated by tablets/computers are not acceptable.</p>
				<br />
				<div class="flex gap-16">
					<h1>Signature: ____________________________________________________</h1>
					<h1>Date: _______/_______/_______</h1>
				</div>
				<div class="flex items-center gap-3">
					<h1>Advisor Initials:</h1>
					<input class="input rounded-md w-16 h-8" type="text" name="" id="" />
				</div>
				<div class="w-[500px]">
					<span class="grid grid-cols-[1fr_3fr]">
						<h1 class="font-medium">RHACOMM -</h1>
						<section class="flex space-x-4">
							<span class="flex items-center gap-2">
								<input type="radio" name="type2" id="type" value="E&G" />
								<label for="radiob">Yes</label>
							</span>
							<span class="flex items-center gap-2">
								<input type="radio" name="type2" id="type" value="E&G" />
								<label for="radiob">No</label>
							</span>
						</section>
					</span>
				</div>
				<br />
				<button
					class="bg-accSlate text-white/90 py-2 rounded-md w-[150px] text-lg no-print"
					on:click={() => {
						window.print();
					}}>Print</button
				>
			</section>
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
