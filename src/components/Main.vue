<template>
  <div>
    <h1>traQ タグソートアプリ</h1>
    <p>traQのタグをソートします。ソートするたびにリクエストがタグの数*3個飛ぶのであまりたくさんは使わないでください。</p>
    <draggable v-model="tags" element="ul" :options="{animation:300}">
      <li v-for="tag in tags" :key="tag.tagId">{{ tag.tag }}</li>
    </draggable>
    <button>ソート！</button>
  </div>
</template>



<script>
import api from "../api";
import draggable from "vuedraggable";
export default {
  name: "Main",
  components: {
    draggable
  },
  data() {
    return {
      tags: [],
      me: {}
    };
  },
  async created() {
    const token = localStorage.getItem("accessToken");
    if (token) {
      api.setAuthToken(token);
      return;
    }

    const params = this.getQueryParams(location.search);
    if (params["code"] && params["state"]) {
      const code = params["code"];
      const state = params["state"];
      const codeVerifier = localStorage.getItem(`login-code-verifier-${state}`);
      if (!code || !codeVerifier) {
        api.redirectAuthorizationEndpoint();
        return;
      }

      try {
        const res = await api.fetchAuthToken(code, codeVerifier);
        localStorage.setItem("accessToken", res.data.access_token);
      } catch (e) {
        // eslint-disable-next-line
        console.error(e);
      }
    } else {
      api.redirectAuthorizationEndpoint();
    }
  },
  async mounted() {
    this.me = await api.getMe();
    await this.getTags();
  },
  methods: {
    async getTags() {
      try {
        const res = await api.getUserTags(this.me.data.userId);
        this.tags = res.data;
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
