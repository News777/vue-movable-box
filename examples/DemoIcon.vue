<template>
  <svg
    class="demo-icon"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path v-for="path in icons[name]" :key="path" :d="path" />
  </svg>
</template>

<script setup lang="ts">
const icons = {
  target: ['M12 3a9 9 0 1 0 9 9', 'M12 7a5 5 0 1 0 5 5', 'M12 11v2', 'M17 3v4h4'],
  canvas: ['M4 5h16v14H4z', 'm7 9 2-2 2 2 3-3'],
  settings: [
    'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8',
    'M12 3v2m0 14v2M3 12h2m14 0h2M5.6 5.6 7 7m10 10 1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4'
  ],
  tune: ['M4 6h10m4 0h2M4 12h3m4 0h9M4 18h8m4 0h4', 'M14 4v4M7 10v4m5 2v4'],
  palette: [
    'M12 3a9 9 0 0 0 0 18h1.5a2 2 0 0 0 0-2-2 2 2 0 0 1 2-2H16a5 5 0 0 0 5-5c0-5-4-9-9-9Z',
    'M7.5 10h.01M10 6.5h.01M15 7h.01'
  ],
  ruler: ['m4 17 13-13 3 3-13 13z', 'm12 7 2 2m-5 1 2 2m-5 1 2 2'],
  flask: ['M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.7 3h10.6a2 2 0 0 0 1.7-3l-5-9V3', 'M8 15h8'],
  plus: ['M12 5v14M5 12h14'],
  minus: ['M5 12h14'],
  copy: ['M8 8h11v11H8z', 'M5 16H4V5h11v1'],
  check: ['m5 12 4 4L19 6'],
  close: ['M6 6l12 12M18 6 6 18'],
  up: ['m6 14 6-6 6 6', 'M12 8v11'],
  down: ['m6 10 6 6 6-6', 'M12 5v11'],
  pin: ['M12 21v-7', 'm8 3 2 5-4 4h12l-4-4 2-5z'],
  size: ['M8 3H3v5M16 3h5v5M8 21H3v-5m13 5h5v-5'],
  rotate: ['M20 11a8 8 0 1 0-2.3 5.7', 'M20 4v7h-7'],
  moon: ['M20 15.5A8 8 0 0 1 8.5 4 8 8 0 1 0 20 15.5Z'],
  ban: ['M5.6 5.6a9 9 0 1 0 12.8 12.8M5.6 5.6l12.8 12.8'],
  layout: ['M4 5h16v14H4z', 'M4 10h16M10 10v9'],
  image: ['M4 5h16v14H4z', 'm5 15 4-4 3 3 2-2 5 5', 'M15.5 9h.01'],
  file: ['M6 3h8l4 4v14H6z', 'M14 3v5h5M9 13h6m-6 4h6'],
  clipboard: ['M8 5H6v16h12V5h-2', 'M9 3h6v4H9z'],
  trash: ['M4 7h16M9 3h6l1 4H8z', 'm9 11 1 7m5-7-1 7'],
  users: [
    'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8',
    'M3 21v-2a6 6 0 0 1 12 0v2M17 11a3 3 0 0 0 0-6M17 15a5 5 0 0 1 4 4v2'
  ],
  shuffle: ['M4 7h3l10 10h3', 'm17 14 3 3-3 3M4 17h3L17 7h3m-3-3 3 3-3 3'],
  box: ['m12 3 8 4-8 4-8-4z', 'M4 7v10l8 4 8-4V7M12 11v10'],
  puzzle: [
    'M9 4h4v3a2 2 0 1 0 4 0V4h3v6h-3a2 2 0 1 0 0 4h3v6h-6v-3a2 2 0 1 0-4 0v3H4v-6h3a2 2 0 1 0 0-4H4V4z'
  ]
} as const;

defineProps<{ name: keyof typeof icons }>();
</script>

<style scoped>
.demo-icon {
  display: inline-block;
  width: 1em;
  height: 1em;
  flex: 0 0 auto;
  vertical-align: -0.14em;
}
</style>
