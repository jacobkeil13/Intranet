<script lang="ts">
	import type { Placement } from '@floating-ui/dom';
	import { popup, type PopupSettings } from '@skeletonlabs/skeleton';
	let id: string = crypto.randomUUID();
	export let pointer: string = '[&>*]:pointer-events-none cursor-pointer';
	export let bgColor: string = 'bg-usfGreen';
	export let width: string = 'w-fit';
	export let eventType: 'click' | 'hover' | 'focus-blur' | 'focus-click' = 'hover';
	export let offset: number | Record<string, any> | undefined = 10;
	export let placement: Placement | undefined = 'left';
	export let event: PopupSettings = {
		event: eventType,
		target: 'popup' + id.replaceAll('-', ''),
		placement,
		middleware: {
			offset
		}
	};
</script>

<div class="{pointer} {width}" use:popup={event}>
	<slot name="content" />
</div>
<div class="card p-4 {bgColor} {width} z-50" data-popup={'popup' + id.replaceAll('-', '')}>
	<slot name="popup" />
	<div class="arrow {bgColor}" />
</div>
