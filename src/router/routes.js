const routes = [
  {
    path: "/chat/:current_session_index(\\d+)?",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      {
        path: "",
        component: () => import("pages/IndexPage.vue"),
      },
    ],
    beforeEnter: (to, from, next) => {
      // console.log(to.params.current_session_index);
      const current_session_index =
        to.params.current_session_index !== ""
          ? parseInt(to.params.current_session_index, 10)
          : null;
      const session_ids =
        JSON.parse(sessionStorage.getItem("session_ids")) || [];

      if (
        current_session_index === null || // Allow if no parameter (for "/chat")
        (!isNaN(current_session_index) &&
          current_session_index >= 0 &&
          current_session_index <= session_ids.length)
      ) {
        next();
      } else {
        next({ path: "/error-not-found" });
      }
    },
  },
  {
    path: "/error-not-found",
    component: () => import("pages/ErrorNotFound.vue"),
  },
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
