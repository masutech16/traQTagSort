<template>
  <div>
    <h1>traQ タグソートアプリ</h1>
    <p>traQのタグをソートします。ソートするたびにリクエストがタグの数*4個飛ぶのであまりたくさんは使わないでください。</p>
    <draggable v-if="!isSending" v-model="tags" element="ul" :options="{animation:300}">
      <li v-for="tag in tags" :key="tag.tagId">{{ tag.tag }}</li>
    </draggable>
    <button v-if="!isSending" v-on:click="updateTag">ソート！</button>
    <div v-if="isSending">
      <p>更新中…: {{ countNum }}/{{ tags.length }}</p>
    </div>
    <div v-if="isComplete">
      <p>ソートが完了しました！</p>
    </div>
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
      me: {},
      isSending: false,
      isComplete: false,
      countNum: 0
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
    const res = await api.getMe();
    this.me = res.data;
    await this.getTags();
  },
  methods: {
    async getTags() {
      try {
        const res = await api.getUserTags(this.me.userId);
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
    },

    async updateTag() {
      /* eslint-disable */
      this.isSending = true;
      const userId = this.me.userId;
      for (const tag of this.tags) {
        const tagId = tag.tagId;
        if (tag.isLocked) {
          await api.unlockTag(userId, tagId).catch(e => {
            console.log(`unlock error: ${e}`);
            return;
          });
        }
        await api.deleteTag(userId, tagId).catch(e => {
          console.log(`delete error: ${e}`);
          return;
        });

        await api.addTag(userId, tag.tag).catch(e => {
          console.log(`add error: ${e}`);
          return;
        });

        if (tag.isLocked) {
          await api.lockTag(userId, tagId).catch(e => {
            console.log(`lock error: ${e}`);
            return;
          });
        }
        this.countNum++;
      }
      this.isComplete = true;
    }
  }
};
</script>
