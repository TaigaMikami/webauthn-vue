<template>
  <div class="container">
    <b-jumbotron header="WebAuthn-Vue" lead="">
      <img alt="Vue logo" src="../assets/logo.png" />
      <hr class="ma-4" />
    </b-jumbotron>
    <div>
      <b-card title="Registration">
        <b-form-group
          class="my-2"
          id="input-group-user"
          label="User ID"
          label-for="input-user-id"
        >
          <b-form-input
            id="input-user-id"
            v-model="userId"
            type="text"
            placeholder="Enter User ID"
            required
          ></b-form-input>
        </b-form-group>
        <b-button variant="success" @click="registration">
          Registration
        </b-button>
      </b-card>

      <b-card title="Authentication">
        <b-form-group
          class="my-2"
          id="input-group-login-user"
          label="User ID"
          label-for="input-login-user-id"
        >
          <b-form-input
            id="input-login-user-id"
            v-model="loginUserId"
            type="text"
            placeholder="Enter User ID"
            required
          ></b-form-input>
        </b-form-group>
        <b-button variant="primary" @click="authentication">
          authentication
        </b-button>
      </b-card>

      <b-card title="Check Browser Supports WebAuth">
        <b-button @click="checkBrowserSupportsWebAuth">
          checkBrowserSupportsWebAuth
        </b-button>
      </b-card>

      <b-card title="Check DB">
        <b-button @click="checkDB">
          checkDB
        </b-button>
      </b-card>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { browserSupportsWebAuthn } from "@/lib/webauthn/helpers/browserSupportsWebAuthn";
import startRegistration from "@/lib/webauthn/registration/startRegistration";
import startAuthentication from "@/lib/webauthn/authentication/startAuthentication";

export default Vue.extend({
  name: "Authentication",
  data() {
    return {
      userId: "",
      loginUserId: ""
    };
  },
  methods: {
    async checkDB() {
      console.log("check");
      const resp = await fetch("/in-memory");
      const json = await resp.json();
      console.log(json);
    },
    checkBrowserSupportsWebAuth() {
      console.log(browserSupportsWebAuthn());
    },
    async registration() {
      const resp = await fetch("/generate-registration-options", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ userId: this.userId })
      });
      const opts = await resp.json();
      console.log(opts);

      const attResp = await startRegistration(opts);
      console.log(attResp);

      const reqAtt = { ...attResp, userId: this.userId };
      const verificationResp = await fetch("/verify-registration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(reqAtt)
      });
      const verificationJSON = await verificationResp.json();
      console.log(verificationJSON);
    },
    async authentication() {
      const resp = await fetch("/generate-authentication-options", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ userId: this.loginUserId })
      });
      const opts = await resp.json();
      console.log(opts);

      const attResp = await startAuthentication(opts);
      const reqAtt = { ...attResp, userId: this.loginUserId };
      const verificationResp = await fetch("/verify-authentication", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(reqAtt)
      });
      const verificationJSON = await verificationResp.json();
      console.log(verificationJSON);
      if (verificationJSON && verificationJSON.verified) {
        this.$router.push({ name: "Home" });
      }
    }
  }
});
</script>
