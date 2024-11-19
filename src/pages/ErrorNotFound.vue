<template>
  <div
    class="fullscreen bg-blue text-white text-center q-pa-md flex flex-center"
  >
    <div>
      <div style="font-size: 30vh">404</div>

      <div class="text-h2" style="opacity: 0.4">Oops. Nothing here...</div>
      <router-link to="/chat/">
        <q-btn
          class="q-mt-xl"
          color="white"
          text-color="blue"
          unelevated
          label="Go Home"
          no-caps
        />
      </router-link>
    </div>
  </div>
</template>

<script setup>
defineOptions({
  name: "ErrorNotFound",
});
</script>
