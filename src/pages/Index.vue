<template>
  <q-page class="flex flex-center justify-around">
    <!-- <img alt="Quasar logo" src="~assets/quasar-logo-full.svg" /> -->
    <q-btn color="primary" label="Floder" @click="$router.push('/floder')" />
    <q-btn label="History" @click="$router.push('/history')" />
    <q-btn color="primary" label="Video" @click="$router.push('/video')" />
  </q-page>
</template>

<script>
export default {
  name: "PageIndex",
  mounted() {}
};
</script>
