import { useEffect, useState } from "react";
import { Button, Modal, Spinner } from "react-bootstrap";
import { Note } from "../App";
import { useAISettings } from "../hooks/useAI";
import { summarizeNote, SummaryResult } from "../services/ai";

type SummaryModalProps = {
  show: boolean;
  onHide: () => void;
  note: Note;
  onOpenSettings: () => void;
};

type Status = "idle" | "loading" | "success" | "error";

export function SummaryModal({
  show,
  onHide,
  note,
  onOpenSettings,
}: SummaryModalProps) {
  const [aiSettings] = useAISettings();
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<SummaryResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  function run() {
    setStatus("loading");
    setError(null);
    summarizeNote(note.title, note.markdown, aiSettings)
      .then((res) => {
        setResult(res);
        setStatus("success");
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : "Unknown error");
        setStatus("error");
      });
  }

  useEffect(() => {
    if (!show) {
      setStatus("idle");
      setResult(null);
      setError(null);
      return;
    }
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="bi bi-stars me-2" style={{ color: "var(--nv-accent)" }} />
          AI Summary
        </Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ minHeight: "180px" }}>
        {status === "loading" && (
          <div
            className="d-flex flex-column align-items-center justify-content-center gap-3"
            style={{ minHeight: "140px" }}
          >
            <Spinner
              animation="border"
              role="status"
              style={{ color: "var(--nv-accent)", width: "2rem", height: "2rem" }}
            />
            <span style={{ color: "var(--nv-text-muted)", fontSize: "0.875rem" }}>
              Summarizing "{note.title}"…
            </span>
          </div>
        )}

        {status === "error" && (
          <div className="d-flex flex-column justify-content-center gap-3" style={{ minHeight: "140px" }}>
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
          <div className="d-flex flex-column gap-4">
            <div>
              <p
                style={{
                  fontSize: "0.95rem",
                  fontFamily: "var(--nv-font-body)",
                  lineHeight: "1.65",
                  color: "var(--nv-text)",
                  margin: 0,
                }}
              >
                {result.summary}
              </p>
            </div>
            {result.keyPoints.length > 0 && (
              <div>
                <p
                  className="mb-2"
                  style={{
                    fontSize: "0.68rem",
                    fontWeight: 600,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "var(--nv-text-muted)",
                  }}
                >
                  Key Points
                </p>
                <ul className="summary-key-points">
                  {result.keyPoints.map((point, i) => (
                    <li key={i}>{point}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="outline-secondary" size="sm" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
