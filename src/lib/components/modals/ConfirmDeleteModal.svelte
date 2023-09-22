<script lang="ts">
	import { getModalStore } from '@skeletonlabs/skeleton';

  let modalStore = getModalStore();
  function onChoice(r: boolean) {
    if ($modalStore[0] !== undefined) {
      $modalStore[0].meta.response(r);
    }
    modalStore.close();
  }
</script>

<section class="w-[40rem] max-h-[calc(100%_-_5rem)] overflow-y-auto bg-usfWhite p-4 rounded-md">
	<div class="flex flex-col justify-between">
		<h1 class="text-xl text-usfGreen font-medium">Please Confirm</h1>
    <p class="mt-5 text-lg font-medium">Are you sure you want to delete this item?</p>
	</div>
	<br />
  <footer class="float-right mt-3">
    <button on:click={() => onChoice(false)} type="submit" class="btn font-semibol bg-accSlate/70 text-usfWhite rounded-md">
      Cancel
    </button>
    <button on:click={() => onChoice(true)} type="submit" class="btn bg-accSlate text-white/90 rounded-md">
      Confirm
    </button>
  </footer>
</section>