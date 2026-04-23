import Link from "next/link";
import SiteHeader from "../../../components/SiteHeader";
import SiteFooter from "../../../components/SiteFooter";

export default function BillingSuccessPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader variant="app" />
      <main className="flex-1 flex items-center justify-center">
        <div className="max-w-md w-full text-center px-5 py-10">
          <div className="mx-auto w-14 h-14 rounded-pill bg-good/15 text-good flex items-center justify-center text-2xl">
            ✓
          </div>
          <h1 className="mt-4 text-2xl font-semibold text-ink-900">Спасибо за покупку!</h1>
          <p className="mt-2 text-ink-500">
            Платёж принят. Как только ЮKassa подтвердит его, Pro активируется автоматически.
            Обычно это занимает несколько секунд.
          </p>
          <Link href="/app" className="btn-primary mt-6 inline-flex">
            Перейти в кабинет
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
