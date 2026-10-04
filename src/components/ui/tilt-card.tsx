"use client";

import { useCallback, useRef, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  /** Độ nghiêng tối đa (độ). Mẫu dùng /10 -> tối đa ~9°. */
  maxTilt?: number;
};

const REDUCED = "(prefers-reduced-motion: reduce)";

/**
 * Thẻ nghiêng 3D theo vị trí chuột — hiệu ứng hologram của mẫu "A6 LEGENDS".
 *
 * Ghi thẳng vào `style` của node thay vì setState: chuột di chuyển 60–120 lần/giây,
 * nếu đi qua state thì mỗi lần đều render lại cả cây con bên trong thẻ.
 */
export function TiltCard({ children, className = "", maxTilt = 9 }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  const onMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const node = ref.current;
      if (!node) return;
      if (window.matchMedia(REDUCED).matches) return;

      const rect = node.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;

      // Chuẩn hoá theo nửa kích thước thẻ rồi nhân với góc tối đa, để thẻ
      // nhỏ và thẻ to nghiêng đều nhau thay vì thẻ nhỏ nghiêng nhiều hơn.
      const rotateX = (-y / (rect.height / 2)) * maxTilt;
      const rotateY = (x / (rect.width / 2)) * maxTilt;

      node.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.03, 1.03, 1.03)`;
    },
    [maxTilt],
  );

  const reset = useCallback(() => {
    const node = ref.current;
    if (!node) return;
    node.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
  }, []);

  return (
    <div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={reset}
      className={className}
      style={{ transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)" }}
    >
      {children}
    </div>
  );
}