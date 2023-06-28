<script lang="ts">
	import { type ModalSettings, modalStore } from "@skeletonlabs/skeleton";

  const isQueueModal: ModalSettings = {
	  type: 'component',
	  component: 'isQueueModal',
  };

  function openModal() {
    modalStore.trigger(isQueueModal);
  }
</script>

<button on:click={openModal}>Create new request</button>