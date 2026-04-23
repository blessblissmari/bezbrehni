import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-cream-200 bg-cream-50">
      <div className="mx-auto max-w-6xl px-5 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="text-sm text-ink-500">
          © {new Date().getFullYear()} Безбрехни. Все права защищены.
        </div>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/privacy" className="text-ink-700 hover:text-accent">
            Политика конфиденциальности
          </Link>
          <Link href="/terms" className="text-ink-700 hover:text-accent">
            Пользовательское соглашение
          </Link>
        </div>
      </div>
    </footer>
  );
}
