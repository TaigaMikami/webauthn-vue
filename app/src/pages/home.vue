<template>
  <div class="container">
    <b-jumbotron header="WebAuthn-Vue" lead="">
      <img alt="Vue logo" src="../assets/logo.png" />
      <hr class="ma-4" />
    </b-jumbotron>
    <div>
      <b-card title="Card title"> </b-card>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "Home",
  computed: {
    logo() {
      return "@/assets/logo.png";
    }
  },
  methods: {}
});
</script>
