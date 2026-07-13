import { useMemo, useRef, useState, type FormEvent } from "react";
import { ArrowRight, Award, BookOpen, CheckCircle2, Menu, Phone, ShieldCheck, Sparkles, Star, Target, Users, X, Zap } from "lucide-react";
import { courses, reviews, subjects, type Course } from "../landing-content";
import { quizBank } from "../hard-quiz";
import { trackEvent } from "../analytics";

const nav = [["Головна", "home"], ["Предмети", "subjects"], ["Тест", "tests"], ["Ціни", "prices"], ["Відгуки", "reviews"], ["Заявка", "contact"]];

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function FinalLanding() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [subject, setSubject] = useState(subjects[0]);
  const [leadSubject, setLeadSubject] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const autoAdvanceTimer = useRef<number | null>(null);

  const questions = useMemo(() => quizBank[subject] || [], [subject]);
  const question = questions[index];
  const key = `${subject}-${index}`;
  const picked = answers[key];
  const score = useMemo(() => questions.reduce((sum, item, itemIndex) => sum + (answers[`${subject}-${itemIndex}`] === item.answer ? 1 : 0), 0), [answers, questions, subject]);
  const answered = questions.filter((_, itemIndex) => answers[`${subject}-${itemIndex}`] !== undefined).length;
  const wrong = Math.max(0, answered - score);
  const percent = questions.length ? Math.round((score / questions.length) * 100) : 0;
  const recommendation = score >= 8 ? "База сильна. Далі варто добити складні теми й тренувати швидкість." : score >= 5 ? "Старт нормальний. Потрібно підтягнути слабкі теми й більше практикувати типові завдання." : "Краще почати з основ. Так буде спокійніше й без хаосу перед НМТ.";

  function clearAutoAdvance() {
    if (autoAdvanceTimer.current === null) return;
    window.clearTimeout(autoAdvanceTimer.current);
    autoAdvanceTimer.current = null;
  }

  function choose(optionIndex: number) {
    if (picked !== undefined) return;
    setAnswers((current) => ({ ...current, [key]: optionIndex }));

    const correct = question?.answer === optionIndex;
    const nextScore = score + (correct ? 1 : 0);
    trackEvent("quiz_answer", {
      subject,
      question_index: index + 1,
      question_total: questions.length,
      correct,
    });

    if (index < questions.length - 1) {
      clearAutoAdvance();
      autoAdvanceTimer.current = window.setTimeout(() => {
        autoAdvanceTimer.current = null;
        setIndex((current) => (current === index ? current + 1 : current));
      }, 650);
      return;
    }

    trackEvent("quiz_complete", {
      subject,
      score: nextScore,
      total: questions.length,
      percent: questions.length ? Math.round((nextScore / questions.length) * 100) : 0,
    });
  }

  function nextQuestion() {
    clearAutoAdvance();
    setIndex((value) => Math.min(questions.length - 1, value + 1));
  }

  function prevQuestion() {
    clearAutoAdvance();
    setIndex((value) => Math.max(0, value - 1));
  }

  function openSubject(next: string) {
    clearAutoAdvance();
    setSubject(next);
    setLeadSubject(next);
    setIndex(0);
    trackEvent("subject_open", { subject: next });
    scrollTo("tests");
  }

  function chooseCourse(course: Course) {
    clearAutoAdvance();
    setSelectedCourse(course);
    setLeadSubject(subjects[0]);
    setSent(false);
    setModalOpen(true);
    trackEvent("trial_modal_open", { course: course.title });
  }

  function closeModal() {
    setModalOpen(false);
  }

  function resetCurrentTest() {
    clearAutoAdvance();
    setAnswers((current) => {
      const next = { ...current };
      questions.forEach((_, itemIndex) => delete next[`${subject}-${itemIndex}`]);
      return next;
    });
    setIndex(0);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!leadSubject.trim()) return;
    setSending(true);

    const payload = {
      type: selectedCourse ? "Заявка на пробний урок" : "Заявка",
      name: name.trim(),
      phone: phone.trim(),
      subject: leadSubject.trim(),
      score: `${score}/${questions.length}`,
      correct: score,
      wrong,
      courseTitle: "",
      coursePrice: "",
    };

    localStorage.setItem("nmthub-lead", JSON.stringify({ ...payload, createdAt: new Date().toISOString() }));
    trackEvent("lead_submit", {
      type: payload.type,
      subject: payload.subject,
      score: payload.score,
    });

    try {
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));
      localStorage.setItem("nmthub-last-telegram", JSON.stringify(data));
      trackEvent("lead_submit_result", {
        ok: Boolean(data.ok),
        type: payload.type,
      });
    } catch {
      localStorage.setItem("nmthub-last-telegram", JSON.stringify({ ok: false, error: "network_error" }));
      trackEvent("lead_submit_result", {
        ok: false,
        type: payload.type,
      });
    } finally {
      setSending(false);
      setSent(true);
      setModalOpen(false);
    }
  }

  return <main className="site" id="home"><div className="orb orb-a" /><div className="orb orb-b" /><div className="nmt-shapes" aria-hidden="true"><span className="shape shape-score">200</span><span className="shape shape-formula">x²</span><span className="shape shape-topic">НМТ</span><span className="shape shape-chem">H₂O</span><span className="shape shape-date">1648</span></div>
    <header className="header float-in"><button className="logo logo-image" onClick={() => scrollTo("home")} aria-label="NMTHub головна"><img className="logo-mark" src="/nmthub-icon.png" alt="" width={512} height={512} decoding="async" /><span className="logo-word">NMTHub</span></button><nav className="nav">{nav.map(([label, id]) => <button key={id} onClick={() => scrollTo(id)}>{label}</button>)}</nav><button className="header-cta" onClick={() => scrollTo("contact")}>Записатися</button><button className="menu-button" onClick={() => setMenuOpen(true)} aria-label="Відкрити меню"><Menu size={22} /></button></header>
    {menuOpen && <div className="mobile-panel"><button className="close-button" onClick={() => setMenuOpen(false)} aria-label="Закрити меню"><X size={22} /></button>{nav.map(([label, id]) => <button key={id} onClick={() => { setMenuOpen(false); scrollTo(id); }}>{label}</button>)}</div>}
    {modalOpen && <div className="modal-backdrop"><dialog className="lead-modal" open aria-labelledby="lead-modal-title" onCancel={closeModal}><button className="modal-close" onClick={closeModal} aria-label="Закрити форму"><X size={20} /></button><div className="lead-modal__head"><div className="label"><Sparkles size={16} /> Пробний урок</div><h2 id="lead-modal-title">Заявка на пробний урок</h2><p>Залиш контакти й обери урок. Ми зв’яжемось, покажемо формат підготовки та підберемо план після пробного заняття.</p></div><form className="form modal-form" onSubmit={submit}><label>Ім'я<input aria-label="Ім'я" value={name} onChange={(event) => setName(event.target.value)} placeholder="Ваше ім'я" required /></label><label>Телефон<input aria-label="Телефон" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+380..." type="tel" required /></label><label>Урок <small>(обов'язково)</small><select aria-label="Урок" value={leadSubject} onChange={(event) => setLeadSubject(event.target.value)} required><option value="">Оберіть урок</option>{subjects.map((item) => <option key={item} value={item}>{item}</option>)}</select></label><button className="primary" type="submit" disabled={sending}>{sending ? "Надсилаємо..." : "Надіслати заявку"} <ArrowRight size={18} /></button></form></dialog></div>}

    <section className="hero section"><div className="hero-text reveal-up"><div className="label"><Sparkles size={16} /> Підготовка до НМТ 2027</div><h1>Здай НМТ на максимум</h1><p>Пройди короткий тест і подивись, з чого варто почати. Після заявки ми підберемо формат занять під твій рівень і ціль.</p><div className="hero-actions"><button className="primary" onClick={() => scrollTo("tests")}>Пройти тест <ArrowRight size={18} /></button><button className="secondary" onClick={() => scrollTo("prices")}>Дивитися ціни</button></div></div><div className="hero-card reveal-up delay-1"><div className="score pulse-score">200</div><h2>200 — це не магія</h2><p>Це нормальний план, регулярна практика і спокійний розбір помилок. Залиш заявку — ми зв’яжемось і підкажемо, з чого почати.</p><div className="card-list"><span><CheckCircle2 size={17} /> 5 базових і 5 складних питань</span><span><CheckCircle2 size={17} /> Відповів — бачиш результат відповіді</span><span><CheckCircle2 size={17} /> У фіналі видно правильні й неправильні відповіді</span></div></div></section>

    <section className="stats reveal-up"><article><strong>8</strong><span>предметів</span></article><article><strong>80</strong><span>питань</span></article><article><strong>{score}/10</strong><span>правильно</span></article><article><strong>{wrong}/10</strong><span>неправильно</span></article></section>

    <section className="section" id="subjects"><div className="section-head"><div className="label"><BookOpen size={16} /> Предмети</div><h2>Обери предмет</h2><p>Перші 5 питань перевіряють базу. Наступні 5 — складніші, ближче до задач, де на НМТ найчастіше гублять бали.</p></div><div className="subject-grid">{subjects.map((item, itemIndex) => <article className={item === subject ? "subject interactive-card active-subject" : "subject interactive-card"} key={item}><span>{String(itemIndex + 1).padStart(2, "0")}</span><h3>{item}</h3><p>10 питань: база + складні завдання.</p><button onClick={() => openSubject(item)}>Відкрити тест</button></article>)}</div></section>

    <section className="section tests-section" id="tests"><div className="section-head"><div className="label"><Zap size={16} /> Тест</div><h2>{subject}</h2><p>Обери відповідь — вона підсвітиться.</p></div><div className="single-quiz"><div className="quiz-progress"><span>Питання {index + 1} / {questions.length}</span><b>{score}/{questions.length}</b></div><div className="quiz-bar"><i style={{ width: `${Math.max(((answered || index + 1) / questions.length) * 100, 10)}%` }} /></div>{question && <article key={key} className={picked !== undefined ? (picked === question.answer ? "quiz-card single correct" : "quiz-card single wrong") : "quiz-card single"}><div className="quiz-top"><span>{question.level}</span>{picked !== undefined && <b>{picked === question.answer ? "+1" : "0"}</b>}</div><h3>{index + 1}. {question.prompt}</h3><div className="quiz-options">{question.options.map((option, optionIndex) => <button key={option} className={picked === optionIndex ? "picked" : ""} disabled={picked !== undefined} onClick={() => choose(optionIndex)}>{option}</button>)}</div></article>}<div className="quiz-actions"><button className="secondary" onClick={prevQuestion}>Назад</button><button className="primary" onClick={nextQuestion}>{picked === undefined && index < questions.length - 1 ? "Пропустити" : index === questions.length - 1 ? "Фініш" : "Далі"}</button></div>{answered === questions.length && <div className="quiz-result"><CheckCircle2 size={28} /><strong>Результат: {score}/{questions.length}</strong><div className="test-stats"><span>Правильно: <b>{score}</b></span><span>Неправильно: <b>{wrong}</b></span><span>Точність: <b>{percent}%</b></span></div><p>{recommendation}</p><div className="quiz-actions"><button className="secondary" onClick={resetCurrentTest}>Пройти ще раз</button><button className="primary" onClick={() => scrollTo("contact")}>Записатися</button></div></div>}</div></section>

    <section className="section process"><div className="section-head left"><div className="label"><Target size={16} /> План</div><h2>Підготовка без хаосу</h2><p>Спочатку дивимось рівень. Потім збираємо план: теми, практика, повторення і контроль прогресу.</p></div><div className="process-grid"><article className="process-card interactive-card"><span>1</span><h3>Тест</h3><p>Учень проходить 10 питань і бачить стартовий результат.</p></article><article className="process-card interactive-card"><span>2</span><h3>Розбір</h3><p>Фіксуємо слабкі теми й не витрачаємо час на те, що вже виходить.</p></article><article className="process-card interactive-card"><span>3</span><h3>Заняття</h3><p>Працюємо в групі або індивідуально — залежно від цілі та темпу.</p></article></div></section>

    <section className="section benefits"><div className="benefit-card interactive-card"><Award /><strong>Фокус на балах</strong><p>Працюємо під конкретний результат, а не просто “проходимо теми”.</p></div><div className="benefit-card interactive-card"><Users /><strong>Нормальний темп</strong><p>Без тиску. Але з регулярністю, домашніми завданнями і контролем.</p></div><div className="benefit-card interactive-card"><ShieldCheck /><strong>Видно прогрес</strong><p>Після тестів зрозуміло, що вже стало краще, а що ще потрібно повторити.</p></div><div className="benefit-card interactive-card"><Star /><strong>Більше практики</strong><p>Менше сухої теорії. Більше завдань, розбору й повторення.</p></div></section>

    <section className="section" id="prices"><div className="section-head"><div className="label"><Star size={16} /> Ціни</div><h2>Формат під твою ціль</h2><p>Можна почати з групи, взяти індивідуальне заняття або одразу забронювати пакет.</p></div><div className="price-grid rich-prices">{courses.map((course, itemIndex) => <article className={itemIndex === 1 ? "price featured" : "price"} key={course.title}>{itemIndex === 1 && <span className="popular">Популярний</span>}<h3>{course.title}</h3><strong>{course.price}</strong><p>{course.text}</p><ul><li><CheckCircle2 size={16} /> План підготовки</li><li><CheckCircle2 size={16} /> Практика</li><li><CheckCircle2 size={16} /> Контроль прогресу</li></ul><button onClick={() => chooseCourse(course)}>Пробний урок</button></article>)}</div></section>

    <section className="section" id="reviews"><div className="section-head"><div className="label"><Award size={16} /> Відгуки</div><h2>Що кажуть учні</h2><p>Коротко і по суті: що змінилось після підготовки.</p></div><div className="reviews">{reviews.map((review) => <article key={`${review.subject}-${review.author}`} className="interactive-card"><div>{review.rating}</div><h3>{review.subject}</h3><p>{review.text}</p><span className="review-author">{review.author}</span></article>)}</div></section>

    <section className="section contact" id="contact"><div><div className="label"><Phone size={16} /> Заявка</div><h2>Залиш заявку</h2><p>Напиши ім’я та телефон. Предмет можна не обирати — ми уточнимо його під час дзвінка.</p></div><form className="form" onSubmit={submit}>{sent ? <div className="success"><CheckCircle2 size={42} /><h3>Заявку прийнято</h3><p>Скоро з вами зв’яжемось.</p><button type="button" onClick={() => setSent(false)}>Ще раз</button></div> : <><label>Ім'я<input aria-label="Ім'я" value={name} onChange={(event) => setName(event.target.value)} placeholder="Ваше ім'я" required /></label><label>Телефон<input aria-label="Телефон" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+380..." type="tel" required /></label><label>Предмет <small>(необов’язково)</small><select aria-label="Предмет" value={leadSubject} onChange={(event) => setLeadSubject(event.target.value)}><option value="">Не обирати зараз</option>{subjects.map((item) => <option key={item} value={item}>{item}</option>)}</select></label><div className="result-pill">Результат тесту: <b>{score}/{questions.length}</b></div><button className="primary" type="submit" disabled={sending}>{sending ? "Надсилаємо..." : "Надіслати заявку"} <ArrowRight size={18} /></button></>}</form></section>

    <footer className="footer"><div className="logo logo-image"><img className="logo-mark" src="/nmthub-icon.png" alt="" width={512} height={512} decoding="async" loading="lazy" /><span className="logo-word">NMTHub</span></div><p>© 2026 NMTHub. Підготовка до НМТ.</p></footer>
  </main>;
}
