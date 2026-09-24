// Single source of truth for the release. Loaded by the page AND the service worker,
// so bumping it is what makes installed phones notice an update.
// Use `python tools/release.py 2.0.1 "What changed"` rather than editing by hand.
self.DEEPEND_VERSION = "2.0.0";
self.DEEPEND_CHANGES = [
  {
    "v": "2.0.0",
    "date": "2026-09-24",
    "notes": [
      "Deep End is now an app: add it to your home screen and it works offline.",
      "Add both your names and the game tells you whose turn it is.",
      "Pass-the-phone screen so the next question stays a surprise.",
      "Leave a note on any question, then send all your notes to the maker in one tap."
    ]
  }
];
