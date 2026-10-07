<template><div class="bg-white px-4 py-3"><p class="text-[10px] font-medium uppercase tracking-wide text-slate-400">{{ label }}</p><p class="mt-0.5 break-words text-sm font-semibold leading-5 text-slate-900">{{ value }}</p></div></template>
<script>export default { name:"OffplanStat", props:{label:{type:String,required:true},value:{type:[String,Number],default:"—"}} };</script>
