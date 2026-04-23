import Link from "next/link";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import { Logo } from "@bezbrehni/ui";
import { FREE_CHECK_LIMIT } from "@bezbrehni/shared";

const features = [
  {
    title: "Кратко пересказать",
    desc: "Длинную статью — в несколько спокойных предложений на русском.",
  },
  {
    title: "Объяснить простыми словами",
    desc: "Без канцелярита и сложных терминов, как будто объясняет друг.",
  },
  {
    title: "Найти сомнительное",
    desc: "Подсветим утверждения, которые стоит перепроверить.",
  },
  {
    title: "Найти противоречия",
    desc: "Если автор сам себе противоречит — мы это увидим.",
  },
  {
    title: "Задать вопрос по фрагменту",
    desc: "Спросите что угодно — AI ответит по выделенному тексту.",
  },
  {
    title: "Переписать понятнее",
    desc: "Тот же смысл, но читать его становится легко.",
  },
  {
    title: "Сгенерировать задачи",
    desc: "Превращаем статью в список конкретных шагов.",
  },
];

const faq = [
  {
    q: "Это правда бесплатно?",
    a: `Да, ${FREE_CHECK_LIMIT} проверки доступны сразу без оплаты. Потом — Pro, если захотите продолжить.`,
  },
  {
    q: "Мои тексты куда-то сохраняются?",
    a: "Мы храним только краткий фрагмент последних проверок, чтобы вы видели историю в кабинете. Можно удалить в любой момент.",
  },
  {
    q: "В каких браузерах работает?",
    a: "Chrome, Яндекс Браузер, Microsoft Edge. Для остальных Chromium-браузеров тоже должно работать.",
  },
  {
    q: "Как устроена оплата?",
    a: "Оплата через ЮKassa. После оплаты Pro активируется автоматически на 30 дней.",
  },
  {
    q: "Можно вернуть деньги?",
    a: "Да. Напишите нам в течение 14 дней с момента оплаты — вернём без лишних вопросов.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader variant="public" />

      {/* HERO */}
      <section className="relative">
        <div className="mx-auto max-w-6xl px-5 pt-10 pb-20 sm:pt-16 sm:pb-28 text-center">
          <div className="inline-flex items-center gap-2 rounded-pill bg-accent-soft text-accent-dark px-4 py-1.5 text-sm font-medium mb-6">
            <Logo size={16} color="#244FA8" noseColor="#C77A1F" title="" />
            Расширение для Chrome, Яндекс Браузера и Edge
          </div>
          <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight text-ink-900 leading-[1.05]">
            AI проверяет контент
            <br />
            <span className="text-accent">за вас — спокойно.</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-ink-500 leading-relaxed">
            Наведите курсор на любой текст в интернете — и узнайте, стоит ли ему доверять.
            Без криков, без рекламы, без суеты.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/install" className="btn-primary">
              Установить расширение
            </Link>
            <Link href="/signup" className="btn-secondary">
              Создать аккаунт — {FREE_CHECK_LIMIT} проверки
            </Link>
          </div>
          <p className="mt-5 text-sm text-ink-500">
            Без карты. Без навязчивых писем. Отменить можно в один клик.
          </p>
        </div>
      </section>

      {/* HOW */}
      <section id="how" className="py-16 bg-white border-y border-cream-200">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="text-3xl sm:text-4xl font-semibold text-ink-900 tracking-tight text-center">
            Как это работает
          </h2>
          <p className="mt-3 text-center text-ink-500 max-w-xl mx-auto">
            Три простых шага. Никакой настройки.
          </p>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                n: "1",
                t: "Наводите курсор",
                d: "На статью, пост, комментарий или абзац. Рядом появится аккуратная кнопка-лупа.",
              },
              {
                n: "2",
                t: "Нажимаете",
                d: "AI спокойно анализирует содержимое. Без вспышек и резких движений.",
              },
              {
                n: "3",
                t: "Читаете вердикт",
                d: "Рядом открывается мягкое окно с кратким объяснением и причинами.",
              },
            ].map((s) => (
              <div key={s.n} className="card p-6">
                <div className="w-10 h-10 rounded-pill bg-accent-soft text-accent-dark flex items-center justify-center font-semibold">
                  {s.n}
                </div>
                <h3 className="mt-4 text-xl font-semibold text-ink-900">{s.t}</h3>
                <p className="mt-2 text-ink-500">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FREE */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-5 text-center">
          <h2 className="text-3xl sm:text-4xl font-semibold text-ink-900 tracking-tight">
            {FREE_CHECK_LIMIT} бесплатные проверки
          </h2>
          <p className="mt-3 text-ink-500 max-w-xl mx-auto">
            Чтобы понять, подходит ли вам — без риска и без карты.
          </p>
        </div>
      </section>

      {/* PRO */}
      <section id="pro" className="py-16 bg-cream-50">
        <div className="mx-auto max-w-6xl px-5">
          <div className="text-center">
            <div className="inline-block rounded-pill bg-ink-900 text-white px-4 py-1.5 text-sm font-medium">
              Pro
            </div>
            <h2 className="mt-4 text-3xl sm:text-4xl font-semibold text-ink-900 tracking-tight">
              Все инструменты, которые пригодятся
            </h2>
            <p className="mt-3 text-ink-500 max-w-2xl mx-auto">
              Pro открывает дополнительные действия. Ничего лишнего, только то, что экономит время.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f) => (
              <div key={f.title} className="card p-5">
                <h3 className="text-lg font-semibold text-ink-900">{f.title}</h3>
                <p className="mt-1 text-ink-500 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/billing" className="btn-primary">
              Оформить Pro
            </Link>
            <Link href="/signup" className="btn-secondary">
              Сначала попробовать бесплатно
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <div className="mx-auto max-w-3xl px-5">
          <h2 className="text-3xl sm:text-4xl font-semibold text-ink-900 tracking-tight text-center">
            Часто спрашивают
          </h2>
          <div className="mt-10 space-y-3">
            {faq.map((item) => (
              <details
                key={item.q}
                className="group card p-5 open:shadow-lift transition"
              >
                <summary className="cursor-pointer list-none flex items-center justify-between gap-4">
                  <span className="font-medium text-ink-900">{item.q}</span>
                  <span className="text-ink-500 group-open:rotate-45 transition">+</span>
                </summary>
                <p className="mt-3 text-ink-500">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-5 text-center">
          <h2 className="text-3xl sm:text-4xl font-semibold text-ink-900 tracking-tight">
            Готовы читать спокойнее?
          </h2>
          <p className="mt-3 text-ink-500">Установка занимает меньше минуты.</p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/install" className="btn-primary">
              Установить расширение
            </Link>
            <Link href="/signup" className="btn-secondary">
              Сначала создать аккаунт
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
