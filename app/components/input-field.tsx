import { Input } from "~/components/ui/input";
import { FieldError } from "./field-error";

interface InputFieldProps<TValue> {
	name: string;
	value: TValue;
	errors?: string[];
	onChange: (value: TValue) => void;
	onBlur: () => void;
	placeholder?: string;
	className?: string;
	inputClassName?: string;
}

export function InputField<TValue>({
	name,
	value,
	errors,
	onChange,
	onBlur,
	placeholder,
	className = "",
	inputClassName = "",
}: InputFieldProps<TValue>) {
	return (
		<div className={`flex flex-col gap-1 ${className}`}>
			<Input
				name={name}
				className={`w-full ${inputClassName}`}
				placeholder={placeholder}
				value={value as string}
				onBlur={onBlur}
				onChange={(e) => onChange(e.target.value as TValue)}
			/>
			<FieldError errors={errors} />
		</div>
	);
}
