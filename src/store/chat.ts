import Vue from "vue";
import Vuex from "vuex";
import { Message } from "../state/message";

Vue.use(Vuex);

import PouchDB from "pouchdb-browser";
const chat = new PouchDB("'http://localhost:5984/chat");

const chatStore = new Vuex.Store({
  state: {
    messages: [],
    avatar_url: ""
  },
  mutations: {
    async storeMessage(state: any, msg: Message) {
      try {
        //chat.post(msg).then(
        let response = await chat.put(msg);
      } catch (err) {
        console.log("post err:");
        console.dir(err);
      }
    },
    setMessages(state: any, msgs: Message[]) {
      state.messages = msgs;
    },
    setAvatar(state: any, url: string) {
      state.avatar_url = url;
    }
  }
});

async function getMessages() {
  try {
    let msgs = await chat.allDocs({
      include_docs: true,
      descending: true,
      limit: 10
    });
    chatStore.commit("setMessages", msgs.rows);
  } catch (err) {
    console.log("alldocs err:");
    console.dir(err);
  }
}

chat
  .changes({ since: "now", live: true, include_docs: true })
  .on("change", function(change) {
    chatStore.state.messages.unshift({
      id: change.doc!._id,
      doc: change.doc
    });
  });

getMessages();
export default chatStore;
