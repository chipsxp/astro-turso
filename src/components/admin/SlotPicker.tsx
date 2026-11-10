import { useEffect, useRef } from "react";
import {
  type PanelSlot,
  SLOT_META,
  VALID_SLOTS,
} from "./panel-gallery-utils";

export function SlotPicker({
  onSelect,
  onClose,
}: {
  onSelect: (slot: PanelSlot) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  return (
    <div className="slot-picker" ref={ref}>
      {VALID_SLOTS.map((s) => (
        <button
          key={s}
          type="button"
          className="slot-picker__btn"
          onClick={() => {
            onSelect(s);
            onClose();
          }}
        >
          {SLOT_META[s].location}
        </button>
      ))}
    </div>
  );
}
