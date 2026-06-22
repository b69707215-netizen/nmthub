import { useEffect, useRef, useState } from "react";
import { api } from "../lib/api";

// ── Icons (emoji) ──────────────────────────────────────────────────────
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
      setData({ name: "", phone: "" });
      onClose();
    } catch (e) {
      alert("Помилка: " + (e instanceof Error ? e.message : "Спробуйте пізніше"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-gray-900 rounded-xl p-6 w-full max-w-md border border-yellow-500/30">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">
            {type === "free" ? "Вільна консультація" : "Пробний урок"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">{ICONS.x}</button>
        </div>
        <input type="text" placeholder="Ім'я" value={data.name} onChange={e => setData({...data, name: e.target.value})} className="w-full bg-gray-800 text-white p-3 rounded-lg mb-3 border border-gray-700 focus:border-yellow-500 outline-none transition" />
        <input type="tel" placeholder="+380..." value={data.phone} onChange={e => setData({...data, phone: e.target.value})} className="w-full bg-gray-800 text-white p-3 rounded-lg mb-4 border border-gray-700 focus:border-yellow-500 outline-none transition" />
        <button onClick={submit} disabled={loading} className="w-full bg-yellow-500 text-black font-bold py-3 rounded-lg hover:bg-yellow-400 disabled:opacity-50 transition">
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
    <div className="bg-gray-950 text-white min-h-screen overflow-hidden">
      {/* ── NAV ── */}
      <nav className="sticky top-0 bg-gray-950/95 backdrop-blur border-b border-gray-800 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center font-bold text-black">N</div>
            <h1 className="text-xl font-bold">NMTHub</h1>
          </div>
          <button onClick={() => setMenu(!menu)} className="md:hidden text-2xl">{ICONS.menu}</button>
          <div className={`${menu ? "flex" : "hidden"} md:flex gap-6 absolute md:static top-16 left-0 right-0 bg-gray-950 md:bg-transparent p-4 md:p-0 flex-col md:flex-row md:items-center`}>
            <a href="#subjects" className="hover:text-yellow-400 transition">Предмети</a>
            <a href="#teachers" className="hover:text-yellow-400 transition">Викладачі</a>
            <a href="#prices" className="hover:text-yellow-400 transition">Ціни</a>
            <button onClick={() => setModal("free")} className="bg-yellow-500 text-black px-6 py-2 rounded-lg font-bold hover:bg-yellow-400 transition md:ml-auto">Почати</button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="max-w-7xl mx-auto px-4 py-16 md:py-32">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="inline-block border border-yellow-600/50 text-yellow-500 px-4 py-2 rounded-full text-sm font-bold mb-6">✨ ПІДГОТОВКА ДО НМТ 2025</div>
            <h2 className="text-5xl md:text-6xl font-black mb-4 leading-tight">
              Здай НМТ <br/><span className="text-yellow-500">на максимум</span>
            </h2>
            <p className="text-gray-300 text-lg mb-8 leading-relaxed">
              Онлайн-підготовка до НМТ з досвідченими викладачами. 8 предметів, 1200+ тестів, персональний прогрес і гарантія результату.
            </p>
            <div className="flex gap-4 flex-wrap">
              <button onClick={() => setModal("free")} className="bg-yellow-500 text-black px-8 py-4 rounded-lg font-bold hover:bg-yellow-400 transition">Почати безкоштовно {ICONS.arrow}</button>
              <button onClick={() => setModal("lesson")} className="border-2 border-yellow-500/50 text-yellow-400 px-8 py-4 rounded-lg font-bold hover:bg-yellow-500/10 transition">{ICONS.play} Пробний урок</button>
            </div>
            <div className="flex gap-4 mt-8">
              <div className="flex gap-2">
                {[...Array(5)].map((_, i) => <span key={i} className="text-yellow-400 text-lg">⭐</span>)}
              </div>
              <p className="text-gray-400">4800+ учнів уже готуються</p>
            </div>
          </div>

          {/* SUBJECTS GRID */}
          <div className="grid grid-cols-2 gap-4">
            {SUBJECTS.map((s, i) => (
              <div key={i} className="bg-gray-900/50 border border-gray-800/50 hover:border-yellow-500/30 rounded-xl p-4 backdrop-blur-sm transition group">
                <div className="text-3xl mb-2 group-hover:scale-110 transition">{s.icon}</div>
                <h4 className="font-bold text-sm mb-1">{s.name}</h4>
                <p className="text-gray-400 text-xs">Середній бал: {s.avg}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="bg-gradient-to-r from-gray-900 via-gray-950 to-gray-900 py-16 border-y border-gray-800">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-4xl mb-3">{s.icon}</div>
              <div className="text-3xl font-bold text-yellow-500">{s.value}+</div>
              <div className="text-gray-400 text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── TEACHERS ── */}
      <section id="teachers" className="max-w-7xl mx-auto px-4 py-20">
        <h3 className="text-4xl font-bold mb-12 text-center">Найкращі викладачі</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {TEACHERS.map((t, i) => (
            <div key={i} className="bg-gradient-to-br from-gray-900 to-gray-800 border border-yellow-500/20 rounded-xl p-6 hover:border-yellow-500/50 transition">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center mb-4 text-lg font-bold">{t.name[0]}</div>
              <h4 className="text-lg font-bold mb-1">{t.name}</h4>
              <p className="text-yellow-500 text-sm font-bold mb-3">{t.subject}</p>
              <p className="text-gray-400 text-sm">{t.exp} • ⭐ {t.rating}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRICES ── */}
      <section id="prices" className="bg-gray-900/50 py-20 border-y border-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <h3 className="text-4xl font-bold mb-12 text-center">Тарифи</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {PLANS.map((p, i) => (
              <div key={i} className={`rounded-xl p-8 border transition ${p.popular ? "border-yellow-500 bg-gradient-to-b from-yellow-500/20 to-yellow-500/5 md:scale-105" : "border-gray-800 bg-gradient-to-b from-gray-900 to-gray-800"}`}>
                {p.popular && <div className="text-yellow-500 text-sm font-bold mb-4 block">★ ПОПУЛЯРНО</div>}
                <h4 className="text-3xl font-black mb-2">{p.name}</h4>
                <div className="text-4xl font-black text-yellow-500 mb-6">{p.price} <span className="text-lg text-gray-400">₴</span></div>
                <ul className="space-y-3 mb-8">
                  {p.features.map((f, j) => <li key={j} className="flex items-center gap-2 text-gray-200"><span className="text-yellow-500">{ICONS.check}</span> {f}</li>)}
                </ul>
                <button onClick={() => setModal("free")} className={`w-full py-3 rounded-lg font-bold transition ${p.popular ? "bg-yellow-500 text-black hover:bg-yellow-400" : "border border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10"}`}>Вибрати</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-gray-950 border-t border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-400">
          <p className="mb-4 text-sm">📧 info@nmthub.online • {ICONS.phone} +380 (XX) XXX-XX-XX</p>
          <p className="text-xs">© 2026 NMTHub. Всі права захищені.</p>
        </div>
      </footer>

      <Modal type={modal} onClose={() => setModal(null)} />
    </div>
  );
}
