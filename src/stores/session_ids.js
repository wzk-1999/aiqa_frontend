import { defineStore } from "pinia";

export const useSessionStore = defineStore("session", {
  state: () => ({
    session_ids: JSON.parse(sessionStorage.getItem("session_ids")) || [],
  }),

  actions: {
    addSessionId(newId) {
      this.session_ids.push(newId);
      sessionStorage.setItem("session_ids", JSON.stringify(this.session_ids));
    },
  },
});
