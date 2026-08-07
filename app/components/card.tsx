interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Card({ className = "", children, ...props }: CardProps) {
  return (
    <div
      className={`sys-panel p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
