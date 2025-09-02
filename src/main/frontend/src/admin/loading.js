import { useEffect, useRef, useState } from "react";
import "./loading.css";

export default function LoadingCenter({
    show = true,
    message = "로딩 중…",
    delay = 120,
    minVisible = 300,
    transparent = false,
}) {
    const [visible, setVisible] = useState(false);
    const shownAt = useRef(0);
    const showT = useRef(null);
    const hideT = useRef(null);

    useEffect(() => {
        clearTimeout(showT.current);
        clearTimeout(hideT.current);

        if (show) {
            showT.current = setTimeout(() => {
                shownAt.current = Date.now();
                setVisible(true);
            }, delay);
        } else {
            const remain = Math.max(0, minVisible - (Date.now() - shownAt.current));
            hideT.current = setTimeout(() => setVisible(false), remain);
        }

        return () => {
            clearTimeout(showT.current);
            clearTimeout(hideT.current);
        };
    }, [show, delay, minVisible]);

    if (!visible) return null;

    return (
        <div
            className={`load-center ${transparent ? 'transparent-bg' : ''}`}
            role="status"
            aria-busy="true"
            aria-live="polite"
        >
            <div className="load-spinner" />
            <div className="load-center-text">{message}</div>
            <span className="load-sr-only">콘텐츠를 불러오는 중입니다</span>
        </div>
    );
}
