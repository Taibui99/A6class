"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type SelectOption = { value: string; label: string };

// Base UI không cho item rỗng — dùng sentinel nội bộ, ngoài vẫn là "".
const NONE = "__none__";

/**
 * Select đẹp (dùng Base UI) thay cho <select> mặc định của trình duyệt.
 * Có hidden input đi kèm nên vẫn submit form server-action bình thường.
 * Bỏ `name` khi chỉ lọc/chuyển trang tại chỗ (không submit form).
 */
export function FormSelect({
  name,
  value,
  onChange,
  options,
  placeholder,
  emptyLabel,
  disabled = false,
  className,
  ariaLabel,
}: {
  name?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  emptyLabel?: string;
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
}) {
  const items: SelectOption[] = emptyLabel
    ? [{ value: "", label: emptyLabel }, ...options]
    : options;
  const shown = value === "" ? NONE : value;

  return (
    <>
      <Select
        value={shown}
        onValueChange={(v: string | null) => onChange(typeof v === "string" && v !== NONE ? v : "")}
      >
        <SelectTrigger className={className} aria-label={ariaLabel}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {items.map((o) => (
            <SelectItem
              key={o.value === "" ? NONE : o.value}
              value={o.value === "" ? NONE : o.value}
            >
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {name ? <input type="hidden" name={name} value={value} /> : null}
    </>
  );
}
