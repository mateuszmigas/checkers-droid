import { ButtonHTMLAttributes, forwardRef } from "react";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`rounded-md border 
            hover:bg-primary/50
            border-primary bg-primary/20 text-primary px-4 py-2 ${className}`}
        {...props}
      />
    );
  }
);

