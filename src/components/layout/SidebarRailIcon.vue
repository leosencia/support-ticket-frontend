<script setup>
import { computed } from 'vue'

const props = defineProps({
  /** When omitted, renders a `<button>` (e.g. logout). */
  to: {
    type: String,
    default: undefined,
  },
  icon: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  active: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['click'])

const ringClass = computed(() =>
  props.active
    ? 'bg-neutral-900 text-white'
    : 'bg-white/70 text-neutral-600 hover:bg-white hover:text-neutral-900',
)
</script>

<template>
  <router-link
    v-if="to"
    :to="to"
    :aria-label="label"
    :title="label"
    class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-transparent transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
    :class="ringClass"
  >
    <i :class="[icon, 'text-lg leading-none']" aria-hidden="true" />
  </router-link>
  <button
    v-else
    type="button"
    :aria-label="label"
    :title="label"
    class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/70 text-neutral-600 transition-all duration-200 hover:bg-red-50 hover:text-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2"
    @click="emit('click')"
  >
    <i :class="[icon, 'text-lg leading-none']" aria-hidden="true" />
  </button>
</template>
