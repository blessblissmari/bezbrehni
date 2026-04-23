import Link from "next/link";
import { Logo } from "@bezbrehni/ui";

export default function SiteHeader({ variant = "public" }: { variant?: "public" | "app" }) {
  return (
    <header className="w-full">
      <div className="mx-auto max-w-6xl px-5 py-5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Logo size={28} />
          <span className="text-ink-900 font-semibold tracking-tight text-lg">Безбрехни</span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-3">
          {variant === "public" ? (
            <>
              <Link href="/#how" className="btn-ghost hidden sm:inline-flex">
                Как это работает
              </Link>
              <Link href="/#pro" className="btn-ghost hidden sm:inline-flex">
                Pro
              </Link>
              <Link href="/login" className="btn-ghost">
                Войти
              </Link>
              <Link href="/signup" className="btn-primary">
                Попробовать
              </Link>
            </>
          ) : (
            <>
              <Link href="/app" className="btn-ghost">
                Мой кабинет
              </Link>
              <Link href="/billing" className="btn-ghost">
                Тариф
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
