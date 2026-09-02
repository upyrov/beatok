import { useLocation } from "react-router";

interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {}

export function PageContainer({
	className = "",
	children,
	...props
}: PageContainerProps) {
	const location = useLocation();

	return (
		<main
			key={location.key}
			className={`transition duration-300 starting:opacity-0 starting:translate-y-1 mx-auto p-4 md:p-8 flex flex-col gap-8 flex-1 w-full ${className}`}
			{...props}
		>
			{children}
		</main>
	);
}
