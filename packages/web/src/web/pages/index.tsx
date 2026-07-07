import { useState } from "react";
import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  Menu,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Users,
  X,
} from "lucide-react";

const navItems = [
  { label: "Головна", id: "home" },
  { label: "Предмети", id: "subjects" },
  { label: "Як працює", id: "process" },
  { label: "Тарифи", id: "prices" },
  { label: "Контакти", id: "contact" },
];

const subjects = [
  "Українська мова",
  "Математика",
  "Історія України",
  "Англійська мова",
  "Біологія",
  "Географія",
  "Фізика",
  "Хімія",
];

const process = [
  {
    title: "Діагностика",
    text: "Учень проходить короткий тест, щоб зрозуміти сильні та слабкі теми.",
  },
  {
    title: "План підготовки",
    text: "Після діагностики формується зрозумілий маршрут: що вчити, коли повторювати і як тренуватися.",
  },
  {
    title: "Практика НМТ",
    text: "Тести, пояснення і пробні варіанти допомагають звикнути до реального формату і таймінгу.",
  },
];

const prices = [
  {
    name: "Старт",
    price: "299 грн",
    description: "Для самостійної підготовки з одного предмета.",
    features: ["Тести НМТ", "Пояснення до тем", "Особистий прогрес"],
  },
  {
    name: "Профі",
    price: "599 грн",
    description: "Оптимальний формат для стабільної підготовки.",
    features: ["3 предмети", "Пробні НМТ", "Розбір помилок", "План занять"],
    featured: true,
  },
  {
    name: "Максимум",
    price: "999 грн",
    description: "Повний супровід до дня тестування.",
    features: ["Усі предмети", "Індивідуальні заняття", "Контроль результату"],
  },
];

const reviews = [
  "Стало зрозуміло, які теми реально треба підтягнути перед НМТ.",
  "Зручно, що все в одному місці: тести, план і пояснення.",
  "Після пробних тестів перестав боятися формату НМТ.",
];

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Index() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(subjects[0]);

  function submitForm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSent(true);
  }

  return (
    <main className="site" id="home">
      <header className="header">
        <button className="logo" onClick={() => scrollToSection("home")} aria-label="NMTHub">
          <span>NH</span>
          <strong>NMT<span>Hub</span></strong>
        </button>

        <nav className="nav" aria-label="Основна навігація">
          {navItems.map((item) => (
            <button key={item.id} onClick={() => scrollToSection(item.id)}>{item.label}</button>
          ))}
        </nav>

        <button className="header-cta" onClick={() => scrollToSection("contact")}>Записатися</button>
        <button className="menu-button" onClick={() => setMenuOpen(true)} aria-label="Відкрити меню"><Menu size={22} /></button>
      </header>

      {menuOpen && (
        <div className="mobile-panel">
          <button className="close-button" onClick={() => setMenuOpen(false)} aria-label="Закрити меню"><X size={22} /></button>
          {navItems.map((item) => (
            <button key={item.id} onClick={() => { setMenuOpen(false); scrollToSection(item.id); }}>{item.label}</button>
          ))}
        </div>
      )}

      <section className="hero section">
        <div className="hero-text">
          <div className="label"><Sparkles size={16} /> Онлайн-підготовка до НМТ</div>
          <h1>Підготуйся до НМТ без хаосу і зайвого стресу</h1>
          <p>
            NMTHub — це простий сайт для підготовки до НМТ: предмети, тести, план занять,
            пробні варіанти та заявка на пробний урок в одному місці.
          </p>
          <div className="hero-actions">
            <button className="primary" onClick={() => scrollToSection("contact")}>Пробний урок <ArrowRight size={18} /></button>
            <button className="secondary" onClick={() => scrollToSection("subjects")}>Переглянути предмети</button>
          </div>
        </div>

        <div className="hero-card">
          <div className="score">200</div>
          <h2>Ціль — високий бал</h2>
          <p>Сайт веде учня від першої діагностики до впевненого проходження пробних НМТ.</p>
          <div className="card-list">
            <span><CheckCircle2 size={17} /> Зрозумілий план</span>
            <span><CheckCircle2 size={17} /> Практика у форматі НМТ</span>
            <span><CheckCircle2 size={17} /> Фокус на слабких темах</span>
          </div>
        </div>
      </section>

      <section className="stats">
        <article><strong>8</strong><span>предметів</span></article>
        <article><strong>1200+</strong><span>завдань</span></article>
        <article><strong>24/7</strong><span>доступ</span></article>
        <article><strong>92%</strong><span>покращують результат</span></article>
      </section>

      <section className="section" id="subjects">
        <div className="section-head">
          <div className="label"><BookOpen size={16} /> Предмети</div>
          <h2>Усе потрібне для підготовки до НМТ</h2>
          <p>Обирай один предмет або готуйся комплексно за кількома напрямами.</p>
        </div>
        <div className="subject-grid">
          {subjects.map((subject, index) => (
            <article className="subject" key={subject}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{subject}</h3>
              <p>Теорія, тести, повторення і пробні завдання у форматі НМТ.</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section process" id="process">
        <div className="section-head left">
          <div className="label"><Target size={16} /> Як працює</div>
          <h2>Проста система підготовки</h2>
          <p>Без зайвих складних кабінетів і незрозумілих екранів — тільки те, що допомагає готуватися.</p>
        </div>
        <div className="process-grid">
          {process.map((item, index) => (
            <article className="process-card" key={item.title}>
              <span>{index + 1}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section benefits">
        <div className="benefit-card"><Clock /><strong>Підготовка у своєму темпі</strong><p>Учень бачить, що вже пройдено, а що ще треба повторити.</p></div>
        <div className="benefit-card"><Users /><strong>Підтримка учнів</strong><p>Заявка допомагає швидко підібрати предмет і формат навчання.</p></div>
        <div className="benefit-card"><ShieldCheck /><strong>Стабільний сайт</strong><p>Сайт працює як статичний лендинг і швидко відкривається на телефоні.</p></div>
        <div className="benefit-card"><Award /><strong>Фокус на результат</strong><p>Головна мета — впевнено пройти НМТ і покращити бал.</p></div>
      </section>

      <section className="section" id="prices">
        <div className="section-head">
          <div className="label"><Star size={16} /> Тарифи</div>
          <h2>Формати підготовки</h2>
          <p>Ціни можна змінити під реальні умови перед запуском.</p>
        </div>
        <div className="price-grid">
          {prices.map((plan) => (
            <article className={plan.featured ? "price featured" : "price"} key={plan.name}>
              {plan.featured && <span className="popular">Популярний</span>}
              <h3>{plan.name}</h3>
              <strong>{plan.price}</strong>
              <p>{plan.description}</p>
              <ul>
                {plan.features.map((feature) => <li key={feature}><CheckCircle2 size={16} /> {feature}</li>)}
              </ul>
              <button onClick={() => scrollToSection("contact")}>Обрати</button>
            </article>
          ))}
        </div>
      </section>

      <section className="section reviews">
        {reviews.map((review) => (
          <article key={review}>
            <div>★★★★★</div>
            <p>“{review}”</p>
          </article>
        ))}
      </section>

      <section className="section contact" id="contact">
        <div>
          <div className="label"><Phone size={16} /> Контакти</div>
          <h2>Запис на пробний урок</h2>
          <p>Залиш контакти, і ми підберемо предмет, формат підготовки та зручний графік.</p>
          <a className="contact-link" href="tel:+380000000000">+380 00 000 00 00</a>
          <a className="contact-link" href="https://t.me/" target="_blank" rel="noreferrer"><MessageCircle size={18} /> Telegram</a>
        </div>

        <form className="form" onSubmit={submitForm}>
          {sent ? (
            <div className="success">
              <CheckCircle2 size={42} />
              <h3>Заявку прийнято</h3>
              <p>Форма працює на сайті без backend. Для реального надсилання можна підключити Telegram або email.</p>
              <button type="button" onClick={() => setSent(false)}>Заповнити ще раз</button>
            </div>
          ) : (
            <>
              <label>Ім'я<input name="name" placeholder="Ваше ім'я" required /></label>
              <label>Телефон<input name="phone" placeholder="+380..." required /></label>
              <label>Предмет
                <select value={selectedSubject} onChange={(event) => setSelectedSubject(event.target.value)}>
                  {subjects.map((subject) => <option key={subject}>{subject}</option>)}
                </select>
              </label>
              <button className="primary" type="submit">Надіслати заявку <ArrowRight size={18} /></button>
            </>
          )}
        </form>
      </section>

      <footer className="footer">
        <div className="logo"><span>NH</span><strong>NMT<span>Hub</span></strong></div>
        <p>© 2026 NMTHub. Сайт підготовки до НМТ.</p>
      </footer>
    </main>
  );
}
