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
    charCount() {
      return this.userInput.length;
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
    class="flex flex-col rounded-2xl transition-all duration-200 bg-n-background dark:bg-zinc-900/80"
    :class="{
      'ring-1 ring-indigo-500/50 shadow-[0_0_12px_rgba(99,102,241,0.15)]': isFocused,
      'ring-1 ring-n-weak dark:ring-zinc-700/50': !isFocused,
    }"
    @keydown.esc="hideEmojiPicker"
  >
    <!-- Textarea -->
    <div class="px-4 pt-1">
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
    <div v-if="showLinkInput" class="flex items-center gap-2 px-4 pb-2">
      <input
        ref="linkInput"
        v-model="linkUrl"
        type="url"
        placeholder="https://..."
        class="flex-1 reset-base text-xs px-2.5 py-1.5 rounded-lg bg-n-slate-3 dark:bg-zinc-800 text-n-slate-12 outline-none border border-n-weak dark:border-zinc-700/50 focus:border-indigo-500/50"
        @keydown="handleLinkKeydown"
      />
      <button class="text-xs text-indigo-400 hover:text-indigo-300 px-2 py-1" @click="insertLink">
        Add
      </button>
      <button class="text-xs text-zinc-500 hover:text-zinc-300 px-1 py-1" @click="cancelLink">
        &times;
      </button>
    </div>

    <!-- Controls Section -->
    <div class="px-3 pb-3">
      <div class="flex items-center justify-between">
        <!-- Left: Attachment group -->
        <div class="flex items-center gap-2">
          <div class="marsai-btn-group flex items-center gap-0.5 p-0.5 rounded-xl">
            <!-- File Upload -->
            <ChatAttachmentButton
              v-if="canHandleAttachments"
              class="marsai-action-btn marsai-action-btn--default"
              :on-attach="onSendAttachment"
            />
            <!-- Link -->
            <button
              class="marsai-action-btn marsai-action-btn--red"
              title="Web link"
              @click="insertLink"
            >
              <FluentIcon icon="link" size="15" />
            </button>
            <!-- Code -->
            <button
              class="marsai-action-btn marsai-action-btn--green"
              title="Code block"
              @click="insertCodeBlock"
            >
              <FluentIcon icon="code" size="15" />
            </button>
            <!-- Figma -->
            <button
              class="marsai-action-btn marsai-action-btn--purple"
              title="Design file"
              @click="insertFigmaLink"
            >
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.852 8.981h-4.588V0h4.588c2.476 0 4.49 2.014 4.49 4.49s-2.014 4.491-4.49 4.491zM12.735 7.51h3.117c1.665 0 3.019-1.355 3.019-3.019s-1.354-3.019-3.019-3.019h-3.117V7.51zm0 1.471H8.148c-2.476 0-4.49-2.015-4.49-4.49S5.672 0 8.148 0h4.588v8.981zm-4.587-7.51c-1.665 0-3.019 1.355-3.019 3.019s1.354 3.02 3.019 3.02h3.117V1.471H8.148zm4.587 15.019H8.148c-2.476 0-4.49-2.014-4.49-4.49s2.014-4.49 4.49-4.49h4.588v8.98zM8.148 8.981c-1.665 0-3.019 1.355-3.019 3.019s1.355 3.019 3.019 3.019h3.117v-6.038H8.148zm7.704 0c-2.476 0-4.49 2.015-4.49 4.49s2.014 4.49 4.49 4.49 4.49-2.015 4.49-4.49-2.014-4.49-4.49-4.49zm0 7.509c-1.665 0-3.019-1.355-3.019-3.019s1.355-3.019 3.019-3.019 3.019 1.354 3.019 3.019-1.354 3.019-3.019 3.019zM8.148 24c-2.476 0-4.49-2.015-4.49-4.49s2.014-4.49 4.49-4.49h4.588V24H8.148zm3.117-1.471V16.49H8.148c-1.665 0-3.019 1.355-3.019 3.019s1.355 3.02 3.019 3.02h3.117z" />
              </svg>
            </button>
          </div>

          <!-- Emoji (separate) -->
          <button
            v-if="shouldShowEmojiPicker && hasEmojiPickerEnabled"
            class="marsai-action-btn marsai-action-btn--default marsai-action-btn--separate"
            :aria-label="$t('EMOJI.ARIA_LABEL')"
            @click="toggleEmojiPicker"
          >
            <FluentIcon
              icon="emoji"
              size="15"
              class="transition-all duration-150"
              :class="{
                '': !showEmojiPicker,
                'text-indigo-400': showEmojiPicker,
              }"
            />
          </button>
          <EmojiInput
            v-if="shouldShowEmojiPicker && showEmojiPicker"
            v-on-clickaway="hideEmojiPicker"
            :on-click="emojiOnClick"
            @keydown.esc="hideEmojiPicker"
          />
        </div>

        <!-- Right: char count + send -->
        <div class="flex items-center gap-2.5">
          <div class="text-[10px] font-medium text-zinc-500 dark:text-zinc-500 tabular-nums">
            {{ charCount }}/2000
          </div>
          <ChatSendButton
            v-if="showSendButton"
            @click="handleButtonClick"
          />
        </div>
      </div>

      <!-- Footer info -->
      <div class="flex items-center justify-between mt-2 pt-2 border-t border-n-weak dark:border-zinc-800/50 text-[10px] text-zinc-500 dark:text-zinc-500">
        <div class="flex items-center gap-1.5">
          <FluentIcon icon="info" size="11" />
          <span>
            Press <kbd class="px-1 py-0.5 bg-n-slate-3 dark:bg-zinc-800 border border-n-weak dark:border-zinc-600 rounded text-zinc-400 font-mono text-[9px]">Shift+Enter</kbd> for new line
          </span>
        </div>
        <div class="flex items-center gap-1">
          <span class="w-1.5 h-1.5 bg-green-500 rounded-full" />
          <span>Online</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.emoji-dialog {
  @apply max-w-full ltr:right-5 rtl:right-[unset] rtl:left-5 -top-[302px] before:ltr:right-2.5 before:rtl:right-[unset] before:rtl:left-2.5;
}

.user-message-input {
  @apply border-none outline-none w-full placeholder:text-n-slate-10 resize-none h-8 min-h-8 max-h-60 py-1 px-0 my-2 bg-transparent text-n-slate-12 transition-all duration-200 text-sm leading-relaxed;
}

/* Button group container */
.marsai-btn-group {
  background: rgba(39, 39, 42, 0.08);
  border: 1px solid rgba(63, 63, 70, 0.12);
}
.dark .marsai-btn-group {
  background: rgba(39, 39, 42, 0.4);
  border-color: rgba(63, 63, 70, 0.5);
}

/* Action buttons base */
.marsai-action-btn {
  @apply relative p-2 bg-transparent border-none rounded-lg cursor-pointer transition-all duration-300;
  color: #71717A;
}
.marsai-action-btn:hover {
  @apply scale-105;
  background: rgba(39, 39, 42, 0.15);
}
.dark .marsai-action-btn:hover {
  background: rgba(39, 39, 42, 0.8);
}

/* Separate button (outside group) */
.marsai-action-btn--separate {
  border: 1px solid rgba(63, 63, 70, 0.12);
  border-radius: 0.5rem;
}
.dark .marsai-action-btn--separate {
  border-color: rgba(63, 63, 70, 0.3);
}

/* Per-button hover colors */
.marsai-action-btn--default:hover { color: #D4D4D8; }
.marsai-action-btn--red:hover { color: #F87171; }
.marsai-action-btn--green:hover { color: #4ADE80; }
.marsai-action-btn--purple:hover { color: #C084FC; }
</style>
