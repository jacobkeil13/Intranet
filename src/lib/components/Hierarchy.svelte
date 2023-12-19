<script lang="ts">
	import type { HierarchyUser } from '$lib/types';
	export let person: HierarchyUser;
</script>

{#if person}
	<li>
		<a href="/">
			<span>
				<p style="font-size: 18px">{person.name}</p>
				<p>{person.title}</p>
				<p>{person.phone}</p>
			</span>
		</a>
		{#if person.directReports && person.directReports.length > 0}
			<ul>
				{#each person.directReports as usr (usr.id)}
					<svelte:self person={usr} />
				{/each}
			</ul>
		{/if}
	</li>
{/if}

<style>
	li {
		display: inline-table;
		text-align: center;
		list-style-type: none;
		position: relative;
		padding: 10px;
		transition: 0.5s;
	}
	li::before,
	li::after {
		content: '';
		position: absolute;
		top: 0;
		right: 50%;
		border-top: 1px solid #ccc;
		width: 51%;
		height: 10px;
	}
	li::after {
		right: auto;
		left: 50%;
		border-left: 1px solid #ccc;
	}
	li:only-child::after,
	li:only-child::before {
		display: none;
	}
	li:only-child {
		padding-top: 0;
	}
	li:first-child::before,
	li:last-child::after {
		border: 0 none;
	}
	li:last-child::before {
		border-right: 1px solid #ccc;
		border-radius: 0 5px 0 0;
		-webkit-border-radius: 0 5px 0 0;
		-moz-border-radius: 0 5px 0 0;
	}
	li:first-child::after {
		border-radius: 5px 0 0 0;
		-webkit-border-radius: 5px 0 0 0;
		-moz-border-radius: 5px 0 0 0;
	}
	li a {
		border: 1px solid #ccc;
		padding: 20px;
		display: inline-grid;
		border-radius: 5px;
		text-decoration-line: none;
		border-radius: 5px;
		transition: 0.5s;
	}
	li a span {
		color: #666;
		padding: 8px;
		font-size: 12px;
		text-transform: uppercase;
		letter-spacing: 1px;
		font-weight: 500;
	}
	li a:hover,
	li a:hover + ul li a {
		background: #c8e4f8;
		color: #000;
		border: 1px solid #94a0b4;
	}
	li a:hover + ul::before,
	li a:hover + ul ul::before {
		border-color: #94a0b4;
	}
</style>
