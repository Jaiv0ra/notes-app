import { Card } from "react-bootstrap";
import { NoteData, Tag } from "./App";
import { NoteForm } from "./NoteForm";

type NewNoteProps = {
  onSubmit: (data: NoteData) => void;
  onAddTag: (tag: Tag) => void;
  availableTags: Tag[];
};

export function NewNote({ onSubmit, onAddTag, availableTags }: NewNoteProps) {
  return (
    <>
      <Card>
        <Card.Header>
          <h5>New Note</h5>
        </Card.Header>
        <Card.Body>
          <NoteForm
            onSubmit={onSubmit}
            onAddTag={onAddTag}
            availableTags={availableTags}
          ></NoteForm>
        </Card.Body>
      </Card>
    </>
  );
}
