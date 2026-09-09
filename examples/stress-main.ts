import { createApp } from 'vue';
import StressApp from './StressApp.vue';

const start = performance.now();
createApp(StressApp).mount('#app');
const mountMs = performance.now() - start;

// The benchmark script reads these after the first paint has settled.
requestAnimationFrame(() => {
  (window as unknown as { __bench: { mountMs: number } }).__bench = { mountMs };
  document.title = 'bench-ready';
});
