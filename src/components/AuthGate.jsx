import React, { useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth } from '../firebase.js';
const API_URL = 'https://tiny-sun-38e3.raimqulovkamron88.workers.dev';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase.js';

export default function AuthGate({ children }) {
  async function assignNickname(user) {
  const token = await user.getIdToken();
  console.log('token olindi');

  console.log('Fetch boshlandi');
  const response = await fetch(
    API_URL + '/nickname/assign',
    {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + token
      }
    }
  );

  const data = await response.json();

  console.log('Nickname assign response:', response.status, data);

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Nickname ajratilmadi.');
  }

  await setDoc(
  doc(db, 'gameStates', user.uid),
  { nickname: data.nickname },
  { merge: true }
);

return data.nickname;
}
  const [user, setUser] = useState(undefined);
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
    if (!currentUser) {
      setUser(null);
      return;
    }

    try {
      await assignNickname(currentUser);
      setUser(currentUser);
    } catch (error) {
      setError(error.message || 'Nickname ajratilmadi.');
      setUser(currentUser);
    }
  });

  return unsubscribe;
}, []);

  const run = async (action) => {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await action();
    } catch (e) {
      const messages = {
        'auth/email-already-in-use': 'Bu email allaqachon ro‘yxatdan o‘tgan.',
        'auth/invalid-credential': 'Email yoki parol noto‘g‘ri.',
        'auth/weak-password': 'Parol kamida 6 belgidan iborat bo‘lishi kerak.',
        'auth/invalid-email': 'Email manzili noto‘g‘ri.',
        'auth/popup-closed-by-user': 'Google orqali kirish oynasi yopildi.',
      };
      setError(messages[e.code] || e.message || 'Xatolik yuz berdi.');
    } finally {
      setBusy(false);
    }
  };

  if (user === undefined) {
    return <div className="auth-screen"><div className="panel">Yuklanmoqda…</div></div>;
  }
  if (user) return children;

  const submit = (e) => {
    e.preventDefault();
    if (mode === 'signup' && password !== confirm) {
      setError('Parollar mos emas.');
      return;
    }
    run(() => mode === 'signup'
      ? createUserWithEmailAndPassword(auth, email.trim(), password)
      : signInWithEmailAndPassword(auth, email.trim(), password));
  };

  return (
    <div className="auth-screen">
      <form className="panel auth-panel" onSubmit={submit}>
        <img src="/images/young-adults-logo.svg" alt="Young Adults" />
        <p className="eyebrow">WELCOME ADVENTURER</p>
        <h1>{mode === 'signup' ? 'Hisob yaratish' : 'Xush kelibsiz!'}</h1>
        <p className="muted">{mode === 'signup' ? 'Young Adults Kids olamiga qo‘shiling.' : 'Hisobingizga kiring va davom eting.'}</p>
        <label htmlFor="auth-email">Email</label>
        <input id="auth-email" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com" />
        <label htmlFor="auth-password">Parol</label>
        <input id="auth-password" type="password" minLength={6} required value={password} onChange={e => setPassword(e.target.value)} placeholder="Kamida 6 belgi" />
        {mode === 'signup' && <>
          <label htmlFor="auth-confirm">Parolni tasdiqlang</label>
          <input id="auth-confirm" type="password" required value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Parolni qayta kiriting" />
        </>}
        {error && <p className="auth-error" role="alert">{error}</p>}
        {notice && <p className="feedback good" role="status">{notice}</p>}
        <button className="primary-btn" disabled={busy}>{busy ? 'Kuting…' : mode === 'signup' ? 'Sign Up' : 'Sign In'}</button>
        <button type="button" className="secondary-btn" disabled={busy} onClick={() => run(() => signInWithPopup(auth, new GoogleAuthProvider()))}>Google orqali davom etish</button>
        <button type="button" className="auth-switch" disabled={busy} onClick={() => { setMode(mode === 'signup' ? 'login' : 'signup'); setError(''); setNotice(''); }}>
          {mode === 'signup' ? 'Hisobingiz bormi? Sign In' : 'Hisobingiz yo‘qmi? Sign Up'}
        </button>
        {mode === 'login' && <button type="button" className="text-btn" disabled={busy || !email.trim()} onClick={() => run(async () => { await sendPasswordResetEmail(auth, email.trim()); setNotice('Parolni tiklash havolasi emailingizga yuborildi.'); })}>Parolni unutdingizmi?</button>}
      </form>
    </div>
  );
}
