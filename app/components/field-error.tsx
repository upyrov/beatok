export interface FieldErrorProps {
	errors?: unknown[] | string | null;
	className?: string;
}

export function FieldError({ errors, className = "" }: FieldErrorProps) {
	if (!errors) return null;

	const errorList = Array.isArray(errors)
		? errors.map((e) =>
				typeof e === "string" ? e : (e as Error)?.message || String(e),
			)
		: [
				typeof errors === "string"
					? errors
					: (errors as Error)?.message || String(errors),
			];

	return (
		!!errorList.length && (
			<span
				role="alert"
				className={`text-red-500 dark:text-red-400 text-xs font-medium flex items-center gap-1 mt-1 ${className}`}
			>
				{errorList.join(", ")}
			</span>
		)
	);
}
