window.__ModuleLoader__.load({ id: "dsh-deep-sticky-wall", factory: (require) => {
var module = { exports: {} }; var exports = module.exports;
let react = require("react");
let react_jsx_runtime = require("react/jsx-runtime");

//#region src/client/styles.ts
const STYLES = `
.dsnw-wall {
  position: relative;
  width: 100%;
  min-height: 100%;
  overflow: hidden;
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
  z-index: 20;
  display: flex;
  gap: 8px;
  align-items: center;
}
.dsnw-button {
  border: 0;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 13px;
  cursor: pointer;
  background: rgba(255,255,255,0.12);
  color: #fff;
  backdrop-filter: blur(6px);
}
.dsnw-button:hover { background: rgba(255,255,255,0.2); }
.dsnw-note {
  position: absolute;
  width: 220px;
  min-height: 120px;
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
.dsnw-note .dsn-delete { cursor: pointer; border: 0; background: rgba(0,0,0,0.12); border-radius: 6px; padding: 2px 8px; }
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
function StickyIcon() {
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
		width: "18",
		height: "18",
		viewBox: "0 0 24 24",
		"aria-hidden": "true",
		children: [
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
				x: "4",
				y: "3",
				width: "16",
				height: "18",
				rx: "2",
				fill: "#fde68a"
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
				x: "4",
				y: "3",
				width: "16",
				height: "4",
				rx: "2",
				fill: "#f59e0b"
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("line", {
				x1: "7",
				y1: "10",
				x2: "17",
				y2: "10",
				stroke: "#92400e",
				strokeWidth: "1.2"
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("line", {
				x1: "7",
				y1: "13",
				x2: "15",
				y2: "13",
				stroke: "#92400e",
				strokeWidth: "1.2"
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("line", {
				x1: "7",
				y1: "16",
				x2: "13",
				y2: "16",
				stroke: "#92400e",
				strokeWidth: "1.2"
			})
		]
	});
}
function StickyWall() {
	const containerRef = (0, react.useRef)(null);
	const [notes, setNotes] = (0, react.useState)(() => loadNotes());
	const [dragging, setDragging] = (0, react.useState)(null);
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
	const addNote = () => {
		const id = `note-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
		const color = COLORS[Math.floor(Math.random() * COLORS.length)];
		setNotes((prev) => [...prev, {
			id,
			text: "",
			x: 42,
			y: 38,
			color
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
		const noteRect = e.currentTarget.getBoundingClientRect();
		setDragging({
			id: note.id,
			offsetX: e.clientX - noteRect.left,
			offsetY: e.clientY - noteRect.top
		});
		e.currentTarget.setPointerCapture?.(e.pointerId);
	};
	const handlePointerMove = (e) => {
		if (!dragging || !containerRef.current) return;
		const rect = containerRef.current.getBoundingClientRect();
		const x = (e.clientX - rect.left - dragging.offsetX) / rect.width * 100;
		const y = (e.clientY - rect.top - dragging.offsetY) / rect.height * 100;
		setNotes((prev) => prev.map((n) => n.id === dragging.id ? {
			...n,
			x: clamp(x, 0, 85),
			y: clamp(y, 0, 85)
		} : n));
	};
	const handlePointerUp = () => setDragging(null);
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
		ref: containerRef,
		className: "dsnw-wall",
		onPointerMove: handlePointerMove,
		onPointerUp: handlePointerUp,
		style: { minHeight: "70vh" },
		children: [
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dsnw-toolbar",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
					className: "dsnw-button",
					onClick: addNote,
					children: "+ Add note"
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
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: "Sticky note wall" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: "Capture ideas anytime. Click “Add note” to start." })]
			}),
			notes.map((note) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dsnw-note",
				onPointerDown: (e) => handlePointerDown(e, note),
				style: {
					left: `${note.x}%`,
					top: `${note.y}%`,
					background: note.color
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
							className: "dsnw-color-dot",
							style: { background: color },
							onClick: () => changeColor(note.id, color),
							"aria-label": "Change color",
							onPointerDown: (e) => e.stopPropagation()
						}, color))
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						className: "dsn-delete",
						onClick: () => removeNote(note.id),
						children: "×"
					})]
				})]
			}, note.id))
		]
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