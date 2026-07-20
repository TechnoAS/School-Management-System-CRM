import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router";
import { StudentsPage } from "@/features/students/StudentsPage";
import { StudentAdmissionPage } from "@/features/students/StudentAdmissionPage";
import { INIT_STUDENTS, INIT_COURSES, INIT_BATCHES } from "@/constants/data";

function renderStudents() {
  const setStudents = vi.fn();
  const { container } = render(
    <MemoryRouter initialEntries={["/students"]}>
      <Routes>
        <Route
          path="/students"
          element={
            <StudentsPage
              students={INIT_STUDENTS}
              setStudents={setStudents}
              courses={INIT_COURSES}
              batches={INIT_BATCHES}
            />
          }
        />
        <Route
          path="/students/new"
          element={
            <StudentAdmissionPage
              students={INIT_STUDENTS}
              setStudents={setStudents}
              courses={INIT_COURSES}
              batches={INIT_BATCHES}
            />
          }
        />
      </Routes>
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

  it("navigates to new admission page", async () => {
    renderStudents();
    const buttons = screen.getAllByRole("button", { name: /new admission/i });
    await userEvent.click(buttons[0]);
    expect(screen.getAllByText(/student admission/i)[0]).toBeInTheDocument();
  });
});
