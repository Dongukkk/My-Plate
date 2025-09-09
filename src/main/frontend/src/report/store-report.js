import { useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import "./review-report.css"; // 동일 스타일 재사용

export default function StoreEditReportModal({
    open = false,
    restaurantId,
    currentInfo = {}, // { name, phone, address, hours, website, category }
    onClose,
    onReported,
}) {
    const user = useSelector((s) => s.user);
    const [fields, setFields] = useState({
        name: currentInfo.name || "",
        phone: currentInfo.phone || "",
        address: currentInfo.address || "",
        hours: currentInfo.hours || "",
        website: currentInfo.website || "",
        category: currentInfo.category || "",
        memo: "",
    });
    const [loading, setLoading] = useState(false);
    if (!open) return null;

    const set = (k, v) => setFields((s) => ({ ...s, [k]: v }));

    const buildDiff = () => {
        const keys = ["name", "phone", "address", "hours", "website", "category"];
        const diff = {};
        keys.forEach((k) => {
            const before = (currentInfo[k] ?? "").trim();
            const after = (fields[k] ?? "").trim();
            if (after && after !== before) diff[k] = { before, after };
        });
        return diff;
    };

    const submit = async () => {
        if (!user || !user.id) { alert("로그인이 필요합니다."); return; }
        if (!restaurantId) { alert("가게 ID가 없습니다."); return; }

        const diff = buildDiff();
        if (Object.keys(diff).length === 0 && !fields.memo.trim()) {
            alert("변경할 내용이나 메모를 입력해주세요.");
            return;
        }

        // 요약(180자 이내) + 상세(JSON)로 구성
        const summary = Object.keys(diff)
            .map(k => `${k}:${(diff[k].before || '-')}→${diff[k].after}`)
            .join(" | ")
            .slice(0, 180);

        const payload = {
            reporterId: user.id,
            reportedItemId: restaurantId,          // ✅ 가게 ID
            reason: "정보 수정 요청",
            memo: `${fields.memo || ""}\n[CHANGES] ${JSON.stringify(diff)}`,
            excerpt: summary,                       // 관리자 목록에서 한 눈에 보이게
            status: "PENDING",
        };

        try {
            setLoading(true);
            const access = localStorage.getItem("access");
            await axios.post("/api/reports/rer", payload, {
                headers: access ? { Authorization: `Bearer ${access}` } : {},
            });
            alert("제보가 접수되었습니다.");
            onReported && onReported();
            onClose && onClose();
        } catch (e) {
            console.error(e);
            alert(e?.response?.data || "제보 중 오류가 발생했습니다.");
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
                    <h3>가게 정보 제보</h3>
                    <button className="report-close" aria-label="닫기" onClick={onClose}>×</button>
                </div>

                <div className="report-body">
                    {[
                        ["name", "가게명"], ["phone", "전화번호"], ["address", "주소"],
                        ["hours", "영업시간"], ["website", "웹사이트"], ["category", "카테고리"],
                    ].map(([k, label]) => (
                        <div className="report-row" key={k}>
                            <label>{label}</label>
                            <input className="report-input"
                                value={fields[k] || ""}
                                onChange={(e) => set(k, e.target.value)}
                                placeholder={currentInfo[k] || ""} />
                        </div>
                    ))}

                    <div className="report-row">
                        <label>추가 메모</label>
                        <div>
                            <textarea
                                className="report-textarea"
                                value={fields.memo}
                                onChange={(e) => set("memo", e.target.value)}
                                placeholder="증빙(사진/링크)나 상세 설명을 적어주세요."
                            />
                            <div className="report-help">변경 전/후를 비교해 저장합니다.</div>
                        </div>
                    </div>
                </div>

                <div className="report-foot">
                    <button className="report-btn cancel" onClick={onClose}>취소</button>
                    <button className="report-btn primary" disabled={loading} onClick={submit}>
                        {loading ? "전송 중…" : "제보하기"}
                    </button>
                </div>
            </div>
        </div>
    );
}
