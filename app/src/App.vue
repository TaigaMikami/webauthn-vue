<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png" />
    <button @click="checkBrowserSupportsWebAuth">
      checkBrowserSupportsWebAuth
    </button>
    <button @click="generateRegistrationOptions">
      generateRegistrationOptions
    </button>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { browserSupportsWebAuthn } from "@/lib/webauthn/helpers/browserSupportsWebAuthn";

export default Vue.extend({
  name: "App",
  methods: {
    checkBrowserSupportsWebAuth() {
      console.log(browserSupportsWebAuthn());
    },
    async generateRegistrationOptions() {
      const resp = await fetch("http://localhost:8081/generate-registration-options");
      const opts = await resp.json();
      console.log(opts);
    }
  }
});
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
