import Vue from "vue";
import Vuex from "vuex";
import { Message } from "../state/message";

Vue.use(Vuex);

import PouchDB from "pouchdb-browser";
var remote: PouchDB.Database<{}> = new PouchDB<Message>(
  "http://localhost:5984/chat"
);
var local: PouchDB.Database<{}> = new PouchDB<Message>("chat");

const chatStore = new Vuex.Store({
  state: {
    messages: [],
    avatar_url: ""
  },
  mutations: {
    async storeMessage(state: any, msg: Message) {
      try {
        //chat.post(msg)
        let response = await local.put(msg);
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
    let msgs = await local.allDocs({
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

const localChanges = local.changes({
  since: "now",
  live: true,
  include_docs: true
});

localChanges.on("change", function(change) {
  console.log("local changes on change");
  console.log(change);

  getMessages();
});
var sync = PouchDB.sync(local, remote, {
  live: true,
  retry: true,
  push: {
    filter: function(doc: Message) {
      return !doc.replicated;
    }
  }
});
sync.on("change", function(info: PouchDB.Replication.SyncResult<Message>) {
  console.log("replicate on change");
  console.log(info);

  // if (info.direction == "push") {
  info.change.docs.forEach(function(message) {
    message.replicated = true;
    local.put(message);
  });
  // }
});
sync.on("paused", function(err) {
  if (err) {
    console.log("replicate on paused - offline error?");
    console.log(err);
  } else {
    console.log("replicate on paused - up to date");
  }
});
sync.on("active", function() {
  console.log("replicate on active");
});
sync.on("denied", function(err) {
  console.log("replicate on denied");
  console.log(err);
});
sync.on("complete", function(
  info: PouchDB.Replication.SyncResultComplete<Message>
) {
  console.log("replicate on complete");
  console.log(info);
});
sync.on("error", function(err) {
  console.log("replicate on error");
  console.log(err);
});

PouchDB.on("created", function(dbName) {
  console.log("PouchDB on created: " + dbName);
});
PouchDB.on("destroyed", function(dbName) {
  console.log("PouchDB on destroyed: " + dbName);
});

///////////////////////////////////

// changes.on("complete", function(info) {
//   // changes() was canceled
//   console.log("changes complete:");
//   console.info();
//   console.log("changes:");
//   console.log(changes);
// });
// changes.on("error", function(err) {
//   console.log("changes error:");
//   console.log(err);
//   console.log("changes:");
//   console.log(changes);
//   changes.cancel();
//   setTimeout(liveChanges, 5 * 1000);
// });
////////////////////////////////////
// let changes: PouchDB.Core.Changes<{}>;

// function liveChanges() {
//   console.log("trying to handle change");
// changes = local.changes({ since: "now", live: true, include_docs: true });

// changes.on("change", function(change) {
//   console.log("changes change:");
//   console.log(change);
//   console.log("changes:");
//   console.log(changes);

//   chatStore.state.messages.unshift({
//     id: change.doc!._id,
//     doc: change.doc
//   });
// });
// changes.on("complete", function(info) {
//   // changes() was canceled
//   console.log("changes complete:");
//   console.info();
//   console.log("changes:");
//   console.log(changes);
// });
// changes.on("error", function(err) {
//   console.log("changes error:");
//   console.log(err);
//   console.log("changes:");
//   console.log(changes);
//   changes.cancel();
//   setTimeout(liveChanges, 5 * 1000);
// });
// }
// liveChanges();

getMessages();
export default chatStore;
