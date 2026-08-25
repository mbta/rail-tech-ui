import { SVGProps, memo, useId } from "react";
interface SVGRProps {
  title?: string;
}
const SvgComponent = ({
  title,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => {
  const id = useId();
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      aria-labelledby={id}
      viewBox="0 0 128 128"
      {...props}
    >
      {title ? <title id={id}>{title}</title> : null}
      <path
        fill="currentColor"
        d="M64 0c35.35 0 64 28.65 64 64s-28.65 64-64 64S0 99.35 0 64 28.65 0 64 0ZM44.493 31.045c-3.333-.256-5.834 2.243-5.578 5.577.256 3.334 3.17 6.248 6.504 6.504L73.54 45.27 35.769 83.043c-2.18 2.18-1.887 5.993.654 8.534 2.541 2.541 6.355 2.834 8.534.654l37.76-37.76 2.169 28.097c.255 3.334 3.17 6.248 6.504 6.504 3.333.256 5.833-2.243 5.578-5.577l-3.274-42.67-.026-.003c-.256-3.333-3.17-6.248-6.504-6.504l-42.67-3.273Z"
      />
    </svg>
  );
};
const Memo = memo(SvgComponent);
export { Memo as DepArrow };
