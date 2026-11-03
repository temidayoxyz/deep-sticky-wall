export const STYLES = `
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
`
