import { render } from "@testing-library/react";
import { ReactElement } from "react";

type RenderOptions = Parameters<typeof render>[1];

export const testSnapshot = (
  description: string,
  node: () => ReactElement,
  options?: RenderOptions,
): void => {
  test(description, () => {
    expectMatchesSnapshot(node(), options);
  });
};

export const expectMatchesSnapshot = (
  node: ReactElement,
  options?: RenderOptions,
): void => {
  const view = render(node, options);
  expect(view.container.firstChild).toMatchSnapshot();
};
