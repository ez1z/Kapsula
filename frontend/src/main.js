import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createI18n } from 'vue-i18n';
import App from './App.vue';
import router from './router/index.js';

import tk from './i18n/locales/tk.json';
import ru from './i18n/locales/ru.json';
import tr from './i18n/locales/tr.json';
import en from './i18n/locales/en.json';

const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem('locale') || 'tk',
  fallbackLocale: 'en',
  messages: { tk, ru, tr, en },
});

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(i18n);

app.mount('#app');