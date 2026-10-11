"use client";

import { useMemo } from "react";
import type { Slide, SlideType } from "@/lib/tram-gia-dinh/quiz";
import { SEED_QUIZ } from "@/lib/tram-gia-dinh/quiz";

const TYPES: Record<SlideType, string> = {
  info: "📢 Thông báo",
  one: "🔘 Trắc nghiệm 1 đáp án",
  many: "☑️ Đúng/Sai nhiều ý",
  fill: "✏️ Điền từ",
  guess: "🖼 Nhìn hình đoán",
};

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
    a.download = "tram-gia-dinh.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  }
  function importJSON(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const q = JSON.parse(String(r.result));
        if (!Array.isArray(q)) throw new Error("bad");
        onChange(q as Slide[]);
      } catch {
        alert("File không hợp lệ!");
      }
    };
    r.readAsText(f);
    e.target.value = "";
  }
  function resetDefault() {
    if (!confirm("Tải lại bản gốc? Mọi sửa đổi sẽ mất!")) return;
    onChange(JSON.parse(JSON.stringify(SEED_QUIZ)) as Slide[]);
  }

  return (
    <>
      <div id="stats">
        <div className="stat">
          {quiz.length}
          <small>slide</small>
        </div>
        {(Object.keys(TYPES) as SlideType[]).map((k) => (
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
        {issues.map((b, k) => (
          <div key={k}>⚠️ {b}</div>
        ))}
      </div>
      <div id="list">
        {quiz.map((s, i) => (
          <div className="card" key={i}>
            <div className="cardhead">
              <span className="num">#{i + 1}</span>
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
                {(Object.keys(TYPES) as SlideType[]).map((k) => (
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
                onClick={() =>
                  i > 0 &&
                  mut((q) => {
                    const t = q[i];
                    q[i] = q[i - 1];
                    q[i - 1] = t;
                  })
                }
              >
                ▲
              </button>
              <button
                className="iconbtn"
                title="Xuống"
                onClick={() =>
                  i < qlen(quiz) - 1 &&
                  mut((q) => {
                    const t = q[i];
                    q[i] = q[i + 1];
                    q[i + 1] = t;
                  })
                }
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
                onClick={() => {
                  if (!confirm(`Xóa câu #${i + 1} không?`)) return;
                  mut((q) => {
                    q.splice(i, 1);
                  });
                }}
              >
                ✕
              </button>
            </div>
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
                    Đáp án 1 là câu ca dao tục ngữ đúng. Ảnh là gợi ý chính.
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
      <div id="addbar">
        {(Object.keys(TYPES) as SlideType[]).map((t) => (
          <button
            key={t}
            className="btn"
            onClick={() =>
              mut((q) => {
                q.push({
                  round: "Vòng mới",
                  type: t,
                  text: t === "info" ? "Thông báo mới" : "Câu hỏi mới",
                  answers:
                    t === "info"
                      ? []
                      : [
                          { text: "Đáp án 1", correct: true },
                          { text: "Đáp án 2", correct: false },
                        ],
                });
                setTimeout(
                  () => window.scrollTo(0, document.body.scrollHeight),
                  50,
                );
              })
            }
          >
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
