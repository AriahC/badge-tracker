import { EncouragementTip } from "@/components/EncouragementTip";
import { decorationSrc } from "@/lib/assets";
import type { ReactNode } from "react";

type EmptyAdventureProps = {
  title: string;
  body: string;
  children?: ReactNode;
  /** backpack | tip | celebration */
  art?: "backpack" | "tip" | "celebration";
  tipMessage?: string;
};

export function EmptyAdventure({
  title,
  body,
  children,
  art = "backpack",
  tipMessage = "You're doing great!",
}: EmptyAdventureProps) {
  return (
    <div className="home-card empty-state">
      {art === "tip" ? (
        <EncouragementTip message={tipMessage} className="empty-tip" />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className={`empty-art empty-art-${art}`}
          src={
            art === "celebration"
              ? decorationSrc("celebration")
              : decorationSrc("empty-adventure")
          }
          alt=""
          width={200}
          height={160}
        />
      )}
      <h2>{title}</h2>
      <p>{body}</p>
      {children}
    </div>
  );
}
