#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import mimetypes
import sys
from dataclasses import asdict
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlparse

sys.path.insert(0, str(Path(__file__).resolve().parent))

from raglab.engine import RagLabEngine


BACKEND_DIR = Path(__file__).resolve().parent
PROJECT_DIR = BACKEND_DIR.parent
FRONTEND_DIR = PROJECT_DIR / "frontend"
ARTIFACT_DIR = PROJECT_DIR / "artifacts"
SAMPLE_PATH = PROJECT_DIR / "sample_data" / "raglab_demo.md"

engine = RagLabEngine(artifact_dir=ARTIFACT_DIR, sample_path=SAMPLE_PATH)


class Handler(BaseHTTPRequestHandler):
    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path == "/api/health":
            self._json({"ok": True, "dataset": asdict(engine.stats())})
            return
        if parsed.path == "/api/dataset":
            self._json({"dataset": asdict(engine.stats())})
            return
        if parsed.path.startswith("/api/memory/"):
            session_id = unquote(parsed.path.rsplit("/", 1)[-1]) or "demo"
            self._json({"memories": [asdict(item) for item in engine.list_memories(session_id)]})
            return
        self._static(parsed.path)

    def do_POST(self) -> None:
        parsed = urlparse(self.path)
        try:
            if parsed.path == "/api/dataset/sample":
                self._json({"dataset": asdict(engine.load_sample())})
                return
            if parsed.path == "/api/dataset/text":
                payload = self._read_json()
                title = str(payload.get("title") or "Custom Dataset")
                text = str(payload.get("text") or "")
                self._json({"dataset": asdict(engine.index_text(title=title, source=title, text=text))})
                return
            if parsed.path == "/api/query":
                payload = self._read_json()
                self._json(
                    engine.compare(
                        question=str(payload.get("question") or ""),
                        session_id=str(payload.get("session_id") or "demo"),
                    )
                )
                return
            if parsed.path == "/api/memory":
                payload = self._read_json()
                session_id = str(payload.get("session_id") or "demo")
                item = engine.add_memory(session_id=session_id, text=str(payload.get("text") or ""))
                self._json(
                    {
                        "memory": asdict(item),
                        "memories": [asdict(memory) for memory in engine.list_memories(session_id)],
                    }
                )
                return
            self.send_error(HTTPStatus.NOT_FOUND)
        except ValueError as exc:
            self._json({"detail": str(exc)}, status=HTTPStatus.BAD_REQUEST)
        except Exception as exc:  # pragma: no cover - HTTP boundary
            self._json({"detail": str(exc)}, status=HTTPStatus.INTERNAL_SERVER_ERROR)

    def log_message(self, format: str, *args) -> None:
        return

    def _read_json(self) -> dict[str, object]:
        length = int(self.headers.get("Content-Length", "0"))
        raw = self.rfile.read(length).decode("utf-8")
        if not raw.strip():
            return {}
        payload = json.loads(raw)
        if not isinstance(payload, dict):
            raise ValueError("JSON object is required.")
        return payload

    def _json(self, payload: object, status: HTTPStatus = HTTPStatus.OK) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def _static(self, request_path: str) -> None:
        relative = "index.html" if request_path in {"", "/"} else request_path.lstrip("/")
        target = (FRONTEND_DIR / relative).resolve()
        if FRONTEND_DIR.resolve() not in target.parents and target != FRONTEND_DIR.resolve():
            self.send_error(HTTPStatus.FORBIDDEN)
            return
        if not target.exists() or not target.is_file():
            target = FRONTEND_DIR / "index.html"
        body = target.read_bytes()
        content_type = mimetypes.guess_type(str(target))[0] or "application/octet-stream"
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


def main() -> None:
    parser = argparse.ArgumentParser(description="Run the local RAGLab prototype.")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8787)
    args = parser.parse_args()

    server = ThreadingHTTPServer((args.host, args.port), Handler)
    print(f"RAGLab: http://{args.host}:{args.port}")
    server.serve_forever()


if __name__ == "__main__":
    main()
