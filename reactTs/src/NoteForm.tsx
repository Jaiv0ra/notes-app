import { FormEvent, lazy, Suspense, useRef, useState } from "react";
import { Button, Col, Form, Row, Stack } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import CreatableReactSelect from "react-select/creatable";
import { NoteData, Tag } from "./App";
import { v4 as uuidV4 } from "uuid";
import darkSelectStyles from "./selectStyles";
const BeautifyModal = lazy(() =>
  import("./components/BeautifyModal").then((m) => ({ default: m.BeautifyModal }))
);
const SettingsModal = lazy(() =>
  import("./components/SettingsModal").then((m) => ({ default: m.SettingsModal }))
);

type NoteFormProps = {
  onSubmit: (data: NoteData) => void;
  onAddTag: (tag: Tag) => void;
  availableTags: Tag[];
  enableBeautify?: boolean;
} & Partial<NoteData>;

export function NoteForm({
  onSubmit,
  onAddTag,
  availableTags,
  enableBeautify = false,
  title = "",
  markdown = "",
  tags = [],
}: NoteFormProps) {
  const titleRef = useRef<HTMLInputElement>(null);
  const markdownRef = useRef<HTMLTextAreaElement>(null);
  const [selectedTags, setSelectedTags] = useState<Tag[]>(tags);
  const navigate = useNavigate();

  // Beautify state — only active when enableBeautify is true
  const [showBeautify, setShowBeautify] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [beautifySnapshot, setBeautifySnapshot] = useState({ title: "", markdown: "" });
  const [hasBody, setHasBody] = useState(markdown.trim().length > 0);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit({
      title: titleRef.current!.value,
      markdown: markdownRef.current!.value,
      tags: selectedTags,
    });
    navigate("..");
  }

  function handleBeautifyClick() {
    setBeautifySnapshot({
      title: titleRef.current?.value ?? "",
      markdown: markdownRef.current?.value ?? "",
    });
    setShowBeautify(true);
  }

  function handleBeautifyApply(result: string) {
    if (markdownRef.current) {
      markdownRef.current.value = result;
      setHasBody(result.trim().length > 0);
    }
  }

  return (
    <>
      <Form onSubmit={handleSubmit}>
        <Stack gap={4}>
          <Row>
            <Col>
              <Form.Group controlId="title">
                <Form.Label>Title</Form.Label>
                <Form.Control ref={titleRef} required defaultValue={title} />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group controlId="tags">
                <Form.Label>Tags</Form.Label>
                <CreatableReactSelect
                  onCreateOption={(label) => {
                    const newTag = { id: uuidV4(), label };
                    onAddTag(newTag);
                    setSelectedTags((prev) => [...prev, newTag]);
                  }}
                  options={availableTags.map((tag) => ({
                    label: tag.label,
                    value: tag.id,
                  }))}
                  value={selectedTags.map((tag) => ({
                    label: tag.label,
                    value: tag.id,
                  }))}
                  onChange={(selected) => {
                    setSelectedTags(
                      selected.map((t) => ({ label: t.label, id: t.value }))
                    );
                  }}
                  styles={darkSelectStyles}
                  isMulti
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group controlId="markdown">
            <div className="d-flex align-items-center justify-content-between mb-1">
              <Form.Label className="mb-0">Body</Form.Label>
              {enableBeautify && (
                <button
                  type="button"
                  className="nv-beautify-btn"
                  onClick={handleBeautifyClick}
                  disabled={!hasBody}
                  aria-label="Beautify markdown with AI"
                >
                  <i className="bi bi-magic" aria-hidden="true" />
                  Beautify
                </button>
              )}
            </div>
            <Form.Control
              ref={markdownRef}
              required
              as="textarea"
              rows={15}
              defaultValue={markdown}
              onChange={(e) => setHasBody(e.target.value.trim().length > 0)}
              style={{
                fontFamily: "var(--nv-font-mono)",
                fontSize: "0.875rem",
                resize: "vertical",
              }}
            />
          </Form.Group>

          <Stack direction="horizontal" gap={2} className="justify-content-end">
            <Button type="submit" variant="primary">
              Save
            </Button>
            <Link to="..">
              <Button type="button" variant="outline-secondary">
                Cancel
              </Button>
            </Link>
          </Stack>
        </Stack>
      </Form>

      {enableBeautify && (
        <Suspense fallback={null}>
          <BeautifyModal
            show={showBeautify}
            onHide={() => setShowBeautify(false)}
            title={beautifySnapshot.title}
            markdown={beautifySnapshot.markdown}
            onApply={handleBeautifyApply}
            onOpenSettings={() => {
              setShowBeautify(false);
              setShowSettings(true);
            }}
          />
          <SettingsModal
            show={showSettings}
            onHide={() => setShowSettings(false)}
          />
        </Suspense>
      )}
    </>
  );
}
