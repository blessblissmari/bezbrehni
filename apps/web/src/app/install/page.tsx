import Link from "next/link";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";

export const metadata = {
  title: "Установить Безбрехни — расширение для Chrome, Edge, Яндекс Браузера",
  description:
    "Скачайте расширение Безбрехни и начните проверять контент в интернете без суеты.",
};

export default function InstallPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader variant="public" />
      <section className="py-16">
        <div className="mx-auto max-w-3xl px-5">
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-ink-900">
            Установить расширение
          </h1>
          <p className="mt-4 text-ink-500 text-lg">
            Пока расширение доступно для установки напрямую — как разархивированная
            сборка. В Chrome Web Store и Microsoft Edge Add-ons появится в ближайшее
            время.
          </p>

          <div className="mt-10 card p-6">
            <h2 className="text-xl font-semibold text-ink-900">Шаг 1. Скачать</h2>
            <p className="mt-2 text-ink-500">
              Скачайте архив со сборкой и распакуйте в любую папку (например, в
              «Документы»).
            </p>
            <div className="mt-4">
              <a
                href="/bezbrehni-extension.zip"
                className="btn-primary inline-flex"
                download
              >
                Скачать Безбрехни.zip
              </a>
            </div>
          </div>

          <div className="mt-6 card p-6">
            <h2 className="text-xl font-semibold text-ink-900">
              Шаг 2. Открыть страницу расширений
            </h2>
            <p className="mt-2 text-ink-500">
              Скопируйте адрес в адресную строку браузера и нажмите Enter:
            </p>
            <ul className="mt-3 space-y-2 text-ink-500">
              <li>
                <strong className="text-ink-900">Chrome:</strong>{" "}
                <code className="bg-cream-100 px-2 py-0.5 rounded">chrome://extensions</code>
              </li>
              <li>
                <strong className="text-ink-900">Яндекс Браузер:</strong>{" "}
                <code className="bg-cream-100 px-2 py-0.5 rounded">browser://extensions</code>
              </li>
              <li>
                <strong className="text-ink-900">Microsoft Edge:</strong>{" "}
                <code className="bg-cream-100 px-2 py-0.5 rounded">edge://extensions</code>
              </li>
            </ul>
          </div>

          <div className="mt-6 card p-6">
            <h2 className="text-xl font-semibold text-ink-900">
              Шаг 3. Включить «Режим разработчика»
            </h2>
            <p className="mt-2 text-ink-500">
              В правом верхнем углу страницы включите переключатель «Режим
              разработчика» (Developer mode). Это нужно только для установки —
              расширение будет работать как обычно.
            </p>
          </div>

          <div className="mt-6 card p-6">
            <h2 className="text-xl font-semibold text-ink-900">
              Шаг 4. «Загрузить распакованное расширение»
            </h2>
            <p className="mt-2 text-ink-500">
              Нажмите кнопку «Загрузить распакованное расширение» (Load unpacked) и
              выберите папку, в которую вы распаковали архив со Шага 1. Готово —
              значок лупы появится рядом с адресной строкой.
            </p>
          </div>

          <div className="mt-10 rounded-xl border border-cream-200 bg-cream-50 p-6">
            <h3 className="font-semibold text-ink-900">Что дальше</h3>
            <p className="mt-2 text-ink-500">
              Наведите курсор на любую статью, комментарий или абзац — рядом появится
              маленькая кнопка с лупой. Нажмите, и Безбрехни спокойно проверит текст.
            </p>
            <div className="mt-5 flex flex-col sm:flex-row gap-3">
              <Link href="/signup" className="btn-primary">
                Создать аккаунт для входа в расширение
              </Link>
              <Link href="/" className="btn-secondary">
                Вернуться на главную
              </Link>
            </div>
          </div>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
