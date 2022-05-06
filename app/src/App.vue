<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png" />
    <button @click="checkBrowserSupportsWebAuth">
      checkBrowserSupportsWebAuth
    </button>
    <button @click="generateRegistrationOptions">
      generateRegistrationOptions
    </button>
    <button @click="checkDB">
      checkDB
    </button>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { browserSupportsWebAuthn } from "@/lib/webauthn/helpers/browserSupportsWebAuthn";
import startRegistration from "@/lib/webauthn/registration/startRegistration";

export default Vue.extend({
  name: "App",
  methods: {
    async checkDB() {
      console.log("check");
      const resp = await fetch(
        "http://localhost:8081/in-memory"
      );
      const json = await resp.json();
      console.log(json);
    },
    checkBrowserSupportsWebAuth() {
      console.log(browserSupportsWebAuthn());
    },
    async generateRegistrationOptions() {
      const resp = await fetch(
        "http://localhost:8081/generate-registration-options"
      );
      const opts = await resp.json();
      console.log(opts);

      const attResp = await startRegistration(opts);
      console.log(attResp);

      const verificationResp = await fetch(
        "http://localhost:8081/verify-registration", 
        {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(attResp),
      });
      const verificationJSON = await verificationResp.json();
      console.log(verificationResp);
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
