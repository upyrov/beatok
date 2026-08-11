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
      className={`animate-fade-in mx-auto p-4 md:p-8 flex flex-col gap-8 flex-1 w-full ${className}`}
      {...props}
    >
      {children}
    </main>
  );
}
