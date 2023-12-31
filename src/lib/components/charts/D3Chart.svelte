<script>
	import * as d3 from 'd3';
	import moment from 'moment';

	// Receive plot data as prop.
	export let data;

	// The chart dimensions and margins as optional props.
	export let width = 1500;
	export let height = 300;
	export let marginTop = 30;
	export let marginRight = 30;
	export let marginBottom = 30;
	export let marginLeft = 30;

	// Create the x (horizontal position) scale.
	const xScale = d3.scaleUtc(
		d3.extent(data, (d) => new Date(d.date)),
		[marginLeft, width - marginRight]
	);

	// Create the y (vertical position) scale.
	const yScale = d3.scaleLinear([0, d3.max(data, (d) => d.visits)], [height - marginBottom, marginTop]);

	// Create the line generator.
	const line = d3
		.line()
		.x((d) => xScale(new Date(d.date)))
		.y((d) => yScale(d.visits));

	const uniqueHours = new Set(data.map((d) => moment(d.date).hour())).size * 2;
</script>

<svg {width} {height} viewBox="0 0 {width} {height}" style:max-width="100%" style:height="auto">
	<!-- X-Axis -->
	<g transform="translate(0,{height - marginBottom})">
		<line stroke="currentColor" x1={marginLeft - 6} x2={width} />

		{#each xScale.ticks(uniqueHours) as tick}
			<!-- X-Axis Ticks -->
			<line stroke="currentColor" x1={xScale(tick)} x2={xScale(tick)} y1={0} y2={6} />

			<!-- X-Axis Tick Labels -->
			<text fill="currentColor" text-anchor="middle" x={xScale(tick)} y={22}>
				{moment(tick).format('hA')}
			</text>
		{/each}
	</g>

	<!-- Y-Axis and Grid Lines -->
	<g transform="translate({marginLeft},0)">
		{#each yScale.ticks() as tick}
			{#if tick !== 0}
				<!-- 
          Grid Lines. 
          Note: First line is skipped since the x-axis is already present at 0. 
        -->
				<line stroke="currentColor" stroke-opacity="0.1" x1={0} x2={width - marginLeft} y1={yScale(tick)} y2={yScale(tick)} />

				<!-- 
          Y-Axis Ticks. 
          Note: First tick is skipped since the x-axis already acts as a tick. 
        -->
				<line stroke="currentColor" x1={0} x2={-6} y1={yScale(tick)} y2={yScale(tick)} />
			{/if}

			<!-- Y-Axis Tick Labels -->
			<text fill="currentColor" text-anchor="end" dominant-baseline="middle" x={-9} y={yScale(tick)}>
				{tick}
			</text>
		{/each}

		<!-- Y-Axis Label -->
		<text fill="currentColor" text-anchor="start" x={-marginLeft} y={15}> Visits </text>
	</g>

	<path fill="none" stroke="steelblue" stroke-width="1.5" d={line(data)} />
</svg>
