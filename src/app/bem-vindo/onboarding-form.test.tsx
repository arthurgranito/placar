import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

vi.mock("./actions", () => ({ completeProfile: vi.fn(async () => ({})) }));

import { OnboardingForm } from "./onboarding-form";

describe("OnboardingForm", () => {
  it("só libera o Continuar depois da confirmação de 18+", async () => {
    const user = userEvent.setup();
    render(<OnboardingForm defaultName="Ana Souza" defaultShowInCards next="/casa/nova" />);

    expect(screen.getByLabelText("Como a casa vai te chamar")).toHaveValue("Ana Souza");
    const continuar = screen.getByRole("button", { name: "Continuar" });
    expect(continuar).toBeDisabled();
    expect(screen.getByText("O Placar é para maiores de 18 anos.")).toBeInTheDocument();

    await user.click(screen.getByRole("checkbox", { name: /Confirmo que tenho 18 anos ou mais/ }));
    expect(continuar).toBeEnabled();
    expect(screen.queryByText("O Placar é para maiores de 18 anos.")).not.toBeInTheDocument();
  });

  it("o toggle dos cards começa ligado e pode ser desligado", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <OnboardingForm defaultName="Ana" defaultShowInCards next="/casa/nova" />,
    );

    const toggle = screen.getByRole("switch", {
      name: "Pode mostrar meu nome nos cards que a minha casa compartilhar",
    });
    expect(toggle).toHaveAttribute("aria-checked", "true");
    expect(container.querySelector('input[name="showInCards"]')).not.toBeNull();

    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-checked", "false");
    expect(container.querySelector('input[name="showInCards"]')).toBeNull();
  });
});
