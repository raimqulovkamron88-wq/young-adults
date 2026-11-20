import React, { useEffect, useState } from 'react';
import { auth } from '../firebase.js';

const API =
  'https://tiny-sun-38e3.raimqulovkamron88.workers.dev';

export default function AdminPage({ role }) {
  const [stats, setStats] = useState(null);
  const [tab, setTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [games, setGames] = useState([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const canManage = ['super_admin', 'admin'].includes(role);

  const getHeaders = async () => {
    const token = await auth.currentUser.getIdToken();

    return {
      Authorization: `Bearer ${token}`
    };
  };

  const loadAdminData = async () => {
    try {
      const response = await fetch(`${API}/admin/stats`, {
        headers: await getHeaders()
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      setStats(data.stats);
    } catch (error) {
      setMessage('Statistikani yuklab bo‘lmadi.');
    }
  };

  const refresh = async () => {
    setBusy(true);
    setMessage('');

    try {
      const headers = await getHeaders();

      const [usersResponse, gamesResponse, questionsResponse] =
        await Promise.all([
          fetch(`${API}/admin/users`, { headers }),
          fetch(`${API}/admin/games`, { headers }),
          fetch(`${API}/admin/questions`, { headers })
        ]);

      const usersData = await usersResponse.json();
      const gamesData = await gamesResponse.json();
      const questionsData = await questionsResponse.json();

      if (
        !usersData.success ||
        !gamesData.success ||
        !questionsData.success
      ) {
        throw new Error('Ma’lumotlarni yuklab bo‘lmadi');
      }

      setUsers(usersData.users.map(user => ({
        id: user.uid,
        ...user
      })));

      setGames(gamesData.games);
      setQuestions(questionsData.questions);

    } catch (error) {
      setMessage('Ma’lumotlarni yuklab bo‘lmadi.');
    } finally {
      setBusy(false);
    }
  };

  const addGame = async () => {
    const title = prompt('O‘yin nomi:');
    if (!title) return;

    const url = prompt('O‘yin havolasi (https://):');
    if (!url) return;

    if (!/^https:\/\/\S+/i.test(url)) {
      setMessage('Havola https:// bilan boshlanishi kerak.');
      return;
    }

    try {
      const response = await fetch(`${API}/admin/games/add`, {
        method: 'POST',
        headers: {
          ...(await getHeaders()),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, url })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      setMessage('O‘yin muvaffaqiyatli qo‘shildi!');
      await refresh();

    } catch (error) {
      setMessage('O‘yin qo‘shilmadi: ' + error.message);
    }
  };

  const addQuestion = async () => {
    const text = prompt('Savol matni:');
    if (!text) return;

    const answer = prompt('To‘g‘ri javob:');
    if (!answer) return;

    try {
      const response = await fetch(`${API}/admin/questions/add`, {
        method: 'POST',
        headers: {
          ...(await getHeaders()),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text, answer })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      setMessage('Savol muvaffaqiyatli qo‘shildi!');
      await refresh();

    } catch (error) {
      setMessage('Savol qo‘shilmadi: ' + error.message);
    }
  };

  useEffect(() => {
    if (role) {
      refresh();
      loadAdminData();
    }
  }, [role]);

  if (!role) {
    return (
      <section className="panel">
        <h1>Admin bo‘limi</h1>
        <p className="muted">
          Bu hisobga admin ruxsati berilmagan.
        </p>
      </section>
    );
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">
            CONTROL CENTER · {role.toUpperCase()}
          </p>
          <h1>Admin bo‘limi</h1>
          <p className="muted">
            Young Adults Kids loyihasini boshqarish.
          </p>
        </div>

        <button
          className="secondary-btn"
          onClick={() => {
            refresh();
            loadAdminData();
          }}
          disabled={busy}
        >
          ↻ Yangilash
        </button>
      </div>

      <div className="filter-row">
        {[
          ['overview', 'Umumiy'],
          ['users', 'Foydalanuvchilar'],
          ['questions', 'Savollar'],
          ['games', 'O‘yinlar']
        ].map(([id, label]) => (
          <button
            key={id}
            className={`filter-btn ${tab === id ? 'active-filter' : ''}`}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {message && (
        <p className="auth-error" role="status">
          {message}
        </p>
      )}

      {tab === 'overview' && (
        <div className="feature-grid">
          <div className="panel">
            <p className="eyebrow">FOYDALANUVCHILAR</p>
            <h2>{stats?.totalUsers ?? '...'}</h2>
          </div>

          <div className="panel">
            <p className="eyebrow">UMUMIY XP</p>
            <h2>{stats?.totalXP ?? '...'}</h2>
          </div>

          <div className="panel">
            <p className="eyebrow">UMUMIY COINS</p>
            <h2>{stats?.totalCoins ?? '...'}</h2>
          </div>

          <div className="panel">
            <p className="eyebrow">JAMI JAVOBLAR</p>
            <h2>{stats?.totalAnswers ?? '...'}</h2>
          </div>
        </div>
      )}

      {tab === 'users' && (
        <section className="panel">
          <h2>Foydalanuvchilar</h2>
          {users.map(user => (
            <div className="admin-row" key={user.id}>
              <b>{user.nickname || 'Nomsiz'}</b>
              <span>{user.id}</span>
              <small>{user.role || 'player'}</small>
            </div>
          ))}
        </section>
      )}

      {tab === 'questions' && (
        <section className="panel">
          <div className="section-title">
            <h2>Savollar</h2>
            {canManage && (
              <button className="primary-btn" onClick={addQuestion}>
                + Savol qo‘shish
              </button>
            )}
          </div>

          {questions.map(question => (
            <div className="admin-row" key={question.id}>
              <b>{question.text}</b>
              <span>{question.answer}</span>
            </div>
          ))}
        </section>
      )}

      {tab === 'games' && (
        <section className="panel">
          <div className="section-title">
            <h2>Tashqi o‘yinlar</h2>
            {canManage && (
              <button className="primary-btn" onClick={addGame}>
                + O‘yin qo‘shish
              </button>
            )}
          </div>

          {games.map(game => (
            <div className="admin-row" key={game.id}>
              <b>{game.title}</b>
              <a href={game.url} target="_blank" rel="noreferrer">
                O‘yinni ochish ↗️
              </a>
            </div>
          ))}
        </section>
      )}

      <p className="note">
        Moderator ma’lumotlarni ko‘rishi mumkin. Savol va o‘yinlarni
        faqat Admin yoki Super Admin boshqaradi.
      </p>
    </>
  );
}