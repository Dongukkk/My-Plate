import { useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import "./review-report.css";

export default function ReviewReportModal({
    open = false,
    reviewId,
    reviewText = "",
    onClose,
    onReported,
}) {
    const user = useSelector((s) => s.user);
    const [reason, setReason] = useState("욕설/비하");
    const [memo, setMemo] = useState("");
    const [loading, setLoading] = useState(false);

    if (!open) return null;

    const submit = async () => {
        if (!user || !user.id) { alert("로그인이 필요합니다."); return; }
        if (!reviewId) { alert("신고 대상이 없습니다."); return; }

        const payload = {
            reporterId: user.id,
            reportedItemId: reviewId,
            reason,
            memo,
            excerpt: String(reviewText || "").slice(0, 180),
            status: "PENDING",
        };

        try {
            setLoading(true);
            const access = localStorage.getItem("access");
            await axios.post(`/api/reports/ipc`, payload, {
                headers: access ? { Authorization: `Bearer ${access}` } : {},
            });
            alert("신고가 접수되었습니다.");
            onReported && onReported(reviewId);
            onClose && onClose();
        } catch (e) {
            console.error(e);
            alert("신고 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    const closeByDim = (e) => {
        if (e.target.classList.contains("report-dim")) onClose && onClose();
    };

    return (
        <div className="report-dim is-open" role="dialog" aria-modal="true" onMouseDown={closeByDim}>
            <div className="report-modal" onMouseDown={(e) => e.stopPropagation()}>
                <div className="report-head">
                    <h3>리뷰 신고</h3>
                    <button className="report-close" aria-label="닫기" onClick={onClose}>×</button>
                </div>

                <div className="report-body">
                    <div className="report-row">
                        <label>대상 요약</label>
                        <div className="report-text">{reviewText ? reviewText.slice(0, 180) : "(내용 없음)"}</div>
                    </div>

                    <div className="report-row">
                        <label>사유</label>
                        <select className="report-select" value={reason} onChange={(e) => setReason(e.target.value)}>
                            {["욕설/비하", "개인정보 노출", "음란/선정적", "광고/스팸", "허위 사실", "기타"].map(r => (
                                <option key={r} value={r}>{r}</option>
                            ))}
                        </select>
                    </div>

                    <div className="report-row">
                        <label>상세 설명</label>
                        <div>
                            <textarea
                                className="report-textarea"
                                placeholder="문제된 부분을 구체적으로 적어주세요."
                                value={memo}
                                onChange={(e) => setMemo(e.target.value)}
                            />
                            <div className="report-help">관리자가 확인 후 조치합니다.</div>
                        </div>
                    </div>
                </div>

                <div className="report-foot">
                    <button className="report-btn cancel" onClick={onClose}>취소</button>
                    <button className="report-btn primary" disabled={loading} onClick={submit}>
                        {loading ? "전송 중…" : "신고하기"}
                    </button>
                </div>
            </div>
        </div>
    );
}
