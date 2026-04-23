import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";

export const metadata = { title: "Пользовательское соглашение — Безбрехни" };

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader variant="public" />
      <main className="flex-1">
        <article className="mx-auto max-w-3xl px-5 py-10 prose prose-neutral">
          <h1 className="text-3xl font-semibold tracking-tight text-ink-900">
            Пользовательское соглашение
          </h1>
          <p className="mt-4 text-ink-500">
            Последнее обновление: {new Date().toLocaleDateString("ru-RU")}.
          </p>
          <h2 className="mt-8 text-xl font-semibold text-ink-900">Кто мы</h2>
          <p className="text-ink-700 mt-2">
            Сервис «Безбрехни» — это расширение и сайт, которые помогают пользователям
            критически оценивать контент в интернете с помощью AI.
          </p>
          <h2 className="mt-6 text-xl font-semibold text-ink-900">Что обещаем</h2>
          <p className="text-ink-700 mt-2">
            Мы стараемся давать спокойные и понятные оценки. AI может ошибаться, поэтому
            наши ответы — это помощь, а не окончательная истина. Важные решения принимайте
            сами, опираясь на разные источники.
          </p>
          <h2 className="mt-6 text-xl font-semibold text-ink-900">Оплата и возврат</h2>
          <p className="text-ink-700 mt-2">
            Pro оформляется на 30 дней без автоматического продления. Если в течение 14
            дней вам что-то не подошло — напишите нам, вернём деньги.
          </p>
          <h2 className="mt-6 text-xl font-semibold text-ink-900">Что нельзя</h2>
          <p className="text-ink-700 mt-2">
            Использовать сервис для нарушения закона и прав третьих лиц, пытаться
            злоупотреблять лимитами или вредить инфраструктуре.
          </p>
          <h2 className="mt-6 text-xl font-semibold text-ink-900">Изменения</h2>
          <p className="text-ink-700 mt-2">
            Мы можем обновлять это соглашение. О существенных изменениях сообщим по
            электронной почте.
          </p>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
