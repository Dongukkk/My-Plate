import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./chating-support.css";

const FAQ_PATH = "/faq";

export default function ChatingSupport() {
    const navigate = useNavigate();
    const scrollAreaRef = useRef(null);
    const inputRef = useRef(null);

    const [draft, setDraft] = useState("");
    const [typing, setTyping] = useState(false);
    const [messages, setMessages] = useState(() => [
        {
            id: "hello-1",
            side: "bot",
            text:
                "안녕하세요! My Plate 채팅상담입니다.\n무엇을 도와드릴까요? 아래 빠른 질문으로 시작해도 좋아요.",
            time: ts(),
        },
    ]);

    // 상담 가능 여부(평일 9:30~17:00, 12:00~14:00 제외)
    const isOpen = useOfficeOpen();

    useEffect(() => {
        const el = scrollAreaRef.current;
        if (!el) return;
        el.scrollTop = el.scrollHeight;
    }, [messages, typing]);

    const sendMessage = (text) => {
        const content = String(text ?? draft).trim();
        if (!content) return;

        const myMsg = {
            id: `me-${Date.now()}`,
            side: "me",
            text: content,
            time: ts(),
            status: "sent",
        };
        setMessages((prev) => [...prev, myMsg]);
        setDraft("");
        setTyping(true);

        // 데모용 가짜 답변
        const reply = makeDemoReply(content, isOpen);
        window.setTimeout(() => {
            setMessages((prev) => [
                ...prev,
                { id: `bot-${Date.now()}`, side: "bot", text: reply, time: ts() },
            ]);
            setTyping(false);
        }, 900 + Math.random() * 700);
    };

    const onKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const onPickFile = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setMessages((prev) => [
            ...prev,
            {
                id: `me-file-${Date.now()}`,
                side: "me",
                text: `파일 전송(데모): ${file.name}`,
                time: ts(),
            },
        ]);
    };

    const quick = [
        "주문/결제 문의",
        "가맹점/이용 안내",
        "아동급식카드 관련",
        "계정/보안 도움",
        "기타 문의",
    ];

    return (
        <main className="chating-wrap">
            <section className="chating-panel" aria-label="채팅 상담">
                {/* 상단바 */}
                <header className="chating-topbar">
                    <button
                        className="chating-back"
                        onClick={() => navigate(-1)}
                        aria-label="이전 페이지로"
                    >
                        ←
                    </button>

                    <div className="chating-agent">
                        <div className="chating-avatar" aria-hidden="true">MP</div>
                        <div className="chating-meta">
                            <h1 className="chating-title">실시간 채팅 상담</h1>
                            <div className="chating-status">
                                <span
                                    className={`chating-dot ${isOpen ? "is-open" : "is-closed"}`}
                                    aria-hidden="true"
                                />
                                {isOpen
                                    ? "지금 상담 가능해요 (평일 9:30-17:00, 12:00-14:00 제외)"
                                    : "지금은 상담 시간이 아닙니다. 남겨주시면 순차 답변 드려요."}
                            </div>
                        </div>
                    </div>

                    {/* FAQ 버튼: 페이지 이동 */}
                    <button
                        className="chating-helpbtn"
                        onClick={() => navigate(FAQ_PATH)}
                        aria-label="FAQ로 이동"
                    >
                        FAQ
                    </button>
                </header>

                {/* 메시지 영역 */}
                <div className="chating-body" ref={scrollAreaRef}>
                    <ul className="chating-msgs">
                        {messages.map((m) => (
                            <li
                                key={m.id}
                                className={`chating-msg ${m.side === "me" ? "chating-me" : "chating-bot"}`}
                            >
                                {m.side === "bot" && (
                                    <div className="chating-msg-av" aria-hidden="true"><span>MP</span></div>
                                )}
                                <div className="chating-bubble">
                                    {m.text.split("\n").map((line, i) => (
                                        <p key={i} className="chating-line">{line}</p>
                                    ))}
                                </div>
                                <time className="chating-time">{m.time}</time>
                            </li>
                        ))}

                        {typing && (
                            <li className="chating-msg chating-bot">
                                <div className="chating-msg-av" aria-hidden="true"><span>MP</span></div>
                                <div className="chating-bubble chating-typing">
                                    <span className="chating-typing-dot" />
                                    <span className="chating-typing-dot" />
                                    <span className="chating-typing-dot" />
                                </div>
                            </li>
                        )}
                    </ul>
                </div>

                {/* 입력 바 */}
                <footer className="chating-inputbar">
                    <label className="chating-toolbtn" aria-label="파일 첨부">
                        📎
                        <input type="file" onChange={onPickFile} className="chating-fileinput" />
                    </label>

                    <button
                        className="chating-toolbtn"
                        aria-label="이모지 추가"
                        onClick={() => setDraft((d) => `${d}🙂`)}
                    >
                        🙂
                    </button>

                    <textarea
                        ref={inputRef}
                        className="chating-input"
                        placeholder="메시지를 입력하세요 (Enter 전송, Shift+Enter 줄바꿈)"
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        onKeyDown={onKeyDown}
                        rows={1}
                    />

                    <button className="chating-send" disabled={!draft.trim()} onClick={() => sendMessage()}>
                        전송
                    </button>
                </footer>

                {/* 빠른 질문 */}
                <div className="chating-quick" aria-label="빠른 질문">
                    {quick.map((q) => (
                        <button key={q} className="chating-chip" onClick={() => sendMessage(q)}>
                            {q}
                        </button>
                    ))}
                </div>
            </section>
        </main>
    );
}

/* ===== utils ===== */
function ts(d = new Date()) {
    const hh = `${d.getHours()}`.padStart(2, "0");
    const mm = `${d.getMinutes()}`.padStart(2, "0");
    return `${hh}:${mm}`;
}

function useOfficeOpen() {
    // 로컬 시간 기준: 평일 9:30~17:00, 점심 12:00~14:00 제외
    return useMemo(() => {
        const now = new Date();
        const day = now.getDay(); // 0=일, 6=토
        if (day === 0 || day === 6) return false;
        const minutes = now.getHours() * 60 + now.getMinutes();
        const start = 9 * 60 + 30; // 9:30
        const lunchS = 12 * 60; // 12:00
        const lunchE = 14 * 60; // 14:00
        const end = 17 * 60; // 17:00
        const inWork = minutes >= start && minutes < end;
        const inLunch = minutes >= lunchS && minutes < lunchE;
        return inWork && !inLunch;
    }, []);
}

function makeDemoReply(text, open) {
    const t = text.toLowerCase();
    if (t.includes("결제") || t.includes("주문")) {
        return "결제 관련 문의 확인했습니다. 주문번호가 있다면 함께 보내주세요. 담당자가 순차적으로 도와드릴게요.";
    }
    if (t.includes("가맹") || t.includes("이용")) {
        return "가맹점/이용 안내입니다. 지역명 또는 매장명을 알려주시면 확인해드릴게요.";
    }
    if (t.includes("급식카드")) {
        return "아동급식카드 문의 접수되었습니다. 카드사/지자체별로 절차가 달라 안내드릴게요. 현재 보유하신 카드/지역을 알려주세요.";
    }
    if (t.includes("계정") || t.includes("보안") || t.includes("비밀번호")) {
        return "계정/보안 관련 요청이네요. 가입 이메일 또는 휴대폰 끝 4자리를 알려주시면 본인 확인 뒤 안내드리겠습니다.";
    }
    return open
        ? "문의 접수되었습니다. 조금만 기다려주세요! 담당자가 곧 답변 드립니다."
        : "현재 운영시간이 아니어서 답변이 지연될 수 있어요. 메시지를 남겨주시면 운영시간에 순차적으로 도와드릴게요.";
}
