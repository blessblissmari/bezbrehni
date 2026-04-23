import Link from "next/link";
import SiteHeader from "../../../components/SiteHeader";
import SiteFooter from "../../../components/SiteFooter";

export default function BillingCancelPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader variant="app" />
      <main className="flex-1 flex items-center justify-center">
        <div className="max-w-md w-full text-center px-5 py-10">
          <h1 className="text-2xl font-semibold text-ink-900">Оплата не завершена</h1>
          <p className="mt-2 text-ink-500">
            Ничего страшного. Можно попробовать ещё раз или вернуться в кабинет.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Link href="/billing" className="btn-primary">
              Попробовать снова
            </Link>
            <Link href="/app" className="btn-secondary">
              В кабинет
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
