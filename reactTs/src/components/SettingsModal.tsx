import { useEffect, useState } from "react";
import { Button, Form, InputGroup, Modal } from "react-bootstrap";
import { useAISettings } from "../hooks/useAI";
import { AISettings } from "../services/ai";

type SettingsModalProps = {
  show: boolean;
  onHide: () => void;
};

const GEMINI_DEFAULTS = { provider: "gemini" as const, model: "gemini-2.5-flash", endpoint: "" };
const OPENAI_DEFAULTS = { provider: "openai" as const, model: "gpt-4o-mini", endpoint: "https://api.openai.com/v1" };

export function SettingsModal({ show, onHide }: SettingsModalProps) {
  const [saved, setSaved] = useAISettings();
  const [form, setForm] = useState<AISettings>(saved);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    if (show) {
      setForm(saved);
      setShowKey(false);
    }
  }, [show]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleSave() {
    setSaved(form);
    onHide();
  }

  function handleReset() {
    setForm({ apiKey: "", ...GEMINI_DEFAULTS });
  }

  function setProvider(p: "gemini" | "openai") {
    if (p === "gemini") {
      setForm((f) => ({ ...f, ...GEMINI_DEFAULTS }));
    } else {
      setForm((f) => ({ ...f, ...OPENAI_DEFAULTS }));
    }
  }

  const isGemini = (form.provider ?? "gemini") === "gemini";

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="bi bi-gear me-2" style={{ color: "var(--nv-text-muted)" }} />
          AI Settings
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form className="d-flex flex-column gap-3">
          {/* Provider */}
          <Form.Group>
            <Form.Label>Provider</Form.Label>
            <div className="d-flex gap-3">
              <Form.Check
                type="radio"
                id="provider-gemini"
                label="Google Gemini"
                checked={isGemini}
                onChange={() => setProvider("gemini")}
                style={{ cursor: "pointer" }}
              />
              <Form.Check
                type="radio"
                id="provider-openai"
                label="OpenAI compatible"
                checked={!isGemini}
                onChange={() => setProvider("openai")}
                style={{ cursor: "pointer" }}
              />
            </div>
          </Form.Group>

          {/* API Key */}
          <Form.Group controlId="settings-api-key">
            <Form.Label>API Key</Form.Label>
            <InputGroup>
              <Form.Control
                type={showKey ? "text" : "password"}
                placeholder={isGemini ? "AIza…" : "sk-…"}
                value={form.apiKey}
                onChange={(e) => setForm((f) => ({ ...f, apiKey: e.target.value }))}
                autoComplete="off"
              />
              <Button
                variant="outline-secondary"
                onClick={() => setShowKey((v) => !v)}
                aria-label={showKey ? "Hide key" : "Reveal key"}
              >
                <i className={`bi bi-eye${showKey ? "-slash" : ""}`} />
              </Button>
            </InputGroup>
            <Form.Text style={{ color: "var(--nv-text-muted)" }}>
              {isGemini ? (
                <>
                  Get a free key at{" "}
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "var(--nv-accent)" }}
                  >
                    Google AI Studio
                  </a>
                  . Stored only in this browser.
                </>
              ) : (
                "Your key is stored only in this browser's localStorage."
              )}
            </Form.Text>
          </Form.Group>

          {/* Model */}
          <Form.Group controlId="settings-model">
            <Form.Label>Model</Form.Label>
            <Form.Control
              type="text"
              value={form.model}
              onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))}
              placeholder={isGemini ? "gemini-2.5-flash" : "gpt-4o-mini"}
            />
          </Form.Group>

          {/* Endpoint — only for OpenAI-compatible */}
          {!isGemini && (
            <Form.Group controlId="settings-endpoint">
              <Form.Label>API Endpoint</Form.Label>
              <Form.Control
                type="url"
                value={form.endpoint}
                onChange={(e) => setForm((f) => ({ ...f, endpoint: e.target.value }))}
                placeholder="https://api.openai.com/v1"
              />
              <Form.Text style={{ color: "var(--nv-text-muted)" }}>
                Compatible with any OpenAI-format endpoint (Groq, Ollama, Azure…).
              </Form.Text>
            </Form.Group>
          )}
        </Form>
      </Modal.Body>

      <Modal.Footer className="justify-content-between">
        <Button
          variant="link"
          size="sm"
          onClick={handleReset}
          style={{ color: "var(--nv-text-muted)", textDecoration: "none", padding: 0 }}
        >
          Reset to defaults
        </Button>
        <div className="d-flex gap-2">
          <Button variant="outline-secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
}
