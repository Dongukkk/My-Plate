import { createContext, useCallback, useContext, useMemo, useState } from "react";
import PrettyAlert from "../admin/pretty-alert";

const AlertCtx = createContext(null);

export function AlertProvider({ children }) {
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [autoCloseTimer, setAutoCloseTimer] = useState(null);

    const close = useCallback(() => {
        setOpen(false);
        setMessage("");
        if (autoCloseTimer) {
            clearTimeout(autoCloseTimer);
            setAutoCloseTimer(null);
        }
    }, [autoCloseTimer]);

    const alert = useCallback((msg, opts = {}) => {
        setMessage(String(msg ?? ""));
        setOpen(true);
        if (autoCloseTimer) clearTimeout(autoCloseTimer);
        if (opts.autoCloseMs) {
            const t = setTimeout(() => close(), opts.autoCloseMs);
            setAutoCloseTimer(t);
        }
    }, [autoCloseTimer, close]);

    const api = useMemo(() => ({ alert, close }), [alert, close]);

    return (
        <AlertCtx.Provider value={api}>
            {children}
            <PrettyAlert open={open} message={message} onClose={close} />
        </AlertCtx.Provider>
    );
}

export function useAlert() {
    const ctx = useContext(AlertCtx);
    if (!ctx) {
        return {
            alert: (m) => window.alert(m),
            close: () => { },
        };
    }
    return ctx;
}
