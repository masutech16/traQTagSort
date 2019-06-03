<template>
  <div>
    <div v-for="tag in tags" :key="tag.tagId">
      <li>{{ tag.tag }}</li>
      <li>{{ tag.isLocked }}</li>
    </div>
    {{ me }}
  </div>
</template>



<script>
import {
  getMe,
  redirectAuthorizationEndpoint,
  fetchAuthToken,
  setAuthToken
} from "../api";
export default {
  name: "HelloWorld",
  data() {
    return {
      tags: [],
      me: {}
    };
  },
  async created() {
    const token = localStorage.getItem("accessToken");
    if (token) {
      setAuthToken(token);
      return;
    }

    const params = this.getQueryParams(location.search);
    if (params["code"] && params["state"]) {
      const code = params["code"];
      const state = params["state"];
      const codeVerifier = localStorage.getItem(`login-code-verifier-${state}`);
      if (!code || !codeVerifier) {
        redirectAuthorizationEndpoint();
        return;
      }

      try {
        const res = await fetchAuthToken(code, codeVerifier);
        localStorage.setItem("accessToken", res.data.access_token);
      } catch (e) {
        // eslint-disable-next-line
        console.error(e);
      }
    } else {
      redirectAuthorizationEndpoint();
    }
  },
  async mounted() {
    await this.getTags();
  },
  methods: {
    async getTags() {
      try {
        const res = await getMe();
        this.me = res;
      } catch (e) {
        // eslint-disable-next-line
        console.error(e);
      }
    },
    getQueryParams(query) {
      if (query === "") {
        return [];
      }

      const hash = query.slice(1).split("&");
      const vars = [];

      for (var i = 0; i < hash.length; i++) {
        const array = hash[i].split("=");
        vars.push(array[0]);
        vars[array[0]] = array[1];
      }
      return vars;
    }
  }
};
</script>
