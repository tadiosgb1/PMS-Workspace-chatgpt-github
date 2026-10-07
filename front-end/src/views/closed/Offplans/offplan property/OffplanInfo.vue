<template><div><p class="text-[10px] font-medium uppercase tracking-wide text-slate-400">{{ label }}</p><p class="mt-0.5 break-words text-xs font-semibold leading-5 text-slate-800">{{ value }}</p></div></template>
<script>export default { name:"OffplanInfo", props:{label:{type:String,required:true},value:{type:[String,Number],default:"—"}} };</script>
