import { Outlet } from "react-router";

export const handle = { sitemap: () => [] };

export default function AuthLayout() {
	return (
		<div className="flex-1 flex flex-col gap-4 items-center p-4 md:p-8">
			<Outlet />
		</div>
	);
}
