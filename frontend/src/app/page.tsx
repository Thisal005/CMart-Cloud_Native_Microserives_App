"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Headphones,
  Keyboard,
  Laptop,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";
import { SpaceHeader } from "@/components/home/space-header";
import { HomeProductImage } from "@/components/home/product-image";
import { useProductsQuery } from "@/features/products/hooks/use-products";
import { ProductGridSkeleton } from "@/features/products/components/product-skeleton";
import { formatUSD } from "@/utils/currency";
import styles from "./home.module.css";

const categories = [
  {
    name: "Computers",
    description: "More power. More possibilities.",
    detail: "Laptops & desktops",
    icon: Laptop,
  },
  {
    name: "Audio",
    description: "Find your own frequency.",
    detail: "Headphones & speakers",
    icon: Headphones,
  },
  {
    name: "Accessories",
    description: "Small details. Big difference.",
    detail: "Cameras & essentials",
    icon: Keyboard,
  },
];

export default function Home() {
  const { data: response, isLoading, isError, refetch } = useProductsQuery();
  const products = response?.data?.slice(0, 3) || [];
  return (
    <div className={styles.home}>
      <a className={styles.skipLink} href="#main-content">
        Skip to content
      </a>
      <SpaceHeader />
      <main id="main-content">
        <section className={styles.hero} aria-labelledby="hero-heading">
          <Image
            src="/space/nebula.webp"
            alt=""
            fill
            priority
            sizes="100vw"
            className={styles.nebula}
          />
          <div className={`${styles.container} ${styles.heroInner}`}>
            <div className={styles.heroCopy}>
              <span className={styles.eyebrow}>
                <span className={styles.liveDot} /> A NEW WORLD OF TECH
              </span>
              <h1 id="hero-heading">
                Your next upgrade.
                <br />
                <span>Beyond ordinary.</span>
              </h1>
              <p>
                Discover standout tech for the way you work, play, and create. Your next great setup
                starts here.
              </p>
              <div className={styles.actions}>
                <Link href="/products" className={styles.primaryButton}>
                  Explore Products <ArrowUpRight size={18} />
                </Link>
                <a href="#categories" className={styles.secondaryButton}>
                  Browse Categories <ArrowDown size={16} />
                </a>
              </div>
              <div className={styles.heroNote}>
                <span /> DOWN TO EARTH PRICES. OUT OF THIS WORLD GEAR.
              </div>
            </div>
            <div className={styles.heroArt}>
              <div className={styles.orbit} aria-hidden="true" />
              <Image
                src="/space/astronaut.webp"
                alt="Astronaut floating through space with a glowing cyan and violet visor"
                fill
                priority
                sizes="(max-width: 700px) 100vw, 58vw"
                className={styles.astronaut}
              />
              <div className={styles.artLabel} aria-hidden="true">
                <Sparkles size={16} />
                <div>
                  Made for explorers<span>THE NEXT FRONTIER IS YOURS</span>
                </div>
              </div>
              <span className={styles.coordinates} aria-hidden="true">
                CM / 001 — EXPLORE WITHOUT LIMITS
              </span>
            </div>
          </div>
        </section>
        <div className={styles.container}>
          <section id="categories" className={styles.section} aria-labelledby="categories-heading">
            <div className={styles.sectionHeading}>
              <div>
                <span className={styles.eyebrow}>FIND YOUR ORBIT</span>
                <h2 id="categories-heading">A universe of possibilities.</h2>
              </div>
              <span className={styles.sectionAside}>Your setup. Your world.</span>
            </div>
            <div className={styles.categories}>
              {categories.map(({ name, description, detail, icon: Icon }, index) => (
                <Link href={`/products?category=${name}`} key={name} className={styles.category}>
                  <div className={styles.categoryTop}>
                    <Icon size={30} strokeWidth={1.4} />
                    <span>0{index + 1}</span>
                  </div>
                  <h3>{name}</h3>
                  <p>{description}</p>
                  <div className={styles.categoryBottom}>
                    <span>{detail}</span>
                    <ArrowUpRight size={19} />
                  </div>
                </Link>
              ))}
            </div>
          </section>
          <section id="featured" className={styles.section} aria-labelledby="featured-heading">
            <div className={styles.sectionHeading}>
              <div>
                <span className={styles.eyebrow}>WORTH EXPLORING</span>
                <h2 id="featured-heading">Meet your next favorite.</h2>
              </div>
              <Link href="/products" className={styles.textLink}>
                View all products <ArrowRight size={17} />
              </Link>
            </div>
            {isLoading ? (
              <div role="status" aria-label="Loading featured products">
                <ProductGridSkeleton count={3} />
              </div>
            ) : isError ? (
              <div className={styles.catalogState} role="status">
                <PackageCheck size={30} />
                <h3>Our catalog is taking a moment.</h3>
                <p>We couldn’t load the products. Please try again.</p>
                <button className={styles.secondaryButton} onClick={() => refetch()}>
                  Try again <ArrowRight size={16} />
                </button>
              </div>
            ) : products.length === 0 ? (
              <div className={styles.catalogState}>
                <Sparkles size={30} />
                <h3>New discoveries are on the way.</h3>
                <p>Check back soon for your next upgrade.</p>
                <button className={styles.secondaryButton} onClick={() => refetch()}>
                  Refresh catalog <ArrowRight size={16} />
                </button>
              </div>
            ) : (
              <div className={styles.products}>
                {products.map((product) => (
                  <article key={product.id} className={styles.product}>
                    <Link
                      href={`/products/${product.id}`}
                      className={styles.productImage}
                      aria-label={`View ${product.name}`}
                    >
                      <HomeProductImage src={product.imageUrl} name={product.name} />
                      <span className={styles.stock}>
                        {product.stock > 0 ? "In stock" : "Out of stock"}
                      </span>
                    </Link>
                    <div className={styles.productBody}>
                      <span className={styles.eyebrow}>{product.category}</span>
                      <h3>
                        <Link href={`/products/${product.id}`}>{product.name}</Link>
                      </h3>
                      <p>
                        {product.description || "Explore the details and find your next upgrade."}
                      </p>
                      <div className={styles.productBottom}>
                        <strong>{formatUSD(product.price)}</strong>
                        <Link href={`/products/${product.id}`} className={styles.textLink}>
                          View details <ArrowUpRight size={17} />
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
          <section className={styles.audio} aria-labelledby="audio-heading">
            <div className={styles.audioCopy}>
              <span className={styles.eyebrow}>
                <Headphones size={15} /> TUNE INTO SOMETHING EXTRAORDINARY
              </span>
              <h2 id="audio-heading">
                Sound from
                <br />
                <span>another world.</span>
              </h2>
              <p>
                Get lost in the music. Stay in the moment.
                <br />
                Discover audio that brings your world to life.
              </p>
              <Link href="/products?category=Audio" className={styles.primaryButton}>
                Explore Audio <ArrowUpRight size={18} />
              </Link>
            </div>
            <div className={styles.audioArt}>
              <Image
                src="/space/audio.webp"
                alt="Astronaut wearing headphones with a glowing violet visor"
                fill
                sizes="(max-width: 700px) 90vw, 50vw"
              />
            </div>
            <span className={styles.audioCaption} aria-hidden="true">
              LESS NOISE. MORE UNIVERSE.
            </span>
          </section>
          <section className={styles.delivery} aria-labelledby="delivery-heading">
            <div className={styles.deliveryArt}>
              <Image
                src="/space/delivery.webp"
                alt="Futuristic delivery rover carrying tech packages"
                fill
                sizes="(max-width: 700px) 90vw, 45vw"
              />
            </div>
            <div className={styles.deliveryCopy}>
              <span className={styles.eyebrow}>GREAT GEAR. A SIMPLE JOURNEY.</span>
              <h2 id="delivery-heading">
                From our universe
                <br />
                to your doorstep.
              </h2>
              <p>Find your favorites, make them yours, and keep everything in one place.</p>
              <div className={styles.benefits}>
                <div>
                  <Truck size={21} />
                  <span>
                    <strong>Free shipping on orders $100+</strong>Your next upgrade, delivered for
                    less.
                  </span>
                </div>
                <div>
                  <ShieldCheck size={21} />
                  <span>
                    <strong>A clear checkout</strong>Review your order before you pay.
                  </span>
                </div>
              </div>
              <Link href="/products" className={styles.textLink}>
                Find your next upgrade <ArrowRight size={17} />
              </Link>
            </div>
          </section>
        </div>
      </main>
      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerShowcase}>
            <div className={styles.footerCopy}>
              <span className={styles.eyebrow}>STAY CURIOUS. GO FURTHER.</span>
              <h2>
                There’s a whole
                <br />
                <span>world out there.</span>
              </h2>
              <p>Find the gear that takes you somewhere new.</p>
              <Link href="/products" className={styles.primaryButton}>
                Keep exploring <ArrowUpRight size={18} />
              </Link>
            </div>
            <div className={styles.footerArt}>
              <div className={styles.footerHalo} aria-hidden="true" />
              <Image
                src="/space/footer-astronaut.webp"
                alt="Astronaut in a purple suit surrounded by violet butterflies"
                fill
                sizes="(max-width: 700px) 85vw, 35vw"
              />
            </div>
            <nav className={styles.footerNavigation} aria-label="Footer">
              <div>
                <h3>Explore</h3>
                <Link href="/products">All products</Link>
                <a href="#categories">Categories</a>
                <a href="#featured">Featured gear</a>
              </div>
              <div>
                <h3>Your CMart</h3>
                <Link href="/dashboard">My account</Link>
                <Link href="/orders">My orders</Link>
                <Link href="/cart">Shopping cart</Link>
              </div>
            </nav>
          </div>
          <div className={styles.footerSignature}>
            <Link href="/" className={styles.brand}>
              <span className={styles.brandMark}>
                C<span />
              </span>
              CMart<span className={styles.brandDot}>.</span>
            </Link>
            <p>For a world beyond ordinary.</p>
            <a href="#main-content" className={styles.textLink}>
              Back to top <ArrowUpRight size={16} />
            </a>
          </div>
          <div className={styles.footerBottom}>
            <span>© {new Date().getFullYear()} CMart. All rights reserved.</span>
            <span>
              YOUR NEXT DISCOVERY STARTS HERE <ArrowUpRight size={13} />
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
