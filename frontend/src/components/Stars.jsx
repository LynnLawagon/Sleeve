import { useState } from "react";
import { Star } from "lucide-react";
import { C } from "../constants";

export default function Stars({ value, onChange, size = 16 }) {
  const [hover, setHover] = useState(0);
  const interactive = !!onChange;

  return (
    <div className="row gap-1" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!interactive}
          onClick={() => onChange && onChange(n === value ? 0 : n)}
          onMouseEnter={() => interactive && setHover(n)}
          className="btn-text"
          style={{ cursor: interactive ? "pointer" : "default", lineHeight: 0 }}
        >
          <Star
            size={size}
            fill={(hover || value) >= n ? C.vinyl : "none"}
            color={(hover || value) >= n ? C.vinyl : C.line}
            strokeWidth={1.5}
          />
        </button>
      ))}
    </div>
  );
}
