import { Form, Link } from "@remix-run/react";
import { Settings } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export function TopBar({ className }: { className?: string }) {
  return (
    <nav className={cn("bg-white dark:bg-gray-800 shadow", className)}>
      <div className="flex justify-between h-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex-shrink-0 flex items-center">
          <Link to="/" className="text-xl font-bold text-primary-600">
            Squire
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <Link
            to="/settings"
            className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white p-2 rounded-md"
          >
            <Settings className="h-5 w-5" />
          </Link>
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
