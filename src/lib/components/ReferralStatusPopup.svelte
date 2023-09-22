<script lang="ts">
	import type { Referral } from "@prisma/client";
	import { popup } from "@skeletonlabs/skeleton";
  export let referral: Referral;
  let id: string = crypto.randomUUID();
</script>

<div
  class:bg-red-600={referral.escalationUser !== null}
  class:bg-orange-400={referral.researchUser !== null}
  class="rounded-full h-5 w-5 [&>*]:pointer-events-none cursor-pointer"
  use:popup={{
    event: 'hover',
    target: 'popup' + id.replaceAll("-", ""),
    placement: 'left'
  }}
></div>
{#if referral.escalationUser || referral.researchUser}
  <div 
    class="card p-4 bg-usfGreen" data-popup={'popup' + id.replaceAll("-", "")}
  >
    <p class="text-white/80 font-semibold">{referral.referralType ?? ""}</p>
    <p class="text-white/80">{referral.researchUser === null ? referral.escalationUser : referral.researchUser}</p>
    <div class="arrow bg-usfGreen" />
  </div>
{/if}