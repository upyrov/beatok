import { Link } from "react-router";

export function Footer() {
  return (
    <footer className="py-6 px-4 border-t border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5">
      <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-7xl mx-auto text-gray-500 text-sm gap-4">
        <div>
          &copy; {new Date().getFullYear()} Beatok. All rights reserved.
        </div>
        <div className="flex gap-6">
          <Link
            to="/privacy-policy"
            className="hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Privacy Policy
          </Link>
          <Link
            to="/terms-of-service"
            className="hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
}
