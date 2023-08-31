<script lang="ts">
  export let value = '';
</script>

<div class="relative">
  <div class="input-group input-group-divider grid-cols-[auto_1fr] rounded-md w-fit">
    <div class="input-group-shim"><box-icon name='search' class="fill-black/30"></box-icon></div>
    <input type="search" placeholder="Search..." bind:value />
  </div>
</div>