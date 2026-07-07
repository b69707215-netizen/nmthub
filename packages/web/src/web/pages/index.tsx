import { useMemo, useState } from "react";
import { ArrowRight, Award, BookOpen, CheckCircle2, Clock, Menu, MessageCircle, Phone, ShieldCheck, Sparkles, Star, Target, Users, X, Zap } from "lucide-react";

const subjects = ["Українська мова", "Математика", "Історія України", "Англійська мова", "Біологія", "Географія", "Фізика", "Хімія"];
const navItems = [
  ["Головна", "home"],
  ["Предмети", "subjects"],
  ["Міні-тести", "tests"],
  ["Тарифи", "prices"],
  ["Контакти", "contact"],
];
const tests = [
  { subject: "Українська мова", question: "У якому слові правильно поставлено наголос?", options: ["вИпадок", "випАдок", "катАлог", "фенОмен"], answer: 1 },
  { subject: "Математика", question: "Скільки буде 15% від 200?", options: ["15", "20", "30", "45"], answer: 2 },
  { subject: "Історія України", question: "Коли проголошено незалежність України?", options: ["1989", "1990", "1991", "1996"], answer: 2 },
  { subject: "Англійська мова", question: "She ___ to school every day.", options: ["go", "goes", "going", "gone"], answer: 1 },
  { subject: "Біологія", question: "Органела фотосинтезу:", options: ["Мітохондрія", "Рибосома", "Хлоропласт", "Ядро"], answer: 2 },
  { subject: "Географія", question: "Найбільший океан Землі:", options: ["Атлантичний", "Індійський", "Тихий", "Північний Льодовитий"], answer: 2 },
  { subject: "Фізика", question: "Одиниця сили в SI:", options: ["Джоуль", "Ньютон", "Ват", "Паскаль"], answer: 1 },
  { subject: "Хімія", question: "Формула води:", options: ["CO₂", "O₂", "H₂O", "NaCl"], answer: 2 },
];
const plans = [
  ["Старт", "299 грн", "Міні-тести, пояснення, особистий прогрес"],
  ["Профі", "599 грн", "3 предмети, пробні НМТ, план занять"],
  ["Максимум", "999 грн", "Усі предмети, супровід, контроль результату"],
];

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Index() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(subjects[0]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [sent, setSent] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const score = useMemo(() => tests.reduce((sum, test) => sum + (answers[test.subject] === test.answer ? 1 : 0), 0), [answers]);
  const shareText = encodeURIComponent(`Нова заявка NMTHub\nІм'я: ${name || "—"}\nТелефон: ${phone || "—"}\nПредмет: ${selectedSubject}\nМіні-тест: ${score}/${tests.length}`);

  async function submitForm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = { name, phone, subject: selectedSubject, score: `${score}/${tests.length}` };
    localStorage.setItem("nmthub-lead", JSON.stringify({ ...payload, createdAt: new Date().toISOString() }));

    try {
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("send failed");
      setMessage("Заявка відправлена в Telegram.");
    } catch {
      setMessage("Заявку збережено. Якщо Telegram не прийшов, додай TELEGRAM_BOT_TOKEN і TELEGRAM_CHAT_ID у Cloudflare Variables.");
      window.open(`https://t.me/share/url?url=&text=${shareText}`, "_blank", "noopener,noreferrer");
    }

    setSent(true);
  }

  return (
    <main className="site" id="home">
      <div className="orb orb-a" /><div className="orb orb-b" />
      <header className="header float-in">
        <button className="logo" onClick={() => scrollToSection("home")}><span>NH</span><strong>NMT<span>Hub</span></strong></button>
        <nav className="nav">{navItems.map(([label, id]) => <button key={id} onClick={() => scrollToSection(id)}>{label}</button>)}</nav>
        <button className="header-cta" onClick={() => scrollToSection("contact")}>Записатися</button>
        <button className="menu-button" onClick={() => setMenuOpen(true)} aria-label="Меню"><Menu size={22} /></button>
      </header>

      {menuOpen && <div className="mobile-panel"><button className="close-button" onClick={() => setMenuOpen(false)}><X size={22} /></button>{navItems.map(([label, id]) => <button key={id} onClick={() => { setMenuOpen(false); scrollToSection(id); }}>{label}</button>)}</div>}

      <section className="hero section">
        <div className="hero-text reveal-up"><div className="label"><Sparkles size={16} /> Онлайн-підготовка до НМТ</div><h1>Підготуйся до НМТ красиво, швидко і без хаосу</h1><p>Сучасний сайт з анімаціями, міні-тестами, адаптацією під телефон і швидким записом у Telegram.</p><div className="hero-actions"><button className="primary" onClick={() => scrollToSection("tests")}>Пройти міні-тест <ArrowRight size={18} /></button><button className="secondary" onClick={() => scrollToSection("subjects")}>Предмети</button></div></div>
        <div className="hero-card reveal-up delay-1"><div className="score pulse-score">200</div><h2>Ціль — високий бал</h2><p>Від швидкої діагностики до впевненого результату на НМТ.</p><div className="card-list"><span><CheckCircle2 size={17} /> Анімований дизайн</span><span><CheckCircle2 size={17} /> Міні-тести</span><span><CheckCircle2 size={17} /> Telegram-заявка</span></div></div>
      </section>

      <section className="stats reveal-up"><article><strong>8</strong><span>предметів</span></article><article><strong>1200+</strong><span>завдань</span></article><article><strong>{score}/{tests.length}</strong><span>твій тест-бал</span></article><article><strong>24/7</strong><span>доступ</span></article></section>

      <section className="section" id="subjects"><div className="section-head"><div className="label"><BookOpen size={16} /> Предмети</div><h2>Усе потрібне для підготовки</h2><p>Обирай предмет і проходь короткий тест.</p></div><div className="subject-grid">{subjects.map((subject, index) => <article className="subject interactive-card" key={subject}><span>{String(index + 1).padStart(2, "0")}</span><h3>{subject}</h3><p>Теорія, практика, повторення і завдання у форматі НМТ.</p><button onClick={() => { setSelectedSubject(subject); scrollToSection("tests"); }}>Тест</button></article>)}</div></section>

      <section className="section tests-section" id="tests"><div className="section-head"><div className="label"><Zap size={16} /> Міні-тести</div><h2>Питання з кожного предмета</h2><p>Вибери відповідь і дивись результат одразу.</p></div><div className="quiz-grid">{tests.map((test) => { const picked = answers[test.subject]; const done = picked !== undefined; const correct = picked === test.answer; return <article className={done ? (correct ? "quiz-card correct" : "quiz-card wrong") : "quiz-card"} key={test.subject}><div className="quiz-top"><span>{test.subject}</span>{done && <b>{correct ? "+1" : "0"}</b>}</div><h3>{test.question}</h3><div className="quiz-options">{test.options.map((option, index) => <button key={option} className={picked === index ? "picked" : ""} onClick={() => setAnswers((current) => ({ ...current, [test.subject]: index }))}>{option}</button>)}</div></article>; })}</div></section>

      <section className="section process" id="process"><div className="section-head left"><div className="label"><Target size={16} /> Як працює</div><h2>Проста система підготовки</h2><p>Діагностика, план, практика і повторення слабких тем.</p></div><div className="process-grid"><article className="process-card interactive-card"><span>1</span><h3>Діагностика</h3><p>Швидко бачимо рівень учня.</p></article><article className="process-card interactive-card"><span>2</span><h3>План</h3><p>Даємо чіткий маршрут підготовки.</p></article><article className="process-card interactive-card"><span>3</span><h3>Практика</h3><p>Тренуємо формат реального НМТ.</p></article></div></section>

      <section className="section benefits"><div className="benefit-card interactive-card"><Clock /><strong>Швидко</strong><p>Сайт легко відкривається на телефоні.</p></div><div className="benefit-card interactive-card"><Users /><strong>Зручно</strong><p>Учень бачить предмети, тести і заявку.</p></div><div className="benefit-card interactive-card"><ShieldCheck /><strong>Оптимізовано</strong><p>Менше зайвого коду, швидший build.</p></div><div className="benefit-card interactive-card"><Award /><strong>Результат</strong><p>Фокус на високий бал НМТ.</p></div></section>

      <section className="section" id="prices"><div className="section-head"><div className="label"><Star size={16} /> Тарифи</div><h2>Формати підготовки</h2><p>Можна змінити під реальні ціни перед запуском.</p></div><div className="price-grid">{plans.map(([name, price, text], index) => <article className={index === 1 ? "price featured" : "price"} key={name}>{index === 1 && <span className="popular">Популярний</span>}<h3>{name}</h3><strong>{price}</strong><p>{text}</p><ul><li><CheckCircle2 size={16} /> Міні-тести</li><li><CheckCircle2 size={16} /> План підготовки</li><li><CheckCircle2 size={16} /> Прогрес учня</li></ul><button onClick={() => scrollToSection("contact")}>Обрати</button></article>)}</div></section>

      <section className="section contact" id="contact"><div><div className="label"><Phone size={16} /> Заявка</div><h2>Запис на пробний урок</h2><p>Заповни форму. Якщо Cloudflare Variables налаштовані, заявка автоматично прийде в Telegram.</p><a className="contact-link" href={`https://t.me/share/url?url=&text=${shareText}`} target="_blank" rel="noreferrer"><MessageCircle size={18} /> Відправити вручну</a></div><form className="form" onSubmit={submitForm}>{sent ? <div className="success"><CheckCircle2 size={42} /><h3>Заявку прийнято</h3><p>{message}</p><button type="button" onClick={() => setSent(false)}>Ще раз</button></div> : <><label>Ім'я<input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ваше ім'я" required /></label><label>Телефон<input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+380..." required /></label><label>Предмет<select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>{subjects.map((subject) => <option key={subject}>{subject}</option>)}</select></label><div className="result-pill">Результат міні-тесту: <b>{score}/{tests.length}</b></div><button className="primary" type="submit">Надіслати заявку <ArrowRight size={18} /></button></>}</form></section>

      <footer className="footer"><div className="logo"><span>NH</span><strong>NMT<span>Hub</span></strong></div><p>© 2026 NMTHub. Сайт підготовки до НМТ.</p></footer>
    </main>
  );
}
