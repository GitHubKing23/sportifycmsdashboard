import { render, screen } from "@testing-library/react";
import App from "./App";

test("shows login screen by default", () => {
  render(<App />);
  expect(screen.getByText(/Administrator Login/i)).toBeInTheDocument();
});
