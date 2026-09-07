import { decorationSrc } from "@/lib/assets";

type EncouragementTipProps = {
  message?: string;
  className?: string;
};

/** Crisp HTML speech bubble + HQ decorative accent. */
export function EncouragementTip({
  message = "You're doing great!",
  className = "",
}: EncouragementTipProps) {
  return (
    <div className={`encourage-tip ${className}`.trim()} aria-hidden="true">
      <p className="encourage-bubble">
        {message}
        <span className="encourage-heart">♥</span>
      </p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="encourage-bird"
        src={decorationSrc("tip-bird")}
        alt=""
        width={88}
        height={88}
        draggable={false}
      />
    </div>
  );
}
