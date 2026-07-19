import { Star } from "lucide-react";

export function StarRating({ value, size = 16, onChange }: { value: number; size?: number; onChange?: (v: number) => void }) {
  return (
    <div className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = value >= n;
        return (
          <button
            key={n}
            type="button"
            disabled={!onChange}
            onClick={() => onChange?.(n)}
            className={onChange ? "cursor-pointer transition-transform hover:scale-110" : "cursor-default"}
          >
            <Star
              size={size}
              className={filled ? "fill-accent text-accent" : "text-muted-foreground/40"}
            />
          </button>
        );
      })}
    </div>
  );
}
