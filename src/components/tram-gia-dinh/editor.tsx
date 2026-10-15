"use client";

import { useMemo, useRef, useState } from "react";
import type { Slide, SlideType } from "@/lib/tram-gia-dinh/quiz";
import { SEED_QUIZ } from "@/lib/tram-gia-dinh/quiz";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const TYPES: Record<SlideType, string> = {
  info: "Thông báo",
  one: "Trắc nghiệm 1 đáp án",
  many: "Đúng/Sai nhiều ý",
  fill: "Điền từ",
  guess: "Nhìn hình đoán",
};

// "Nhanh như chớp" chỉ dùng thông báo, trắc nghiệm và điền khuyết.
const EDIT_TYPES: SlideType[] = ["info", "one", "fill"];

// Giữ loại hiện có của slide (kể cả dữ liệu cũ many/guess) để không mất nội dung.
const typeOpts = (cur: SlideType): SlideType[] =>
  EDIT_TYPES.includes(cur) ? EDIT_TYPES : [cur, ...EDIT_TYPES];

function esc(s: string): string {
  return s == null ? "" : s;
}

export default function Editor({
  quiz,
  onChange,
}: {
  quiz: Slide[];
  onChange: (q: Slide[]) => void;
}) {
  const mut = (fn: (q: Slide[]) => void) => {
    const next: Slide[] = JSON.parse(JSON.stringify(quiz));
    fn(next);
    onChange(next);
  };

  const [collapsed, setCollapsed] = useState<Record<number, boolean>>({});
  const [deleting, setDeleting] = useState<number | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [importError, setImportError] = useState("");
  const [flashIdx, setFlashIdx] = useState<number | null>(null);
  const [dying, setDying] = useState<number | null>(null);
  const flashTimer = useRef<number | null>(null);

  // Thẻ nào vừa chạm thì sáng viền lên (chỉ đổi class thẻ cha nên
  // input đang gõ không bị mất focus).
  function flash(i: number) {
    setFlashIdx(i);
    if (flashTimer.current) window.clearTimeout(flashTimer.current);
    flashTimer.current = window.setTimeout(() => setFlashIdx(null), 950);
  }

  function addOf(t: SlideType) {
    const at = quiz.length;
    mut((q) => {
      q.push({
        round: "Câu mới",
        type: t,
        text: t === "info" ? "Thông báo mới" : "Câu hỏi mới",
        answers:
          t === "info"
            ? []
            : [
                { text: "Đáp án A", correct: true },
                { text: "Đáp án B", correct: false },
                { text: "Đáp án C", correct: false },
                { text: "Đáp án D", correct: false },
              ],
      });
      setTimeout(() => window.scrollTo(0, document.body.scrollHeight), 50);
    });
    flash(at);
  }

  const counts = useMemo(() => {
    const c: Partial<Record<SlideType, number>> = {};
    quiz.forEach((s) => {
      c[s.type] = (c[s.type] || 0) + 1;
    });
    return c;
  }, [quiz]);

  const issues = useMemo(() => {
    const bad: string[] = [];
    quiz.forEach((s, i) => {
      if (!s.text || !s.text.trim()) bad.push(`Câu ${i + 1} chưa có nội dung.`);
      if (s.type === "one" && s.answers.filter((a) => a.correct).length !== 1)
        bad.push(`Câu ${i + 1} phải có đúng 1 đáp án đúng.`);
      if (s.type === "many" && s.answers.filter((a) => a.correct).length < 1)
        bad.push(`Câu ${i + 1} chưa có ý đúng nào.`);
      if (
        (s.type === "fill" || s.type === "guess") &&
        !(s.answers || [])[0]
      )
        bad.push(`Câu ${i + 1} thiếu đáp án.`);
    });
    return bad;
  }, [quiz]);

  function exportJSON() {
    const b = new Blob([JSON.stringify(quiz, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(b);
    a.download = "ai-la-trieu-phu-vat-li.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  }
  function importJSON(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setImportError("");
    const r = new FileReader();
    r.onload = () => {
      try {
        const q = JSON.parse(String(r.result));
        if (!Array.isArray(q)) throw new Error("bad");
        onChange(q as Slide[]);
      } catch {
        setImportError("File không hợp lệ — cần file JSON mảng câu hỏi.");
      }
    };
    r.readAsText(f);
    e.target.value = "";
  }
  function resetDefault() {
    setConfirmReset(true);
  }

  return (
    <>
      <div id="stats">
        <div className="stat">
          {quiz.length}
          <small>slide</small>
        </div>
        {EDIT_TYPES.map((k) => (
          <div className="stat" key={k}>
            {counts[k] || 0}
            <small>{TYPES[k]}</small>
          </div>
        ))}
        <div className="stat">
          ~{Math.round(quiz.length * 1.15)}&apos;
          <small>ước lượng</small>
        </div>
        <div className="stat">
          <button className="iconbtn" onClick={exportJSON}>
            ⬇ Xuất JSON
          </button>{" "}
          <label className="iconbtn" style={{ cursor: "pointer" }}>
            ⬆ Nhập
            <input
              type="file"
              accept="application/json"
              style={{ display: "none" }}
              onChange={importJSON}
            />
          </label>{" "}
          <button className="iconbtn" onClick={resetDefault}>
            ↺ Bản gốc
          </button>
        </div>
      </div>
      <div id="issues">
        {importError && <div>⚠️ {importError}</div>}
        {issues.map((b, k) => (
          <div key={k}>⚠️ {b}</div>
        ))}
      </div>
      <div className="card">
        <div className="cardhead">
          <span className="num">+</span>
          <span style={{ fontWeight: 900 }}>Thêm câu mới vào cuối</span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {EDIT_TYPES.map((t) => (
            <button key={t} className="btn" onClick={() => addOf(t)}>
              + {TYPES[t]}
            </button>
          ))}
        </div>
      </div>
      <div id="list">
        {quiz.map((s, i) => (
          <div
            className={`card${flashIdx === i ? " flash" : ""}${dying === i ? " dying" : ""}`}
            key={i}
            onChangeCapture={() => flash(i)}
          >
            <div className="cardhead">
              <button
                className="iconbtn"
                title={collapsed[i] ? "Mở ra" : "Thu gọn"}
                onClick={() => setCollapsed((c) => ({ ...c, [i]: !c[i] }))}
              >
                {collapsed[i] ? "▸" : "▾"}
              </button>
              <span className="num">#{i + 1}</span>
              {collapsed[i] ? (
                <span style={{ fontWeight: 800, opacity: 0.75 }}>
                  {(s.text || "").trim().slice(0, 52) || TYPES[s.type]}
                </span>
              ) : null}
              <select
                value={s.type}
                onChange={(e) =>
                  mut((q) => {
                    q[i].type = e.target.value as SlideType;
                    if (q[i].type !== "info" && !q[i].answers)
                      q[i].answers = [];
                  })
                }
              >
                {typeOpts(s.type).map((k) => (
                  <option key={k} value={k}>
                    {TYPES[k]}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={s.round || ""}
                placeholder="Tên vòng..."
                onChange={(e) =>
                  mut((q) => {
                    q[i].round = e.target.value;
                  })
                }
              />
              <button
                className="iconbtn"
                title="Lên"
                onClick={() => {
                  if (i === 0) return;
                  mut((q) => {
                    const t = q[i];
                    q[i] = q[i - 1];
                    q[i - 1] = t;
                  });
                  setCollapsed({});
                  flash(i - 1);
                }}
              >
                ▲
              </button>
              <button
                className="iconbtn"
                title="Xuống"
                onClick={() => {
                  if (i >= qlen(quiz) - 1) return;
                  mut((q) => {
                    const t = q[i];
                    q[i] = q[i + 1];
                    q[i + 1] = t;
                  });
                  setCollapsed({});
                  flash(i + 1);
                }}
              >
                ▼
              </button>
              <button
                className="iconbtn"
                title="Nhân bản"
                onClick={() =>
                  mut((q) => {
                    q.splice(i + 1, 0, JSON.parse(JSON.stringify(q[i])));
                  })
                }
              >
                ⧉
              </button>
              <button
                className="iconbtn"
                title="Xóa"
                onClick={() => setDeleting(i)}
              >
                ✕
              </button>
            </div>
            {!collapsed[i] && (
              <>
            <label>Câu hỏi / nội dung</label>
            <textarea
              rows={2}
              value={esc(s.text)}
              onChange={(e) =>
                mut((q) => {
                  q[i].text = e.target.value;
                })
              }
            />
            <div className="row2">
              <div>
                <label>Ảnh minh họa (URL, để trống nếu không dùng)</label>
                <input
                  type="text"
                  value={esc(s.img || "")}
                  placeholder="https://..."
                  onChange={(e) =>
                    mut((q) => {
                      q[i].img = e.target.value.trim();
                    })
                  }
                />
                {s.img ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    className="imgprev"
                    src={s.img}
                    alt=""
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : null}
              </div>
              <div>
                <label>Ghi chú hiện khi chấm (💡)</label>
                <input
                  type="text"
                  value={esc(s.note || "")}
                  placeholder="Giải thích ngắn..."
                  onChange={(e) =>
                    mut((q) => {
                      q[i].note = e.target.value;
                    })
                  }
                />
              </div>
            </div>
            {s.type !== "info" && (
              <>
                <label>Các đáp án — tích vào ô đúng</label>
                <div>
                  {(s.answers || []).map((a, j) => (
                    <div className="ansrow" key={j}>
                      {s.type === "one" ? (
                        <input
                          type="radio"
                          name={`c${i}`}
                          checked={!!a.correct}
                          title="Đáp án đúng"
                          onChange={() =>
                            mut((q) => {
                              q[i].answers.forEach((x) => (x.correct = false));
                              q[i].answers[j].correct = true;
                            })
                          }
                        />
                      ) : (
                        <input
                          type="checkbox"
                          checked={!!a.correct}
                          title="Ý đúng"
                          onChange={(e) =>
                            mut((q) => {
                              q[i].answers[j].correct = e.target.checked;
                            })
                          }
                        />
                      )}
                      <input
                        type="text"
                        value={esc(a.text)}
                        onChange={(e) =>
                          mut((q) => {
                            q[i].answers[j].text = e.target.value;
                          })
                        }
                      />
                      <button
                        className="iconbtn"
                        onClick={() =>
                          mut((q) => {
                            q[i].answers.splice(j, 1);
                          })
                        }
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  className="iconbtn"
                  style={{ marginTop: 8 }}
                  onClick={() =>
                    mut((q) => {
                      q[i].answers.push({ text: "Đáp án mới", correct: false });
                    })
                  }
                >
                  + Thêm đáp án
                </button>
                {s.type === "fill" && (
                  <div style={{ fontSize: 13, color: "#8a8aa3", marginTop: 6 }}>
                    Mẹo: dùng ___ trong câu hỏi để tạo chỗ trống.
                  </div>
                )}
                {s.type === "guess" && (
                  <div style={{ fontSize: 13, color: "#8a8aa3", marginTop: 6 }}>
                    Đáp án 1 là đáp án đúng. Ảnh là gợi ý chính.
                  </div>
                )}
              </>
            )}
            </>)}
          </div>
        ))}
      </div>
      <ConfirmDialog
        open={deleting !== null}
        title={deleting !== null ? `Xóa câu #${deleting + 1}?` : "Xóa câu hỏi?"}
        message="Câu hỏi mất khỏi bản chung của cả lớp."
        confirmLabel="Xóa"
        danger
        onConfirm={() => {
          if (deleting === null) return;
          const idx = deleting;
          setDeleting(null);
          setCollapsed({});
          setDying(idx);
          window.setTimeout(() => {
            setDying(null);
            mut((q) => {
              q.splice(idx, 1);
            });
          }, 280);
        }}
        onCancel={() => setDeleting(null)}
      />
      <ConfirmDialog
        open={confirmReset}
        title="Tải lại bản gốc?"
        message="Mọi sửa đổi của lớp sẽ mất, về lại bộ câu hỏi Vật lí mặc định."
        confirmLabel="Tải lại"
        danger
        onConfirm={() => {
          setConfirmReset(false);
          onChange(JSON.parse(JSON.stringify(SEED_QUIZ)) as Slide[]);
        }}
        onCancel={() => setConfirmReset(false)}
      />
      <div id="addbar">
        {EDIT_TYPES.map((t) => (
          <button key={t} className="btn" onClick={() => addOf(t)}>
            + {TYPES[t]}
          </button>
        ))}
      </div>
    </>
  );
}
function qlen(q: Slide[]): number {
  return q.length;
}
