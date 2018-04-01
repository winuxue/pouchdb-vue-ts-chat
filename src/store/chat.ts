import Vue from "vue";
import Vuex from "vuex";
import { Message } from "../state/message";

Vue.use(Vuex);

import PouchDB from "pouchdb-browser";
const chat = new PouchDB("chat");

const store = new Vuex.Store({
  state: {
    messages: [],
    avatar_url: ""
  },
  mutations: {
    storeMessage(state: any, msg: Message) {
      //chat.post(msg).then(
      chat.put(msg).then(
        function(msg: any) {
          console.log("Successfully posted a message!");
        },
        function(err: any) {
          console.log("post err:");
          console.dir(err);
        }
      );
    },
    setMessages(state: any, msgs: Message[]) {
      state.messages = msgs;
    },
    setAvatar(state: any, url: string) {
      state.avatar_url = url;
    }
  }
});

function getMessages() {
  chat.allDocs({ include_docs: true, descending: true }).then(
    function(msgs: any) {
      console.log(msgs);
      store.commit("setMessages", msgs.rows);
    },
    function(err: any) {
      console.log("alldocs err:");
      console.dir(err);
    }
  );
}

chat
  .changes({
    since: "now",
    live: true
  })
  .on("change", function() {
    console.log("change event fired");
    getMessages();
  });

getMessages();
export default store;
