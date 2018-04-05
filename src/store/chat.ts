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
        //chat.post(msg)
        let response = await chat.put(msg);
      } catch (err) {
        alert("Message was not sent");
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
    last_seq = Number(last_seq) - 1;
    console.log("alldocs err:");
    console.dir(err);
  }
}

var last_seq: string | number;
let changes: PouchDB.Core.Changes<Message>;
async function feedChanges() {
  try {
    changes = chat.changes<Message>({
      since: last_seq,
      live: true
    });
    changes.on("change", function(
      change: PouchDB.Core.ChangesResponseChange<Message>
    ) {
      console.log("changes on change:");
      console.log(change);

      last_seq = change.seq;
      getMessages();
    });
    changes.on("complete", function(
      info: PouchDB.Core.ChangesResponse<Message>
    ) {
      // changes() was canceled
      console.log("changes on complete:");
      console.log(info);
      console.log("changes:");
      console.log(changes);
    });
    changes.on("error", function(err) {
      console.log("changes on error:");
      console.log(err);
      console.log("changes:");
      console.log(changes);

      //needed because changes doesn't have retry option
      changes.cancel();
      setTimeout(feedChanges, 5 * 1000);
    });
  } catch (err) {
    //needed because changes doesn't have retry option
    changes.cancel();
    setTimeout(feedChanges, 5 * 1000);
  }
}

chat
  .info()
  .then(function(result) {
    console.log("PouchDB database info:");
    console.log(result);

    last_seq = result.update_seq;
    feedChanges();
    getMessages();
  })
  .catch(function(err) {
    console.log(err);
  });

export default chatStore;
