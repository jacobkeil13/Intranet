<script lang="ts">
  export let href: string = "/";
  export let target: "_blank" | "_self" = "_self";
  export let border: "border-y" | "border-b" | "border-none" = "border-none";
  export let label: string;
  export let icon: string;
</script>

<a {href} {target}  class="flex items-center justify-between {border} {border === "border-none" ? "": "p-4 border-white/10"} duration-100 cursor-pointer group">
  <h1 class="font-medium text-xl">{label}</h1>
  <div class="flex items-center justify-center w-6 h-6 rounded-full">
    <i class="fa-solid {icon} fa-lg text-white/80 group-hover:text-accApple group-hover:rotate-[10deg] duration-200"></i>
  </div>
</a>