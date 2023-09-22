<script lang="ts">
  export let value = '';
  export let width = 'w-fit';
</script>

<div class="relative">
  <div class="input-group input-group-divider grid-cols-[auto_1fr] rounded-md {width} bg-transparent">
    <div class="input-group-shim bg-transparent"><i class="fa-solid fa-magnifying-glass text-black/60"></i></div>
    <input spellcheck="false" type="search" placeholder="Search..." bind:value />
  </div>
</div>