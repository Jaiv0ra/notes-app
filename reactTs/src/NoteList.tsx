import { lazy, Suspense, useMemo, useState } from "react";
import { Badge, Button, Col, Form, Modal, Row, Stack } from "react-bootstrap";
import { Link } from "react-router-dom";
import ReactSelect from "react-select";
import { Note, Tag } from "./App";
import styles from "./NoteList.module.css";
import darkSelectStyles from "./selectStyles";
const SettingsModal = lazy(() =>
  import("./components/SettingsModal").then((m) => ({ default: m.SettingsModal }))
);

type SimplifiedNote = {
  tags: Tag[];
  title: string;
  id: string;
  isFavorite?: boolean;
};

type NoteListProps = {
  availableTags: Tag[];
  notes: Note[];
  onUpdateTag: (id: string, label: string) => void;
  onDeleteTag: (id: string) => void;
  onAddTagFromModal: () => void;
  onToggleFavorite: (id: string) => void;
};

type NoteCardProps = SimplifiedNote & {
  onToggleFavorite: (id: string) => void;
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
  onToggleFavorite,
}: NoteListProps) {
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [title, setTitle] = useState<string>("");
  const [editTagsModalIsOpen, setEditTagsModalIsOpen] = useState(false);
  const [settingsModalIsOpen, setSettingsModalIsOpen] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      const titleMatch =
        title === "" ||
        note.title.toLowerCase().includes(title.toLowerCase());
      const tagMatch =
        selectedTags.length === 0 ||
        selectedTags.every((tag) =>
          note.tags.some((nt) => nt.id === tag.id)
        );
      const favMatch = !showFavoritesOnly || !!note.isFavorite;
      return titleMatch && tagMatch && favMatch;
    });
  }, [title, selectedTags, notes, showFavoritesOnly]);

  const favoriteNotes = useMemo(
    () => filteredNotes.filter((n) => n.isFavorite),
    [filteredNotes]
  );
  const regularNotes = useMemo(
    () => filteredNotes.filter((n) => !n.isFavorite),
    [filteredNotes]
  );
  const hasAnyFavorites = notes.some((n) => n.isFavorite);

  const tagOptions = availableTags.map((tag) => ({
    label: tag.label,
    value: tag.id,
  }));
  const selectedTagOptions = selectedTags.map((tag) => ({
    label: tag.label,
    value: tag.id,
  }));

  return (
    <>
      {/* Header */}
      <Row className="align-items-center mb-4">
        <Col>
          <h1 style={{ fontSize: "1.4rem", margin: 0, fontWeight: 700 }}>
            NoteVault
          </h1>
        </Col>
        <Col xs="auto">
          <Stack direction="horizontal" gap={2}>
            {hasAnyFavorites && (
              <button
                type="button"
                data-testid="favorites-filter"
                className={`favorite-btn ${showFavoritesOnly ? "active" : ""}`}
                onClick={() => setShowFavoritesOnly((v) => !v)}
                aria-label={
                  showFavoritesOnly ? "Show all notes" : "Show favorites only"
                }
                aria-pressed={showFavoritesOnly}
                style={{ fontSize: "1rem", padding: "6px 8px" }}
              >
                <i
                  className={`bi bi-star${showFavoritesOnly ? "-fill" : ""}`}
                />
              </button>
            )}
            <Link to="/new">
              <Button variant="primary" size="sm">
                <i className="bi bi-plus-lg me-1" />
                New Note
              </Button>
            </Link>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => setEditTagsModalIsOpen(true)}
            >
              Tags
            </Button>
            <button
              type="button"
              className="favorite-btn"
              onClick={() => setSettingsModalIsOpen(true)}
              aria-label="AI Settings"
              style={{ fontSize: "1rem", padding: "6px 8px" }}
            >
              <i className="bi bi-gear" />
            </button>
          </Stack>
        </Col>
      </Row>

      {/* Filters */}
      <Row className="mb-4 g-2">
        <Col xs={12} sm={6}>
          <Form.Group controlId="title">
            <Form.Label className="visually-hidden">Search notes</Form.Label>
            <Form.Control
              type="search"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Search notes…"
            />
          </Form.Group>
        </Col>
        <Col xs={12} sm={6}>
          <Form.Group controlId="tags">
            <Form.Label className="visually-hidden">Filter by tags</Form.Label>
            <ReactSelect
              placeholder="Filter by tags…"
              value={selectedTagOptions}
              options={tagOptions}
              onChange={(selected) =>
                setSelectedTags(
                  selected.map((t) => ({ label: t.label, id: t.value }))
                )
              }
              styles={darkSelectStyles}
              isMulti
            />
          </Form.Group>
        </Col>
      </Row>

      {/* Notes grid */}
      {filteredNotes.length === 0 ? (
        <div className="empty-state">
          <i className="bi bi-journal-text" />
          <p>
            {title || selectedTags.length > 0
              ? "No notes match your filters."
              : showFavoritesOnly
                ? "No favorited notes yet."
                : "No notes yet. Create your first one."}
          </p>
          {!title && selectedTags.length === 0 && !showFavoritesOnly && (
            <Link to="/new">
              <Button variant="primary" size="sm">
                New Note
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <>
          {!showFavoritesOnly && favoriteNotes.length > 0 && (
            <div className="mb-4" data-testid="favorites-section">
              <div className={styles.sectionLabel}>
                <i
                  className="bi bi-star-fill"
                  style={{
                    color: "var(--nv-favorite)",
                    fontSize: "0.65rem",
                  }}
                />
                Favorites
              </div>
              <Row xs={1} sm={2} lg={3} xl={4} className="g-3">
                {favoriteNotes.map((note) => (
                  <Col key={note.id}>
                    <NoteCard
                      id={note.id}
                      title={note.title}
                      tags={note.tags}
                      isFavorite={note.isFavorite}
                      onToggleFavorite={onToggleFavorite}
                    />
                  </Col>
                ))}
              </Row>
            </div>
          )}

          {showFavoritesOnly ? (
            <Row xs={1} sm={2} lg={3} xl={4} className="g-3">
              {filteredNotes.map((note) => (
                <Col key={note.id}>
                  <NoteCard
                    id={note.id}
                    title={note.title}
                    tags={note.tags}
                    isFavorite={note.isFavorite}
                    onToggleFavorite={onToggleFavorite}
                  />
                </Col>
              ))}
            </Row>
          ) : regularNotes.length > 0 ? (
            <div>
              {favoriteNotes.length > 0 && (
                <div className={styles.sectionLabel}>
                  <i
                    className="bi bi-journal"
                    style={{ fontSize: "0.7rem" }}
                  />
                  All Notes
                </div>
              )}
              <Row xs={1} sm={2} lg={3} xl={4} className="g-3">
                {regularNotes.map((note) => (
                  <Col key={note.id}>
                    <NoteCard
                      id={note.id}
                      title={note.title}
                      tags={note.tags}
                      isFavorite={note.isFavorite}
                      onToggleFavorite={onToggleFavorite}
                    />
                  </Col>
                ))}
              </Row>
            </div>
          ) : null}
        </>
      )}

      <EditTagsModal
        availableTags={availableTags}
        show={editTagsModalIsOpen}
        handleClose={() => setEditTagsModalIsOpen(false)}
        onUpdateTag={onUpdateTag}
        onDeleteTag={onDeleteTag}
        onAddTag={onAddTagFromModal}
      />
      <Suspense fallback={null}>
        <SettingsModal
          show={settingsModalIsOpen}
          onHide={() => setSettingsModalIsOpen(false)}
        />
      </Suspense>
    </>
  );
}

function NoteCard({
  id,
  title,
  tags,
  isFavorite,
  onToggleFavorite,
}: NoteCardProps) {
  return (
    <div className={styles.cardWrapper}>
      <Link to={`/${id}`} className={styles.cardLink}>
        <div className={styles.card}>
          <div className={styles.cardBody}>
            <p className={styles.cardTitle}>{title}</p>
            {tags.length > 0 && (
              <div className={styles.tagRow}>
                {tags.map((tag) => (
                  <Badge key={tag.id} bg="" className={styles.tag}>
                    {tag.label}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </Link>
      <button
        type="button"
        className={`favorite-btn ${styles.favBtn} ${isFavorite ? "active" : ""}`}
        onClick={() => onToggleFavorite(id)}
        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
      >
        <i className={`bi bi-star${isFavorite ? "-fill" : ""}`} />
      </button>
    </div>
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
    if (!availableTags.every((tag) => tag.label.trim() !== "")) return;
    handleClose();
  }

  return (
    <Modal show={show} onHide={onSubmit}>
      <Modal.Header closeButton>
        <Modal.Title>Edit Tags</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Stack gap={3}>
            {availableTags.length === 0 && (
              <p
                style={{
                  color: "var(--nv-text-muted)",
                  fontSize: "0.875rem",
                  margin: 0,
                }}
              >
                No tags yet. Add one below.
              </p>
            )}
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
                <Col xs="auto" className="d-flex align-items-center">
                  <Button
                    variant="outline-danger"
                    size="sm"
                    className="d-inline-flex align-items-center justify-content-center"
                    onClick={() => onDeleteTag(tag.id)}
                    aria-label={`Delete tag: ${tag.label}`}
                  >
                    <i className="bi bi-trash" />
                  </Button>
                </Col>
              </Row>
            ))}
            <Stack direction="horizontal" gap={2} className="justify-content-end">
              <Button
                onClick={onAddTag}
                variant="outline-secondary"
                size="sm"
              >
                <i className="bi bi-plus me-1" />
                Add Tag
              </Button>
              <Button onClick={onSubmit} variant="primary" size="sm">
                Done
              </Button>
            </Stack>
          </Stack>
        </Form>
      </Modal.Body>
    </Modal>
  );
}
