import { className } from "src/util/dom";

const Spinner = ({ extraClassName }: { extraClassName?: string }) => {
  return (
    <div
      className={className([
        "h-6 w-6 animate-spin rounded-full border-4 border-dotted border-current border-t-transparent",
        extraClassName,
      ])}
      data-testid="spinner"
    ></div>
  );
};

export { Spinner };
