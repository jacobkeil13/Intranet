<script lang="ts">
	import type { TrainingSchedule, UserProfile } from '@prisma/client';
	import moment from 'moment';
	import { fly } from 'svelte/transition';

	interface FullTraining extends TrainingSchedule {
		trainers: UserProfile[];
	}

	export let training: FullTraining;
</script>

<section in:fly={{ y: -10, duration: 200 }} out:fly={{ y: -10, duration: 200 }}>
	<div class="border border-red-600 max-w-fit p-3 rounded-md">
		<div class="flex justify-between items-center">
			<h1 class="text-lg text-red-600 font-medium">Upcoming Training - <span class="text-black font-normal">{moment(training.date).format('MMMM Do, YYYY')}</span></h1>
		</div>
		<hr class="my-3" />
		<p class="font-semibold">
			{training.name} -
			<span
				><span class="font-normal">presented by </span>{training.trainers
					.map((user) => {
						return user.first_name;
					})
					.join(' / ')}</span
			>
		</p>
	</div>
</section>
