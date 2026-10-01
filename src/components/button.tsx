import { ReactElement, ReactNode } from "react";
import { className } from "src/util/dom";
import { Spinner } from "src/components/icons/Spinner";

type ButtonType = "primary" | "secondary" | "tertiary" | "quaternary";
const colorStyles: Record<ButtonType, string> = {
  primary:
    "light:bg-alt-blue-700 light:text-white light:hover:bg-alt-blue-700/75 dark:bg-blue-300 dark:text-slate-800 dark:hover:bg-blue-300/75",
  secondary:
    "border border-current hover:bg-slate-400/50 dark:text-white light:text-black",
  tertiary:
    "light:border light:border-alt-blue-700 light:text-alt-blue-700 light:hover:bg-alt-blue-700/25 dark:bg-blue-300/20 dark:text-blue-300 dark:hover:bg-blue-300/[.45]",
  quaternary:
    "border light:border-alt-blue-700 light:text-alt-blue-700 light:hover:bg-alt-blue-700/25 dark:border-blue-300 dark:text-blue-300 dark:hover:bg-blue-300/25",
};

type ButtonSize = "small" | "medium" | "large";
const sizeStyles: Record<ButtonSize, string> = {
  small: "h-8 px-2 text-xs",
  medium: "h-8 px-2 text-sm",
  large: "h-10 min-w-[5rem] rounded-md px-4 text-base",
};

export const Button = ({
  type,
  size,
  className: extraClassName,
  children,
  disabled = false,
  loading = false,
  onClick,
}: {
  type: ButtonType;
  size: ButtonSize;
  className?: string;
  children: ReactNode;
  disabled?: boolean;
  loading?: boolean;
  onClick: "submit" | (() => void);
}): ReactElement => {
  return (
    <button
      type={onClick === "submit" ? "submit" : "button"}
      className={className([
        "relative rounded font-semibold disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-40",
        colorStyles[type],
        sizeStyles[size],
        extraClassName,
      ])}
      disabled={disabled || loading}
      onClick={onClick !== "submit" ? onClick : undefined}
    >
      <div
        className={className([
          "flex flex-row items-center justify-center gap-2 leading-none no-underline",
          loading ? "text-transparent" : null,
        ])}
      >
        {children}
      </div>
      {loading ? (
        <div className="absolute inset-1 flex items-center justify-center">
          <Spinner className="inline h-full animate-spin fill-current" />
        </div>
      ) : null}
    </button>
  );
};
