import { Navigate, Outlet, useOutletContext, useParams } from "react-router-dom";
import { Note } from "./App";

type NoteLayoutProps = {
  notes: Note[];
};

type NoteContext = {
  note: Note;
  allNotes: Note[];
};

export function NoteLayout({ notes }: NoteLayoutProps) {
  const { id } = useParams();
  const note = notes.find((n) => n.id === id);

  if (note == null) return <Navigate to="/" replace />;

  return <Outlet context={{ note, allNotes: notes } satisfies NoteContext} />;
}

export function useNote(): NoteContext {
  return useOutletContext<NoteContext>();
}
