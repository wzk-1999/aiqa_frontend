import { defineStore } from "pinia";

export const useclickedQuestionIndexStore = defineStore(
  "clickedQuestionIndex",
  {
    state: () => ({
      clickedQuestionIndex: null,
    }),
    actions: {
      setClickedQuestionIndex(index) {
        this.clickedQuestionIndex = index;
      },
    },
  }
);
