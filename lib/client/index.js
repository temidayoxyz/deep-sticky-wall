window.__ModuleLoader__.load({ id: "dsh-deep-sticky-wall", factory: (require) => {
var module = { exports: {} }; var exports = module.exports;
let react = require("react");
let react_jsx_runtime = require("react/jsx-runtime");

//#region src/client/styles.ts
const STYLES = `
.dsnw-viewport {
  width: 100%;
  height: 100%;
  min-height: 100vh;
  overflow: auto;
  background: #12121a;
}
.dsnw-wall {
  position: relative;
  overflow: visible;
  background-color: #1e1e28;
  background-image: radial-gradient(rgba(255,255,255,0.22) 1px, transparent 1px);
  background-size: 24px 24px;
  background-position: 0 0;
  color: #f5f5f5;
}
.dsnw-toolbar {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 30;
  display: flex;
  gap: 8px;
  align-items: center;
}
.dsnw-button {
  border: 0;
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 13px;
  cursor: pointer;
  background: rgba(255,255,255,0.14);
  color: #fff;
  backdrop-filter: blur(6px);
}
.dsnw-button:hover { background: rgba(255,255,255,0.22); }
.dsnw-note {
  position: absolute;
  padding: 10px;
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.28);
  display: flex;
  flex-direction: column;
  gap: 8px;
  cursor: move;
  user-select: none;
  touch-action: none;
}
.dsnw-note textarea {
  flex: 1;
  resize: none;
  border: 0;
  outline: 0;
  background: transparent;
  color: #1f1f1f;
  font-size: 13px;
  line-height: 1.4;
}
.dsnw-note .dsn-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.dsnw-note .dsn-delete {
  cursor: pointer;
  border: 0;
  background: rgba(0,0,0,0.16);
  color: #1f1f1f;
  border-radius: 6px;
  padding: 4px 10px;
  font-size: 12px;
}
.dsnw-colors { display: flex; gap: 4px; }
.dsnw-color-dot { width: 18px; height: 18px; border-radius: 50%; cursor: pointer; border: 2px solid rgba(0,0,0,0.15); }
.dsnw-empty {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  opacity: .7;
  text-align: center;
  pointer-events: none;
  max-width: 360px;
}
`;

//#endregion
//#region src/client/StickyWall.tsx
const STORAGE_KEY = "dsh-deep-sticky-wall:notes";
const COLORS = [
	"#fef08a",
	"#fde68a",
	"#bbf7d0",
	"#bfdbfe",
	"#fbcfe8",
	"#ddd6fe"
];
const NOTE_WIDTH = 224;
const NOTE_HEIGHT = 160;
const MARGIN = 28;
function loadNotes() {
	try {
		const raw = window.localStorage.getItem(STORAGE_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		if (!Array.isArray(parsed)) return [];
		return parsed.filter((n) => typeof n?.id === "string");
	} catch {
		return [];
	}
}
function saveNotes(notes) {
	try {
		window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
	} catch {}
}
function clamp(value, min, max) {
	return Math.min(max, Math.max(min, value));
}
function rectanglesOverlap(a, b) {
	return Math.abs(a.x - b.x) < NOTE_WIDTH + MARGIN && Math.abs(a.y - b.y) < NOTE_HEIGHT + MARGIN;
}
function findEmptySpot(notes, canvasWidth, canvasHeight) {
	const gridX = Math.max(1, Math.floor((canvasWidth - NOTE_WIDTH) / (NOTE_WIDTH + MARGIN)));
	const gridY = Math.max(1, Math.floor((canvasHeight - NOTE_HEIGHT) / (NOTE_HEIGHT + MARGIN)));
	for (let row = 0; row < gridY; row++) for (let col = 0; col < gridX; col++) {
		const candidate = {
			x: MARGIN + col * (NOTE_WIDTH + MARGIN),
			y: MARGIN + row * (NOTE_HEIGHT + MARGIN)
		};
		if (!notes.some((note) => rectanglesOverlap(candidate, note))) return candidate;
	}
	const last = notes[notes.length - 1];
	return {
		x: (last?.x ?? 0) + NOTE_WIDTH + MARGIN,
		y: last?.y ?? MARGIN
	};
}
function StickyIcon(props = {}) {
	const size = props.size ?? 18;
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
		width: size,
		height: size,
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: "1.8",
		"aria-hidden": "true",
		children: [
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M6 4h9l5 5v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" }),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M15 4v5h5" }),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
				d: "M8 12h8M8 16h5",
				strokeLinecap: "round"
			})
		]
	});
}
function StickyWall() {
	const containerRef = (0, react.useRef)(null);
	const [notes, setNotes] = (0, react.useState)(() => loadNotes());
	const [dragging, setDragging] = (0, react.useState)(null);
	const [size, setSize] = (0, react.useState)({
		width: 3200,
		height: 2200
	});
	(0, react.useEffect)(() => {
		saveNotes(notes);
	}, [notes]);
	(0, react.useEffect)(() => {
		const style = document.createElement("style");
		style.dataset.plugin = "dsh-deep-sticky-wall";
		style.textContent = STYLES;
		document.head.appendChild(style);
		return () => {
			style.remove();
		};
	}, []);
	(0, react.useEffect)(() => {
		const recalc = () => {
			const maxX = Math.max(0, ...notes.map((note) => note.x + NOTE_WIDTH + MARGIN * 2));
			const maxY = Math.max(0, ...notes.map((note) => note.y + NOTE_HEIGHT + MARGIN * 2));
			setSize({
				width: Math.max(window.innerWidth, maxX),
				height: Math.max(window.innerHeight, maxY)
			});
		};
		recalc();
	}, [notes]);
	const addNote = () => {
		const spot = findEmptySpot(notes, size.width, size.height);
		const color = COLORS[Math.floor(Math.random() * COLORS.length)];
		setNotes((prev) => [...prev, {
			id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
			text: "",
			color,
			...spot
		}]);
	};
	const updateText = (id, text) => {
		setNotes((prev) => prev.map((n) => n.id === id ? {
			...n,
			text
		} : n));
	};
	const changeColor = (id, color) => {
		setNotes((prev) => prev.map((n) => n.id === id ? {
			...n,
			color
		} : n));
	};
	const removeNote = (id) => {
		setNotes((prev) => prev.filter((n) => n.id !== id));
	};
	const handlePointerDown = (e, note) => {
		const noteEl = e.currentTarget;
		const noteRect = noteEl.getBoundingClientRect();
		setDragging({
			id: note.id,
			offsetX: e.clientX - noteRect.left,
			offsetY: e.clientY - noteRect.top
		});
		noteEl.setPointerCapture?.(e.pointerId);
	};
	const handlePointerMove = (e) => {
		if (!dragging || !containerRef.current) return;
		const rect = containerRef.current.getBoundingClientRect();
		const x = e.clientX - rect.left - dragging.offsetX + containerRef.current.scrollLeft;
		const y = e.clientY - rect.top - dragging.offsetY + containerRef.current.scrollTop;
		setNotes((prev) => prev.map((n) => n.id === dragging.id ? {
			...n,
			x: clamp(x, 0, size.width - NOTE_WIDTH),
			y: clamp(y, 0, size.height - NOTE_HEIGHT)
		} : n));
	};
	const handlePointerUp = () => setDragging(null);
	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
		className: "dsnw-viewport",
		onPointerMove: handlePointerMove,
		onPointerUp: handlePointerUp,
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			ref: containerRef,
			className: "dsnw-wall",
			style: {
				width: size.width,
				height: size.height
			},
			children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "dsnw-toolbar",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: "dsnw-button",
						onClick: addNote,
						children: "Add note"
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
						style: {
							opacity: .7,
							fontSize: 12
						},
						children: [
							notes.length,
							" note",
							notes.length === 1 ? "" : "s"
						]
					})]
				}),
				notes.length === 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "dsnw-empty",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: "Sticky note wall" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: "Click “Add note” to capture an idea. Drag an empty spot to pan the canvas." })]
				}),
				notes.map((note) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "dsnw-note",
					onPointerDown: (e) => handlePointerDown(e, note),
					style: {
						left: note.x,
						top: note.y,
						background: note.color,
						width: NOTE_WIDTH,
						height: NOTE_HEIGHT
					},
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
						value: note.text,
						onChange: (e) => updateText(note.id, e.target.value),
						placeholder: "Type an idea…",
						onPointerDown: (e) => e.stopPropagation()
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dsn-actions",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "dsnw-colors",
							children: COLORS.map((color) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "dsnw-color-dot",
								style: { background: color },
								onClick: () => changeColor(note.id, color),
								onPointerDown: (e) => e.stopPropagation(),
								"aria-label": "Change color"
							}, color))
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: "dsn-delete",
							onClick: (e) => {
								e.stopPropagation();
								removeNote(note.id);
							},
							onPointerDown: (e) => e.stopPropagation(),
							children: "Delete"
						})]
					})]
				}, note.id))
			]
		})
	});
}

//#endregion
//#region src/client/index.ts
const PANEL_ID = "deep-sticky-wall";
const inject = ["slots"];
function apply(ctx) {
	ctx.slots.inject("sidebar.panellist", () => ctx.slots.register({
		name: "sidebar.panellist",
		id: PANEL_ID,
		order: 60,
		label: "Sticky Notes"
	}, StickyIcon));
	ctx.slots.inject("main", () => ctx.slots.register({
		name: "main",
		key: PANEL_ID
	}, StickyWall));
}

//#endregion
exports.PANEL_ID = PANEL_ID;
exports.apply = apply;
exports.inject = inject;
return module.exports; } });
//# sourceMappingURL=index.js.map