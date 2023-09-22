<script lang="ts">
  export let content: string;
  let copied = false;

  function copyText(text: string) {
    copied = true;
    navigator.clipboard.writeText(text);
    setTimeout(() => {
      copied = false; 
    }, 5000)
  }
</script>

<div class="relative">
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  {#if !copied}
    <i on:click={() => { copyText(content) }}
      class="fa-solid fa-copy duration-150 text-accSlate/70 hover:text-accSlate cursor-pointer absolute top-2 right-2 z-50"
    ></i>
  {:else}
    <i class="fa-solid fa-check duration-150 text-usfGreen cursor-pointer absolute top-2 right-2"></i>
  {/if}
  <slot name="textarea" />
</div>