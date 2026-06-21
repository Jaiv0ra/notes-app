import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Badge, Button, Col, Row, Stack } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { NoteData } from "./App";
import { useNote } from "./NoteLayout";

const MarkdownRenderer = lazy(() =>
  import("./components/MarkdownRenderer").then((m) => ({ default: m.MarkdownRenderer }))
);
const SummaryModal = lazy(() =>
  import("./components/SummaryModal").then((m) => ({ default: m.SummaryModal }))
);
const SettingsModal = lazy(() =>
  import("./components/SettingsModal").then((m) => ({ default: m.SettingsModal }))
);
const BeautifyModal = lazy(() =>
  import("./components/BeautifyModal").then((m) => ({ default: m.BeautifyModal }))
);

type NoteProps = {
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onEdit: (id: string, data: NoteData) => void;
};

function escapeRegex(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function Note({ onDelete, onToggleFavorite, onEdit }: NoteProps) {
  const { note, allNotes } = useNote();
  const navigate = useNavigate();
  const [showSummary, setShowSummary] = useState(false);
  const [showBeautify, setShowBeautify] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const [stickyVisible, setStickyVisible] = useState(false);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setStickyVisible(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const backlinks = useMemo(() => {
    const re = new RegExp(
      `\\[\\[${escapeRegex(note.title)}\\]\\]`,
      "i"
    );
    return allNotes.filter((n) => n.id !== note.id && re.test(n.markdown));
  }, [allNotes, note.id, note.title]);

  async function handlePDFExport() {
    const el = document.getElementById("note-markdown-content");
    if (!el) return;
    setPdfLoading(true);
    try {
      const [{ jsPDF }, { default: html2canvas }] = await Promise.all([
        import("jspdf"),
        import("html2canvas"),
      ]);
      const canvas = await html2canvas(el, {
        backgroundColor: "#ffffff",
        scale: 2,
        logging: false,
      });

      const pdf = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
      const margin = 12;
      const pageW = pdf.internal.pageSize.getWidth() - margin * 2;
      const pageH = pdf.internal.pageSize.getHeight() - margin * 2;
      const pxPerMm = canvas.width / pageW;
      const pageHeightPx = Math.floor(pageH * pxPerMm);

      const pageCanvas = document.createElement("canvas");
      pageCanvas.width = canvas.width;
      let srcY = 0;
      let pageNum = 0;

      while (srcY < canvas.height) {
        const srcH = Math.min(pageHeightPx, canvas.height - srcY);
        pageCanvas.height = srcH;
        const ctx = pageCanvas.getContext("2d")!;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, pageCanvas.width, srcH);
        ctx.drawImage(
          canvas,
          0, srcY, canvas.width, srcH,
          0, 0, canvas.width, srcH
        );
        if (pageNum > 0) pdf.addPage();
        pdf.addImage(
          pageCanvas.toDataURL("image/png"),
          "PNG",
          margin,
          margin,
          pageW,
          srcH / pxPerMm
        );
        srcY += srcH;
        pageNum++;
      }

      pdf.save(`${note.title}.pdf`);
    } catch (e) {
      console.error("PDF export failed:", e);
    } finally {
      setPdfLoading(false);
    }
  }

  function handleBeautifyApply(markdown: string) {
    onEdit(note.id, { title: note.title, markdown, tags: note.tags });
  }

  return (
    <>
      {/* Compact sticky header — appears when main header scrolls out of view */}
      <div
        className={`sticky-note-header${stickyVisible ? " is-visible" : ""}`}
        aria-hidden={!stickyVisible}
      >
        <Link to="/" className="sticky-note-header__back" tabIndex={stickyVisible ? 0 : -1}>
          <i className="bi bi-arrow-left" aria-hidden="true" />
          Back
        </Link>
        <span className="sticky-note-header__title">{note.title}</span>
        <Link
          to={`/${note.id}/edit`}
          className="sticky-note-header__edit"
          tabIndex={stickyVisible ? 0 : -1}
        >
          <i className="bi bi-pencil" aria-hidden="true" />
          <span className="sticky-note-header__edit-label">Edit</span>
        </Link>
      </div>

      {/* Main header */}
      <div ref={headerRef}>
        <Row className="align-items-start mb-4">
        <Col>
          <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
            <button
              type="button"
              className={`favorite-btn ${note.isFavorite ? "active" : ""}`}
              onClick={() => onToggleFavorite(note.id)}
              aria-label={
                note.isFavorite ? "Remove from favorites" : "Add to favorites"
              }
              style={{ fontSize: "1.15rem", flexShrink: 0 }}
            >
              <i className={`bi bi-star${note.isFavorite ? "-fill" : ""}`} />
            </button>
            <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700 }}>
              {note.title}
            </h1>
          </div>
          {note.tags.length > 0 && (
            <Stack gap={1} direction="horizontal" className="flex-wrap">
              {note.tags.map((tag) => (
                <Badge
                  key={tag.id}
                  bg=""
                  style={{
                    backgroundColor: "var(--nv-surface-raised)",
                    color: "var(--nv-text-muted)",
                    border: "1px solid var(--nv-border)",
                    fontSize: "0.72rem",
                    fontFamily: "var(--nv-font-display)",
                    fontWeight: 500,
                  }}
                >
                  {tag.label}
                </Badge>
              ))}
            </Stack>
          )}
        </Col>
        <Col xs="auto">
          <Stack direction="horizontal" gap={2} className="flex-wrap justify-content-end">
            <Link to={`/${note.id}/edit`}>
              <Button variant="primary" size="sm">
                <i className="bi bi-pencil me-1" />
                Edit
              </Button>
            </Link>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => setShowSummary(true)}
            >
              <i className="bi bi-stars me-1" />
              Summarize
            </Button>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => setShowBeautify(true)}
            >
              <i className="bi bi-magic me-1" />
              Beautify
            </Button>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={handlePDFExport}
              disabled={pdfLoading}
            >
              <i
                className={`bi bi-${pdfLoading ? "hourglass-split" : "file-pdf"} me-1`}
              />
              {pdfLoading ? "Exporting…" : "PDF"}
            </Button>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => setShowSettings(true)}
              aria-label="AI Settings"
            >
              <i className="bi bi-gear" />
            </Button>
            <Button
              variant="outline-danger"
              size="sm"
              onClick={() => {
                onDelete(note.id);
                navigate("/");
              }}
            >
              <i className="bi bi-trash me-1" />
              Delete
            </Button>
            <Link to="/">
              <Button variant="outline-secondary" size="sm">
                <i className="bi bi-arrow-left me-1" />
                Back
              </Button>
            </Link>
          </Stack>
        </Col>
        </Row>
      </div>

      {/* Content */}
      <Suspense fallback={null}>
        <MarkdownRenderer markdown={note.markdown} allNotes={allNotes} />
      </Suspense>

      {/* Backlinks */}
      {backlinks.length > 0 && (
        <div className="backlinks-panel">
          <p className="backlinks-panel__title">
            <i className="bi bi-link-45deg me-1" />
            Referenced by
          </p>
          <ul className="backlinks-panel__list">
            {backlinks.map((n) => (
              <li key={n.id}>
                <Link to={`/${n.id}`} className="backlinks-panel__link">
                  <i className="bi bi-journal" />
                  {n.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Suspense fallback={null}>
        <SummaryModal
          show={showSummary}
          onHide={() => setShowSummary(false)}
          note={note}
          onOpenSettings={() => setShowSettings(true)}
        />
        <BeautifyModal
          show={showBeautify}
          onHide={() => setShowBeautify(false)}
          title={note.title}
          markdown={note.markdown}
          allNotes={allNotes}
          onApply={handleBeautifyApply}
          onOpenSettings={() => setShowSettings(true)}
        />
        <SettingsModal
          show={showSettings}
          onHide={() => setShowSettings(false)}
        />
      </Suspense>
    </>
  );
}
