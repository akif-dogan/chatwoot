<script setup>
import HeaderActions from './HeaderActions.vue';
import { computed } from 'vue';
import { useMessageFormatter } from 'shared/composables/useMessageFormatter';

const props = defineProps({
  avatarUrl: {
    type: String,
    default: '',
  },
  introHeading: {
    type: String,
    default: '',
  },
  introBody: {
    type: String,
    default: '',
  },
  showPopoutButton: {
    type: Boolean,
    default: false,
  },
});

const { formatMessage } = useMessageFormatter();

const containerClasses = computed(() => [
  props.avatarUrl ? 'justify-between' : 'justify-end',
]);
</script>

<template>
  <header
    class="header-expanded pt-6 pb-5 px-5 relative box-border w-full"
    style="background: linear-gradient(135deg, #1e3a8a, #2563eb); border-radius: 0 0 16px 16px;"
  >
    <div class="flex items-start" :class="containerClasses">
      <div class="flex items-center gap-3">
        <img
          v-if="avatarUrl"
          class="h-12 rounded-full ring-2 ring-white/30"
          :src="avatarUrl"
          alt="Avatar"
        />
        <div v-if="!avatarUrl" class="flex items-center justify-center h-12 w-12 rounded-full bg-white/20 text-white text-lg font-bold">
          M
        </div>
      </div>
      <HeaderActions
        :show-popout-button="showPopoutButton"
        :show-end-conversation-button="false"
      />
    </div>
    <h2
      v-dompurify-html="introHeading"
      class="mt-4 text-2xl mb-1.5 font-semibold text-white line-clamp-4"
    />
    <p
      v-dompurify-html="formatMessage(introBody)"
      class="text-base leading-normal text-white/80 [&_a]:underline line-clamp-6"
    />
    <div class="flex items-center gap-2 mt-3">
      <span class="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
      <span class="text-xs text-white/70 font-medium">AI assistant online — typically replies instantly</span>
    </div>
  </header>
</template>
