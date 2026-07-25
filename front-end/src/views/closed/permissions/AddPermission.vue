<!-- Alias for add.vue — used by PermissionView.vue -->
<template><AddPerm v-bind="$attrs" v-on="$listeners" /></template>
<script>
import AddPerm from "./add.vue";
export default { components: { AddPerm } };
</script>
