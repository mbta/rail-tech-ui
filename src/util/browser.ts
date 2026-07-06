export const scrollTo = (
  elem: HTMLElement,
  position: "top" | "nearTop" | "center" | "nearest",
  smooth: boolean = false,
): void => {
  const behavior = smooth ? "smooth" : "auto";
  switch (position) {
    case "top":
      elem.scrollIntoView({ behavior, block: "start" });
      break;
    case "nearTop":
      elem.scrollIntoView({ behavior, block: "start" });
      window.scrollBy(0, -100);
      break;
    case "center":
      elem.scrollIntoView({ behavior, block: "center" });
      break;
    case "nearest":
      elem.scrollIntoView({ behavior, block: "nearest" });
      break;
  }
};
