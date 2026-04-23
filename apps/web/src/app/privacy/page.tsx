import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";

export const metadata = { title: "Политика конфиденциальности — Безбрехни" };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader variant="public" />
      <main className="flex-1">
        <article className="mx-auto max-w-3xl px-5 py-10 prose prose-neutral">
          <h1 className="text-3xl font-semibold tracking-tight text-ink-900">
            Политика конфиденциальности
          </h1>
          <p className="mt-4 text-ink-500">
            Последнее обновление: {new Date().toLocaleDateString("ru-RU")}.
          </p>
          <h2 className="mt-8 text-xl font-semibold text-ink-900">Что мы собираем</h2>
          <p className="text-ink-700 mt-2">
            Мы собираем минимум данных, необходимых для работы сервиса: адрес электронной
            почты при регистрации, факт использования AI-проверки и короткий фрагмент (до
            200 символов) проверенного текста для истории в кабинете.
          </p>
          <h2 className="mt-6 text-xl font-semibold text-ink-900">Зачем</h2>
          <p className="text-ink-700 mt-2">
            Чтобы показать вам историю ваших же проверок, вести учёт бесплатных проверок и
            активировать Pro после оплаты.
          </p>
          <h2 className="mt-6 text-xl font-semibold text-ink-900">Данные карт</h2>
          <p className="text-ink-700 mt-2">
            Мы не видим и не храним данные банковских карт. Оплата проходит на стороне
            ЮKassa, сертифицированной по PCI DSS.
          </p>
          <h2 className="mt-6 text-xl font-semibold text-ink-900">Удаление</h2>
          <p className="text-ink-700 mt-2">
            Вы можете запросить удаление аккаунта и всей истории, написав нам на электронную
            почту. Мы удалим данные в течение 30 дней.
          </p>
          <h2 className="mt-6 text-xl font-semibold text-ink-900">Контакты</h2>
          <p className="text-ink-700 mt-2">
            Если у вас есть вопросы о приватности, напишите нам. Мы стараемся отвечать в
            течение одного рабочего дня.
          </p>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
