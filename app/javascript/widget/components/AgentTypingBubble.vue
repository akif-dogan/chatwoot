<script>
export default {
  name: 'AgentTypingBubble',
};
</script>

<template>
  <div class="agent-message-wrap sticky bottom-1">
    <div class="agent-message">
      <div class="avatar-wrap" />
      <div class="message-wrap mt-2">
        <div
          class="chat-bubble agent typing-bubble bg-n-background dark:bg-n-solid-3"
        >
          <div class="marsai-typing-dots">
            <span class="marsai-typing-dot" />
            <span class="marsai-typing-dot" />
            <span class="marsai-typing-dot" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.typing-bubble {
  @apply max-w-[2.8rem] p-2 ltr:rounded-bl-[1.25rem] rtl:rounded-br-[1.25rem] ltr:rounded-tl-lg rtl:rounded-tr-lg;
}
</style>
