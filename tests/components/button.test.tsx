import { render } from "@testing-library/react";
import { Button } from "src/index";
import userEvent from "@testing-library/user-event";

describe("Button", () => {
  test("renders a primary button", () => {
    const view = render(
      <Button type="primary" size="small" onClick={jest.fn()}>
        Primary
      </Button>,
    );
    expect(view.getByRole("button")).toBeInTheDocument();
  });
  test("renders a secondary button", () => {
    const view = render(
      <Button type="secondary" size="small" onClick={jest.fn()}>
        Secondary
      </Button>,
    );
    expect(view.getByRole("button")).toBeInTheDocument();
  });
  test("renders a primary button", () => {
    const view = render(
      <Button type="tertiary" size="small" onClick={jest.fn()}>
        Tertiary
      </Button>,
    );
    expect(view.getByRole("button")).toBeInTheDocument();
  });
  test("renders a quaternary button", () => {
    const view = render(
      <Button type="quaternary" size="small" onClick={jest.fn()}>
        Quaternary
      </Button>,
    );
    expect(view.getByRole("button")).toBeInTheDocument();
  });

  test("calls onClick function on click", async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    const view = render(
      <Button type="primary" size="small" onClick={onClick}>
        Content
      </Button>,
    );
    await user.click(view.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test("loading=true shows a spinner", async () => {
    const view = render(
      <Button type="primary" size="small" onClick={jest.fn()} loading={true}>
        Content
      </Button>,
    );
    const img = view.getByRole("img");
    expect(img).toBeInTheDocument();
    expect(img.tagName).toEqual("svg");
  });
});
