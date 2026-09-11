import './style.css';
import { initApp } from './ui/app';

// Донат-ссылку и стор-строку задаёт только веб-версия: мобильные сборки
// вызывают initApp со своими опциями и без них — донат-ссылок в приложениях
// магазинов быть не должно (их правила), а ссылка «скачай приложение»
// внутри приложения не нужна (идея 0019). Обе ссылки — чистые адреса витрин,
// без campaign-параметров (Google Play — с production-выпуска 11.09.2026).
initApp({
  supportUrl: 'https://ko-fi.com/telesik',
  appStoreUrl: 'https://apps.apple.com/app/id6801880127',
  googlePlayUrl: 'https://play.google.com/store/apps/details?id=com.telesik.bonesai',
});
