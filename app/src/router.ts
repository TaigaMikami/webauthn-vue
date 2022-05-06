import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";
import Home from "@/pages/home.vue";
import Authentication from "@/pages/authentication.vue";

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: "/",
    name: "Home",
    component: Home
  },
  {
    path: "/authentication",
    name: "Authentication",
    component: Authentication
  }
];

export default new VueRouter({
  routes
});
