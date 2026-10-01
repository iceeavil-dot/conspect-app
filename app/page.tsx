import Link from 'next/link'

export default function LandingPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-white dark:bg-black">
      <div className="max-w-md text-center">
        <h1 className="text-4xl font-bold mb-4 text-black dark:text-white">
          Конспект
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-10">
          Заметки, планер, привычки и календарь — всё в одном месте.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/register"
            className="px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded-md font-medium hover:opacity-80"
          >
            Регистрация
          </Link>
          <Link
            href="/login"
            className="px-6 py-2 border border-black dark:border-white text-black dark:text-white rounded-md font-medium hover:bg-gray-100 dark:hover:bg-gray-900"
          >
            Войти
          </Link>
        </div>
      </div>
    </main>
  )
}