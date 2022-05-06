<template>
  <div class="container">
    <b-jumbotron header="WebAuthn-Vue" lead="">
      <img alt="Vue logo" src="../assets/logo.png" />
      <hr class="ma-4" />
      <h1>Login Success!</h1>
      <b-button variant="success" @click="goToAuthentication">
        Authentication
      </b-button>
    </b-jumbotron>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "Home",
  methods: {
    goToAuthentication() {
      this.$router.push({ name: "Authentication" });
    }
  }
});
</script>
