(() => {
"use strict";

const VERSION = self.DEEPEND_VERSION || "dev";
const CHANGES = self.DEEPEND_CHANGES || [];
const { LEVELS, GROUPS, Q } = self.DEEPEND_BANK;
const WATER = ["#123F48","#10334F","#0D2748","#0A1B3A","#050B1F"];
const NOTE_REASONS = ["Great question","Awkward","Confusing","Wrong depth","Too similar to another"];
const $ = id => document.getElementById(id);

// ---------- native shell ----------
// The same files run as a website and inside the App Store / Play Store builds (Capacitor).
// In the store builds we use real haptics and the system share sheet; on the web we fall back.
const Cap = window.Capacitor;
const NATIVE = !!(Cap && Cap.isNativePlatform && Cap.isNativePlatform());
const plugin = name => NATIVE && Cap.Plugins && Cap.Plugins[name];
document.documentElement.classList.toggle("native", NATIVE);
function haptic(kind = "light"){
  const H = plugin("Haptics");
  if(H){ (kind === "select" ? H.selectionChanged() : H.impact({ style: kind === "medium" ? "MEDIUM" : "LIGHT" })).catch(() => {}); return; }
  if(navigator.vibrate) navigator.vibrate(kind === "medium" ? 14 : 8);
}
async function shareText(title, text){
  const S = plugin("Share");
  if(S){ await S.share({ title, text, dialogTitle: title }); return true; }
  if(navigator.share){ await navigator.share({ title, text }); return true; }
  return false;
}

// ---------- storage: every read/write guarded; private mode must not break the game ----------
const store = {
  get(k, fb){ try { const v = localStorage.getItem(k); return v == null ? fb : JSON.parse(v); } catch(e){ return fb; } },
  set(k, v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch(e){} }
};
const K = { saved:"deepend-saved", seen:"deepend-seen-v1", notes:"deepend-notes", prefs:"deepend-prefs",
            last:"deepend-last", ver:"deepend-last-version" };

let saved = store.get(K.saved, []);
let seen  = store.get(K.seen, {});
let notes = store.get(K.notes, []);
// Question transitions start off for anyone whose phone asks for reduced motion.
const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
let prefs = Object.assign({ passScreen:true, transitions:!REDUCED, nameA:"", nameB:"", general:"" }, store.get(K.prefs, {}));
const savePrefs = () => store.set(K.prefs, prefs);

const state = { label:"", phrase:"", cat:"friend", level:1, current:null, turn:0 };

// ---------- toast ----------
let toastTimer;
function toast(text, action, onAction){
  clearTimeout(toastTimer);
  $("toastText").textContent = text;
  const b = $("toastBtn");
  b.hidden = !action; b.textContent = action || ""; b.onclick = onAction || null;
  $("toast").hidden = false;
  if(!action) toastTimer = setTimeout(() => { $("toast").hidden = true; }, 3200);
}

// ---------- sheets ----------
let lastFocus = null;
function openSheet(id){
  lastFocus = document.activeElement;
  $(id).hidden = false;
  const f = $(id).querySelector("[data-close].x"); if(f) f.focus();
}
function closeSheet(id){ $(id).hidden = true; if(lastFocus && lastFocus.focus) lastFocus.focus(); }
document.querySelectorAll(".sheet-wrap").forEach(w =>
  w.querySelectorAll("[data-close]").forEach(el => el.addEventListener("click", () => closeSheet(w.id))));
document.addEventListener("keydown", e => {
  if(e.key !== "Escape") return;
  const open = [...document.querySelectorAll(".sheet-wrap")].find(w => !w.hidden);
  if(open) closeSheet(open.id);
});

// ---------- home ----------
GROUPS.forEach(g => {
  const wrap = document.createElement("div"); wrap.className = "group";
  const h = document.createElement("p"); h.className = "group-h"; h.textContent = g.name;
  const chips = document.createElement("div"); chips.className = "chips";
  g.rels.forEach(([label, cat, phrase]) => {
    const b = document.createElement("button");
    b.className = "chip"; b.type = "button"; b.textContent = label;
    b.onclick = () => start(label, cat, phrase, 1);
    chips.appendChild(b);
  });
  wrap.append(h, chips); $("groups").appendChild(wrap);
});
$("customForm").onsubmit = e => {
  e.preventDefault();
  const v = $("customInput").value.trim();
  if(!v){ $("customInput").focus(); return; }
  start(v, "friend", v, 1);
};
$("nameA").value = prefs.nameA; $("nameB").value = prefs.nameB;
["nameA","nameB"].forEach(id => $(id).addEventListener("input", () => { prefs[id] = $(id).value.trim(); savePrefs(); }));
$("versionLink").textContent = "Version " + VERSION + (NATIVE ? " · what's new, feedback" : " · what's new, feedback, install");
$("versionLink").onclick = openMenu;
$("menuHome").onclick = openMenu;

function renderResume(){
  const last = store.get(K.last, null);
  $("resume").hidden = !last;
  if(last) $("resumeText").textContent = "With " + last.phrase + " · " + LEVELS[last.level-1];
}
$("resume").onclick = () => {
  const l = store.get(K.last, null);
  if(l) start(l.label, l.cat, l.phrase, l.level);
};

function showHome(){
  $("play").hidden = true; $("home").hidden = false;
  setLevel(1, false); renderResume();
}
$("goHome").onclick = showHome;
$("changeWho").onclick = showHome;

// ---------- turns ----------
function names(){ return [prefs.nameA, prefs.nameB]; }
function turnText(){
  const [a, b] = names();
  if(a && b) return state.turn === 0 ? a + " asks " + b : b + " asks " + a;
  return state.turn === 0 ? "You ask them" : "They ask you";
}
function passTitle(){
  const [a, b] = names();
  const to = state.turn === 0 ? a : b;
  return to ? "Over to you, " + to : "Hand it across";
}

// ---------- question store: no repeats per relationship, kept on the device ----------
function relKey(){ return state.label.trim().toLowerCase(); }
function qid(lvl, i){ return state.cat + "-" + lvl + "-" + i; }
function pool(lvl){
  const s = new Set(seen[relKey()] || []);
  return Q[state.cat][lvl-1].map((q,i) => ({ q, id: qid(lvl, i) })).filter(x => !s.has(x.id));
}
function draw(){
  const p = pool(state.level);
  if(!p.length) return null;
  const pick = p[Math.floor(Math.random() * p.length)];
  (seen[relKey()] = seen[relKey()] || []).push(pick.id);
  store.set(K.seen, seen);
  return pick;
}
$("reset").onclick = () => {
  const prefix = state.cat + "-" + state.level + "-";
  seen[relKey()] = (seen[relKey()] || []).filter(id => !id.startsWith(prefix));
  store.set(K.seen, seen);
  newQuestion();
};

function start(label, cat, phrase, level){
  Object.assign(state, { label, cat, phrase, turn:0 });
  $("changeWho").textContent = "With " + phrase;
  $("home").hidden = true; $("play").hidden = false;
  setLevel(level || 1, false);
  newQuestion();
  updateSavedCount();
}
function remember(){ store.set(K.last, { label:state.label, cat:state.cat, phrase:state.phrase, level:state.level }); }

// With transitions on, the old question drifts up and away and the new one rises from below
// (the same upward pull as the bubbles). Off, it just swaps. Game state always updates at once
// so a quick Save or Skip during the animation acts on the new question.
let swapTimer = 0;
function newQuestion(){
  const pick = draw();
  state.current = pick ? { q: pick.q, id: pick.id, level: state.level, who: state.phrase, cat: state.cat } : null;
  syncSave(); remember();
  const card = document.querySelector(".card");
  clearTimeout(swapTimer);
  if(!prefs.transitions || !$("question").textContent){
    card.classList.remove("leaving");
    paintQuestion(pick, false);
    return;
  }
  card.classList.add("leaving");
  swapTimer = setTimeout(() => { card.classList.remove("leaving"); paintQuestion(pick, true); }, 190);
}
function replayEnter(){
  const el = $("question");
  el.classList.remove("enter"); void el.offsetWidth;
  if(prefs.transitions) el.classList.add("enter");
}
function paintQuestion(pick, animate){
  const el = $("question");
  el.classList.remove("enter");
  $("levelName").textContent = LEVELS[state.level-1];
  $("levelN").textContent = state.level + " of 5";
  const exhausted = !pick;
  ["next","pass","save","noteBtn"].forEach(id => $(id).disabled = exhausted);
  $("reset").hidden = !exhausted;
  if(exhausted){
    el.textContent = "You've asked every " + LEVELS[state.level-1].toLowerCase() + " question with " + state.phrase + ".";
    $("turn").textContent = "Nothing new here";
    $("left").textContent = "Slide to another depth, or start this one over.";
  } else {
    el.textContent = pick.q;
    $("turn").textContent = turnText();
    const n = pool(state.level).length;
    $("left").textContent = n === 0 ? "Last new one at this depth" : n + " new left at this depth";
  }
  if(animate){ void el.offsetWidth; el.classList.add("enter"); }
}

// ---------- depth ----------
function setLevel(lvl, fetch = true){
  lvl = Math.max(1, Math.min(5, lvl));
  const changed = lvl !== state.level;
  state.level = lvl;
  paintDepth(lvl);
  $("knob").style.top = ((lvl-1)/4*100) + "%";
  const g = $("gauge");
  g.setAttribute("aria-valuenow", lvl);
  g.setAttribute("aria-valuetext", LEVELS[lvl-1]);
  $("deeper").disabled = lvl === 5;
  $("deeper").querySelector("span").textContent = lvl === 5 ? "Deepest" : "Deeper";
  if(fetch && changed) newQuestion();
}
function paintDepth(l){
  document.body.dataset.level = l;
  document.querySelector('meta[name="theme-color"]').content = WATER[l-1];
}

const rail = $("rail"), gauge = $("gauge");
function tFromY(y){ const r = rail.getBoundingClientRect(); return Math.max(0, Math.min(1, (y - r.top) / r.height)); }
let dragging = false, dragLevel = 1;
gauge.addEventListener("pointerdown", e => {
  dragging = true; gauge.classList.add("dragging");
  gauge.setPointerCapture(e.pointerId);
  // A tap snaps straight to the nearest depth; only a drag glides (as in the original).
  dragLevel = Math.round(tFromY(e.clientY)*4) + 1;
  paintDepth(dragLevel); $("knob").style.top = ((dragLevel-1)/4*100) + "%";
});
gauge.addEventListener("pointermove", e => { if(dragging) moveTo(e.clientY); });
function moveTo(y){
  const t = tFromY(y);
  $("knob").style.top = (t*100) + "%";
  const l = dragLevel = Math.round(t*4) + 1;
  paintDepth(l); $("levelName").textContent = LEVELS[l-1]; $("levelN").textContent = l + " of 5";
}
function endDrag(){
  if(!dragging) return;
  dragging = false; gauge.classList.remove("dragging");
  if(dragLevel !== state.level) haptic("select");
  setLevel(dragLevel);
  $("levelName").textContent = LEVELS[state.level-1];
}
gauge.addEventListener("pointerup", endDrag);
gauge.addEventListener("pointercancel", endDrag);
gauge.addEventListener("keydown", e => {
  const map = { ArrowDown:1, ArrowRight:1, ArrowUp:-1, ArrowLeft:-1 };
  if(e.key in map){ e.preventDefault(); setLevel(state.level + map[e.key]); }
  else if(e.key === "Home"){ e.preventDefault(); setLevel(1); }
  else if(e.key === "End"){ e.preventDefault(); setLevel(5); }
});

// ---------- actions ----------
$("next").onclick = () => {
  haptic();
  state.turn = 1 - state.turn;
  newQuestion();
  if(prefs.passScreen && state.current) dive();
};

// ---------- hand-off: hold the ring to bring the question up ----------
const HOLD_MS = 750, SINK_MS = 300;
const surf = $("passScreen"), holdBtn = $("passReveal");
let holdP = 0, holding = false, holdRaf = 0, holdLast = 0, surfacing = false;

function dive(){
  $("passKicker").textContent = "Next up · " + LEVELS[state.level-1];
  $("passTitle").textContent = passTitle();
  surfacing = false; setHold(0);
  surf.classList.remove("out", "holding");
  surf.hidden = false;
  holdBtn.focus();
}
function setHold(p){
  holdP = p;
  surf.style.setProperty("--p", p.toFixed(3));
  $("holdFill").style.strokeDashoffset = String(100 - p * 100);
}
function holdFrame(now){
  const dt = now - holdLast; holdLast = now;
  const before = holdP;
  const p = holding ? Math.min(1, holdP + dt / HOLD_MS) : Math.max(0, holdP - dt / SINK_MS);
  setHold(p);
  // two small ticks on the way up, like notches on a reel
  if(holding && ((before < 1/3 && p >= 1/3) || (before < 2/3 && p >= 2/3))) haptic("select");
  if(p >= 1){ rise(); return; }
  if(holding || p > 0) holdRaf = requestAnimationFrame(holdFrame);
  else holdRaf = 0;
}
function press(e){
  if(surfacing) return;
  if(e){ e.preventDefault(); try { holdBtn.setPointerCapture(e.pointerId); } catch(_){} }
  holding = true; surf.classList.add("holding"); holdBtn.classList.add("holding");
  if(!holdRaf){ holdLast = performance.now(); holdRaf = requestAnimationFrame(holdFrame); }
}
function letGo(){
  if(!holding) return;
  holding = false; surf.classList.remove("holding"); holdBtn.classList.remove("holding");
  if(!holdRaf && holdP > 0){ holdLast = performance.now(); holdRaf = requestAnimationFrame(holdFrame); }
}
function rise(){
  surfacing = true; holding = false; holdRaf = 0;
  holdBtn.classList.remove("holding");
  haptic("medium");
  // restart the question's entrance so it comes up as the water lifts away
  clearTimeout(swapTimer); document.querySelector(".card").classList.remove("leaving");
  paintQuestion(state.current, false); replayEnter();
  surf.classList.add("out");
  setTimeout(() => { surf.hidden = true; surf.classList.remove("out", "holding"); setHold(0); $("next").focus(); }, 500);
}
holdBtn.addEventListener("pointerdown", press);
holdBtn.addEventListener("pointerup", letGo);
holdBtn.addEventListener("pointercancel", letGo);
holdBtn.addEventListener("lostpointercapture", letGo);
holdBtn.addEventListener("contextmenu", e => e.preventDefault());   // long-press menus on Android
// Keyboards and screen readers can't "hold": a click that didn't come from a pointer surfaces at once.
holdBtn.addEventListener("click", e => { if(e.detail === 0 && !surfacing) rise(); });
$("pass").onclick = () => newQuestion();
$("deeper").onclick = () => { haptic("medium"); setLevel(state.level + 1); };

function isSaved(){ return state.current && saved.some(s => s.q === state.current.q); }
function syncSave(){
  const on = !!isSaved();
  $("save").setAttribute("aria-pressed", on);
  $("save").querySelector("span").textContent = on ? "Saved" : "Save";
}
function updateSavedCount(){ $("openSaved").textContent = "Saved " + saved.length; }
$("save").onclick = () => {
  if(!state.current) return;
  if(isSaved()) saved = saved.filter(s => s.q !== state.current.q);
  else { saved.unshift({ q:state.current.q, level:state.current.level, who:state.current.who }); haptic(); }
  store.set(K.saved, saved); syncSave(); updateSavedCount();
};

function renderSaved(){
  const ul = $("savedList"); ul.innerHTML = "";
  if(!saved.length){
    const li = document.createElement("li");
    const p = document.createElement("p"); p.className = "empty";
    p.textContent = "Tap Save on a question you want to come back to. It will show up here.";
    li.appendChild(p); ul.appendChild(li); return;
  }
  saved.forEach((s, i) => {
    const li = document.createElement("li");
    const p = document.createElement("p"); p.textContent = s.q;
    const sm = document.createElement("small"); sm.textContent = LEVELS[s.level-1] + ", with " + s.who;
    p.appendChild(sm);
    const sh = document.createElement("button");
    sh.className = "x"; sh.textContent = "Share"; sh.setAttribute("aria-label", "Share: " + s.q);
    sh.onclick = async () => {
      try { if(!(await shareText("A question from Deep End", s.q + "\n\n(Deep End: questions for two)"))) throw 0; }
      catch(e){ if(e && e.name === "AbortError") return; try { await navigator.clipboard.writeText(s.q); toast("Question copied"); } catch(_){} }
    };
    const x = document.createElement("button");
    x.className = "x"; x.textContent = "Remove"; x.setAttribute("aria-label", "Remove: " + s.q);
    x.onclick = () => { saved.splice(i, 1); store.set(K.saved, saved); renderSaved(); updateSavedCount(); syncSave(); };
    const btns = document.createElement("div"); btns.className = "li-btns"; btns.append(sh, x);
    li.append(p, btns); ul.appendChild(li);
  });
}
$("openSaved").onclick = () => { renderSaved(); openSheet("savedSheet"); };

// ---------- playtest notes ----------
NOTE_REASONS.forEach(r => {
  const b = document.createElement("button");
  b.type = "button"; b.className = "chip"; b.textContent = r; b.setAttribute("aria-pressed", "false");
  b.onclick = () => b.setAttribute("aria-pressed", b.getAttribute("aria-pressed") !== "true");
  $("noteReasons").appendChild(b);
});
$("noteBtn").onclick = () => {
  if(!state.current) return;
  $("noteQ").textContent = state.current.q;
  $("noteText").value = "";
  $("noteReasons").querySelectorAll(".chip").forEach(c => c.setAttribute("aria-pressed", "false"));
  openSheet("noteSheet");
};
$("noteSubmit").onclick = () => {
  const reasons = [...$("noteReasons").querySelectorAll('.chip[aria-pressed="true"]')].map(c => c.textContent);
  const text = $("noteText").value.trim();
  if(!reasons.length && !text){ toast("Pick a reason or write something first"); return; }
  const c = state.current;
  notes.push({ q:c.q, id:c.id, level:c.level, cat:c.cat, who:c.who, reasons, text, v:VERSION, at:new Date().toISOString() });
  store.set(K.notes, notes);
  closeSheet("noteSheet");
  toast("Note saved. Send your notes from the menu.");
};

function feedbackText(){
  const lines = ["Deep End playtest feedback", "Version " + VERSION + " · " + new Date().toLocaleDateString(), ""];
  if(prefs.general) lines.push("General thoughts:", prefs.general, "");
  if(notes.length){
    lines.push("Notes on questions (" + notes.length + "):");
    notes.forEach((n, i) => {
      lines.push("", (i+1) + ". [" + LEVELS[n.level-1] + " · with " + n.who + "] " + n.q);
      if(n.reasons.length) lines.push("   " + n.reasons.join(", "));
      if(n.text) lines.push("   \"" + n.text + "\"");
    });
  }
  return lines.join("\n");
}
function renderFeedback(){
  $("fbCount").textContent = notes.length
    ? notes.length + (notes.length === 1 ? " note" : " notes") + " on questions so far."
    : "Tap Note on any question while you play. Send everything here when you're done.";
  $("fbGeneral").value = prefs.general;
}
$("fbGeneral").addEventListener("input", () => { prefs.general = $("fbGeneral").value; savePrefs(); });
$("fbSend").onclick = async () => {
  if(!notes.length && !prefs.general.trim()){ toast("Nothing to send yet"); return; }
  const text = feedbackText();
  try { if(await shareText("Deep End feedback", text)) return; }
  catch(e){ if(e && (e.name === "AbortError" || /cancel/i.test(e.message || ""))) return; }
  try { await navigator.clipboard.writeText(text); toast("Copied. Paste it in a message to the maker."); }
  catch(e){ toast("Couldn't share from this browser"); }
};
$("fbClear").onclick = () => {
  if(!notes.length && !prefs.general) return;
  if(!confirm("Clear all your notes? Do this after you've sent them.")) return;
  notes = []; store.set(K.notes, notes); prefs.general = ""; savePrefs(); renderFeedback();
};

// ---------- menu ----------
$("optPass").checked = prefs.passScreen;
$("optPass").onchange = () => { prefs.passScreen = $("optPass").checked; savePrefs(); };
$("optTransitions").checked = prefs.transitions;
$("optTransitions").onchange = () => { prefs.transitions = $("optTransitions").checked; savePrefs(); };
$("resetSeen").onclick = () => {
  if(!confirm("Every question becomes new again, for everyone you've played with.")) return;
  seen = {}; store.set(K.seen, seen); toast("Question history cleared");
};
function renderChanges(){
  const box = $("changes"); box.innerHTML = "";
  CHANGES.slice(0, 5).forEach(c => {
    const d = document.createElement("div"); d.className = "change";
    const b = document.createElement("b"); b.textContent = "Version " + c.v + (c.date ? " · " + c.date : "");
    const ul = document.createElement("ul");
    c.notes.forEach(n => { const li = document.createElement("li"); li.textContent = n; ul.appendChild(li); });
    d.append(b, ul); box.appendChild(d);
  });
}
function openMenu(){ renderInstall(); renderFeedback(); renderChanges(); openSheet("menuSheet"); }

// ---------- install ----------
let installPrompt = null;
const standalone = () => matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); installPrompt = e; renderInstall(); });
window.addEventListener("appinstalled", () => { installPrompt = null; renderInstall(); toast("Installed. Find Deep End on your home screen."); });
function renderInstall(){
  const t = $("installText"), b = $("installBtn");
  b.hidden = true;
  if(standalone()) t.textContent = "You're using the installed app. New versions arrive on their own; you'll see a prompt to update.";
  else if(installPrompt){ t.textContent = "Add Deep End to your home screen. It opens full screen and works without signal."; b.hidden = false; }
  else if(isIOS) t.textContent = "In Safari, tap the Share button, then Add to Home Screen. It opens full screen and works without signal.";
  else t.textContent = "Open your browser menu and choose Install app or Add to Home screen.";
}
$("installBtn").onclick = async () => {
  if(!installPrompt) return;
  installPrompt.prompt();
  try { await installPrompt.userChoice; } catch(e){}
  installPrompt = null; renderInstall();
};

// ---------- updates ----------
// The service worker holds a full offline copy per version. When a new version is
// published it downloads in the background and waits; we ask before swapping so a
// question never vanishes mid-conversation.
// Store builds carry their files inside the app and update through the store instead.
if(!NATIVE && "serviceWorker" in navigator && location.protocol !== "file:"){
  let reloading = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if(reloading) return; reloading = true; location.reload();
  });
  window.addEventListener("load", async () => {
    try {
      const reg = await navigator.serviceWorker.register("sw.js", { updateViaCache:"none" });
      const offer = w => toast("A new version of Deep End is ready.", "Update", () => {
        $("toast").hidden = true; w.postMessage({ type:"SKIP_WAITING" });
      });
      if(reg.waiting && navigator.serviceWorker.controller) offer(reg.waiting);
      reg.addEventListener("updatefound", () => {
        const w = reg.installing;
        w && w.addEventListener("statechange", () => {
          if(w.state === "installed" && navigator.serviceWorker.controller) offer(w);
        });
      });
      // Phones keep installed apps alive for days; check again whenever it's reopened.
      document.addEventListener("visibilitychange", () => {
        if(document.visibilityState === "visible") reg.update().catch(() => {});
      });
    } catch(e){}
  });
}

const lastVer = store.get(K.ver, null);
if(lastVer && lastVer !== VERSION){
  setTimeout(() => toast("Updated to version " + VERSION + ".", "What's new", () => { $("toast").hidden = true; openMenu(); }), 600);
}
store.set(K.ver, VERSION);

renderResume();
})();
