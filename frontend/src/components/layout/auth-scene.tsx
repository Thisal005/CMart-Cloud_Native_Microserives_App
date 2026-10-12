import Image from "next/image";
import Link from "next/link";

export function AuthScene({
  children,
  register = false,
}: {
  children: React.ReactNode;
  register?: boolean;
}) {
  return (
    <main className="auth-scene cosmic-shell">
      <aside className="auth-art">
        <Image
          unoptimized
          src="/assests/door.jpg"
          alt="An astronaut stepping through a doorway into a violet galaxy"
          fill
          priority
          sizes="(max-width: 800px) 100vw, 50vw"
          className="object-cover"
        />
        <div className="auth-art-shade" />
        <Link href="/" className="auth-brand">
          CMart<span>.</span>
        </Link>
        <div className="auth-art-copy">
          <p className="cosmic-eyebrow">Beyond the everyday</p>
          <h2>
            A whole new
            <br />
            world awaits.
          </h2>
          <p>Discover your next favorite. Make it yours.</p>
        </div>
      </aside>
      <section className="auth-form-area" aria-label={register ? "Create an account" : "Sign in"}>
        <Link href="/products" className="auth-back">
          ← Back to the collection
        </Link>
        <div className="auth-form-wrap">
          <p className="cosmic-eyebrow">{register ? "Begin your journey" : "Your next chapter"}</p>
          {children}
          <p className="auth-footnote">Your universe of everyday upgrades.</p>
        </div>
      </section>
    </main>
  );
}
