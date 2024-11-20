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
            <img src="/cstcloud_logo.png" alt="logo" style="height: 2rem" />
          </q-item-label>
          <q-item v-ripple>
            <q-item-section>
              <q-btn-dropdown
                color="primary"
                rounded
                push
                glossy
                padding="0.5rem"
              >
                <template v-slot:label>
                  <div class="row items-center no-wrap">
                    <q-icon left name="add" class="q-mr-lg" />
                    <div
                      class="text-center q-mx-md"
                      style="letter-spacing: 0.8rem"
                    >
                      新建会话
                    </div>
                  </div>
                </template>
                <q-list>
                  <q-item clickable v-close-popup @click="startNewSession">
                    <q-item-section avatar>
                      <q-avatar
                        icon="fa-solid fa-question"
                        color="primary"
                        text-color="white"
                      />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>邮件问答</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item clickable v-close-popup>
                    <q-item-section avatar>
                      <q-avatar
                        icon="fa-regular fa-envelope"
                        color="secondary"
                        text-color="white"
                      />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>垃圾邮件识别</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-btn-dropdown></q-item-section
            >
            <!-- <q-item-section avatar>
              <q-icon color="primary" name="add" @click="startNewSession" />
            </q-item-section> -->
          </q-item>

          <q-separator class="q-mb-md q-mt-sm" />
          <RecentChat
            v-for="(chat, index) in ChatList"
            :title="chat.title"
            :icon="chat.icon"
            :link="chat.link"
            :key="index"
            :isActive="chat.isActive"
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
import { ref, computed } from "vue";
import RecentChat from "src/components/RecentChat.vue";
import { useRouter } from "vue-router";
import { useSessionStore } from "../stores/session_ids";

const sessionStore = useSessionStore();
const router = useRouter();
const session_ids = sessionStore.session_ids;

const startNewSession = () => {
  // console.log(session_ids);
  // 执行路由跳转
  router.push({
    path: `/chat/${session_ids.length}`,
  });
};

defineOptions({
  name: "MainLayout",
});

const ChatList = computed(() => {
  const currentChatId =
    router.currentRoute.value.params.current_session_index !== ""
      ? parseInt(router.currentRoute.value.params.current_session_index, 10)
      : 0;
  return session_ids.map((_, index) => ({
    title: `会话${index + 1}`,
    icon: "chat",
    link: `/chat/${index}`,
    isActive: currentChatId === index,
  }));
});

const leftDrawerOpen = ref(false);

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}
</script>
