"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { type LiveGameState } from "@/app/api/minigame-20-10/live/route";

const POLL_INTERVAL = 800; // ms

export default function MobileMCPage() {
  const [liveState, setLiveState] = useState<LiveGameState | null>(null);
  const [connected, setConnected] = useState<boolean>(false);
  const [lastSync, setLastSync] = useState<number>(0);
  const [sendingCmd, setSendingCmd] = useState<string | null>(null);
  const [wakeLockActive, setWakeLockActive] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [allBoxes, setAllBoxes] = useState<Array<{ id: string; num: number; title: string; prompt?: string; answer?: string; type: string }>>([]);
  const [tab, setTab] = useState<"live" | "cheatSheet" | "rules">("live");

  const lastBoxIdRef = useRef<string | null>(null);

  // Giữ màn hình điện thoại luôn sáng khi MC dẫn chương trình (Wake Lock API)
  useEffect(() => {
    let wakeLock: any = null;
    const requestWakeLock = async () => {
      try {
        if ("wakeLock" in navigator && (navigator as any).wakeLock) {
          wakeLock = await (navigator as any).wakeLock.request("screen");
          setWakeLockActive(true);
        }
      } catch (e) {
        console.warn("WakeLock not supported or denied", e);
      }
    };
    requestWakeLock();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        requestWakeLock();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (wakeLock) {
        wakeLock.release().catch(() => {});
      }
    };
  }, []);

  // Tải danh sách 100 câu hỏi từ server để MC có thể tra cứu nhanh
  useEffect(() => {
    async function loadBoxes() {
      try {
        const res = await fetch("/api/minigame-20-10/config", { cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
          if (json?.data?.boxes) {
            setAllBoxes(
              json.data.boxes.map((b: any, idx: number) => ({
                id: b.id || `box_${idx}`,
                num: idx + 1,
                title: b.title || `Túi #${idx + 1}`,
                prompt: b.prompt || "",
                answer: b.answer || "",
                type: b.type || "quiz",
              }))
            );
          }
        }
      } catch (err) {
        console.warn("Could not load boxes cheat sheet", err);
      }
    }
    loadBoxes();
  }, []);

  // Polling realtime state từ máy chiếu
  const poll = useCallback(async () => {
    try {
      const res = await fetch("/api/minigame-20-10/live", {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.state) {
          const s: LiveGameState = data.state;
          setLiveState(s);
          setConnected(true);
          setLastSync(Date.now());

          // Rung điện thoại khi máy chiếu vừa bốc một túi mới
          if (s.curBox && s.curBox.id !== lastBoxIdRef.current) {
            lastBoxIdRef.current = s.curBox.id;
            try {
              if (navigator.vibrate) {
                navigator.vibrate([150, 80, 150]);
              }
            } catch {}
          } else if (!s.curBox) {
            lastBoxIdRef.current = null;
          }
        }
      } else {
        setConnected(false);
      }
    } catch {
      setConnected(false);
    }
  }, []);

  useEffect(() => {
    poll();
    const interval = setInterval(poll, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [poll]);

  // Gửi lệnh điều khiển từ xa đến máy chiếu
  const sendCommand = async (cmd: string) => {
    setSendingCmd(cmd);
    try {
      if (navigator.vibrate) {
        navigator.vibrate(60);
      }
    } catch {}

    try {
      await fetch("/api/minigame-20-10/live", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: cmd }),
      });
      // Poll ngay để cập nhật nhanh
      setTimeout(poll, 200);
    } catch (err) {
      alert("Lỗi kết nối khi gửi lệnh đến máy chiếu.");
    } finally {
      setTimeout(() => setSendingCmd(null), 600);
    }
  };

  const curBox = liveState?.curBox;
  const curIdx = liveState?.curIdx;
  const currentPlayer = liveState?.currentPlayer;
  const answerShown = liveState?.answerShown;
  const timeLeft = liveState?.timeLeft;
  const expired = liveState?.expired;

  // Filter boxes cho tab tra cứu
  const filteredBoxes = allBoxes.filter((b) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      b.num.toString() === q ||
      b.title.toLowerCase().includes(q) ||
      b.prompt?.toLowerCase().includes(q) ||
      b.answer?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="mc-root">
      {/* Top Header */}
      <header className="mc-header">
        <div className="mc-header-left">
          <div className="mc-badge-live">
            <span className={`mc-dot ${connected ? "is-online" : "is-offline"}`} />
            {connected ? "LIVE MÁY CHIẾU" : "MẤT KẾT NỐI"}
          </div>
          <h1 className="mc-brand">🎙️ MC 12A6 TELEPROMPTER</h1>
        </div>

        <div className="mc-header-right">
          {wakeLockActive && <span className="mc-wake-pill" title="Màn hình luôn sáng">💡 Luôn sáng</span>}
          <button className="mc-refresh-btn" onClick={poll} aria-label="Làm mới">
            ↻
          </button>
        </div>
      </header>

      {/* Tabs */}
      <nav className="mc-nav-tabs">
        <button
          className={`mc-tab ${tab === "live" ? "is-active" : ""}`}
          onClick={() => setTab("live")}
        >
          🔴 Trực Tiếp {curBox ? "(Đang Có)" : ""}
        </button>
        <button
          className={`mc-tab ${tab === "cheatSheet" ? "is-active" : ""}`}
          onClick={() => setTab("cheatSheet")}
        >
          📖 Sổ Tay ({allBoxes.length})
        </button>
        <button
          className={`mc-tab ${tab === "rules" ? "is-active" : ""}`}
          onClick={() => setTab("rules")}
        >
          📜 Luật Chơi (4 Tổ)
        </button>
      </nav>

      {/* TAB 1: LIVE TELEPROMPTER */}
      {tab === "live" && (
        <main className="mc-content">
          {curBox ? (
            <div className="mc-live-card">
              {/* Bag Info & Timer Header */}
              <div className="mc-card-meta">
                <div className="mc-bag-badge">
                  TÚI MÙ SỐ #{curIdx !== null && curIdx !== undefined ? curIdx + 1 : "?"}
                </div>
                <div className={`mc-type-badge is-${curBox.type}`}>
                  {curBox.type === "quiz" && "🧠 Câu Đố Suy Luận"}
                  {curBox.type === "dare" && "⚡ Thử Thách Vui"}
                  {curBox.type === "gift" && "🎁 Hộp Quà May Mắn"}
                  {curBox.type === "special" && "⭐ Bí Ẩn Đặc Biệt"}
                  {curBox.type === "truth" && "💬 Tâm Sự Thật Lòng"}
                </div>
              </div>

              {/* Current Player Banner */}
              {currentPlayer && (
                <div className="mc-player-banner">
                  <span className="mc-player-label">🎯 Người chơi trên bục:</span>
                  <span className="mc-player-name">{currentPlayer}</span>
                </div>
              )}

              {/* Countdown Status */}
              <div className="mc-timer-strip">
                {expired ? (
                  <span className="mc-time-text is-expired">⏰ HẾT THỜI GIAN!</span>
                ) : timeLeft !== null && timeLeft !== undefined ? (
                  <span className="mc-time-text">
                    ⏳ Thời gian còn: <b>{timeLeft}s</b>
                  </span>
                ) : (
                  <span className="mc-time-text is-free">✨ Không tính giờ</span>
                )}
                <span className={`mc-screen-status ${answerShown ? "is-revealed" : "is-hidden"}`}>
                  {answerShown ? "🖥️ Máy chiếu: ĐÃ HIỆN ĐÁP ÁN" : "🖥️ Máy chiếu: ĐANG ẨN"}
                </span>
              </div>

              {/* Question / Challenge Details */}
              <div className="mc-section">
                <div className="mc-section-label">❓ CÂU HỎI TRÊN MÁY CHIẾU:</div>
                <h2 className="mc-question-title">{curBox.title}</h2>
                {curBox.prompt && (
                  <p className="mc-question-prompt">{curBox.prompt}</p>
                )}
              </div>

              {/* SECRET ANSWER IN ADVANCE (CHEAT SHEET FOR MC) */}
              <div className="mc-answer-box">
                <div className="mc-answer-tag">
                  💡 ĐÁP ÁN BÍ MẬT DÀNH CHO MC (NHÌN TRƯỚC)
                </div>
                <div className="mc-answer-text">
                  {curBox.answer || "(Câu này là hành động hoặc quà tặng, không có đáp án chữ cụ thể)"}
                </div>
                <div className="mc-mc-tips">
                  <b>Lời khuyên cho MC:</b>
                  {curBox.type === "dare" ? (
                    <span> Nhắc bạn tập trung thực hiện và hô hào cả lớp đếm hoặc vỗ tay cổ vũ!</span>
                  ) : curBox.type === "gift" ? (
                    <span> Tạo không khí hồi hộp, chúc mừng bạn và trao quà ngay trên bục!</span>
                  ) : (
                    <span> Cho bạn 10 giây suy nghĩ, nếu bạn lúng túng có thể gợi ý chữ cái đầu tiên.</span>
                  )}
                </div>
              </div>

              {/* REMOTE CONTROL BUTTONS */}
              <div className="mc-controls">
                <div className="mc-controls-label">🎮 ĐIỀU KHIỂN TỪ XA MÁY CHIẾU:</div>

                {!answerShown ? (
                  <button
                    className="mc-btn mc-btn-reveal"
                    onClick={() => sendCommand("reveal")}
                    disabled={sendingCmd === "reveal"}
                  >
                    {sendingCmd === "reveal" ? "Đang gửi..." : "🎯 BẤM HIỆN ĐÁP ÁN TRÊN MÁY CHIẾU"}
                  </button>
                ) : (
                  <div className="mc-done-hint">✓ Đáp án đã hiện trên màn hình lớn</div>
                )}

                <div className="mc-btn-row">
                  <button
                    className="mc-btn mc-btn-close"
                    onClick={() => sendCommand("close")}
                    disabled={sendingCmd === "close"}
                  >
                    {sendingCmd === "close" ? "..." : "➡️ Đóng Túi / Xong Lượt"}
                  </button>
                  <button
                    className="mc-btn mc-btn-wheel"
                    onClick={() => sendCommand("spin_wheel")}
                    disabled={sendingCmd === "spin_wheel"}
                  >
                    {sendingCmd === "spin_wheel" ? "..." : "🎡 Vòng Quay"}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Standby State when no box is open */
            <div className="mc-standby">
              <div className="mc-standby-icon">🎡</div>
              <h2 className="mc-standby-title">Máy Chiếu Đang Chờ Bốc Túi Mù</h2>
              <p className="mc-standby-sub">
                Ngay khi máy chiếu bốc trúng túi nào, câu hỏi và <b>đáp án bí mật</b> sẽ lập tức hiện tại đây!
              </p>

              {currentPlayer ? (
                <div className="mc-standby-player">
                  <div className="mc-standby-player-label">🎯 NGƯỜI CHƠI TRÊN BỤC:</div>
                  <div className="mc-standby-player-name">{currentPlayer}</div>
                </div>
              ) : (
                <div className="mc-standby-no-player">
                  Chưa chọn người chơi. Bạn có thể mở vòng quay trên máy chiếu:
                </div>
              )}

              <button
                className="mc-btn mc-btn-wheel mc-btn-large"
                onClick={() => sendCommand("spin_wheel")}
                disabled={sendingCmd === "spin_wheel"}
              >
                {sendingCmd === "spin_wheel" ? "Đang gửi..." : "🎡 MỞ VÒNG QUAY CHỌN NGƯỜI"}
              </button>

              <div className="mc-quick-tips">
                <h3>💡 Mẹo dẫn chương trình của MC:</h3>
                <ul>
                  <li>Giữ không khí hào hứng, kích thích sự tò mò của cả lớp.</li>
                  <li>Nếu bạn trả lời sai, hãy cho cơ hội một bạn nữ khác trong lớp cứu bồ!</li>
                  <li>Điện thoại sẽ rung nhẹ khi có túi mới được xé trên máy chiếu.</li>
                </ul>
              </div>
            </div>
          )}
        </main>
      )}

      {/* TAB 2: CHEAT SHEET 100 CÂU */}
      {tab === "cheatSheet" && (
        <div className="mc-cheatsheet">
          <div className="mc-search-bar">
            <input
              type="text"
              placeholder="🔍 Tìm số túi (#1..#100) hoặc nội dung..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mc-search-input"
            />
            {searchQuery && (
              <button className="mc-search-clear" onClick={() => setSearchQuery("")}>
                ✕
              </button>
            )}
          </div>

          <div className="mc-cheatsheet-list">
            {filteredBoxes.map((b) => (
              <div key={b.id} className="mc-cheat-item">
                <div className="mc-cheat-head">
                  <span className="mc-cheat-num">#{b.num}</span>
                  <span className={`mc-cheat-type is-${b.type}`}>{b.type}</span>
                  <strong className="mc-cheat-title">{b.title}</strong>
                </div>
                {b.prompt && <p className="mc-cheat-prompt">{b.prompt}</p>}
                <div className="mc-cheat-ans">
                  <b>Đáp án:</b> {b.answer || "Không có (Hành động/Quà)"}
                </div>
              </div>
            ))}
            {filteredBoxes.length === 0 && (
              <div className="mc-cheat-empty">Không tìm thấy túi nào khớp với từ khóa.</div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: LUẬT CHƠI 4 TỔ */}
      {tab === "rules" && (
        <div className="mc-rules-tab">
          <div className="mc-rules-card">
            <div className="mc-rules-tag">📜 HỘP QUÀ BÍ ẨN 12A6</div>
            <h2 className="mc-rules-title">QUY TẮC & LUẬT CHƠI</h2>
            <p className="mc-rules-sub">MC đọc và phổ biến điều lệ này trước khi cả lớp bắt đầu thi đấu.</p>

            <div className="mc-rules-item">
              <div className="mc-rules-item-icon">👥</div>
              <div className="mc-rules-item-text">
                <b>1. ĐỘI HÌNH & THỨ TỰ LƯỢT CHƠI:</b>
                <p>• 4 Tổ trong lớp là 4 đội chơi chính thức: <b>Tổ 1 – Tổ 2 – Tổ 3 – Tổ 4</b>.</p>
                <p>• Thi đấu lần lượt <b>từ trái sang phải</b>: <code>Tổ 1 ➔ Tổ 2 ➔ Tổ 3 ➔ Tổ 4 ➔ lặp lại Tổ 1</code>.</p>
                <p>• Khi đến lượt tổ mình: <b>Mỗi lượt chơi sẽ là 1 người trong tổ lần lượt tham gia</b>.</p>
              </div>
            </div>

            <div className="mc-rules-item">
              <div className="mc-rules-item-icon">⏱️</div>
              <div className="mc-rules-item-text">
                <b>2. BỐC HỘP & THỜI GIAN:</b>
                <p>• Người chơi đại diện bấm bốc hộp ngẫu nhiên hoặc chọn túi mù trên bảng.</p>
                <p>• Mỗi câu hỏi có đồng hồ đếm ngược (20s - 30s). Cần trả lời trước khi hết giờ.</p>
                <p>• Hộp có video clip: Chạy hết video clip mới bắt đầu đếm ngược.</p>
              </div>
            </div>

            <div className="mc-rules-item">
              <div className="mc-rules-item-icon">⭐</div>
              <div className="mc-rules-item-text">
                <b>3. CƠ CHẾ TÍNH ĐIỂM & THỬ THÁCH:</b>
                <p>• <b>Trả lời đúng:</b> Mỗi lượt trả lời đúng của thành viên tính là <b>+1 ĐIỂM</b> cho tổ!</p>
                <p>• <b>Thử thách & May mắn:</b> Nếu hoàn thành yêu cầu của 1 thử thách, đội hoặc người tham gia sẽ nhận được <b>1 PHẦN QUÀ</b> hoặc được <b>CỘNG 1 ĐIỂM</b> cho đội!</p>
              </div>
            </div>

            <div className="mc-rules-item">
              <div className="mc-rules-item-icon">🏆</div>
              <div className="mc-rules-item-text">
                <b>4. KẾT THÚC & XẾP HẠNG TRAO THƯỞNG:</b>
                <p>• Trò chơi kết thúc khi <b>toàn bộ số lượng hộp quà được mở hết</b>.</p>
                <p>• Bảng tổng sắp điểm số của 4 tổ sẽ phân chia theo 4 thứ hạng danh dự: <b>🥇 Nhất – 🥈 Nhì – 🥉 Ba – 🎖️ Khuyến Khích</b>.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Info */}
      <footer className="mc-footer">
        <span>12A6 Mini-game 20/10 · Mobile MC View</span>
        <Link href="/minigame-20-10" className="mc-link-game">
          Mở máy chiếu ↗
        </Link>
      </footer>

      {/* Mobile Styles */}
      <style jsx global>{`
        .mc-root {
          min-height: 100vh;
          background: #0d0a1a;
          color: #f1f2f6;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          display: flex;
          flex-direction: column;
          padding-bottom: 24px;
        }

        .mc-header {
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(18, 14, 34, 0.96);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding: 12px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .mc-header-left {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .mc-badge-live {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.08em;
          color: #94a3b8;
          text-transform: uppercase;
        }

        .mc-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .mc-dot.is-online {
          background: #10b981;
          box-shadow: 0 0 10px #10b981;
          animation: mcPulse 1.8s infinite;
        }

        .mc-dot.is-offline {
          background: #ef4444;
        }

        @keyframes mcPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }

        .mc-brand {
          font-size: 16px;
          font-weight: 900;
          margin: 0;
          background: linear-gradient(135deg, #ffd166, #ff758c);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .mc-header-right {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .mc-wake-pill {
          font-size: 10px;
          padding: 3px 7px;
          background: rgba(255, 209, 102, 0.15);
          color: #ffd166;
          border-radius: 12px;
          border: 1px solid rgba(255, 209, 102, 0.3);
          font-weight: 700;
        }

        .mc-refresh-btn {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.15);
          background: #1e1838;
          color: #ffd166;
          font-size: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .mc-nav-tabs {
          display: flex;
          background: #15112b;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          padding: 4px 12px;
          gap: 8px;
        }

        .mc-tab {
          flex: 1;
          padding: 10px 8px;
          background: transparent;
          border: none;
          color: #94a3b8;
          font-size: 13px;
          font-weight: 800;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .mc-tab.is-active {
          background: #251d45;
          color: #ffd166;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }

        .mc-content {
          flex: 1;
          padding: 14px;
        }

        .mc-live-card {
          background: #16122c;
          border-radius: 18px;
          border: 1px solid rgba(255, 209, 102, 0.25);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .mc-card-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }

        .mc-bag-badge {
          background: #ff4d6d;
          color: #fff;
          font-size: 13px;
          font-weight: 900;
          padding: 4px 12px;
          border-radius: 20px;
          letter-spacing: 0.05em;
        }

        .mc-type-badge {
          font-size: 12px;
          font-weight: 800;
          padding: 4px 10px;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.1);
        }
        .mc-type-badge.is-quiz { background: #6366f1; color: #fff; }
        .mc-type-badge.is-dare { background: #f59e0b; color: #fff; }
        .mc-type-badge.is-gift { background: #10b981; color: #fff; }
        .mc-type-badge.is-special { background: #ec4899; color: #fff; }
        .mc-type-badge.is-truth { background: #8b5cf6; color: #fff; }

        .mc-player-banner {
          background: linear-gradient(135deg, rgba(255, 77, 109, 0.2), rgba(162, 89, 255, 0.25));
          border: 1px solid rgba(255, 209, 102, 0.4);
          border-radius: 12px;
          padding: 10px 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .mc-player-label {
          font-size: 12px;
          color: #ffd166;
          font-weight: 700;
        }

        .mc-player-name {
          font-size: 18px;
          font-weight: 900;
          color: #ffffff;
          text-shadow: 0 0 10px rgba(255, 209, 102, 0.5);
        }

        .mc-timer-strip {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #1e183a;
          border-radius: 10px;
          padding: 8px 12px;
          font-size: 13px;
        }

        .mc-time-text {
          color: #cbd5e1;
        }

        .mc-time-text b {
          color: #ffd166;
          font-size: 16px;
        }

        .mc-time-text.is-expired {
          color: #ef4444;
          font-weight: 900;
          animation: mcPulse 1s infinite;
        }

        .mc-screen-status {
          font-size: 11px;
          font-weight: 800;
          padding: 2px 8px;
          border-radius: 6px;
        }
        .mc-screen-status.is-hidden {
          background: rgba(245, 158, 11, 0.2);
          color: #fbbf24;
        }
        .mc-screen-status.is-revealed {
          background: rgba(16, 185, 129, 0.2);
          color: #34d399;
        }

        .mc-section {
          background: #1f183d;
          border-radius: 14px;
          padding: 14px;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .mc-section-label {
          font-size: 11px;
          font-weight: 800;
          color: #a5b4fc;
          letter-spacing: 0.05em;
          margin-bottom: 6px;
        }

        .mc-question-title {
          font-size: 19px;
          line-height: 1.45;
          font-weight: 800;
          color: #ffffff;
          margin: 0;
        }

        .mc-question-prompt {
          font-size: 14px;
          line-height: 1.5;
          color: #cbd5e1;
          margin: 8px 0 0 0;
          white-space: pre-line;
        }

        /* SECRET ANSWER BOX - HERO OF THE MC SCREEN */
        .mc-answer-box {
          background: linear-gradient(145deg, #18281a, #0e1e12);
          border: 2px solid #10b981;
          box-shadow: 0 0 20px rgba(16, 185, 129, 0.35);
          border-radius: 16px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .mc-answer-tag {
          font-size: 12px;
          font-weight: 900;
          color: #34d399;
          letter-spacing: 0.05em;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .mc-answer-text {
          font-size: 22px;
          line-height: 1.4;
          font-weight: 900;
          color: #fef08a;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
          background: rgba(0, 0, 0, 0.25);
          padding: 12px 14px;
          border-radius: 10px;
          border: 1px dashed rgba(254, 240, 138, 0.4);
          white-space: pre-line;
        }

        .mc-mc-tips {
          font-size: 12px;
          line-height: 1.45;
          color: #a7f3d0;
          background: rgba(16, 185, 129, 0.1);
          padding: 8px 10px;
          border-radius: 8px;
        }

        .mc-controls {
          margin-top: 6px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .mc-controls-label {
          font-size: 11px;
          font-weight: 800;
          color: #94a3b8;
          letter-spacing: 0.05em;
        }

        .mc-btn {
          border: none;
          border-radius: 12px;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.15s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;
          min-height: 48px;
        }

        .mc-btn:active {
          transform: scale(0.98);
        }

        .mc-btn-reveal {
          background: linear-gradient(135deg, #10b981, #059669);
          color: #fff;
          font-size: 16px;
          box-shadow: 0 4px 16px rgba(16, 185, 129, 0.4);
        }

        .mc-done-hint {
          text-align: center;
          padding: 8px;
          color: #34d399;
          font-weight: 800;
          font-size: 13px;
          background: rgba(16, 185, 129, 0.12);
          border-radius: 8px;
        }

        .mc-btn-row {
          display: flex;
          gap: 10px;
        }

        .mc-btn-close {
          flex: 1;
          background: #334155;
          color: #f1f5f9;
        }

        .mc-btn-wheel {
          flex: 1;
          background: linear-gradient(135deg, #f59e0b, #d97706);
          color: #fff;
        }

        /* STANDBY STATE */
        .mc-standby {
          background: #16122c;
          border-radius: 18px;
          border: 1px dashed rgba(255, 255, 255, 0.15);
          padding: 28px 20px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
        }

        .mc-standby-icon {
          font-size: 52px;
          animation: mcRotate 12s linear infinite;
        }

        @keyframes mcRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .mc-standby-title {
          font-size: 20px;
          font-weight: 900;
          margin: 0;
          color: #ffffff;
        }

        .mc-standby-sub {
          font-size: 14px;
          line-height: 1.5;
          color: #94a3b8;
          margin: 0;
          max-width: 320px;
        }

        .mc-standby-player {
          background: rgba(255, 209, 102, 0.1);
          border: 2px solid #ffd166;
          border-radius: 14px;
          padding: 12px 20px;
          width: 100%;
          box-sizing: border-box;
        }

        .mc-standby-player-label {
          font-size: 11px;
          font-weight: 800;
          color: #ffd166;
        }

        .mc-standby-player-name {
          font-size: 22px;
          font-weight: 900;
          color: #fff;
          margin-top: 4px;
        }

        .mc-standby-no-player {
          font-size: 13px;
          color: #cbd5e1;
        }

        .mc-btn-large {
          width: 100%;
          min-height: 52px;
          font-size: 16px;
        }

        .mc-quick-tips {
          background: #1e183a;
          border-radius: 12px;
          padding: 14px;
          text-align: left;
          width: 100%;
          box-sizing: border-box;
          margin-top: 10px;
        }

        .mc-quick-tips h3 {
          font-size: 13px;
          margin: 0 0 8px 0;
          color: #ffd166;
        }

        .mc-quick-tips ul {
          margin: 0;
          padding-left: 18px;
          font-size: 12px;
          line-height: 1.6;
          color: #94a3b8;
        }

        /* CHEAT SHEET TAB */
        .mc-cheatsheet {
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .mc-search-bar {
          position: sticky;
          top: 60px;
          z-index: 20;
          background: #0d0a1a;
          padding: 10px 14px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .mc-search-input {
          flex: 1;
          height: 42px;
          background: #1c1635;
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 10px;
          padding: 0 14px;
          font-size: 14px;
          color: #fff;
          outline: none;
        }

        .mc-search-input:focus {
          border-color: #ffd166;
        }

        .mc-search-clear {
          width: 38px;
          height: 42px;
          background: #251d45;
          border: none;
          color: #94a3b8;
          border-radius: 8px;
          font-size: 16px;
          cursor: pointer;
        }

        .mc-cheatsheet-list {
          padding: 0 14px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .mc-cheat-item {
          background: #17132e;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 12px;
        }

        .mc-cheat-head {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 6px;
        }

        .mc-cheat-num {
          background: #ff4d6d;
          color: #fff;
          font-size: 11px;
          font-weight: 900;
          padding: 2px 8px;
          border-radius: 6px;
        }

        .mc-cheat-type {
          font-size: 10px;
          font-weight: 800;
          padding: 2px 6px;
          border-radius: 4px;
          background: rgba(255, 255, 255, 0.1);
        }

        .mc-cheat-title {
          font-size: 14px;
          color: #fff;
          flex: 1;
        }

        .mc-cheat-prompt {
          font-size: 12px;
          color: #94a3b8;
          margin: 4px 0 8px 0;
          line-height: 1.4;
        }

        .mc-cheat-ans {
          font-size: 13px;
          color: #34d399;
          background: rgba(16, 185, 129, 0.12);
          border-radius: 6px;
          padding: 6px 10px;
        }

        .mc-cheat-ans b {
          color: #6ee7b7;
        }

        .mc-cheat-empty {
          text-align: center;
          padding: 40px 14px;
          color: #64748b;
          font-size: 14px;
        }

        /* 4 Teams Live Score Bar on Mobile */
        .mc-teams-bar {
          background: #15112b;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          padding: 8px 12px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .mc-teams-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 12px;
          color: #cbd5e1;
        }

        .mc-next-turn-btn {
          background: #334155;
          color: #ffd166;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 6px;
          padding: 3px 8px;
          font-size: 11px;
          font-weight: 800;
          cursor: pointer;
        }

        .mc-teams-chips {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 6px;
        }

        .mc-team-chip {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 4px 6px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }

        .mc-team-chip.is-active {
          border-color: #ffd166;
          background: rgba(255, 209, 102, 0.12);
        }

        .mc-team-chip-name {
          font-size: 11px;
          font-weight: 800;
        }

        .mc-team-chip-score {
          font-size: 14px;
          font-weight: 900;
          color: #fff;
        }

        .mc-team-add-btn {
          background: #10b981;
          color: #fff;
          border: none;
          border-radius: 4px;
          padding: 2px 8px;
          font-size: 11px;
          font-weight: 800;
          cursor: pointer;
          width: 100%;
        }

        .mc-score-row {
          display: flex;
          gap: 8px;
        }

        .mc-btn-team-score {
          flex: 2;
          color: #fff;
          font-size: 15px;
          font-weight: 800;
        }

        .mc-btn-turn-next {
          flex: 1;
          background: #334155;
          color: #ffd166;
          font-size: 13px;
          font-weight: 800;
        }

        .mc-standby-team-box {
          background: rgba(255, 255, 255, 0.05);
          border: 1px dashed rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          padding: 10px 14px;
          width: 100%;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .mc-standby-team-label {
          font-size: 11px;
          color: #94a3b8;
        }

        .mc-standby-team-val {
          font-size: 20px;
          font-weight: 900;
        }

        /* Rules Tab on Mobile */
        .mc-rules-tab {
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .mc-rules-card {
          background: #16122c;
          border-radius: 16px;
          border: 1px solid rgba(255, 209, 102, 0.25);
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .mc-rules-tag {
          font-size: 11px;
          font-weight: 900;
          color: #ffd166;
          letter-spacing: 0.08em;
        }

        .mc-rules-title {
          font-size: 20px;
          font-weight: 900;
          color: #fff;
          margin: 0;
        }

        .mc-rules-sub {
          font-size: 12px;
          color: #94a3b8;
          margin: 0;
          line-height: 1.4;
        }

        .mc-rules-item {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 10px;
          padding: 12px;
          display: flex;
          gap: 10px;
        }

        .mc-rules-item-icon {
          font-size: 22px;
        }

        .mc-rules-item-text {
          font-size: 13px;
          line-height: 1.5;
          color: #cbd5e1;
        }

        .mc-rules-item-text b {
          color: #ffd166;
          display: block;
          margin-bottom: 4px;
        }

        .mc-rules-item-text p {
          margin: 0 0 4px 0;
        }

        .mc-rules-item-text code {
          background: rgba(255, 209, 102, 0.15);
          color: #ffd166;
          padding: 1px 4px;
          border-radius: 4px;
          font-size: 11px;
        }

        .mc-footer {
          margin-top: auto;
          padding: 14px 16px 0 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 11px;
          color: #64748b;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }

        .mc-link-game {
          color: #ffd166;
          text-decoration: none;
          font-weight: 700;
        }
      `}</style>
    </div>
  );
}
