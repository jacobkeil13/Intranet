<div class="flex justify-between items-center">
	<slot name="title" />
	<div class="flex justify-center items-center gap-2">
		<slot name="title-right" />
	</div>
</div>
<br />
<section class="flex flex-wrap items-center gap-2 rounded-md w-fit">
	<slot name="filters" />
</section>
<br />
<slot name="content" />
