<script>
import Spinner from 'shared/components/Spinner.vue';
import FluentIcon from 'shared/components/FluentIcon/Index.vue';

export default {
  components: {
    FluentIcon,
    Spinner,
  },
  props: {
    loading: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<template>
  <button
    type="submit"
    :disabled="disabled"
    class="marsai-send-button group relative flex items-center justify-center ml-1"
  >
    <FluentIcon v-if="!loading" icon="send" class="relative z-10 text-white w-4 h-4 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:rotate-12 group-hover:scale-110" />
    <Spinner v-else size="small" />
    <!-- Hover glow -->
    <div class="absolute inset-0 rounded-xl bg-gradient-to-r from-red-600 to-red-500 opacity-0 group-hover:opacity-50 transition-opacity duration-300 blur-lg scale-110" />
  </button>
</template>

<style scoped>
.marsai-send-button {
  padding: 10px;
  background: linear-gradient(to right, #DC2626, #EF4444);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.25);
}
.marsai-send-button:hover {
  background: linear-gradient(to right, #EF4444, #F87171);
  transform: scale(1.08);
  box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
}
.marsai-send-button:active {
  transform: scale(0.95);
}
.marsai-send-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}
</style>
