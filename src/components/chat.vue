<template>
  <div class="container">
    <div class="control">
      <input class="textarea title" v-model="newMessage" v-on:keyup.enter="addMessage" autofocus="true" />
    </div>
  
    <div class="columns is-vcentered is-mobile" v-for="message of messages" :key="message.id" transition="expand">
      <div class="column is-narrow">
        <img height="50px" width="50px" :src="message.doc.url" />
      </div>
      <div class="column">
          {{ message.doc.text }}
      </div>
       <div class="column is-narrow datetime is-hidden-mobile">
          {{ message.doc.replicated ? '(Remote)' : '(Local)'  }}
      </div> 
      <div class="column is-narrow datetime is-hidden-mobile">
          {{message.doc._id}}
      </div> 
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Provide } from "vue-property-decorator";
import { Message } from "../state/message";
import { State, Getter, Action, Mutation, namespace } from "vuex-class";

@Component
export default class Chat extends Vue {
  @State("messages") messages: Message[];
  @State("avatar_url") avatar: string;
  @Mutation("storeMessage") storeMessage: (message: Message) => void;

  @Provide() newMessage: String = "";
  addMessage() {
    var text = this.newMessage.trim();
    if (text) {
      let message: Message = {
        text: text,
        _id: new Date().toISOString(),
        url: this.avatar
      };

      this.storeMessage(message);
      this.newMessage = "";
    }
  }
}
</script>
<<style>
.datetime {
  color: darkgrey;
}
.control{
  margin-bottom: 20px;
}
</style>