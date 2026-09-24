"""Cut a new release: bump the version and add a "What's new" entry.

    python tools/release.py 2.0.1 "Fixed the slider on small phones" "Ten new family questions"

Changing version.js is what makes every installed copy notice the update and offer it
to the player, so run this before each publish. Notes are shown to players verbatim.
"""
import datetime
import json
import re
import sys
from pathlib import Path

VERSION_FILE = Path(__file__).resolve().parent.parent / "docs" / "version.js"


def main(argv):
    if len(argv) < 3 or not re.fullmatch(r"\d+\.\d+\.\d+", argv[1]):
        sys.exit(__doc__)
    version, notes = argv[1], argv[2:]
    src = VERSION_FILE.read_text(encoding="utf-8")
    current = re.search(r'DEEPEND_VERSION = "([^"]+)"', src).group(1)
    changes = json.loads(re.search(r"DEEPEND_CHANGES = (\[.*\]);", src, re.S).group(1))
    if version == current or any(c["v"] == version for c in changes):
        sys.exit(f"Version {version} already exists (current is {current}).")
    changes.insert(0, {"v": version, "date": datetime.date.today().isoformat(), "notes": notes})
    src = re.sub(r'DEEPEND_VERSION = "[^"]+"', f'DEEPEND_VERSION = "{version}"', src)
    src = re.sub(r"DEEPEND_CHANGES = \[.*\];",
                 lambda _: "DEEPEND_CHANGES = " + json.dumps(changes, indent=2, ensure_ascii=False) + ";",
                 src, flags=re.S)
    VERSION_FILE.write_text(src, encoding="utf-8")
    print(f"{current} -> {version}. Commit and push: GitHub Pages updates the web app in about a minute.")


if __name__ == "__main__":
    main(sys.argv)
