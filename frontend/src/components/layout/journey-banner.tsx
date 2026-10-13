"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";

const destinations: Record<
  string,
  { label: string; title: string; description: string; art: string }
> = {
  "/cart": {
    label: "Your next discovery",
    title: "Great finds. Ready for liftoff.",
    description: "A little closer to your next upgrade. Review your picks below.",
    art: "moon.png",
  },
  "/checkout": {
    label: "Checkout · Delivery",
    title: "Your next stop: something new.",
    description: "Add your delivery details and review your order.",
    art: "3.0.png",
  },
  "/checkout/payment": {
    label: "Checkout · Payment",
    title: "One step from yours.",
    description: "Review your payment details to complete your order.",
    art: "3.0.png",
  },
  "/dashboard": {
    label: "Your personal space",
    title: "Welcome to your orbit.",
    description: "Your account, discoveries, and recent activity. All in one place.",
    art: "moon.png",
  },
  "/orders": {
    label: "Your collection",
    title: "Every discovery has a journey.",
    description: "Follow your orders, from the first click to your doorstep.",
    art: "2.0.png",
  },
  "/payments": {
    label: "Account activity",
    title: "Everything, accounted for.",
    description: "Review your transactions and payment history.",
    art: "3.0.png",
  },
  "/checkout/payments": {
    label: "Account activity",
    title: "Everything, accounted for.",
    description: "Review your transactions and payment history.",
    art: "3.0.png",
  },
};

export function JourneyBanner() {
  const pathname = usePathname();
  const destination = destinations[pathname];
  if (!destination) return null;
  return (
    <section className="journey-banner" aria-label={destination.label}>
      <div className="journey-copy">
        <p className="cosmic-eyebrow">✦ {destination.label}</p>
        <h1>{destination.title}</h1>
        <p>{destination.description}</p>
      </div>
      <div className="journey-art" aria-hidden="true">
        <Image
          unoptimized
          src={`/assests/${destination.art}`}
          alt=""
          fill
          sizes="(max-width: 640px) 180px, 360px"
          className="object-contain"
        />
      </div>
    </section>
  );
}
