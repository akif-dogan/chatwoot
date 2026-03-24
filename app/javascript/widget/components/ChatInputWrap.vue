<script>
import { mapGetters } from 'vuex';

import ChatAttachmentButton from 'widget/components/ChatAttachment.vue';
import ChatSendButton from 'widget/components/ChatSendButton.vue';
import { useAttachments } from '../composables/useAttachments';
import FluentIcon from 'shared/components/FluentIcon/Index.vue';
import ResizableTextArea from 'shared/components/ResizableTextArea.vue';

import EmojiInput from 'shared/components/emoji/EmojiInput.vue';

export default {
  name: 'ChatInputWrap',
  components: {
    ChatAttachmentButton,
    ChatSendButton,
    EmojiInput,
    FluentIcon,
    ResizableTextArea,
  },
  props: {
    onSendMessage: {
      type: Function,
      default: () => {},
    },
    onSendAttachment: {
      type: Function,
      default: () => {},
    },
  },
  setup() {
    const {
      canHandleAttachments,
      shouldShowEmojiPicker,
      hasEmojiPickerEnabled,
    } = useAttachments();
    return {
      canHandleAttachments,
      shouldShowEmojiPicker,
      hasEmojiPickerEnabled,
    };
  },
  data() {
    return {
      userInput: '',
      showEmojiPicker: false,
      isFocused: false,
      showLinkInput: false,
      linkUrl: '',
    };
  },

  computed: {
    ...mapGetters({
      widgetColor: 'appConfig/getWidgetColor',
      isWidgetOpen: 'appConfig/getIsWidgetOpen',
      shouldShowEmojiPicker: 'appConfig/getShouldShowEmojiPicker',
    }),
    showSendButton() {
      return this.userInput.length > 0;
    },
  },
  watch: {
    isWidgetOpen(isWidgetOpen) {
      if (isWidgetOpen) {
        this.focusInput();
      }
    },
  },
  unmounted() {
    document.removeEventListener('keypress', this.handleEnterKeyPress);
  },
  mounted() {
    document.addEventListener('keypress', this.handleEnterKeyPress);
    if (this.isWidgetOpen) {
      this.focusInput();
    }
  },

  methods: {
    onBlur() {
      this.isFocused = false;
    },
    onFocus() {
      this.isFocused = true;
    },
    handleButtonClick() {
      if (this.userInput && this.userInput.trim()) {
        this.onSendMessage(this.userInput);
      }
      this.userInput = '';
      this.focusInput();
    },
    handleEnterKeyPress(e) {
      if (e.keyCode === 13 && !e.shiftKey) {
        e.preventDefault();
        this.handleButtonClick();
      }
    },
    toggleEmojiPicker() {
      this.showEmojiPicker = !this.showEmojiPicker;
    },
    hideEmojiPicker(e) {
      if (this.showEmojiPicker) {
        e.stopPropagation();
        this.toggleEmojiPicker();
      }
    },
    emojiOnClick(emoji) {
      this.userInput = `${this.userInput}${emoji} `;
    },
    onTypingOff() {
      this.toggleTyping('off');
    },
    onTypingOn() {
      this.toggleTyping('on');
    },
    toggleTyping(typingStatus) {
      this.$store.dispatch('conversation/toggleUserTyping', { typingStatus });
    },
    focusInput() {
      this.$refs.chatInput.focus();
    },
    insertLink() {
      if (this.showLinkInput && this.linkUrl.trim()) {
        const url = this.linkUrl.trim();
        this.userInput = `${this.userInput}[link](${url})`;
        this.linkUrl = '';
        this.showLinkInput = false;
        this.focusInput();
      } else {
        this.showLinkInput = !this.showLinkInput;
        if (this.showLinkInput) {
          this.$nextTick(() => {
            const el = this.$refs.linkInput;
            if (el) el.focus();
          });
        }
      }
    },
    cancelLink() {
      this.showLinkInput = false;
      this.linkUrl = '';
      this.focusInput();
    },
    handleLinkKeydown(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.insertLink();
      } else if (e.key === 'Escape') {
        this.cancelLink();
      }
    },
    insertCodeBlock() {
      this.userInput = `${this.userInput}\n\`\`\`\n\n\`\`\``;
      this.focusInput();
    },
    insertFigmaLink() {
      const url = prompt('Figma URL:');
      if (url && url.trim()) {
        this.userInput = `${this.userInput}[Figma Design](${url.trim()})`;
        this.focusInput();
      }
    },
  },
};
</script>

<template>
  <div
    class="flex flex-col rounded-[7px] transition-all duration-200 bg-n-background !shadow-[0_0_0_1px,0_0_2px_3px]"
    :class="{
      '!shadow-[var(--marsai-indigo,#6366F1)]': isFocused,
      '!shadow-n-strong dark:!shadow-n-strong': !isFocused,
    }"
    @keydown.esc="hideEmojiPicker"
  >
    <!-- Textarea row -->
    <div class="flex items-center ltr:pl-3 rtl:pr-3 ltr:pr-2 rtl:pl-2">
      <ResizableTextArea
        id="chat-input"
        ref="chatInput"
        v-model="userInput"
        :rows="1"
        :aria-label="$t('CHAT_PLACEHOLDER')"
        :placeholder="$t('CHAT_PLACEHOLDER')"
        class="user-message-input reset-base"
        @typing-off="onTypingOff"
        @typing-on="onTypingOn"
        @focus="onFocus"
        @blur="onBlur"
      />
    </div>

    <!-- Link URL input (expandable) -->
    <div v-if="showLinkInput" class="flex items-center gap-2 px-3 pb-2">
      <input
        ref="linkInput"
        v-model="linkUrl"
        type="url"
        placeholder="https://..."
        class="flex-1 reset-base text-sm px-2 py-1 rounded-lg bg-n-slate-3 dark:bg-n-alpha-2 text-n-slate-12 outline-none border border-n-weak focus:border-[#6366F1]"
        @keydown="handleLinkKeydown"
      />
      <button class="marsai-toolbar-btn text-xs" @click="insertLink">
        Add
      </button>
      <button class="marsai-toolbar-btn text-xs" @click="cancelLink">
        &times;
      </button>
    </div>

    <!-- Toolbar row -->
    <div
      class="flex items-center justify-between px-2 pb-1.5 pt-0"
    >
      <!-- Left: action buttons -->
      <div class="flex items-center gap-0.5">
        <ChatAttachmentButton
          v-if="canHandleAttachments"
          class="marsai-toolbar-btn"
          :on-attach="onSendAttachment"
        />
        <button
          class="marsai-toolbar-btn"
          title="Insert link"
          @click="insertLink"
        >
          <FluentIcon icon="link" size="14" />
        </button>
        <button
          class="marsai-toolbar-btn"
          title="Insert code block"
          @click="insertCodeBlock"
        >
          <FluentIcon icon="code" size="14" />
        </button>
        <button
          class="marsai-toolbar-btn"
          title="Insert Figma link"
          @click="insertFigmaLink"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M5 5.5A3.5 3.5 0 0 1 8.5 2H12v7H8.5A3.5 3.5 0 0 1 5 5.5ZM12 2h3.5a3.5 3.5 0 1 1 0 7H12V2Zm0 12.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0Zm-7 0A3.5 3.5 0 0 1 8.5 11H12v3.5a3.5 3.5 0 1 1-7 0ZM5 5.5A3.5 3.5 0 0 0 8.5 9H12V5.5h-.01A3.49 3.49 0 0 0 8.5 2 3.5 3.5 0 0 0 5 5.5Z"/>
          </svg>
        </button>
      </div>
      <!-- Right: emoji + send -->
      <div class="flex items-center">
        <button
          v-if="shouldShowEmojiPicker && hasEmojiPickerEnabled"
          class="marsai-toolbar-btn"
          :aria-label="$t('EMOJI.ARIA_LABEL')"
          @click="toggleEmojiPicker"
        >
          <FluentIcon
            icon="emoji"
            size="14"
            class="transition-all duration-150"
            :class="{
              'text-n-slate-12': !showEmojiPicker,
              'text-[#6366F1]': showEmojiPicker,
            }"
          />
        </button>
        <EmojiInput
          v-if="shouldShowEmojiPicker && showEmojiPicker"
          v-on-clickaway="hideEmojiPicker"
          :on-click="emojiOnClick"
          @keydown.esc="hideEmojiPicker"
        />
        <ChatSendButton
          v-if="showSendButton"
          :color="'#6366F1'"
          @click="handleButtonClick"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.emoji-dialog {
  @apply max-w-full ltr:right-5 rtl:right-[unset] rtl:left-5 -top-[302px] before:ltr:right-2.5 before:rtl:right-[unset] before:rtl:left-2.5;
}

.user-message-input {
  @apply border-none outline-none w-full placeholder:text-n-slate-10 resize-none h-8 min-h-8 max-h-60 py-1 px-0 my-2 bg-n-background text-n-slate-12 transition-all duration-200;
}
</style>
