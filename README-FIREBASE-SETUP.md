# Firebase sozlash (Spark rejasi)

1. Firebase Console'da `young-adults-kids` loyihasini oching.
2. Authentication → Sign-in method bo‘limida Email/Password va Google usullarini yoqing.
3. Project settings → Your apps bo‘limidan Web App konfiguratsiyasini oling.
4. Loyiha ildizida `.env` fayl yarating (`package.json` bilan bir papkada) va quyidagi qiymatlarni o‘zingiz kiriting:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

5. `npm install`, keyin `npm run dev` buyrug‘ini bajaring.
6. Vercel'da yuqoridagi oltita `VITE_` qiymatni Environment Variables sifatida kiriting va qayta deploy qiling.
7. Firebase Console → Firestore Database → Rules bo‘limiga `firestore.rules` mazmunini joylang.

## Muhim cheklovlar

- Bu loyiha Firebase Spark rejimida ishlashi uchun Auth va Firestore SDK'laridan foydalanadi; Cloud Functions kodi ushbu ZIP'dan olib tashlangan.
- Hozirgi o‘yin progressi `localStorage`da saqlanadi. Shu sababli u boshqa qurilmaga avtomatik sinxronlanmaydi.
- XP/tanga mukofotlari va nickname o‘zgartirish hozircha brauzer tomonda. Ularni ishonchli himoyalash uchun alohida server/backend kerak. Faqat Firestore Rules bilan brauzer yuborgan mukofotni ishonchli deb bo‘lmaydi.
- `admins/{uid}` hujjatlarini faqat ishonchli boshqaruv muhitidan yaratish kerak. Client ilovasi admin rolini o‘zi tayinlay olmaydi.
- `.env` maxfiy repoga yuklanmasligi uchun `.gitignore` ichida turadi. `.env.example` faqat namuna.
