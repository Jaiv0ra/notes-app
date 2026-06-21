import { useEffect, useState } from "react";
import { Button, Modal, Spinner } from "react-bootstrap";
import { Note } from "../App";
import { useAISettings } from "../hooks/useAI";
import { beautifyMarkdown } from "../services/ai";
import { MarkdownRenderer } from "./MarkdownRenderer";

type BeautifyModalProps = {
  show: boolean;
  onHide: () => void;
  title: string;
  markdown: string;
  allNotes?: Note[];
  onApply: (markdown: string) => void;
  onOpenSettings: () => void;
};

type Status = "idle" | "loading" | "success" | "error";

export function BeautifyModal({
  show,
  onHide,
  title,
  markdown,
  allNotes = [],
  onApply,
  onOpenSettings,
}: BeautifyModalProps) {
  const [aiSettings] = useAISettings();
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showRaw, setShowRaw] = useState(false);

  useEffect(() => {
    if (!show) {
      setStatus("idle");
      setResult(null);
      setError(null);
      setShowRaw(false);
      return;
    }
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  function run() {
    setStatus("loading");
    setError(null);
    beautifyMarkdown(title, markdown, aiSettings)
      .then((res) => {
        setResult(res);
        setStatus("success");
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : "Unknown error");
        setStatus("error");
      });
  }

  function handleApply() {
    if (result) {
      onApply(result);
      onHide();
    }
  }

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="bi bi-magic me-2" style={{ color: "var(--nv-accent)" }} />
          Beautify Markdown
        </Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ minHeight: "200px" }}>
        {status === "loading" && (
          <div
            className="d-flex flex-column align-items-center justify-content-center gap-3"
            style={{ minHeight: "160px" }}
          >
            <Spinner
              animation="border"
              role="status"
              style={{ color: "var(--nv-accent)", width: "2rem", height: "2rem" }}
            />
            <span style={{ color: "var(--nv-text-muted)", fontSize: "0.875rem" }}>
              Beautifying "{title}"…
            </span>
          </div>
        )}

        {status === "error" && (
          <div
            className="d-flex flex-column justify-content-center gap-3"
            style={{ minHeight: "160px" }}
          >
            <div
              role="alert"
              className="d-flex align-items-center gap-2 p-3 rounded"
              style={{
                background: "var(--nv-danger-subtle)",
                border: "1px solid var(--nv-danger-border)",
                color: "var(--nv-danger)",
              }}
            >
              <i className="bi bi-exclamation-circle-fill flex-shrink-0" />
              <span style={{ fontSize: "0.875rem" }}>{error}</span>
            </div>
            <div className="d-flex gap-2">
              {error?.includes("API key") ? (
                <>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      onHide();
                      onOpenSettings();
                    }}
                  >
                    <i className="bi bi-gear me-1" />
                    Configure API
                  </Button>
                  <Button variant="outline-secondary" size="sm" onClick={run}>
                    <i className="bi bi-arrow-clockwise me-1" />
                    Retry
                  </Button>
                </>
              ) : (
                <Button variant="outline-secondary" size="sm" onClick={run}>
                  <i className="bi bi-arrow-clockwise me-1" />
                  Retry
                </Button>
              )}
            </div>
          </div>
        )}

        {status === "success" && result && (
          <div className="d-flex flex-column gap-3">
            <div className="d-flex align-items-center justify-content-between">
              <p
                className="mb-0"
                style={{ fontSize: "0.8rem", color: "var(--nv-text-muted)" }}
              >
                Preview — review before applying
              </p>
              <button
                type="button"
                onClick={() => setShowRaw((v) => !v)}
                style={{
                  background: "none",
                  border: "none",
                  padding: "2px 6px",
                  fontSize: "0.75rem",
                  color: "var(--nv-text-muted)",
                  cursor: "pointer",
                  borderRadius: "var(--nv-radius-sm)",
                  fontFamily: "var(--nv-font-display)",
                }}
              >
                <i className={`bi bi-${showRaw ? "eye" : "code"} me-1`} />
                {showRaw ? "Preview" : "Raw"}
              </button>
            </div>

            {showRaw ? (
              <pre
                style={{
                  fontFamily: "var(--nv-font-mono)",
                  fontSize: "0.8rem",
                  background: "var(--nv-surface-raised)",
                  border: "1px solid var(--nv-border)",
                  borderRadius: "var(--nv-radius-md)",
                  padding: "1rem",
                  overflowY: "auto",
                  maxHeight: "380px",
                  whiteSpace: "pre-wrap",
                  color: "var(--nv-text)",
                  margin: 0,
                }}
              >
                {result}
              </pre>
            ) : (
              <div
                style={{
                  border: "1px solid var(--nv-border)",
                  borderRadius: "var(--nv-radius-md)",
                  padding: "1rem 1.25rem",
                  overflowY: "auto",
                  maxHeight: "380px",
                  background: "var(--nv-surface-raised)",
                }}
              >
                <MarkdownRenderer markdown={result} allNotes={allNotes} />
              </div>
            )}
          </div>
        )}
      </Modal.Body>

      <Modal.Footer className="justify-content-between">
        <p
          className="mb-0"
          style={{ fontSize: "0.75rem", color: "var(--nv-text-muted)" }}
        >
          {status === "success" ? "All original information preserved." : " "}
        </p>
        <div className="d-flex gap-2">
          <Button variant="outline-secondary" size="sm" onClick={onHide}>
            Discard
          </Button>
          {status === "success" && (
            <Button variant="primary" size="sm" onClick={handleApply}>
              <i className="bi bi-check-lg me-1" />
              Apply &amp; Save
            </Button>
          )}
        </div>
      </Modal.Footer>
    </Modal>
  );
}
