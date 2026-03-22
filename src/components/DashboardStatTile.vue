<template>
  <section
    class="bento-surface p-4 transition-shadow duration-200 md:p-5"
    :class="[{ 'bento-surface--muted': muted }, 'hover:shadow-sm']"
  >
    <div class="flex items-center gap-4">
      <div class="bento-stat-icon">
        <i :class="[icon, 'text-[0.95rem]']" aria-hidden="true" />
      </div>
      <div class="min-w-0 flex-1">
        <p class="bento-label m-0 mb-0.5">{{ label }}</p>
        <p class="m-0 text-2xl font-semibold tabular-nums tracking-tight text-neutral-900 md:text-3xl">
          {{ value }}
        </p>
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  label: {
    type: String,
    required: true,
  },
  value: {
    type: [Number, String],
    required: true,
  },
  icon: {
    type: String,
    required: true,
  },
  muted: {
    type: Boolean,
    default: false,
  },
})
</script>
