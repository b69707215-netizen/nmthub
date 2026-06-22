import { useEffect, useRef, useState } from "react";
import { api } from "../lib/api";

// ── Icons (emoji + unicode) ──────────────────────────────────────────────────
const ICONS = {
  calc: "🧮", book: "📚", award: "🏆", globe: "🌍", zap: "⚡",
  flask: "🧪", dna: "🧬", map: "🗺️", users: "👥", trend: "📈",
  mail: "📧", phone: "☎️", menu: "☰", x: "✕", arrow: "→",
  chevron: "›", check: "✓", loader: "⏳", quote: "❝", play: "▶"
};

const SUBJECTS = [
  { icon: ICONS.calc, name: "Математика", color: "#f5c542", tests: 240, avg: 178 },
  { icon: ICONS.book, name: "Укр. мова", color: "#ffd54f", tests: 310, avg: 182 },
  { icon: ICONS.award, name: "Історія", color: "#ff9d2f", tests: 195, avg: 174 },
  { icon: ICONS.globe, name: "Англійська", color: "#ffe082", tests: 280, avg: 186 },
  { icon: ICONS.zap, name: "Фізика", color: "#f5b942", tests: 160, avg: 170 },
  { icon: ICONS.flask, name: "Хімія", color: "#d4a017", tests: 140, avg: 172 },
  { icon: ICONS.dna, name: "Біологія", color: "#ffca28", tests: 175, avg: 180 },
  { icon: ICONS.map, name: "Географія", color: "#ffab40", tests: 130, avg: 168 },
];

const STATS = [
  { value: 4800, label: "Учнів", icon: ICONS.users },
  { value: 92, label: "Успіх %", icon: ICONS.trend },
  { value: 186, label: "Середній бал", icon: ICONS.award },
  { value: 1200, label: "Тестів", icon: ICONS.book },
];

const TEACHERS = [
  { name: "Олексій М.", subject: "Математика", exp: "8 років", rating: 4.9, students: 620 },
  { name: "Ірина К.", subject: "Укр. мова", exp: "11 років", rating: 5.0, students: 840 },
  { name: "Дмитро С.", subject: "Історія", exp: "7 років", rating: 4.8, students: 510 },
  { name: "Вікторія Л.", subject: "Англійська", exp: "9 років", rating: 4.9, students: 730 },
];

const TESTIMONIALS = [
  { name: "Аліна К.", score: 196, text: "196 балів! Вступила на бюджет!" },
  { name: "Максим П.", score: 189, text: "Найкращий сайт для підготовки до НМТ." },
  { name: "Даша В.", score: 192, text: "Пояснення до кожного питання — супер!" },
  { name: "Іван С.", score: 184, text: "Структура чітка, практика реальна." },
  { name: "Юля М.", score: 200, text: "200 балів! Не очікувала такого результату." },
];

const PLANS = [
  { name: "Старт", price: 299, features: ["1 предмет", "Всі тести", "Відеоуроки", "Статистика", "Форум"] },
  { name: "Профі", price: 599, features: ["3 предмети", "Розбори", "Вебінари", "Домашні", "Куратор", "Підтримка"], popular: true },
  { name: "Максимум", price: 999, features: ["8 предметів", "Необмежено", "1-на-1", "Розбір помилок", "Гарантія", "CV+вступ"] },
];

// ── Modal ────────────────────────────────────────────────────────────────────
type ModalType = "free" | "lesson" | null;

function Modal({ type, onClose }: { type: ModalType; onClose: () => void }) {
  const [data, setData] = useState({ name: "", phone: "" });
  const [loading, setLoading] = useState(false);

  if (!type) return null;

  const submit = async () => {
    if (!data.name || !data.phone) return alert("Заповніть поля");
    setLoading(true);
    try {
      await api.post("/leads", {
        ...data,
        type,
        subject: type === "lesson" ? "Пробний урок" : undefined,
      });
      alert("✓ Заявка отримана!");
      onClose();
    } catch (e) {
      alert("Помилка: " + (e instanceof Error ? e.message : "Спробуйте пізніше"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">
            {type === "free" ? "Вільна консультація" : "Пробний урок"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">{ICONS.x}</button>
        </div>
        <input type="text" placeholder="Ім'я" value={data.name} onChange={e => setData({...data, name: e.target.value})} className="w-full bg-gray-800 text-white p-2 rounded mb-2 border border-gray-700" />
        <input type="tel" placeholder="+380..." value={data.phone} onChange={e => setData({...data, phone: e.target.value})} className="w-full bg-gray-800 text-white p-2 rounded mb-4 border border-gray-700" />
        <button onClick={submit} disabled={loading} className="w-full bg-yellow-500 text-black font-bold py-2 rounded hover:bg-yellow-400 disabled:opacity-50">
          {loading ? ICONS.loader : "Отримати"}
        </button>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function Home() {
  const [modal, setModal] = useState<ModalType>(null);
  const [menu, setMenu] = useState(false);

  return (
    <div className="bg-gray-950 text-white min-h-screen">
      {/* NAV */}
      <nav className="sticky top-0 bg-gray-950/95 border-b border-gray-800 p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-yellow-500">NMTHub</h1>
          <button onClick={() => setMenu(!menu)} className="md:hidden text-2xl">{ICONS.menu}</button>
          <div className={`${menu ? "block" : "hidden"} md:flex gap-4 absolute md:static top-16 left-0 right-0 bg-gray-950 md:bg-transparent p-4 md:p-0 flex-col md:flex-row`}>
            <a href="#courses" className="hover:text-yellow-500">Курси</a>
            <a href="#teachers" className="hover:text-yellow-500">Викладачі</a>
            <a href="#prices" className="hover:text-yellow-500">Ціни</a>
            <a href="#contacts" className="hover:text-yellow-500">Контакти</a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-4">Підготовка до НМТ 🚀</h2>
        <p className="text-gray-400 text-lg mb-8">Все для успіху: курси, тести, викладачі</p>
        <div className="flex gap-4 justify-center flex-wrap">
          <button onClick={() => setModal("free")} className="bg-yellow-500 text-black px-8 py-3 rounded font-bold hover:bg-yellow-400">Вільна консультація</button>
          <button onClick={() => setModal("lesson")} className="border border-yellow-500 text-yellow-500 px-8 py-3 rounded font-bold hover:bg-yellow-500/10">Пробний урок</button>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-gray-900 py-12">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl mb-2">{s.icon}</div>
              <div className="text-2xl font-bold text-yellow-500">{s.value}</div>
              <div className="text-gray-400 text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* SUBJECTS */}
      <section id="courses" className="max-w-6xl mx-auto px-4 py-20">
        <h3 className="text-3xl font-bold mb-8 text-center">Предмети</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {SUBJECTS.map((s, i) => (
            <div key={i} className="bg-gray-900 p-4 rounded-lg border border-gray-800 hover:border-yellow-500 transition text-center">
              <div className="text-4xl mb-2">{s.icon}</div>
              <h4 className="font-bold mb-2">{s.name}</h4>
              <p className="text-gray-400 text-sm">{s.tests} тестів</p>
            </div>
          ))}
        </div>
      </section>

      {/* TEACHERS */}
      <section id="teachers" className="bg-gray-900 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className="text-3xl font-bold mb-8 text-center">Викладачі</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {TEACHERS.map((t, i) => (
              <div key={i} className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <h4 className="text-lg font-bold">{t.name}</h4>
                <p className="text-yellow-500 text-sm mb-2">{t.subject}</p>
                <p className="text-gray-400 text-sm">{t.exp} • {t.students}+ учнів • ⭐ {t.rating}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <h3 className="text-3xl font-bold mb-8 text-center">Відгуки</h3>
        <div className="grid md:grid-cols-2 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="bg-gray-900 p-4 rounded-lg border border-gray-800">
              <p className="text-gray-300 mb-3">{ICONS.quote} {t.text}</p>
              <p className="font-bold">{t.name} — {t.score} балів ⭐</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICES */}
      <section id="prices" className="bg-gray-900 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className="text-3xl font-bold mb-8 text-center">Тарифи</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {PLANS.map((p, i) => (
              <div key={i} className={`p-6 rounded-lg border transition ${p.popular ? "border-yellow-500 bg-yellow-500/10" : "border-gray-700 bg-gray-900"}`}>
                {p.popular && <div className="text-yellow-500 text-sm font-bold mb-2">ПОПУЛЯРНО</div>}
                <h4 className="text-2xl font-bold mb-2">{p.name}</h4>
                <div className="text-3xl font-bold text-yellow-500 mb-4">{p.price} ₴</div>
                <ul className="text-gray-300 text-sm space-y-1 mb-6">
                  {p.features.map((f, j) => <li key={j}>{ICONS.check} {f}</li>)}
                </ul>
                <button onClick={() => setModal("free")} className="w-full bg-yellow-500 text-black py-2 rounded font-bold hover:bg-yellow-400">Вибрати</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="contacts" className="bg-gray-950 border-t border-gray-800 py-12">
        <div className="max-w-6xl mx-auto px-4 text-center text-gray-400">
          <p className="mb-4">📧 info@nmthub.online • {ICONS.phone} +380 (XX) XXX-XX-XX</p>
          <p className="text-sm">© 2026 NMTHub. Всі права захищені.</p>
        </div>
      </footer>

      <Modal type={modal} onClose={() => setModal(null)} />
    </div>
  );
}
