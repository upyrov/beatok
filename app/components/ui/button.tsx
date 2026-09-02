import { Button as BaseButton } from "@base-ui/react";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "~/lib/utils";

const buttonVariants = cva(
	"inline-flex items-center justify-center rounded-xl text-[14px] font-semibold transition duration-150 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed",
	{
		variants: {
			variant: {
				default:
					"relative border border-[var(--btn-border)] text-[var(--btn-text)] shadow-[var(--btn-shadow)] bg-linear-to-b from-[var(--btn-bg-from)] via-[var(--btn-bg-via)] to-[var(--btn-bg-to)] hover:not-disabled:from-[var(--btn-bg-hover-from)] hover:not-disabled:via-[var(--btn-bg-hover-via)] hover:not-disabled:to-[var(--btn-bg-hover-to)] active:not-disabled:from-[var(--btn-bg-active)] active:not-disabled:via-[var(--btn-bg-active)] active:not-disabled:to-[var(--btn-bg-active)] active:not-disabled:shadow-[var(--btn-shadow-active)]",
				destructive: "bg-red-500 text-white hover:bg-red-600/90",
				outline:
					"border border-input-border bg-background hover:bg-muted-hover text-foreground",
				secondary:
					"bg-secondary text-secondary-foreground hover:bg-secondary/80",
				ghost: "hover:bg-muted-hover text-foreground",
				link: "text-blue-500 underline-offset-4 hover:underline",
			},
			size: {
				default: "h-10 px-5",
				sm: "h-8 px-3 text-xs",
				lg: "h-12 px-8 text-base",
				icon: "h-10 w-10",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

interface ButtonProps
	extends React.ComponentProps<typeof BaseButton>,
		VariantProps<typeof buttonVariants> {
	asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant, size, ...props }, ref) => {
		return (
			<BaseButton
				ref={ref}
				className={cn(buttonVariants({ variant, size, className }))}
				{...props}
			/>
		);
	},
);
Button.displayName = "Button";

export { Button };
