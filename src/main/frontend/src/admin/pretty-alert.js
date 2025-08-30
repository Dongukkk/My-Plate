import { useEffect } from "react";
import "./pretty-alert.css";

export default function PrettyAlert({
    open, message, onClose,
}) {
    useEffect(() => {
        if (!open) return;
        const onKeyDown = (e) => {if (e.key === "Escape") onClose?.();};
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [open, onClose]);

    if (!open) return null;

    const onBackdropClick = (e) => { if (e.target === e.currentTarget) onClose?.(); };

    return (
        <div className="pa-overlay" role="dialog" aria-modal="true" aria-labelledby="pa-title" aria-describedby="pa-desc" onClick={onBackdropClick}>
            <div className="pa-card" role="document">
                <p className="pa-message" id="pa-desc">{message}</p>
                <div className="pa-actions"><button className="pa-btn" autoFocus onClick={onClose}>확인</button></div>
            </div>
        </div>
    );
}
