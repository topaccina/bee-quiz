#!/usr/bin/env python3
"""Regenerate svelte-app/public/questions.json from App quiz Bees - Foglio1.csv.

This script and the CSV live at the repo root next to svelte-app/; both are listed
in svelte-app/.gitignore (../…) so they stay local (not committed). Copy your Sheet
export to the CSV path, then run:

    python regenerate_questions_from_csv.py
"""
from __future__ import annotations

import csv
import json
import re
import subprocess
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parent
CSV_PATH = ROOT / "App quiz Bees - Foglio1.csv"
OLD_JSON_PATH = ROOT / "svelte-app" / "public" / "questions.json"
OUT_JSON_PATH = OLD_JSON_PATH

TOPIC_MAP = {
    "Le api": "bees",
    "Impollinazione": "pollination",
    "Gestione dell'alveare": "hive_management",
    "Prodotti dell'alveare": "bee_products",
}

def preprocess_csv_bytes(raw: bytes) -> bytes:
    """Fix Excel/Sheets export mangling before UTF-8 decode."""
    fixes: list[tuple[bytes, bytes]] = [
        (b"CO\xc3\xa2\xe2\x80\x9a\xe2\x80\x9a", b"CO\xe2\x82\x82"),
        # Curly quotes / apostrophe (UTF-8 read as Latin-1 then saved again)
        (b"\xc3\xa2\xe2\x82\xac\xc5\x93", b'"'),
        (b"\xc3\xa2\xe2\x82\xac\xc2\x9d", b'"'),
        (b"\xc3\xa2\xe2\x82\xac\xe2\x84\xa2", b"'"),
        # Ellipsis "…" mis-encoded like smart quotes
        (b"\xc3\xa2\xe2\x82\xac\xc2\xa6", "\u2026".encode("utf-8")),
        # Double-encoded accented letters
        (b"\xc3\x83\xc2\xa8", "è".encode("utf-8")),
        (b"\xc3\x83\xc2\xa9", "é".encode("utf-8")),
        (b"\xc3\x83\xc2\xac", "ì".encode("utf-8")),
        (b"\xc3\x83\xc2\xb2", "ò".encode("utf-8")),
        (b"\xc3\x83\xc2\xb9", "ù".encode("utf-8")),
        (b"\xc3\x83\xcb\x86", "È".encode("utf-8")),
        # Truncated "à" (lone U+00C3 before space / expected letter)
        (b"diversit\xc3\x83 floreale", b"diversit\xc3\xa0 floreale"),
        (b"buona qualit\xc3\x83 di", b"buona qualit\xc3\xa0 di"),
        (b"alta densit\xc3\x83 energetica", b"alta densit\xc3\xa0 energetica"),
        (b"piena attivit\xc3\x83 di", b"piena attivit\xc3\xa0 di"),
        (b"umidit\xc3\x83,", b"umidit\xc3\xa0,"),
        (b"e la quantit\xc3\x83 di", b"e la quantit\xc3\xa0 di"),
        (b"L'et\xc3\x83 della", b"L'et\xc3\xa0 della"),
        (b"nza tossicit\xc3\x83 per", b"nza tossicit\xc3\xa0 per"),
        (b"Tracciabilit\xc3\x83 ,", b"Tracciabilit\xc3\xa0 ,"),
        (b"Propriet\xc3\x83 lisante", b"Propriet\xc3\xa0 lisante"),
    ]
    for a, b in fixes:
        raw = raw.replace(a, b)
    return raw


def fix_mojibake_loop(s: str) -> str:
    if not s:
        return s
    for _ in range(4):
        try:
            t = s.encode("latin-1").decode("utf-8")
        except (UnicodeEncodeError, UnicodeDecodeError):
            break
        if t == s:
            break
        s = t
    return s


def apply_manual_text_fixes(s: str) -> str:
    s = s.replace("Nel affuicatore ", "Nell'affumicatore ")
    s = s.replace("affuicatore", "affumicatore")
    s = s.replace("sciamature indesiderati", "sciami indesiderati")
    s = s.replace("nell affumicatore", "nell'affumicatore")
    s = s.replace("Nel affumicatore", "Nell'affumicatore")
    # Residual mojibake if a cell skipped byte fixes
    s = s.replace("â€™", "'").replace("â€œ", '"').replace("â€\u009d", '"').replace("â€¦", "…")
    s = s.replace("Ãˆ", "È").replace("Ã¨", "è").replace("Ã©", "é")
    s = s.replace("Ã²", "ò").replace("Ã¹", "ù").replace("Ã¬", "ì")
    # Truncated "umidità" in some exports
    s = s.replace("umiditÃ,", "umidità,")
    s = s.replace("umiditÃ.", "umidità.")
    s = s.replace("Un escludi-regina  serve", "Un escludi-regina serve")
    if s.startswith("la leva"):
        s = "L" + s[1:]
    return s


def normalize_key(text: str) -> str:
    t = unicodedata.normalize("NFKC", text or "")
    t = t.replace("\u2019", "'").replace("\u2018", "'").lower()
    t = re.sub(r"\s+", " ", t).strip()
    return t


def polish_field(s: str) -> str:
    s = (s or "").strip()
    s = fix_mojibake_loop(s)
    s = apply_manual_text_fixes(s)
    s = s.replace("\u2019", "'").replace("\u2018", "'")
    s = s.replace("\u201c", '"').replace("\u201d", '"')
    s = re.sub(r"  +", " ", s)
    return s.strip()


def reorder_options_balanced(
    options: list[str], correct_one_based: int, question_index: int
) -> tuple[list[str], int]:
    """correct_one_based: 1..4 from CSV. Returns (new_options, new_correct_index 0..3)."""
    if len(options) != 4:
        raise ValueError("Expected 4 options")
    if not 1 <= correct_one_based <= 4:
        raise ValueError(f"Invalid correct index: {correct_one_based}")
    old_correct_idx = correct_one_based - 1
    correct_text = options[old_correct_idx]
    wrong_indices = [i for i in range(4) if i != old_correct_idx]
    wrongs = [options[i] for i in wrong_indices]
    target = question_index % 4
    new_opts: list[str | None] = [None, None, None, None]
    new_opts[target] = correct_text
    fill_slots = [i for i in range(4) if i != target]
    for slot, w in zip(fill_slots, wrongs):
        new_opts[slot] = w
    assert all(x is not None for x in new_opts)
    return [str(x) for x in new_opts], target


# Git HEAD may not match CSV wording (typo fixes, quotes); fill gaps here.
EXPL_EXTRA: dict[str, tuple[str, int]] = {
    normalize_key(
        "Cosa indica una forte presenza di celle reali lungo i bordi dei telaini?"
    ): (
        "Molte celle reali sul bordo inferiore sono spesso associate a sciamatura imminente.",
        25,
    ),
    normalize_key('Uno "sciame artificiale" può essere creato per:'): (
        "La divisione controllata di telai con covata e api replica in parte il processo naturale.",
        25,
    ),
    normalize_key(
        'La "sparizione" massiccia di operaie (sindrome tipo CCD) è considerata in genere:'
    ): (
        "La letteratura scientifica descrive interazioni complesse più che una singola causa.",
        25,
    ),
    normalize_key("Nell'affumicatore è opportuno bruciare materiali che:"): (
        "Si usano paglia, cartone, trucioli specifici; evitare sostanze nocive o fumi troppo caldi.",
        25,
    ),
    normalize_key("La leva serve a:"): (
        "Aiuta a non danneggiare i favi quando i telai aderiscono ai margini.",
        25,
    ),
    normalize_key("Un escludi-regina serve a:"): (
        "Si ottiene miele senza covata (né uova/larve) nei telai da estrazione.",
        25,
    ),
}


def load_old_explanations(path: Path) -> dict[str, tuple[str, int]]:
    """Prefer last committed questions.json so explanations survive re-runs."""
    rel = path.relative_to(ROOT).as_posix().replace("\\", "/")
    raw: bytes | None = None
    try:
        raw = subprocess.check_output(
            ["git", "show", f"HEAD:{rel}"],
            cwd=str(ROOT),
            stderr=subprocess.DEVNULL,
        )
    except (subprocess.CalledProcessError, FileNotFoundError, OSError):
        pass
    if raw is None and path.exists():
        raw = path.read_bytes()
    if not raw:
        return {}
    out: dict[str, tuple[str, int]] = {}
    data = json.loads(raw.decode("utf-8"))
    for q in data.get("questions", []):
        key = normalize_key(q.get("text", ""))
        out[key] = (q.get("explanation", ""), int(q.get("timeLimitSeconds", 25)))
    return out


def main() -> None:
    if not CSV_PATH.is_file():
        raise SystemExit(
            f"Missing source sheet: {CSV_PATH}\n"
            "Export from Google Sheets to that exact filename next to this script "
            "(see svelte-app/.gitignore — sheet export is not committed to the repo)."
        )
    raw = preprocess_csv_bytes(CSV_PATH.read_bytes())
    text = raw.decode("utf-8")

    reader = csv.DictReader(text.splitlines())
    rows = list(reader)
    if not rows:
        raise SystemExit("CSV empty")

    old_exp = load_old_explanations(OLD_JSON_PATH) if OLD_JSON_PATH.exists() else {}

    questions: list[dict] = []
    for idx, row in enumerate(rows):
        domanda = polish_field(row.get("domanda", ""))
        cat = polish_field(row.get("categoria", ""))
        topic_key = TOPIC_MAP.get(cat)
        if not topic_key:
            raise SystemExit(f"Unknown category {cat!r} in row {idx + 2}")

        opts = [
            polish_field(row.get("risposta_1", "")),
            polish_field(row.get("risposta_2", "")),
            polish_field(row.get("risposta_3", "")),
            polish_field(row.get("risposta_4", "")),
        ]
        correct_raw = (row.get("risposta_corretta") or "").strip()
        correct_one_based = int(correct_raw)
        new_opts, correct_idx = reorder_options_balanced(opts, correct_one_based, idx)

        nk = normalize_key(domanda)
        explanation, tlim = old_exp.get(nk, ("", 25))
        if not explanation:
            # Loose match: same normalized text ignoring final punctuation
            nk2 = nk.rstrip(".? ")
            for k, v in old_exp.items():
                if k.rstrip(".? ") == nk2:
                    explanation, tlim = v
                    break
        if not explanation:
            explanation, tlim = EXPL_EXTRA.get(nk, ("", 25))

        qid = f"q{idx + 1}"
        if idx == 0:
            tlim = 20
        questions.append(
            {
                "id": qid,
                "text": domanda,
                "options": new_opts,
                "correctIndex": correct_idx,
                "topicKey": topic_key,
                "explanation": explanation,
                "timeLimitSeconds": tlim,
            }
        )

    topics = [
        {"key": "bees", "label": "Le api"},
        {"key": "pollination", "label": "Impollinazione"},
        {"key": "hive_management", "label": "Gestione dell'alveare"},
        {"key": "bee_products", "label": "Prodotti dell'alveare"},
    ]

    payload = {"topics": topics, "questions": questions}
    OUT_JSON_PATH.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    # Stats
    from collections import Counter

    c = Counter(q["correctIndex"] for q in questions)
    print(f"Wrote {len(questions)} questions to {OUT_JSON_PATH}")
    print("correctIndex distribution:", dict(sorted(c.items())))


if __name__ == "__main__":
    main()
