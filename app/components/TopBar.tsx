import { Form } from "@remix-run/react";

export function TopBar() {
  return (
    <nav className="bg-white dark:bg-gray-800 shadow">
      <div className="flex justify-between h-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex-shrink-0 flex items-center">
          <a href="/" className="text-xl font-bold text-primary-600">
            Squire
          </a>
        </div>
        <div className="flex items-center">
          <Form method="post" action="/logout">
            <button
              type="submit"
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium"
            >
              Logout
            </button>
          </Form>
        </div>
      </div>
    </nav>
  );
}
