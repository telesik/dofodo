import './style.css';
import { initApp } from './ui/app';

// Донат-ссылку и стор-строку задаёт только веб-версия: мобильные сборки
// вызывают initApp со своими опциями и без них — донат-ссылок в приложениях
// магазинов быть не должно (их правила), а ссылка «скачай приложение»
// внутри приложения не нужна (идея 0019). Google Play пока пометкой «скоро»
// (googlePlaySoon): приложение в закрытом треке, публичной страницы нет —
// при production-выпуске заменить пометку на ссылку.
initApp({
  supportUrl: 'https://ko-fi.com/telesik',
  appStoreUrl: 'https://apps.apple.com/app/id6801880127',
  googlePlaySoon: true,
});
