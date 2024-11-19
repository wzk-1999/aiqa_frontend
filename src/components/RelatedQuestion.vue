<template>
  <div
    style="display: flex; flex-direction: column"
    class="q-mt-md q-ml-none q-pl-none"
  >
    <q-separator />
    <q-item class="text-subtitle2 q-pb-none q-pl-xs" style="min-height: 1rem"
      >您可能想知道</q-item
    >

    <q-item
      v-for="(relatedQuestion, index) in relatedQuestions"
      :key="index"
      class="dense q-pl-xs"
      style="min-height: 0.8rem"
    >
      <q-item-section
        avatar
        class="q-ma-none q-pa-none"
        style="min-width: 2rem"
      >
        <q-icon name="mdi-lightbulb-on-outline" />
      </q-item-section>
      <q-item-section
        @mouseenter="highlightQuestion(index)"
        @mouseleave="unhighlightQuestion(index)"
        style="margin-right: 0rem"
        :class="{
          'cursor-pointer text-blue-14 rounded-borders': isHovered[index],
        }"
        @click="recordClickedQuestionIndex(index)"
      >
        <q-item-label>{{ relatedQuestion.question }}</q-item-label>
      </q-item-section>
    </q-item>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useclickedQuestionIndexStore } from "../stores/clickedQuestionIndex";

defineOptions({
  name: "RelatedQuestion",
});

const props = defineProps({
  relatedQuestions: {
    type: Array,
    required: true,
    default: () => [],
  },
});

const isHovered = ref(Array(props.relatedQuestions.length).fill(false));

const recordClickedQuestionIndex = (index) => {
  // 获取Pinia store实例
  const clickedQuestionIndexStore = useclickedQuestionIndexStore();
  // 使用store的方法设置点击问题的索引
  clickedQuestionIndexStore.setClickedQuestionIndex(index);
  // console.log(clickedQuestionIndexStore.clickedQuestionIndex);
};

const highlightQuestion = (index) => {
  isHovered.value[index] = true;
};

const unhighlightQuestion = (index) => {
  isHovered.value[index] = false;
};
</script>
