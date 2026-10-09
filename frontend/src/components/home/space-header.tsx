"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Menu, Search, ShoppingBag, UserRound, X } from "lucide-react";
import { useAuthStore } from "@/store/use-auth-store";
import { useCartStore } from "@/store/use-cart-store";
import { useCartQuery } from "@/features/cart/hooks/use-cart-queries";
import styles from "@/app/home.module.css";

export function SpaceHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const { isAuthenticated, clearSession } = useAuthStore();
  const { cartBadgeCount, toggleCart } = useCartStore();
  useCartQuery();
  return (
    <header
      className={styles.header}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          setMenuOpen(false);
          menuButton.current?.focus();
        }
      }}
    >
      <div className={`${styles.container} ${styles.headerInner}`}>
        <Link href="/" aria-label="CMart home" className={styles.brand}>
          <span className={styles.brandMark}>
            C<span />
          </span>
          CMart<span className={styles.brandDot}>.</span>
        </Link>
        <nav className={styles.desktopNav} aria-label="Main navigation">
          <Link href="/" aria-current="page">
            Home
          </Link>
          <Link href="/products">Shop</Link>
          <a href="#categories">Categories</a>
          <a href="#featured">Featured</a>
        </nav>
        <div className={styles.headerActions}>
          <form action="/products" role="search" className={styles.search}>
            <input
              type="search"
              name="searchTerm"
              aria-label="Search products"
              placeholder="Find your next upgrade"
            />
            <button type="submit" aria-label="Search">
              <Search size={17} />
            </button>
          </form>
          <Link
            href={isAuthenticated ? "/dashboard" : "/login"}
            className={styles.iconButton}
            aria-label={isAuthenticated ? "My account" : "Log in"}
          >
            <UserRound size={19} />
          </Link>
          <button
            className={styles.iconButton}
            onClick={toggleCart}
            aria-label={`Open shopping cart, ${cartBadgeCount} items`}
          >
            <ShoppingBag size={19} />
            <span className={styles.cartCount}>{cartBadgeCount}</span>
          </button>
          <button
            ref={menuButton}
            className={`${styles.iconButton} ${styles.menuButton}`}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="home-menu"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
          {isAuthenticated ? (
            <button className={styles.accountAction} onClick={clearSession}>
              Log out
            </button>
          ) : (
            <Link className={styles.accountAction} href="/register">
              Join CMart <span>↗</span>
            </Link>
          )}
        </div>
      </div>
      {menuOpen && (
        <nav
          id="home-menu"
          className={styles.mobileNav}
          aria-label="Mobile navigation"
          onClick={(event) => {
            if ((event.target as HTMLElement).closest("a")) setMenuOpen(false);
          }}
        >
          <Link href="/products">Shop all products</Link>
          <a href="#categories">Categories</a>
          <a href="#featured">Featured products</a>
          <form action="/products" role="search" className={styles.search}>
            <input
              type="search"
              name="searchTerm"
              aria-label="Search products"
              placeholder="Search products…"
            />
            <button aria-label="Search" type="submit">
              <Search size={18} />
            </button>
          </form>
          {isAuthenticated ? (
            <button
              onClick={() => {
                clearSession();
                setMenuOpen(false);
              }}
            >
              Log out
            </button>
          ) : (
            <Link href="/register">
              Create an account <span>↗</span>
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}
