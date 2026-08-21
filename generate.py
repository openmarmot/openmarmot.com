#!/usr/bin/env python3
"""Generate website/index.html from links.txt."""

from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parent
LINKS_FILE = ROOT / "links.txt"
OUTPUT_FILE = ROOT / "website" / "index.html"

HTML = """\
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>openmarmot.com</title>
    <link rel="preload" href="images/dani.JPG" as="image">
    <style>
        * {{ box-sizing: border-box; }}
        body {{
            margin: 0;
            min-height: 100vh;
            color: #f4f0ea;
            font: 18px/1.55 system-ui, sans-serif;
            background-color: #1c1612;
            background-image: url("images/dani.JPG");
            background-position: right top;
            background-size: cover;
            background-repeat: no-repeat;
            background-attachment: fixed;
        }}
        main {{
            max-width: 36rem;
            margin: 2rem auto 2rem 2rem;
            padding: 1.75rem 1.75rem 2rem;
            background: rgba(12, 8, 6, 0.86);
            border-radius: 12px;
        }}
        p {{ margin: 0 0 1rem; }}
        .outro {{ margin: 1.75rem 0 0; }}
        h2 {{
            margin: 1.5rem 0 0.5rem;
            font-size: 0.95rem;
            font-weight: 650;
            letter-spacing: 0.02em;
            color: #e2c29a;
        }}
        ul {{
            margin: 0;
            padding: 0;
            list-style: none;
        }}
        li {{ margin: 0.4rem 0; }}
        a {{
            color: #fff;
            text-decoration: underline;
            text-underline-offset: 0.18em;
            text-decoration-color: rgba(255, 255, 255, 0.45);
        }}
        a:hover {{
            color: #ffb020;
            text-decoration-color: #ffb020;
        }}
        @media (max-width: 44rem) {{
            main {{
                margin: 0;
                min-height: 100vh;
                border-radius: 0;
            }}
        }}
    </style>
</head>
<body>
    <main>
        <p>welcome to openmarmot.com.</p>
        <p>here are some interesting web links.</p>
{body}
        <p class="outro">have a good day!</p>
    </main>
</body>
</html>
"""


def parse_links(text: str) -> list[tuple[str | None, list[tuple[str, str]]]]:
    sections: list[tuple[str | None, list[tuple[str, str]]]] = []
    title: str | None = None
    links: list[tuple[str, str]] = []

    def flush() -> None:
        nonlocal title, links
        if title is not None or links:
            sections.append((title, links))
        title = None
        links = []

    for raw in text.splitlines():
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        if line.startswith("[") and line.endswith("]"):
            flush()
            title = line[1:-1].strip()
            continue
        if "|" not in line:
            raise ValueError(f"expected 'url | description', got: {raw}")
        url, description = line.split("|", 1)
        url, description = url.strip(), description.strip()
        if not url or not description:
            raise ValueError(f"url and description are required: {raw}")
        links.append((url, description))

    flush()
    return sections


def render_body(sections: list[tuple[str | None, list[tuple[str, str]]]]) -> str:
    chunks: list[str] = []
    for title, links in sections:
        if title:
            chunks.append(f"        <h2>{escape(title)}</h2>")
        chunks.append("        <ul>")
        for url, description in links:
            chunks.append(
                f'            <li><a href="{escape(url, quote=True)}">{escape(description)}</a></li>'
            )
        chunks.append("        </ul>")
    return "\n".join(chunks)


def main() -> None:
    sections = parse_links(LINKS_FILE.read_text(encoding="utf-8"))
    html = HTML.format(body=render_body(sections))
    OUTPUT_FILE.write_text(html, encoding="utf-8")
    count = sum(len(links) for _, links in sections)
    print(f"wrote {OUTPUT_FILE.relative_to(ROOT)} ({count} links)")


if __name__ == "__main__":
    main()
