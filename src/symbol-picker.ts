import type { EditorView } from "@codemirror/view";
import type { KeyBinding } from "@codemirror/view";
import { getCurrentThemeId } from "./appearance";
import { THEMES } from "./themes";

// ── Symbol data ──────────────────────────────────────────────────────

interface Sym { char: string; name: string }

const EMOJI_DATA: Sym[] = [
  // Smileys & people
  { char: "😀", name: "grinning face" },
  { char: "😁", name: "grinning face with big eyes" },
  { char: "😂", name: "face with tears of joy" },
  { char: "🤣", name: "rolling on the floor laughing" },
  { char: "😃", name: "grinning face with big eyes" },
  { char: "😄", name: "grinning face with smiling eyes" },
  { char: "😅", name: "grinning face with sweat" },
  { char: "😆", name: "grinning squinting face" },
  { char: "😉", name: "winking face" },
  { char: "😊", name: "smiling face with smiling eyes" },
  { char: "😋", name: "face savoring food" },
  { char: "😎", name: "smiling face with sunglasses" },
  { char: "😍", name: "smiling face with heart eyes" },
  { char: "😘", name: "face blowing a kiss" },
  { char: "🥰", name: "smiling face with hearts" },
  { char: "😗", name: "kissing face" },
  { char: "😙", name: "kissing face with smiling eyes" },
  { char: "😚", name: "kissing face with closed eyes" },
  { char: "🙂", name: "slightly smiling face" },
  { char: "🤗", name: "hugging face" },
  { char: "🤔", name: "thinking face" },
  { char: "😐", name: "neutral face" },
  { char: "😑", name: "expressionless face" },
  { char: "😶", name: "face without mouth" },
  { char: "🙄", name: "face with rolling eyes" },
  { char: "😏", name: "smirking face" },
  { char: "😣", name: "persevering face" },
  { char: "😥", name: "sad but relieved face" },
  { char: "😮", name: "face with open mouth" },
  { char: "🤐", name: "zipper mouth face" },
  { char: "😯", name: "hushed face" },
  { char: "😪", name: "sleepy face" },
  { char: "😫", name: "tired face" },
  { char: "🥱", name: "yawning face" },
  { char: "😴", name: "sleeping face" },
  { char: "😌", name: "relieved face" },
  { char: "😛", name: "face with tongue" },
  { char: "😜", name: "winking face with tongue" },
  { char: "😝", name: "squinting face with tongue" },
  { char: "🤤", name: "drooling face" },
  { char: "😒", name: "unamused face" },
  { char: "😓", name: "downcast face with sweat" },
  { char: "😔", name: "pensive face" },
  { char: "😕", name: "confused face" },
  { char: "🙃", name: "upside down face" },
  { char: "🤑", name: "money mouth face" },
  { char: "😲", name: "astonished face" },
  { char: "😷", name: "face with medical mask" },
  { char: "🤒", name: "face with thermometer" },
  { char: "🤕", name: "face with head bandage" },
  { char: "🤢", name: "nauseated face" },
  { char: "🤧", name: "sneezing face" },
  { char: "🥵", name: "hot face" },
  { char: "🥶", name: "cold face" },
  { char: "🥴", name: "woozy face" },
  { char: "😵", name: "dizzy face" },
  { char: "🤯", name: "exploding head" },
  { char: "🤠", name: "cowboy hat face" },
  { char: "🥳", name: "partying face" },
  { char: "😬", name: "grimacing face" },
  { char: "😱", name: "face screaming in fear" },
  { char: "😨", name: "fearful face" },
  { char: "😰", name: "anxious face with sweat" },
  { char: "😢", name: "crying face" },
  { char: "😭", name: "loudly crying face" },
  { char: "😤", name: "face with steam from nose" },
  { char: "😠", name: "angry face" },
  { char: "😡", name: "pouting face" },
  { char: "🤬", name: "face with symbols on mouth" },
  { char: "😈", name: "smiling face with horns" },
  { char: "👿", name: "angry face with horns" },
  { char: "💀", name: "skull" },
  { char: "☠️", name: "skull and crossbones" },
  { char: "💩", name: "pile of poo" },
  { char: "🤡", name: "clown face" },
  { char: "👻", name: "ghost" },
  { char: "👽", name: "alien" },
  { char: "🤖", name: "robot" },
  { char: "💫", name: "dizzy star" },
  { char: "💥", name: "collision explosion" },
  { char: "💢", name: "anger symbol" },
  { char: "💬", name: "speech bubble" },
  { char: "💭", name: "thought bubble" },
  { char: "💤", name: "sleeping zzz" },
  // Hands & gestures
  { char: "👍", name: "thumbs up" },
  { char: "👎", name: "thumbs down" },
  { char: "👌", name: "ok hand" },
  { char: "✌️", name: "victory hand" },
  { char: "🤞", name: "crossed fingers" },
  { char: "👏", name: "clapping hands" },
  { char: "🙌", name: "raising hands" },
  { char: "🤝", name: "handshake" },
  { char: "🙏", name: "folded hands pray" },
  { char: "💪", name: "flexed biceps muscle" },
  // Animals
  { char: "🐶", name: "dog face" },
  { char: "🐱", name: "cat face" },
  { char: "🐭", name: "mouse face" },
  { char: "🐹", name: "hamster face" },
  { char: "🐰", name: "rabbit face" },
  { char: "🦊", name: "fox face" },
  { char: "🐻", name: "bear face" },
  { char: "🐼", name: "panda face" },
  { char: "🐨", name: "koala" },
  { char: "🐯", name: "tiger face" },
  { char: "🦁", name: "lion face" },
  { char: "🐮", name: "cow face" },
  { char: "🐷", name: "pig face" },
  { char: "🐸", name: "frog face" },
  { char: "🐵", name: "monkey face" },
  { char: "🐔", name: "chicken" },
  { char: "🐧", name: "penguin" },
  { char: "🐦", name: "bird" },
  { char: "🦆", name: "duck" },
  { char: "🦅", name: "eagle" },
  { char: "🦉", name: "owl" },
  { char: "🦋", name: "butterfly" },
  { char: "🐛", name: "bug caterpillar" },
  { char: "🐝", name: "bee" },
  { char: "🐞", name: "ladybug" },
  // Food
  { char: "🍎", name: "red apple" },
  { char: "🍊", name: "tangerine orange" },
  { char: "🍋", name: "lemon" },
  { char: "🍇", name: "grapes" },
  { char: "🍓", name: "strawberry" },
  { char: "🍒", name: "cherries" },
  { char: "🍑", name: "peach" },
  { char: "🍕", name: "pizza" },
  { char: "🍔", name: "hamburger" },
  { char: "🍟", name: "fries" },
  { char: "🌮", name: "taco" },
  { char: "🍜", name: "noodles ramen" },
  { char: "🍣", name: "sushi" },
  { char: "🍩", name: "doughnut donut" },
  { char: "🎂", name: "birthday cake" },
  { char: "🍺", name: "beer" },
  { char: "☕", name: "coffee hot beverage" },
  { char: "🍵", name: "teacup tea" },
  // Activities & objects
  { char: "⚽", name: "soccer ball football" },
  { char: "🏀", name: "basketball" },
  { char: "🎸", name: "guitar music" },
  { char: "🎹", name: "piano keyboard music" },
  { char: "🎮", name: "video game controller" },
  { char: "🎲", name: "dice game" },
  { char: "📚", name: "books" },
  { char: "📝", name: "memo pencil note" },
  { char: "💡", name: "light bulb idea" },
  { char: "🔍", name: "magnifying glass search" },
  { char: "🔑", name: "key" },
  { char: "🔒", name: "locked lock" },
  { char: "🔓", name: "unlocked lock" },
  { char: "📌", name: "pin pushpin" },
  { char: "📎", name: "paperclip" },
  { char: "✂️", name: "scissors" },
  { char: "🗑️", name: "wastebasket trash" },
  { char: "💾", name: "floppy disk save" },
  { char: "💻", name: "laptop computer" },
  { char: "📱", name: "mobile phone" },
  // Symbols & nature
  { char: "❤️", name: "red heart love" },
  { char: "🧡", name: "orange heart" },
  { char: "💛", name: "yellow heart" },
  { char: "💚", name: "green heart" },
  { char: "💙", name: "blue heart" },
  { char: "💜", name: "purple heart" },
  { char: "🖤", name: "black heart" },
  { char: "⭐", name: "star" },
  { char: "🌟", name: "glowing star" },
  { char: "✨", name: "sparkles" },
  { char: "🔥", name: "fire flame" },
  { char: "❄️", name: "snowflake cold" },
  { char: "🌈", name: "rainbow" },
  { char: "☀️", name: "sun sunny" },
  { char: "🌙", name: "crescent moon" },
  { char: "⚡", name: "lightning bolt" },
  { char: "🌊", name: "wave ocean" },
  { char: "🌱", name: "seedling plant" },
  { char: "🌸", name: "cherry blossom flower" },
  { char: "🍀", name: "four leaf clover lucky" },
  { char: "⚠️", name: "warning" },
  { char: "✅", name: "check mark done" },
  { char: "❌", name: "cross mark wrong" },
  { char: "❓", name: "question mark" },
  { char: "❗", name: "exclamation mark" },
  { char: "🎉", name: "party popper celebrate" },
  { char: "🏆", name: "trophy award" },
  { char: "🎯", name: "direct hit target" },
  { char: "💯", name: "hundred points" },
  { char: "🚀", name: "rocket launch" },
  { char: "🌍", name: "earth globe" },
];

const GREEK_DATA: Sym[] = [
  { char: "α", name: "alpha" },
  { char: "β", name: "beta" },
  { char: "γ", name: "gamma" },
  { char: "δ", name: "delta" },
  { char: "ε", name: "epsilon" },
  { char: "ζ", name: "zeta" },
  { char: "η", name: "eta" },
  { char: "θ", name: "theta" },
  { char: "ι", name: "iota" },
  { char: "κ", name: "kappa" },
  { char: "λ", name: "lambda" },
  { char: "μ", name: "mu" },
  { char: "ν", name: "nu" },
  { char: "ξ", name: "xi" },
  { char: "ο", name: "omicron" },
  { char: "π", name: "pi" },
  { char: "ρ", name: "rho" },
  { char: "σ", name: "sigma" },
  { char: "τ", name: "tau" },
  { char: "υ", name: "upsilon" },
  { char: "φ", name: "phi" },
  { char: "χ", name: "chi" },
  { char: "ψ", name: "psi" },
  { char: "ω", name: "omega" },
  { char: "Α", name: "Alpha" },
  { char: "Β", name: "Beta" },
  { char: "Γ", name: "Gamma" },
  { char: "Δ", name: "Delta" },
  { char: "Ε", name: "Epsilon" },
  { char: "Ζ", name: "Zeta" },
  { char: "Η", name: "Eta" },
  { char: "Θ", name: "Theta" },
  { char: "Ι", name: "Iota" },
  { char: "Κ", name: "Kappa" },
  { char: "Λ", name: "Lambda" },
  { char: "Μ", name: "Mu" },
  { char: "Ν", name: "Nu" },
  { char: "Ξ", name: "Xi" },
  { char: "Ο", name: "Omicron" },
  { char: "Π", name: "Pi" },
  { char: "Ρ", name: "Rho" },
  { char: "Σ", name: "Sigma" },
  { char: "Τ", name: "Tau" },
  { char: "Υ", name: "Upsilon" },
  { char: "Φ", name: "Phi" },
  { char: "Χ", name: "Chi" },
  { char: "Ψ", name: "Psi" },
  { char: "Ω", name: "Omega" },
  // variants
  { char: "ς", name: "sigma final" },
  { char: "ϑ", name: "theta variant" },
  { char: "ϕ", name: "phi variant" },
  { char: "ϖ", name: "pi variant" },
  { char: "ϱ", name: "rho variant" },
  { char: "ϵ", name: "epsilon variant" },
];

const MATH_DATA: Sym[] = [
  // Basic operators
  { char: "±", name: "plus minus" },
  { char: "∓", name: "minus plus" },
  { char: "×", name: "times multiply" },
  { char: "÷", name: "division divide" },
  { char: "·", name: "dot product" },
  { char: "∘", name: "ring composition" },
  // Relations
  { char: "=", name: "equals" },
  { char: "≠", name: "not equal" },
  { char: "≈", name: "approximately equal" },
  { char: "≡", name: "identical congruent" },
  { char: "≢", name: "not identical" },
  { char: "≅", name: "congruent isomorphic" },
  { char: "~", name: "tilde similar" },
  { char: "≃", name: "asymptotically equal" },
  { char: "<", name: "less than" },
  { char: ">", name: "greater than" },
  { char: "≤", name: "less than or equal" },
  { char: "≥", name: "greater than or equal" },
  { char: "≪", name: "much less than" },
  { char: "≫", name: "much greater than" },
  { char: "∝", name: "proportional" },
  // Calculus & analysis
  { char: "∑", name: "sum sigma" },
  { char: "∏", name: "product pi" },
  { char: "∫", name: "integral" },
  { char: "∬", name: "double integral" },
  { char: "∭", name: "triple integral" },
  { char: "∮", name: "contour integral oint" },
  { char: "∂", name: "partial derivative" },
  { char: "∇", name: "nabla del gradient" },
  { char: "√", name: "square root" },
  { char: "∛", name: "cube root" },
  { char: "∞", name: "infinity" },
  { char: "lim", name: "limit" },
  { char: "′", name: "prime derivative" },
  { char: "″", name: "double prime" },
  { char: "‴", name: "triple prime" },
  // Logic
  { char: "∧", name: "and logical" },
  { char: "∨", name: "or logical" },
  { char: "¬", name: "not negation" },
  { char: "⊕", name: "xor exclusive or" },
  { char: "⊻", name: "xor veebar" },
  { char: "∀", name: "for all universal" },
  { char: "∃", name: "there exists existential" },
  { char: "∄", name: "there does not exist" },
  { char: "⊢", name: "proves turnstile" },
  { char: "⊨", name: "models entails" },
  { char: "⊤", name: "top true tautology" },
  { char: "⊥", name: "bottom false contradiction" },
  // Sets
  { char: "∈", name: "element of in set" },
  { char: "∉", name: "not element of" },
  { char: "∋", name: "contains member" },
  { char: "⊂", name: "subset" },
  { char: "⊃", name: "superset" },
  { char: "⊆", name: "subset or equal" },
  { char: "⊇", name: "superset or equal" },
  { char: "⊄", name: "not subset" },
  { char: "∅", name: "empty set null" },
  { char: "∩", name: "intersection cap" },
  { char: "∪", name: "union cup" },
  { char: "∖", name: "set minus difference" },
  { char: "△", name: "symmetric difference" },
  { char: "𝒫", name: "power set" },
  // Arrows
  { char: "→", name: "right arrow implies" },
  { char: "←", name: "left arrow" },
  { char: "↔", name: "left right arrow iff" },
  { char: "↑", name: "up arrow" },
  { char: "↓", name: "down arrow" },
  { char: "↕", name: "up down arrow" },
  { char: "⇒", name: "right double arrow implies" },
  { char: "⇐", name: "left double arrow" },
  { char: "⇔", name: "left right double arrow iff equivalent" },
  { char: "⇑", name: "up double arrow" },
  { char: "⇓", name: "down double arrow" },
  { char: "↦", name: "maps to mapsto" },
  { char: "↪", name: "hook right injection" },
  { char: "↠", name: "twohead right surjection" },
  { char: "↝", name: "right squiggly arrow" },
  // Number sets
  { char: "ℕ", name: "natural numbers" },
  { char: "ℤ", name: "integers" },
  { char: "ℚ", name: "rationals" },
  { char: "ℝ", name: "real numbers" },
  { char: "ℂ", name: "complex numbers" },
  { char: "ℙ", name: "primes" },
  // Geometry & misc
  { char: "°", name: "degree angle" },
  { char: "∠", name: "angle" },
  { char: "⊥", name: "perpendicular" },
  { char: "∥", name: "parallel" },
  { char: "△", name: "triangle" },
  { char: "□", name: "square end of proof" },
  { char: "◇", name: "diamond" },
  { char: "⌊", name: "floor left" },
  { char: "⌋", name: "floor right" },
  { char: "⌈", name: "ceiling left" },
  { char: "⌉", name: "ceiling right" },
  { char: "|", name: "divides absolute value" },
  { char: "‖", name: "norm parallel" },
  { char: "…", name: "ellipsis dots" },
  { char: "⋯", name: "horizontal dots" },
  { char: "⋮", name: "vertical dots" },
  { char: "⋱", name: "diagonal dots" },
  { char: "⊗", name: "tensor product otimes" },
  { char: "⊙", name: "circle dot" },
  { char: "⊞", name: "boxplus" },
  { char: "≜", name: "defined as triangleq" },
  { char: "≝", name: "defined equal" },
  { char: "≙", name: "corresponds to" },
];

// ── DOM state ────────────────────────────────────────────────────────

type Category = "emoji" | "greek" | "math";

const COLS = 8;
let overlayEl: HTMLDivElement | null = null;
let pickerEl: HTMLDivElement | null = null;
let headerEl: HTMLDivElement | null = null;
let searchEl: HTMLInputElement | null = null;
let gridEl: HTMLDivElement | null = null;

let activeCategory: Category = "emoji";
let activeView: EditorView | null = null;

// ── Build DOM (once) ─────────────────────────────────────────────────

function buildPicker(): void {
  overlayEl = document.createElement("div");
  Object.assign(overlayEl.style, {
    position: "fixed",
    inset: "0",
    zIndex: "9999",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(0,0,0,0.35)",
  });
  overlayEl.addEventListener("mousedown", (e) => {
    if (e.target === overlayEl) closePicker();
  });

  pickerEl = document.createElement("div");
  Object.assign(pickerEl.style, {
    position: "relative",
    width: "384px",
    maxHeight: "460px",
    display: "flex",
    flexDirection: "column",
    borderRadius: "8px",
    overflow: "hidden",
    boxShadow: "0 8px 32px rgba(0,0,0,0.45)",
  });

  // Header: tabs + close button
  headerEl = document.createElement("div");
  Object.assign(headerEl.style, {
    display: "flex",
    alignItems: "center",
    padding: "8px 10px 0",
    gap: "4px",
    flexShrink: "0",
  });

  const categories: { id: Category; label: string }[] = [
    { id: "emoji", label: "Emoji" },
    { id: "greek", label: "Greek" },
    { id: "math", label: "Math" },
  ];

  for (const cat of categories) {
    const btn = document.createElement("button");
    btn.textContent = cat.label;
    btn.dataset["cat"] = cat.id;
    Object.assign(btn.style, {
      flex: "1",
      padding: "5px 0",
      border: "none",
      borderRadius: "4px 4px 0 0",
      cursor: "pointer",
      fontSize: "13px",
      fontWeight: "600",
      transition: "background 0.15s",
    });
    btn.addEventListener("click", () => {
      activeCategory = cat.id;
      updateTabStyles();
      renderGrid();
      searchEl!.value = "";
      searchEl!.focus();
    });
    headerEl.appendChild(btn);
  }

  const closeBtn = document.createElement("button");
  closeBtn.textContent = "×";
  Object.assign(closeBtn.style, {
    marginLeft: "auto",
    width: "26px",
    height: "26px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "16px",
    lineHeight: "1",
    flexShrink: "0",
  });
  closeBtn.addEventListener("click", closePicker);
  headerEl.appendChild(closeBtn);

  // Search input
  searchEl = document.createElement("input");
  searchEl.type = "text";
  searchEl.placeholder = "Search…";
  Object.assign(searchEl.style, {
    margin: "8px 10px",
    padding: "5px 8px",
    border: "1px solid",
    borderRadius: "4px",
    fontSize: "13px",
    outline: "none",
    flexShrink: "0",
  });
  searchEl.addEventListener("input", () => renderGrid());
  searchEl.addEventListener("keydown", handlePickerKeydown);

  // Grid
  gridEl = document.createElement("div");
  Object.assign(gridEl.style, {
    display: "grid",
    gridTemplateColumns: `repeat(${COLS}, 1fr)`,
    gap: "2px",
    padding: "4px 10px 10px",
    overflowY: "auto",
    flexGrow: "1",
  });

  pickerEl.appendChild(headerEl);
  pickerEl.appendChild(searchEl);
  pickerEl.appendChild(gridEl);
  overlayEl.appendChild(pickerEl);
}

// ── Theming ──────────────────────────────────────────────────────────

function applyThemeStyles(): void {
  if (!pickerEl || !searchEl) return;
  const themeId = getCurrentThemeId();
  const palette = THEMES[themeId];
  const dark = palette.isDark;

  const bg = dark ? "#2c2c2c" : "#ffffff";
  const fg = dark ? "#e0e0e0" : "#222222";
  const border = dark ? "#444444" : "#dddddd";
  const tabActiveBg = dark ? "#3a3a3a" : "#f0f0f0";
  const tabHoverBg = dark ? "#353535" : "#f8f8f8";
  const tabInactiveBg = dark ? "#252525" : "#e8e8e8";
  const inputBg = dark ? "#1e1e1e" : "#ffffff";
  const inputBorder = dark ? "#555555" : "#cccccc";

  pickerEl.style.background = bg;
  pickerEl.style.color = fg;
  pickerEl.style.border = `1px solid ${border}`;

  searchEl.style.background = inputBg;
  searchEl.style.color = fg;
  searchEl.style.borderColor = inputBorder;

  // Tab buttons
  const tabBtns = headerEl!.querySelectorAll<HTMLButtonElement>("button[data-cat]");
  tabBtns.forEach((btn) => {
    const isActive = btn.dataset["cat"] === activeCategory;
    btn.style.background = isActive ? tabActiveBg : tabInactiveBg;
    btn.style.color = fg;
    btn.onmouseenter = () => { if (btn.dataset["cat"] !== activeCategory) btn.style.background = tabHoverBg; };
    btn.onmouseleave = () => { btn.style.background = isActive ? tabActiveBg : tabInactiveBg; };
  });

  // Close button
  const closeBtn = headerEl!.querySelector<HTMLButtonElement>("button:not([data-cat])")!;
  closeBtn.style.background = tabInactiveBg;
  closeBtn.style.color = fg;

  if (headerEl) {
    headerEl.style.background = tabInactiveBg;
    headerEl.style.borderBottom = `1px solid ${border}`;
  }
}

function updateTabStyles(): void {
  applyThemeStyles();
}

// ── Grid rendering ───────────────────────────────────────────────────

function dataForCategory(cat: Category): Sym[] {
  if (cat === "emoji") return EMOJI_DATA;
  if (cat === "greek") return GREEK_DATA;
  return MATH_DATA;
}

function renderGrid(): void {
  if (!gridEl) return;
  const query = searchEl!.value.toLowerCase();
  const data = dataForCategory(activeCategory).filter(
    (s) => !query || s.name.toLowerCase().includes(query)
  );

  const themeId = getCurrentThemeId();
  const palette = THEMES[themeId];
  const dark = palette.isDark;
  const cellBg = dark ? "#2c2c2c" : "#ffffff";
  const cellHover = dark ? "#3e3e3e" : "#f0f0f0";
  const cellFocusBg = dark ? "#4a4a4a" : "#ddeeff";
  const cellFocusBorder = dark ? "#6699cc" : "#3388cc";

  gridEl.innerHTML = "";
  for (const sym of data) {
    const cell = document.createElement("span");
    cell.textContent = sym.char;
    cell.title = sym.name;
    cell.tabIndex = 0;
    Object.assign(cell.style, {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      aspectRatio: "1",
      fontSize: activeCategory === "emoji" ? "20px" : "18px",
      borderRadius: "4px",
      cursor: "pointer",
      background: cellBg,
      border: "1px solid transparent",
      userSelect: "none",
      transition: "background 0.1s",
    });
    cell.addEventListener("mouseenter", () => { cell.style.background = cellHover; });
    cell.addEventListener("mouseleave", () => { cell.style.background = cellBg; });
    cell.addEventListener("focus", () => {
      cell.style.background = cellFocusBg;
      cell.style.borderColor = cellFocusBorder;
    });
    cell.addEventListener("blur", () => {
      cell.style.background = cellBg;
      cell.style.borderColor = "transparent";
    });
    cell.addEventListener("click", () => {
      insertSymbol(sym.char);
      closePicker();
    });
    cell.addEventListener("keydown", handlePickerKeydown);
    gridEl.appendChild(cell);
  }
}

// ── Keyboard navigation ──────────────────────────────────────────────

function handlePickerKeydown(e: KeyboardEvent): void {
  if (e.key === "Escape") {
    e.preventDefault();
    closePicker();
    return;
  }

  const focused = document.activeElement as HTMLElement;
  const cells = Array.from(gridEl!.querySelectorAll<HTMLElement>("span[tabindex]"));
  const idx = cells.indexOf(focused);

  if (e.key === "Enter") {
    e.preventDefault();
    if (idx >= 0) {
      insertSymbol(cells[idx].textContent!);
      closePicker();
    }
    return;
  }

  if (e.key === "ArrowRight" || e.key === "ArrowLeft" || e.key === "ArrowDown" || e.key === "ArrowUp") {
    e.preventDefault();
    if (cells.length === 0) return;

    let next = idx;
    if (e.key === "ArrowRight") next = idx + 1;
    else if (e.key === "ArrowLeft") next = idx - 1;
    else if (e.key === "ArrowDown") next = idx + COLS;
    else if (e.key === "ArrowUp") next = idx - COLS;

    if (next >= 0 && next < cells.length) {
      cells[next].focus();
    } else if (idx < 0 && cells.length > 0) {
      cells[0].focus();
    }
  }

  if (e.key === "Tab") {
    // Cycle tabs: e → g → m → e
    e.preventDefault();
    const order: Category[] = ["emoji", "greek", "math"];
    const cur = order.indexOf(activeCategory);
    activeCategory = order[(cur + (e.shiftKey ? order.length - 1 : 1)) % order.length];
    updateTabStyles();
    renderGrid();
    searchEl!.value = "";
    searchEl!.focus();
  }
}

// ── Insert & close ───────────────────────────────────────────────────

function insertSymbol(char: string): void {
  if (!activeView) return;
  activeView.dispatch(activeView.state.replaceSelection(char));
  activeView.focus();
}

function closePicker(): void {
  if (overlayEl && overlayEl.parentNode) {
    overlayEl.parentNode.removeChild(overlayEl);
  }
  activeView?.focus();
}

// ── Public API ───────────────────────────────────────────────────────

export function openSymbolPicker(view: EditorView, category: Category): void {
  activeView = view;
  activeCategory = category;

  if (!overlayEl) buildPicker();

  applyThemeStyles();
  searchEl!.value = "";
  renderGrid();

  document.body.appendChild(overlayEl!);

  requestAnimationFrame(() => searchEl!.focus());
}

export const symbolPickerKeymap: KeyBinding[] = [
  { key: "Mod-e", run: (view) => { openSymbolPicker(view, "emoji"); return true; } },
  { key: "Mod-g", run: (view) => { openSymbolPicker(view, "greek"); return true; } },
  { key: "Mod-m", run: (view) => { openSymbolPicker(view, "math"); return true; } },
];
