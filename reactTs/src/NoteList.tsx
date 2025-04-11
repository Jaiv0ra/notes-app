import { useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  Col,
  Form,
  Modal,
  Row,
  Stack,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import ReactSelect from "react-select";
import { Note, Tag } from "./App";
import styles from "./NoteList.module.css";

type SimplifiedNote = {
  tags: Tag[];
  title: string;
  id: string;
};

type NoteListProps = {
  availableTags: Tag[];
  notes: Note[];
  onUpdateTag: (id: string, label: string) => void;
  onDeleteTag: (id: string) => void;
  onAddTagFromModal: () => void;
};

type EditTagsProps = {
  availableTags: Tag[];
  show: boolean;
  handleClose: () => void;
  onUpdateTag: (id: string, label: string) => void;
  onDeleteTag: (id: string) => void;
  onAddTag: () => void;
};

export function NoteList({
  availableTags,
  notes,
  onUpdateTag,
  onDeleteTag,
  onAddTagFromModal,
}: NoteListProps) {
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [title, setTtile] = useState<string>("");
  const [editTagsModalIsOpen, setEditTagsModalIsOpen] = useState(false);
  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      return (
        (title === "" ||
          note.title.toLocaleLowerCase().includes(title.toLocaleLowerCase())) &&
        (selectedTags.length === 0 ||
          selectedTags.every((tag) => {
            return note.tags.some((noteTag) => noteTag.id === tag.id);
          }))
      );
    });
  }, [title, selectedTags, notes]);

  return (
    <>
      <Row className="mb-3">
        <Col>
          <h2>Notes</h2>
        </Col>
        <Col xs="auto">
          <Stack direction="horizontal" gap={2}>
            <Link to="/new">
              <Button variant="primary">Create</Button>
            </Link>
            <Button
              onClick={() => setEditTagsModalIsOpen(true)}
              variant="outline-secondary"
            >
              Edit Tags
            </Button>
          </Stack>
        </Col>
      </Row>
      <Form>
        <Row className="mb-4">
          <Col>
            <Form.Group controlId="title">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                value={title}
                onChange={(e) => setTtile(e.target.value)}
                placeholder="Search By Ttile..."
              ></Form.Control>
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="tags">
              <Form.Label>Tags</Form.Label>
              <ReactSelect
                placeholder="Filter By Tags"
                value={selectedTags.map((tag) => {
                  return { label: tag.label, value: tag.id };
                })}
                options={availableTags.map((tag) => {
                  return { label: tag.label, value: tag.id };
                })}
                onChange={(tags) => {
                  setSelectedTags(
                    tags.map((tag) => {
                      return { label: tag.label, id: tag.value };
                    })
                  );
                }}
                isMulti
              ></ReactSelect>
            </Form.Group>
          </Col>
        </Row>
      </Form>
      <Row xs={1} sm={2} lg={3} xl={4} className="g-3">
        {filteredNotes.map((note) => (
          <Col key={note.id}>
            <NoteCard id={note.id} title={note.title} tags={note.tags} />
          </Col>
        ))}
      </Row>
      <EditTagsModal
        availableTags={availableTags}
        show={editTagsModalIsOpen}
        handleClose={() => {
          setEditTagsModalIsOpen(false);
        }}
        onUpdateTag={onUpdateTag}
        onDeleteTag={onDeleteTag}
        onAddTag={onAddTagFromModal}
      />
    </>
  );
}

function NoteCard({ id, title, tags }: SimplifiedNote) {
  return (
    <Card
      as={Link}
      to={`/${id}`}
      className={`h-100 text-decoration-none text-reset ${styles.card}`}
    >
      <Card.Body>
        <Stack
          gap={2}
          className="align-items-center h-100 justify-content-center"
        >
          <span className="fs-5">{title}</span>
          {tags.length > 0 && (
            <Stack
              gap={1}
              direction="horizontal"
              className="justify-content-center flex-wrap"
            >
              {tags.map((tag) => (
                <Badge className="text-truncate" key={tag.id}>
                  {tag.label}
                </Badge>
              ))}
            </Stack>
          )}
        </Stack>
      </Card.Body>
    </Card>
  );
}

function EditTagsModal({
  availableTags,
  onUpdateTag,
  onDeleteTag,
  show,
  handleClose,
  onAddTag,
}: EditTagsProps) {
  function onSubmit() {
    if (!availableTags.every((tag) => tag.label.trim() !== "")) {
      return;
    } else {
      handleClose();
    }
  }

  return (
    <Modal show={show} onHide={onSubmit}>
      <Modal.Header closeButton>
        <Modal.Title>Edit Tags</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Stack gap={3}>
            {availableTags.map((tag: Tag) => (
              <Row key={tag.id}>
                <Col>
                  <Form.Group>
                    <Form.Control
                      type="text"
                      value={tag.label}
                      required
                      isInvalid={tag.label.trim() === ""}
                      onChange={(e) => onUpdateTag(tag.id, e.target.value)}
                    />
                    <Form.Control.Feedback type="invalid">
                      Tag cannot be empty
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col xs="auto">
                  <Button
                    variant="outline-danger"
                    onClick={() => onDeleteTag(tag.id)}
                  >
                    &times;
                  </Button>
                </Col>
              </Row>
            ))}
            <Stack
              className="justify-content-end"
              direction="horizontal"
              gap={3}
            >
              <Button onClick={onAddTag} variant="primary">
                Add New Tag
              </Button>
              <Button onClick={onSubmit} variant="outline-secondary">
                Close
              </Button>
            </Stack>
          </Stack>
        </Form>
      </Modal.Body>
    </Modal>
  );
}
