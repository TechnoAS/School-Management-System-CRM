import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { StudentsPage } from "@/features/students/StudentsPage";
import { INIT_STUDENTS, INIT_COURSES, INIT_BATCHES } from "@/constants/data";

function renderStudents() {
  const setStudents = vi.fn();
  const { container } = render(
    <MemoryRouter>
      <StudentsPage
        students={INIT_STUDENTS}
        setStudents={setStudents}
        courses={INIT_COURSES}
        batches={INIT_BATCHES}
      />
    </MemoryRouter>
  );
  return { setStudents, container };
}

describe("StudentsPage", () => {
  it("renders student list", () => {
    renderStudents();
    expect(screen.getAllByText(/student management/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(INIT_STUDENTS[0].name)[0]).toBeInTheDocument();
  });

  it("filters students by search", async () => {
    const { container } = renderStudents();
    const search = within(container).getAllByPlaceholderText(/search by name/i)[0];
    await userEvent.type(search, INIT_STUDENTS[0].id);
    expect(screen.getAllByText(INIT_STUDENTS[0].name)[0]).toBeInTheDocument();
  });

  it("opens new admission modal", async () => {
    renderStudents();
    const buttons = screen.getAllByRole("button", { name: /new admission/i });
    await userEvent.click(buttons[0]);
    expect(screen.getAllByText(/new student admission/i)[0]).toBeInTheDocument();
  });
});
