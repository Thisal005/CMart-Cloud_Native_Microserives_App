import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

describe("Button UI Component", () => {
  it("renders children text content correctly", () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByText("Click Me")).toBeInTheDocument();
  });

  it("handles user click interactions", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);
    fireEvent.click(screen.getByText("Click Me"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});

describe("Input UI Component", () => {
  it("should capture and register text changes", () => {
    const handleChange = vi.fn();
    render(<Input placeholder="Enter username" onChange={handleChange} />);
    const input = screen.getByPlaceholderText("Enter username") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "test-user" } });
    expect(input.value).toBe("test-user");
    expect(handleChange).toHaveBeenCalled();
  });
});

describe("Badge UI Component", () => {
  it("displays tag values correctly", () => {
    render(<Badge>NEW</Badge>);
    expect(screen.getByText("NEW")).toBeInTheDocument();
  });
});

describe("ConfirmDialog UI Component", () => {
  it("renders header titles and triggers handlers", () => {
    const handleConfirm = vi.fn();
    const handleClose = vi.fn();

    render(
      <ConfirmDialog
        isOpen={true}
        onClose={handleClose}
        onConfirm={handleConfirm}
        title="Delete Item"
        description="Are you sure you want to delete this?"
        confirmLabel="Confirm"
      />
    );

    expect(screen.getByText("Delete Item")).toBeInTheDocument();
    expect(screen.getByText("Are you sure you want to delete this?")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Confirm"));
    expect(handleConfirm).toHaveBeenCalled();

    fireEvent.click(screen.getByText("Cancel"));
    expect(handleClose).toHaveBeenCalled();
  });
});
export type { Button as ButtonType };
