import { createContext, useCallback, useContext, useMemo, useRef, useState, useEffect } from "react";
import PrettyAlert from "../admin/pretty-alert";

const AlertCtx = createContext(null);

export function AlertProvider({ children }) {
    // ---- Alert ----
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState("");
    const autoCloseTimerRef = useRef(null);

    const close = useCallback(() => {
        setOpen(false);
        setMessage("");
        if (autoCloseTimerRef.current) {
            clearTimeout(autoCloseTimerRef.current);
            autoCloseTimerRef.current = null;
        }
    }, []);

    const alert = useCallback(
        (msg, opts = {}) => {
            setMessage(String(msg ?? ""));
            setOpen(true);
            if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
            if (opts.autoCloseMs) autoCloseTimerRef.current = setTimeout(close, opts.autoCloseMs);
        },
        [close]
    );

    // ---- Confirm ----
    const [confirmOpen, setConfirmOpen] = useState(false);
    const confirmResolveRef = useRef(null);
    const [confirmOpts, setConfirmOpts] = useState({
        title: "확인",
        message: "",
        okText: "확인",
        cancelText: "취소",
        danger: false,
    });

    const confirm = useCallback((opts = {}) => {
        return new Promise((resolve) => {
            setConfirmOpts({
                title: opts.title || "확인",
                message: String(opts.message ?? ""),
                okText: opts.okText || "확인",
                cancelText: opts.cancelText || "취소",
                danger: !!opts.danger,
            });
            confirmResolveRef.current = resolve;
            setConfirmOpen(true);
        });
    }, []);

    const handleConfirmClose = useCallback((result) => {
        setConfirmOpen(false);
        const resolve = confirmResolveRef.current;
        confirmResolveRef.current = null;
        if (resolve) resolve(result);
    }, []);

    useEffect(() => {
        if (!confirmOpen) return;
        const onKey = (e) => {
            if (e.key === "Escape") handleConfirmClose(false);
            if (e.key === "Enter") handleConfirmClose(true);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [confirmOpen, handleConfirmClose]);

    const api = useMemo(() => ({ alert, close, confirm }), [alert, close, confirm]);

    const ConfirmModal = () =>
        !confirmOpen ? null : (
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="confirm-title"
                onClick={() => handleConfirmClose(false)}
                style={{
                    position: "fixed",
                    inset: 0,
                    background: "rgba(0,0,0,0.35)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 10000,
                }}
            >
                <div
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        width: "min(440px, 92vw)",
                        background: "#fff",
                        borderRadius: 12,
                        boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                        padding: 18,
                    }}
                >
                    <h3 id="confirm-title" style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>
                        {confirmOpts.title}
                    </h3>
                    <div style={{ marginTop: 10, whiteSpace: "pre-line", lineHeight: 1.5, color: "#333" }}>
                        {confirmOpts.message}
                    </div>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
                        <button
                            type="button"
                            onClick={() => handleConfirmClose(false)}
                            style={{
                                padding: "8px 12px",
                                borderRadius: 8,
                                border: "1px solid #d1d5db",
                                background: "#fff",
                                cursor: "pointer",
                            }}
                        >
                            {confirmOpts.cancelText}
                        </button>
                        <button
                            type="button"
                            autoFocus
                            onClick={() => handleConfirmClose(true)}
                            style={{
                                padding: "8px 12px",
                                borderRadius: 8,
                                border: "1px solid transparent",
                                background: confirmOpts.danger ? "#ef4444" : "#2563eb",
                                color: "#fff",
                                cursor: "pointer",
                            }}
                        >
                            {confirmOpts.okText}
                        </button>
                    </div>
                </div>
            </div>
        );

    return (
        <AlertCtx.Provider value={api}>
            {children}
            <PrettyAlert open={open} message={message} onClose={close} />
            <ConfirmModal />
        </AlertCtx.Provider>
    );
}

export function useAlert() {
    const ctx = useContext(AlertCtx);
    if (!ctx) {
        return {
            alert: (m) => window.alert(String(m ?? "")),
            close: () => { },
            confirm: async ({ message } = {}) => window.confirm(String(message ?? "")),
        };
    }
    // confirm도 함께 반환 (기존 코드와 호환)
    return ctx;
}

export function useConfirm() {
    const ctx = useContext(AlertCtx);
    if (!ctx) {
        return { confirm: async ({ message } = {}) => window.confirm(String(message ?? "")) };
    }
    return { confirm: ctx.confirm };
}
