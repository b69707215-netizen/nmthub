import { useMemo, useState } from "react";
import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Clock,
  GraduationCap,
  Menu,
  MessageCircle,
  Phone,
  Star,
  Target,
  X,
  Zap,
} from "lucide-react";

const subjects = [
  "Математика",
  "Українська мова",
  "Історія України",
  "Англійська мова",
  "Фізика",
  "Хімія",
  "Біологія",
  "Географія",
];

const plans = [
  {
    name: "Старт",
    price: "299 грн",
    text: "Для самостійної підготовки з одного предмета.",
    features: ["Тести НМТ", "Короткі пояснення", "Особистий прогрес"],
  },
  {
    name: "Профі",
    price: "599 грн",
    text: "Оптимальний план для активної підготовки.",
    features: ["3 предмети", "Розбір помилок", "План занять", "Підтримка куратора"],
    popular: true,
  },
  {
    name: "Максимум",
    price: "999 грн",
    text: "Повний супровід до дня тестування.",
    features: ["Усі предмети", "Індивідуальні заняття", "Пробні НМТ", "Контроль результату"],
  },
];

const stats = [
  { value: "8", label: "предметів" },
  { value: "1200+", label: "тестових завдань" },
  { value: "92%", label: "учнів покращили бал" },
  { value: "24/7", label: "доступ до платформи" },
];

const reviews = [
  "Після місяця занять я зрозуміла структуру тесту і перестала боятися математики.",
  "Зручно, що все в одному місці: тести, пояснення, план підготовки і контроль прогресу.",
  "Найбільше допомогли пробні НМТ та розбір помилок після кожного тесту.",
];

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Index() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [formSent, setFormSent] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState(subjects[0]);

  const leadText = useMemo(() => {
    const lines = [
      "Нова заявка NMTHub",
      `Ім'я: ${name || "—"}`,
      `Телефон: ${phone || "—"}`,
      `Предмет: ${subject}`,
    ];
    return encodeURIComponent(lines.join("\n"));
  }, [name, phone, subject]);

  const nav = [
    ["Предмети", "subjects"],
    ["Переваги", "benefits"],
    ["Ціни", "pricing"],
    ["Заявка", "contact"],
  ];

  function submitLead(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    const saved = JSON.parse(localStorage.getItem("nmthub-leads") || "[]");
    saved.push({ name: name.trim(), phone: phone.trim(), subject, createdAt: new Date().toISOString() });
    localStorage.setItem("nmthub-leads", JSON.stringify(saved));
    setFormSent(true);
  }

  return (
    <main className="site-shell">
      <header className="topbar">
        <button className="brand" onClick={() => scrollToId("home")} aria-label="NMTHub home">
          <span className="brand-mark">N</span>
          <span>NMT<b>Hub</b></span>
        </button>

        <nav className="desktop-nav" aria-label="Головна навігація">
          {nav.map(([label, id]) => (
            <button key={id} onClick={() => scrollToId(id)}>{label}</button>
          ))}
        </nav>

        <button className="nav-cta desktop-only" onClick={() => scrollToId("contact")}>Пробний урок</button>
        <button className="menu-btn" onClick={() => setMenuOpen(true)} aria-label="Відкрити меню"><Menu size={22} /></button>
      </header>

      {menuOpen && (
        <div className="mobile-menu">
          <button className="menu-close" onClick={() => setMenuOpen(false)} aria-label="Закрити меню"><X size={22} /></button>
          {nav.map(([label, id]) => (
            <button key={id} onClick={() => { setMenuOpen(false); scrollToId(id); }}>{label}</button>
          ))}
        </div>
      )}

      <section id="home" className="hero section-pad">
        <div className="hero-content">
          <div className="badge"><Zap size={16} /> Онлайн-підготовка до НМТ</div>
          <h1>Здай НМТ <span>на максимум</span></h1>
          <p>
            NMTHub — сучасна платформа для підготовки до НМТ: тести, пояснення,
            пробні варіанти, план навчання і контроль прогресу в одному місці.
          </p>
          <div className="hero-actions">
            <button className="primary" onClick={() => scrollToId("contact")}>Записатися <ArrowRight size={18} /></button>
            <button className="secondary" onClick={() => scrollToId("subjects")}>Дивитися предмети</button>
          </div>
        </div>

        <div className="hero-card" aria-label="Переваги NMTHub">
          <div className="score-ring">200</div>
          <h2>Ціль — високий бал</h2>
          <p>Розумна структура занять допомагає рухатися від слабких тем до впевненого результату.</p>
          <div className="mini-list">
            <span><CheckCircle2 size={16} /> Персональний план</span>
            <span><CheckCircle2 size={16} /> Пробні тести</span>
            <span><CheckCircle2 size={16} /> Розбір помилок</span>
          </div>
        </div>
      </section>

      <section className="stats-grid" aria-label="Статистика">
        {stats.map((item) => (
          <div className="stat" key={item.label}>
            <strong>{item.value}</strong>
            <span>{item.label}</span>
          </div>
        ))}
      </section>

      <section id="subjects" className="section-pad">
        <div className="section-head">
          <span className="eyebrow"><BookOpen size={16} /> Предмети</span>
          <h2>Підготовка з усіх основних предметів НМТ</h2>
          <p>Обирай один предмет або готуйся комплексно за повною програмою.</p>
        </div>
        <div className="subject-grid">
          {subjects.map((item, index) => (
            <article className="subject-card" key={item}>
              <div className="subject-icon">{index + 1}</div>
              <h3>{item}</h3>
              <p>Теми, тести, пояснення та завдання у форматі реального НМТ.</p>
            </article>
          ))}
        </div>
      </section>

      <section id="benefits" className="section-pad split-section">
        <div>
          <span className="eyebrow"><Target size={16} /> Чому це працює</span>
          <h2>Без хаосу, зайвих матеріалів і втрати часу</h2>
          <p>
            Сайт побудований як зрозуміла система: спочатку діагностика, потім план,
            практика, перевірка помилок і повторення слабких тем.
          </p>
        </div>
        <div className="benefit-list">
          <div><GraduationCap /> <span>Програма під НМТ</span></div>
          <div><Clock /> <span>Підготовка у зручному темпі</span></div>
          <div><Award /> <span>Фокус на результат</span></div>
          <div><MessageCircle /> <span>Підтримка під час навчання</span></div>
        </div>
      </section>

      <section className="section-pad reviews">
        <div className="section-head">
          <span className="eyebrow"><Star size={16} /> Відгуки</span>
          <h2>Що кажуть учні</h2>
        </div>
        <div className="review-grid">
          {reviews.map((review, index) => (
            <article className="review-card" key={review}>
              <div className="stars">★★★★★</div>
              <p>“{review}”</p>
              <strong>Учень #{index + 1}</strong>
            </article>
          ))}
        </div>
      </section>

      <section id="pricing" className="section-pad">
        <div className="section-head">
          <span className="eyebrow"><ChevronDown size={16} /> Тарифи</span>
          <h2>Обери формат підготовки</h2>
        </div>
        <div className="pricing-grid">
          {plans.map((plan) => (
            <article className={plan.popular ? "plan popular" : "plan"} key={plan.name}>
              {plan.popular && <span className="popular-label">Популярний</span>}
              <h3>{plan.name}</h3>
              <strong>{plan.price}</strong>
              <p>{plan.text}</p>
              <ul>
                {plan.features.map((feature) => <li key={feature}><CheckCircle2 size={16} /> {feature}</li>)}
              </ul>
              <button onClick={() => scrollToId("contact")}>Обрати</button>
            </article>
          ))}
        </div>
      </section>

      <section id="contact" className="section-pad contact-section">
        <div>
          <span className="eyebrow"><Phone size={16} /> Заявка</span>
          <h2>Запишись на пробний урок</h2>
          <p>Залиш контакти, і менеджер допоможе підібрати предмет та формат підготовки.</p>
          <a className="telegram-link" href={`https://t.me/share/url?url=&text=${leadText}`} target="_blank" rel="noreferrer">
            Відправити дані в Telegram
          </a>
        </div>

        <form className="lead-form" onSubmit={submitLead}>
          {formSent ? (
            <div className="success-box">
              <CheckCircle2 size={38} />
              <h3>Заявку збережено</h3>
              <p>Дані збережені у браузері. Для живого відправлення додай Telegram/Cloudflare secret.</p>
              <button type="button" onClick={() => setFormSent(false)}>Нова заявка</button>
            </div>
          ) : (
            <>
              <label>
                Ім'я
                <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Наприклад, Данило" required />
              </label>
              <label>
                Телефон
                <input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+380..." required />
              </label>
              <label>
                Предмет
                <select value={subject} onChange={(event) => setSubject(event.target.value)}>
                  {subjects.map((item) => <option key={item}>{item}</option>)}
                </select>
              </label>
              <button className="primary" type="submit">Надіслати заявку <ArrowRight size={18} /></button>
            </>
          )}
        </form>
      </section>

      <footer className="footer">
        <div className="brand"><span className="brand-mark">N</span><span>NMT<b>Hub</b></span></div>
        <p>© 2026 NMTHub. Підготовка до НМТ онлайн.</p>
      </footer>
    </main>
  );
}
