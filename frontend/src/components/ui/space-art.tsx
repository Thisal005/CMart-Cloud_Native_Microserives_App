import Image from "next/image";

export function SpaceArt({ asset = "2.0.png" }: { asset?: "2.0.png" | "3.0.png" | "moon.png" }) {
  return (
    <div className="space-state-art" aria-hidden="true">
      <Image
        unoptimized
        src={`/assests/${asset}`}
        alt=""
        fill
        sizes="280px"
        className="object-contain"
      />
    </div>
  );
}
