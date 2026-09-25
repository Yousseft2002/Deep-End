// Single source of truth for the release. Loaded by the page AND the service worker,
// so bumping it is what makes installed phones notice an update.
// Use `python tools/release.py 2.0.1 "What changed"` rather than editing by hand.
self.DEEPEND_VERSION = "3.0.0";
self.DEEPEND_CHANGES = [
  {
    "v": "3.0.0",
    "date": "2026-09-25",
    "notes": [
      "A new, darker look. The light in the water warms as you go deeper.",
      "240 new questions, and every question now has a follow-up. Tap Follow-up to dig into the answer.",
      "Every few turns, a short moment to share. You can turn these off in Settings.",
      "Smarter picks: fewer similar questions back to back, and a nudge when you're ready to go deeper."
    ]
  },
  {
    "v": "2.2.0",
    "date": "2026-09-24",
    "notes": [
      "Question transitions: new questions rise up as the old one drifts away. Turn them off in Settings if you prefer an instant swap."
    ]
  },
  {
    "v": "2.1.0",
    "date": "2026-09-24",
    "notes": [
      "New hand-off between turns: the next question waits underwater. Hold the life ring to bring it up.",
      "Fonts are now built into the app, so it looks right with no signal and never contacts Google."
    ]
  },
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
