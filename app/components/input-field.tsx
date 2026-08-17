import { Input as BaseInput } from "@base-ui/react";
import { FieldError } from "./field-error";

interface InputFieldProps<TValue> {
  name: string;
  value: TValue;
  errors?: string[];
  onChange: (value: TValue) => void;
  onBlur: () => void;
  placeholder?: string;
  className?: string;
}

export function InputField<TValue>({
  name,
  value,
  errors,
  onChange,
  onBlur,
  placeholder,
  className = "",
}: InputFieldProps<TValue>) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <BaseInput
        name={name}
        className="w-full px-3 py-2"
        placeholder={placeholder}
        value={value as string}
        onBlur={onBlur}
        onChange={(e) => onChange(e.target.value as TValue)}
      />
      <FieldError errors={errors} />
    </div>
  );
}
