"use client";

import { useState } from "react";

const PRESET_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "FREE SIZE"];

export function AdminSizePicker({ defaultValue }: { defaultValue?: string }) {
  const initial = defaultValue
    ? defaultValue.split(",").map(s => s.trim()).filter(Boolean)
    : ["S", "M", "L", "XL", "XXL"];

  const [selected, setSelected] = useState<string[]>(initial);

  const toggle = (size: string) => {
    setSelected(prev =>
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size],
    );
  };

  return (
    <div className="admin-size-picker">
      <input type="hidden" name="sizes" value={selected.join(",")} />
      <div className="admin-size-btns">
        {PRESET_SIZES.map(size => (
          <button
            key={size}
            type="button"
            className={`admin-size-btn${selected.includes(size) ? " active" : ""}`}
            onClick={() => toggle(size)}
          >
            {size}
          </button>
        ))}
      </div>
    </div>
  );
}
