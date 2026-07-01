import { useEffect, useRef, useState } from "react";
import {
  BookOpen, Calculator, Globe, FlaskConical, Map,
  Star, ChevronRight, Check, Menu, X, ArrowRight, Zap,
  Users, Award, TrendingUp, Clock, Play, Quote, Mail,
  Phone, MessageCircle, Dna, ChevronLeft, Loader2
} from "lucide-react";
import { api } from "../lib/api";

// ── Data ─────────────────────────────────────────────────────────────────────

const SUBJECTS = [
  { icon: <Calculator size={26} />, name: "Математика", color: "#f5c542", glow: "rgba(245,197,66,0.3)", tests: 240, avg: 178 },
  { icon: <BookOpen size={26} />, name: "Укр. мова", color: "#ffd54f", glow: "rgba(255,213,79,0.3)", tests: 310, avg: 182 },
  { icon: <Award size={26} />, name: "Історія України", color: "#ff9d2f", glow: "rgba(255,157,47,0.3)", tests: 195, avg: 174 },
  { icon: <Globe size={26} />, name: "Англійська", color: "#ffe082", glow: "rgba(255,224,130,0.3)", tests: 280, avg: 186 },
  { icon: <Zap size={26} />, name: "Фізика", color: "#f5b942", glow: "rgba(245,185,66,0.3)", tests: 160, avg: 170 },
  { icon: <FlaskConical size={26} />, name: "Хімія", color: "#d4a017", glow: "rgba(212,160,23,0.3)", tests: 140, avg: 172 },
  { icon: <Dna size={26} />, name: "Біологія", color: "#ffca28", glow: "rgba(255,202,40,0.3)", tests: 175, avg: 180 },
  { icon: <Map size={26} />, name: "Географія", color: "#ffab40", glow: "rgba(255,171,64,0.3)", tests: 130, avg: 168 },
];

const STATS = [
  { value: 4800, suffix: "+", label: "Учнів навчається", icon: <Users size={22} /> },
  { value: 92, suffix: "%", label: "Успішно здали НМТ", icon: <TrendingUp size={22} /> },
  { value: 186, suffix: "", label: "Середній бал учнів", icon: <Award size={22} /> },
  { value: 1200, suffix: "+", label: "Тестових завдань", icon: <BookOpen size={22} /> },
];

const TEACHERS = [
  { name: "Олексій Мороз", subject: "Математика", exp: "8 років", rating: 4.9, students: 620, color: "#f5c542", initials: "ОМ" },
  { name: "Ірина Коваль", subject: "Українська мова", exp: "11 років", rating: 5.0, students: 840, color: "#ffd54f", initials: "ІК" },
  { name: "Дмитро Сірий", subject: "Історія України", exp: "7 років", rating: 4.8, students: 510, color: "#ff9d2f", initials: "ДС" },
  { name: "Вікторія Ліс", subject: "Англійська мова", exp: "9 років", rating: 4.9, students: 730, color: "#ffe082", initials: "ВЛ" },
];

const TESTS = [
  { subject: "Математика", title: "Алгебра та початки аналізу", questions: 36, time: "180 хв", level: "Середній", color: "#f5c542" },
  { subject: "Укр. мова", title: "Орфографія та пунктуація", questions: 30, time: "150 хв", level: "Базовий", color: "#ffd54f" },
  { subject: "Англійська", title: "Reading Comprehension", questions: 32, time: "160 хв", level: "Складний", color: "#ffe082" },
  { subject: "Фізика", title: "Механіка та термодинаміка", questions: 28, time: "150 хв", level: "Середній", color: "#ff9d2f" },
];

const TESTIMONIALS = [
  { name: "Аліна К.", city: "Київ", score: 196, subject: "Математика", text: "Завдяки NMTHub я підняла бал з 140 до 196! Зрозумілі пояснення, купа практики. Вступила на бюджет!", avatar: "АК", color: "#f5c542" },
  { name: "Максим П.", city: "Львів", score: 189, subject: "Англійська", text: "Нарешті сайт де реально вчаться, а не просто дивляться відео. Тести, розбори, підтримка — все є.", avatar: "МП", color: "#ffd54f" },
  { name: "Даша В.", city: "Харків", score: 192, subject: "Біологія", text: "Мій репетитор порадив NMTHub. Здала на 192! Особливо круто що є пояснення до кожного питання.", avatar: "ДВ", color: "#ff9d2f" },
  { name: "Іван С.", city: "Одеса", score: 184, subject: "Фізика", text: "Готувався 3 місяці тільки тут. Структура чітка, задачі від простих до складних. Рекомендую всім.", avatar: "ІС", color: "#ffe082" },
  { name: "Юля М.", city: "Дніпро", score: 200, subject: "Укр. мова", text: "200 балів з мови! Навіть сама не очікувала. Викладач просто бог, пояснює краще за школу.", avatar: "ЮМ", color: "#ffca28" },
];

const PLANS = [
  { name: "Старт", price: 299, period: "/ місяць", desc: "Для самостійної підготовки",
    features: ["1 предмет на вибір", "Доступ до всіх тестів", "Відеоуроки", "Прогрес та статистика", "Форум підтримки"], color: "#ffd54f", popular: false },
  { name: "Профі", price: 599, period: "/ місяць", desc: "Найпопулярніший вибір",
    features: ["3 предмети на вибір", "Всі тести + розбори", "Відеоуроки + вебінари", "Перевірка домашніх", "Особистий куратор", "Пріоритетна підтримка"], color: "#f5c542", popular: true },
  { name: "Максимум", price: 999, period: "/ місяць", desc: "Повна підготовка до НМТ",
    features: ["Всі 8 предметів", "Необмежені тести", "Індивідуальні заняття", "Розбір помилок 1-на-1", "Гарантія результату", "Підготовка CV + вступ"], color: "#ff9d2f", popular: false },
];

// ── Hooks ─────────────────────────────────────────────────────────────────────

function useScrollReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("revealed"); }),
      { threshold: 0.12 }
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

function useCounter(target: number, duration = 1800) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const start = Date.now();
        const tick = () => {
          const p = Math.min((Date.now() - start) / duration, 1);
          setCount(Math.floor((1 - Math.pow(1 - p, 3)) * target));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [target, duration]);
  return { count, ref };
}

// ── Lead Modal ───────────────────────────────────────────────────────────────

type ModalType = "free" | "lesson" | null;

function LeadModal({ type, onClose }: { type: ModalType; onClose: () => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const isFree = type === "free";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim() || !phone.trim()) { setError("Заповни ім'я та номер телефону"); return; }
    setLoading(true);
    try {
      const res = await api.leads.$post({
        json: { name: name.trim(), phone: phone.trim(), subject: isFree ? undefined : (subject || undefined), type: type! },
      });
      if (!res.ok) throw new Error("fail");
      setSent(true);
    } catch {
      setError("Помилка надсилання. Спробуй ще раз.");
    } finally {
      setLoading(false);
    }
  };

  if (!type) return null;

  return (
    <div onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} className="glass fade-up"
        style={{ borderRadius: 24, padding: "clamp(24px,5vw,40px)", maxWidth: 440, width: "100%", position: "relative" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "rgba(255,255,255,0.06)", border: "none", borderRadius: 8, width: 34, height: 34, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <X size={18} />
        </button>

        {sent ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(16,185,129,0.2)", color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
              <Check size={32} />
            </div>
            <h3 className="font-display" style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Заявку надіслано!</h3>
            <p style={{ color: "#8888aa", marginBottom: 24 }}>Ми зв'яжемось з тобою найближчим часом 🚀</p>
            <button className="btn-primary" style={{ width: "100%" }} onClick={onClose}>Готово</button>
          </div>
        ) : (
          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="section-badge" style={{ alignSelf: "flex-start", marginBottom: 4 }}>
              {isFree ? "🎁 Безкоштовно" : "Запис"}
            </div>
            <h3 className="font-display" style={{ fontSize: "clamp(20px,5vw,26px)", fontWeight: 700 }}>
              {isFree ? "Безкоштовний пробний урок" : "Запис на урок"}
            </h3>
            <p style={{ color: "#8888aa", fontSize: 14, marginBottom: 6 }}>
              {isFree ? "Залиш ім'я та номер — ми передзвонимо і запишемо тебе." : "Залиш дані і ми підберемо викладача."}
            </p>
            <input className="form-input" placeholder="Твоє ім'я" value={name} onChange={(e) => setName(e.target.value)} />
            <input className="form-input" placeholder="Номер телефону" value={phone} onChange={(e) => setPhone(e.target.value)} />
            {!isFree && (
              <select className="form-input" value={subject} onChange={(e) => setSubject(e.target.value)}>
                <option value="">Обери предмет (необов'язково)</option>
                {SUBJECTS.map((s) => <option key={s.name} value={s.name}>{s.name}</option>)}
              </select>
            )}
            {error && <div style={{ color: "#f87171", fontSize: 13 }}>{error}</div>}
            <button type="submit" className="btn-primary" disabled={loading}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 6 }}>
              {loading ? <><Loader2 size={18} className="spin" /> Надсилаю...</> : <>Надіслати <ArrowRight size={18} /></>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// ── Sub components ───────────────────────────────────────────────────────────

function StatCard({ stat }: { stat: typeof STATS[0] }) {
  const { count, ref } = useCounter(stat.value);
  return (
    <div ref={ref} className="reveal glass hover-lift" style={{ borderRadius: 20, padding: "28px 20px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 10 }}>
      <div style={{ color: "#f5c542" }}>{stat.icon}</div>
      <div className="font-display gradient-text" style={{ fontSize: "clamp(2rem,6vw,3rem)", fontWeight: 800 }}>
        {count.toLocaleString("uk-UA")}{stat.suffix}
      </div>
      <div style={{ fontSize: 13, color: "#8888aa" }}>{stat.label}</div>
    </div>
  );
}

function TestimonialSlider() {
  const [idx, setIdx] = useState(0);
  const prev = () => setIdx((i) => (i - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  const next = () => setIdx((i) => (i + 1) % TESTIMONIALS.length);
  useEffect(() => { const t = setInterval(() => setIdx((i) => (i + 1) % TESTIMONIALS.length), 5000); return () => clearInterval(t); }, []);
  const t = TESTIMONIALS[idx];
  return (
    <div style={{ position: "relative", maxWidth: 720, margin: "0 auto" }}>
      <div key={idx} className="glass fade-up" style={{ borderRadius: 24, padding: "clamp(28px,5vw,40px)", textAlign: "center" }}>
        <Quote size={34} style={{ color: "#f5c542", margin: "0 auto 20px" }} />
        <p style={{ fontSize: "clamp(1rem,2.5vw,1.25rem)", lineHeight: 1.6, marginBottom: 28, color: "#d0d0e8" }}>"{t.text}"</p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, background: t.color + "33", color: t.color, border: `2px solid ${t.color}66`, flexShrink: 0 }}>{t.avatar}</div>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontWeight: 600 }}>{t.name}, {t.city}</div>
            <div style={{ fontSize: 13, color: "#8888aa" }}>{t.subject} — <span style={{ color: t.color }}>{t.score} балів</span></div>
          </div>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 24 }}>
        {TESTIMONIALS.map((_, i) => (
          <button key={i} onClick={() => setIdx(i)} aria-label={`Відгук ${i + 1}`}
            style={{ height: 8, borderRadius: 4, border: "none", cursor: "pointer", transition: "all 0.3s", width: i === idx ? 24 : 8, background: i === idx ? "#f5c542" : "rgba(255,255,255,0.2)" }} />
        ))}
      </div>
      <button onClick={prev} aria-label="Назад" className="glass" style={{ position: "absolute", left: 0, top: "40%", transform: "translateX(-50%)", width: 40, height: 40, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff" }}><ChevronLeft size={18} /></button>
      <button onClick={next} aria-label="Далі" className="glass" style={{ position: "absolute", right: 0, top: "40%", transform: "translateX(50%)", width: 40, height: 40, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff" }}><ChevronRight size={18} /></button>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────

export default function Index() {
  useScrollReveal();
  const [menuOpen, setMenuOpen] = useState(false);
  const [modal, setModal] = useState<ModalType>(null);

  const openFree = () => { setMenuOpen(false); setModal("free"); };
  const openLesson = () => { setMenuOpen(false); setModal("lesson"); };
  const scrollTo = (id: string) => { setMenuOpen(false); document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); };

  const navItems = [
    { label: "Предмети", id: "subjects" },
    { label: "Викладачі", id: "teachers" },
    { label: "Тести", id: "tests" },
    { label: "Відгуки", id: "reviews" },
    { label: "Ціни", id: "pricing" },
  ];

  return (
    <div className="dot-grid" style={{ background: "#07070d", minHeight: "100vh", width: "100%", overflowX: "hidden" }}>
      <LeadModal type={modal} onClose={() => setModal(null)} />

      {/* ── NAV ── */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, background: "rgba(7,7,13,0.85)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="container-x" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, background: "linear-gradient(135deg,#ffe082,#f5c542,#d4a017)" }}>N</div>
            <span className="font-display" style={{ fontWeight: 700, fontSize: 18 }}>NMT<span className="gradient-text">Hub</span></span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 28 }} className="hidden md:flex">
            {navItems.map((n) => <span key={n.id} className="nav-link" onClick={() => scrollTo(n.id)}>{n.label}</span>)}
          </div>

          <div style={{ alignItems: "center", gap: 12 }} className="hidden md:flex">
            <button className="btn-primary" style={{ padding: "10px 20px", fontSize: 14 }} onClick={openFree}>Почати безкоштовно</button>
          </div>

          <button className="md:hidden" style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }} onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden container-x" style={{ paddingBottom: 24, display: "flex", flexDirection: "column", gap: 16, background: "rgba(7,7,13,0.98)" }}>
            {navItems.map((n) => <span key={n.id} className="nav-link" style={{ fontSize: 16 }} onClick={() => scrollTo(n.id)}>{n.label}</span>)}
            <button className="btn-primary" style={{ width: "100%", marginTop: 4 }} onClick={openFree}>Почати безкоштовно</button>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section style={{ position: "relative", overflow: "hidden", paddingTop: 120, paddingBottom: 80 }}>
        <div className="orb orb-1" /><div className="orb orb-2" /><div className="orb orb-3" />
        <div className="container-x" style={{ position: "relative", zIndex: 10 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 56, alignItems: "center" }} className="hero-grid">
            <div style={{ textAlign: "center" }} className="hero-text">
              <div className="section-badge fade-up stagger-1" style={{ marginBottom: 24 }}><Zap size={12} /> Підготовка до НМТ</div>
              <h1 className="font-display h-hero fade-up stagger-2" style={{ fontWeight: 800, marginBottom: 24 }}>
                Здай НМТ<br /><span className="gold-shimmer">на максимум</span>
              </h1>
              <p className="fade-up stagger-3" style={{ fontSize: "clamp(1rem,2.5vw,1.15rem)", lineHeight: 1.6, marginBottom: 36, color: "#8888aa", maxWidth: 520, marginLeft: "auto", marginRight: "auto" }}>
                Онлайн-підготовка до НМТ з досвідченими викладачами. 8 предметів, 1200+ тестів, персональний прогрес і гарантія результату.
              </p>
              <div className="fade-up stagger-4 hero-cta" style={{ display: "flex", flexDirection: "column", gap: 14, justifyContent: "center", maxWidth: 420, margin: "0 auto" }}>
                <button className="btn-primary" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }} onClick={openFree}>Почати безкоштовно <ArrowRight size={18} /></button>
                <button className="btn-outline" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }} onClick={() => scrollTo("tests")}><Play size={16} /> Переглянути тести</button>
              </div>
              <div className="fade-up stagger-5 hero-proof" style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 36, justifyContent: "center" }}>
                <div style={{ display: "flex" }}>
                  {["#f5c542", "#ffd54f", "#ff9d2f", "#ffe082"].map((c, i) => (
                    <div key={i} style={{ width: 32, height: 32, borderRadius: "50%", border: `2px solid ${c}`, marginLeft: i ? -8 : 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, background: c + "33", color: c }}>{["А", "М", "Д", "В"][i]}</div>
                  ))}
                </div>
                <div style={{ textAlign: "left" }}>
                  <div style={{ display: "flex", gap: 2, marginBottom: 2 }}>{[...Array(5)].map((_, i) => <Star key={i} size={13} fill="#f59e0b" stroke="none" />)}</div>
                  <p style={{ fontSize: 12, color: "#8888aa" }}>4800+ учнів вже готуються</p>
                </div>
              </div>
            </div>

            {/* Floating cards — only desktop */}
            <div className="hero-cards" style={{ position: "relative", height: 460, display: "none" }}>
              {SUBJECTS.slice(0, 6).map((s, i) => {
                const pos = [
                  { top: 0, left: "50%", transform: "translateX(-50%)" },
                  { top: 70, right: 0 }, { top: 70, left: 0 },
                  { top: 230, right: 24 }, { top: 230, left: 24 },
                  { bottom: 20, left: "50%", transform: "translateX(-50%)" },
                ][i];
                return (
                  <div key={i} className={`glass float float-delay-${i % 4}`} style={{ position: "absolute", borderRadius: 16, padding: 14, display: "flex", alignItems: "center", gap: 12, border: `1px solid ${s.color}33`, boxShadow: `0 4px 24px ${s.glow}`, ...pos }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", background: s.color + "22", color: s.color }}>{s.icon}</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, whiteSpace: "nowrap" }}>{s.name}</div>
                      <div style={{ fontSize: 12, color: "#8888aa" }}>Середній бал {s.avg}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── SUBJECTS ── */}
      <Section id="subjects" badge="8 предметів" title={<>Обери <span className="gradient-text">свій предмет</span></>} sub="Повна підготовка до кожного предмету НМТ — від теорії до практики">
        <div className="grid-subjects" style={{ display: "grid", gap: 16 }}>
          {SUBJECTS.map((s, i) => (
            <div key={i} className="subject-card glass reveal" style={{ borderRadius: 18, padding: 22, textAlign: "center", transitionDelay: `${i * 0.05}s` }}
              onMouseEnter={(e) => { const el = e.currentTarget; el.style.boxShadow = `0 10px 32px ${s.glow}`; el.style.borderColor = s.color + "55"; }}
              onMouseLeave={(e) => { const el = e.currentTarget; el.style.boxShadow = ""; el.style.borderColor = ""; }}
              onClick={openFree}>
              <div className="ic" style={{ width: 54, height: 54, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", background: s.color + "20", color: s.color }}>{s.icon}</div>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>{s.name}</div>
              <div style={{ fontSize: 12, color: "#8888aa", marginBottom: 10 }}>{s.tests} тестів</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: s.color }}>Серед. бал {s.avg}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── STATS ── */}
      <div style={{ background: "rgba(255,255,255,0.015)" }}>
        <Section badge="Результати" title={<>Цифри <span className="gradient-text-pink">говорять самі</span></>}>
          <div className="grid-stats" style={{ display: "grid", gap: 20 }}>
            {STATS.map((s, i) => <StatCard key={i} stat={s} />)}
          </div>
        </Section>
      </div>

      {/* ── TEACHERS ── */}
      <Section id="teachers" badge="Команда" title={<>Наші <span className="gradient-text">викладачі</span></>} sub="Досвідчені вчителі які знають як підготувати до НМТ">
        <div className="grid-teachers" style={{ display: "grid", gap: 20 }}>
          {TEACHERS.map((t, i) => (
            <div key={i} className="glass reveal hover-lift" style={{ borderRadius: 18, padding: 24, textAlign: "center", transitionDelay: `${i * 0.08}s` }}>
              <div style={{ width: 76, height: 76, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 24, fontWeight: 800, background: t.color + "22", color: t.color, border: `2px solid ${t.color}44` }}>{t.initials}</div>
              <div className="font-display" style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>{t.name}</div>
              <div style={{ fontSize: 14, marginBottom: 12, color: t.color }}>{t.subject}</div>
              <div style={{ display: "flex", justifyContent: "center", gap: 16, fontSize: 12, color: "#8888aa" }}>
                <span>⏱ {t.exp}</span><span>👥 {t.students}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, marginTop: 12 }}>
                <Star size={14} fill="#f59e0b" stroke="none" /><span style={{ fontSize: 14, fontWeight: 600 }}>{t.rating}</span>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── TESTS ── */}
      <div style={{ background: "rgba(255,255,255,0.015)" }}>
        <section id="tests" style={{ padding: "80px 0" }}>
          <div className="container-x">
            <div className="tests-grid" style={{ display: "grid", gridTemplateColumns: "1fr", gap: 48, alignItems: "start" }}>
              <div className="reveal">
                <div className="section-badge" style={{ marginBottom: 20 }}>Практика</div>
                <h2 className="font-display h-section" style={{ fontWeight: 800, marginBottom: 20 }}>Тести в форматі <span className="gradient-text">реального НМТ</span></h2>
                <p style={{ color: "#8888aa", fontSize: "1.05rem", lineHeight: 1.6, marginBottom: 28 }}>Понад 1200 тестових завдань у форматі НМТ. Детальний розбір кожної відповіді, відстеження прогресу та персональні рекомендації.</p>
                <ul style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 32, listStyle: "none" }}>
                  {["Адаптивна складність завдань", "Детальний розбір помилок", "Статистика по темах", "Порівняння з іншими учнями"].map((f, i) => (
                    <li key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: "rgba(245,197,66,0.2)", color: "#f5c542" }}><Check size={12} /></div>
                      <span style={{ color: "#d0d0e8" }}>{f}</span>
                    </li>
                  ))}
                </ul>
                <button className="btn-primary" style={{ display: "flex", alignItems: "center", gap: 8 }} onClick={openFree}>Спробувати безкоштовно <ArrowRight size={18} /></button>
              </div>
              <div style={{ display: "grid", gap: 16 }}>
                {TESTS.map((t, i) => (
                  <div key={i} className="glass reveal hover-lift" style={{ borderRadius: 16, padding: 18, display: "flex", alignItems: "center", gap: 16, transitionDelay: `${i * 0.08}s` }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 14, fontWeight: 700, background: t.color + "22", color: t.color }}>{i + 1}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, color: t.color }}>{t.subject}</div>
                      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>{t.title}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 11, color: "#8888aa", flexWrap: "wrap" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}><BookOpen size={11} /> {t.questions} питань</span>
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Clock size={11} /> {t.time}</span>
                        <span style={{ padding: "2px 8px", borderRadius: 100, background: t.color + "22", color: t.color }}>{t.level}</span>
                      </div>
                    </div>
                    <button className="btn-outline" style={{ fontSize: 12, padding: "8px 12px", display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }} onClick={openFree}><Play size={12} /> Почати</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ── REVIEWS ── */}
      <Section id="reviews" badge="Відгуки" title={<>Що кажуть <span className="gradient-text">наші учні</span></>}>
        <TestimonialSlider />
      </Section>

      {/* ── PRICING ── */}
      <div style={{ background: "rgba(255,255,255,0.015)" }}>
        <Section id="pricing" badge="Тарифи" title={<>Прості <span className="gradient-text">і прозорі ціни</span></>} sub="Жодних прихованих платежів. Перший тиждень безкоштовно.">
          <div className="grid-pricing" style={{ display: "grid", gap: 28, alignItems: "start" }}>
            {PLANS.map((p, i) => (
              <div key={i} className={`reveal ${p.popular ? "pricing-popular" : "glass"}`} style={{ borderRadius: 24, padding: 32, position: "relative", transitionDelay: `${i * 0.08}s` }}>
                {p.popular && <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", padding: "6px 18px", borderRadius: 100, fontSize: 12, fontWeight: 700, color: "#2a1d00", background: "linear-gradient(135deg,#ffe082,#f5c542,#d4a017)", whiteSpace: "nowrap" }}>⭐ Найпопулярніший</div>}
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: p.color }}>{p.name}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
                  <span className="font-display" style={{ fontWeight: 800, fontSize: 44 }}>{p.price}</span>
                  <span style={{ fontSize: 14, color: "#8888aa" }}>грн{p.period}</span>
                </div>
                <p style={{ fontSize: 14, marginBottom: 28, color: "#8888aa" }}>{p.desc}</p>
                <ul style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28, listStyle: "none" }}>
                  {p.features.map((f, j) => (
                    <li key={j} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 14 }}>
                      <div style={{ width: 20, height: 20, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: p.color + "22", color: p.color }}><Check size={11} /></div>
                      {f}
                    </li>
                  ))}
                </ul>
                <button className={p.popular ? "btn-primary" : "btn-outline"} style={{ width: "100%" }} onClick={openLesson}>Обрати тариф</button>
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* ── CONTACT ── */}
      <section id="contact" style={{ padding: "80px 0" }}>
        <div className="container-x">
          <div className="contact-grid" style={{ display: "grid", gridTemplateColumns: "1fr", gap: 48 }}>
            <div className="reveal">
              <div className="section-badge" style={{ marginBottom: 20 }}>Контакти</div>
              <h2 className="font-display h-section" style={{ fontWeight: 800, marginBottom: 20 }}>Запишись <span className="gradient-text">на безкоштовний урок</span></h2>
              <p style={{ color: "#8888aa", fontSize: "1.05rem", lineHeight: 1.6, marginBottom: 32 }}>Залиш заявку і ми підберемо для тебе найкращого викладача та оптимальний план підготовки.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {[
                  { icon: <Mail size={18} />, label: "Email", value: "info@nmthub.com.ua" },
                  { icon: <Phone size={18} />, label: "Телефон", value: "+380 (67) 123-45-67" },
                  { icon: <MessageCircle size={18} />, label: "Telegram", value: "@nmthub_support" },
                ].map((c, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(245,197,66,0.15)", color: "#f5c542" }}>{c.icon}</div>
                    <div>
                      <div style={{ fontSize: 12, color: "#8888aa" }}>{c.label}</div>
                      <div style={{ fontWeight: 500 }}>{c.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="reveal glass" style={{ borderRadius: 24, padding: "clamp(28px,5vw,40px)", display: "flex", flexDirection: "column", justifyContent: "center", textAlign: "center" }}>
              <div className="glow-pulse" style={{ width: 64, height: 64, borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", color: "#2a1d00", background: "linear-gradient(135deg,#ffe082,#f5c542,#d4a017)" }}><Zap size={28} /></div>
              <h3 className="font-display" style={{ fontWeight: 700, fontSize: 24, marginBottom: 12 }}>Готовий почати?</h3>
              <p style={{ color: "#8888aa", marginBottom: 28 }}>Перший пробний урок — безкоштовно. Без прив'язки картки.</p>
              <button className="btn-primary" style={{ width: "100%", marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }} onClick={openFree}>🎁 Безкоштовний урок <ArrowRight size={18} /></button>
              <button className="btn-outline" style={{ width: "100%" }} onClick={openLesson}>Записатись на курс</button>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section style={{ padding: "40px 0 70px" }}>
        <div className="container-x">
          <div className="reveal" style={{ borderRadius: 28, overflow: "hidden", position: "relative", background: "linear-gradient(135deg, rgba(245,197,66,0.28), rgba(255,157,47,0.16))", border: "1px solid rgba(245,197,66,0.35)", padding: "clamp(36px,6vw,56px) clamp(24px,5vw,48px)" }}>
            <div className="orb" style={{ width: 300, height: 300, background: "rgba(245,197,66,0.2)", top: "50%", left: "15%", transform: "translateY(-50%)" }} />
            <div className="cta-inner" style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", gap: 28, textAlign: "center" }}>
              <div>
                <h2 className="font-display" style={{ fontWeight: 800, fontSize: "clamp(1.6rem,4vw,2.4rem)", marginBottom: 12 }}>Готовий почати підготовку? 🚀</h2>
                <p style={{ color: "#a0a0b8" }}>Перший тиждень безкоштовно. Без прив'язки картки.</p>
              </div>
              <button className="btn-primary" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "1rem", padding: "16px 32px", flexShrink: 0 }} onClick={openFree}>Почати зараз <ArrowRight size={20} /></button>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "36px 0" }}>
        <div className="container-x">
          <div className="footer-inner" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", gap: 16, textAlign: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 12, background: "linear-gradient(135deg,#ffe082,#f5c542,#d4a017)" }}>N</div>
              <span className="font-display" style={{ fontWeight: 700 }}>NMT<span className="gradient-text">Hub</span></span>
            </div>
            <p style={{ fontSize: 12, color: "#555570" }}>© 2026 NMTHub. Всі права захищені. Підготовка до НМТ онлайн.</p>
            <div style={{ display: "flex", gap: 24 }}>
              {["Умови", "Конфіденційність", "Підтримка"].map((l) => <span key={l} className="nav-link" style={{ fontSize: 12 }}>{l}</span>)}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ── Section wrapper ──────────────────────────────────────────────────────────
function Section({ id, badge, title, sub, children }: { id?: string; badge: string; title: React.ReactNode; sub?: string; children: React.ReactNode }) {
  return (
    <section id={id} style={{ padding: "80px 0", position: "relative" }}>
      <div className="container-x" style={{ position: "relative", zIndex: 10 }}>
        <div className="reveal" style={{ textAlign: "center", marginBottom: 56 }}>
          <div className="section-badge" style={{ marginBottom: 16 }}>{badge}</div>
          <h2 className="font-display h-section" style={{ fontWeight: 800, marginBottom: sub ? 16 : 0 }}>{title}</h2>
          {sub && <p style={{ color: "#8888aa", fontSize: "1.05rem", maxWidth: 540, margin: "0 auto" }}>{sub}</p>}
        </div>
        {children}
      </div>
    </section>
  );
}
