<template>
  <div class="container">
    <b-jumbotron header="WebAuthn-Vue" lead="">
      <img alt="Vue logo" src="../assets/logo.png" />
      <hr class="ma-4" />
    </b-jumbotron>
    <div>
      <b-card title="Card title">
        <b-card-text>A second paragraph of text in the card.</b-card-text>
        <b-button variant="primary" @click="generateRegistrationOptions">
          generateRegistrationOptions
        </b-button>
      </b-card>

      <b-card title="Card title">
        <b-card-text>A second paragraph of text in the card.</b-card-text>
        <b-button @click="checkBrowserSupportsWebAuth">
          checkBrowserSupportsWebAuth
        </b-button>
      </b-card>

      <b-card title="Card title">
        <b-card-text>A second paragraph of text in the card.</b-card-text>
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

export default Vue.extend({
  name: "Authentication",
  methods: {
    async checkDB() {
      console.log("check");
      const resp = await fetch("http://localhost:8081/in-memory");
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
            "Content-Type": "application/json"
          },
          body: JSON.stringify(attResp)
        }
      );
      const verificationJSON = await verificationResp.json();
      console.log(verificationJSON);
    }
  }
});
</script>
