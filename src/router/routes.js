const routes = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      { path: "", component: () => import("pages/Index.vue") },
      { path: "/floder", component: () => import("pages/FloderList.vue") },
      { path: "/history", component: () => import("pages/History.vue") }
    ]
  },
  { path: "/video", component: () => import("pages/VideoList.vue") },
  // Always leave this as last one,
  // but you can also remove it
  {
    path: "*",
    component: () => import("pages/Error404.vue")
  }
];

export default routes;
