<template>
  <h1>TEST</h1>
</template>
  
<script lang="ts">
import { defineComponent } from 'vue';
import { useStore } from '@/common/composables/use-store';

export default defineComponent({
    components: {},
    setup() {
    const store = useStore();
    return {
        store,
    };
    },
    props: {},
});
</script>

<style scoped lang="scss">
@import '@/common/styles/variables.scss';
@import '@/common/styles/mixins.scss';
// Mobile styles here

@include desktop {
}
</style>
