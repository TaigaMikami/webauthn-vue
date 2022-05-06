import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";
import Home from "@/pages/home.vue";

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: "/",
    name: "Home",
    component: Home
  }
];

export default new VueRouter({
  routes
});
