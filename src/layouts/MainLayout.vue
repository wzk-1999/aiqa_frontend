<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="q-pr-md">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title> 帮助中心 </q-toolbar-title>

        <div>登录邮箱</div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-scroll-area class="fit">
        <q-list>
          <q-item-label header>
            <img
              src="../assets/cstcloud_logo.png"
              alt="logo"
              style="height: 2rem"
            />
          </q-item-label>
          <q-item clickable v-ripple>
            <q-item-section>新会话</q-item-section>
            <q-item-section avatar>
              <q-icon color="primary" name="add" />
            </q-item-section>
          </q-item>

          <q-separator class="q-mb-md" />
          <EssentialLink
            v-for="(link, index) in linksList"
            :title="link.title"
            :caption="link.caption"
            :icon="link.icon"
            :link="link.link"
            :key="index"
          />
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from "vue";
import EssentialLink from "components/EssentialLink.vue";

defineOptions({
  name: "MainLayout",
});

const linksList = [
  {
    title: "常用链接1",
    caption: "chat.quasar.dev",
    icon: "chat",
    link: "https://chat.quasar.dev",
  },
  {
    title: "常用链接2",
    caption: "forum.quasar.dev",
    icon: "record_voice_over",
    link: "https://forum.quasar.dev",
  },
  {
    title: "常用链接3",
    caption: "@quasarframework",
    icon: "rss_feed",
    link: "https://twitter.quasar.dev",
  },
  {
    title: "常用链接4",
    caption: "@QuasarFramework",
    icon: "public",
    link: "https://facebook.quasar.dev",
  },
];

const leftDrawerOpen = ref(false);

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}
</script>
