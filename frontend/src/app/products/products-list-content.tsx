"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Headphones,
  Laptop,
  Layers3,
  PackageSearch,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Truck,
  X,
} from "lucide-react";
import { SpaceHeader } from "@/components/home/space-header";
import { CosmicParticles } from "@/components/home/cosmic-particles";
import { HomeProductImage } from "@/components/home/product-image";
import { useProductsQuery } from "@/features/products/hooks/use-products";
import { ProductGridSkeleton } from "@/features/products/components/product-skeleton";
import { Product } from "@/features/products/services/product-service";
import { formatUSD } from "@/utils/currency";
import home from "../home.module.css";
import styles from "./shop.module.css";

const ITEMS_PER_PAGE = 6;
const EMPTY_PRODUCTS: Product[] = [];
const categoryIcons: Record<string, typeof Laptop> = { Computers: Laptop, Audio: Headphones };

function parsePrice(value: string | null) {
  if (!value?.trim()) return null;
  const price = Number(value);
  return Number.isFinite(price) && price >= 0 ? price : null;
}

export default function ProductsListContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const { data: response, isLoading, isError, refetch } = useProductsQuery();
  const querySearch = searchParams.get("searchTerm") || "";
  const queryCategory = searchParams.get("category") || null;
  const queryMinPrice = parsePrice(searchParams.get("minPrice"));
  const queryMaxPrice = parsePrice(searchParams.get("maxPrice"));
  const queryInStock = searchParams.get("inStockOnly") === "true";
  const querySortBy = searchParams.get("sortBy") || "createdAt";
  const querySortOrder = searchParams.get("sortOrder") || "desc";
  const parsedPage = Number(searchParams.get("page") || "1");
  const queryPage = Number.isFinite(parsedPage) ? Math.floor(parsedPage) : 1;
  const rawProducts = response?.data || EMPTY_PRODUCTS;
  const uniqueCategories = React.useMemo(
    () => Array.from(new Set(rawProducts.map((p) => p.category))).filter(Boolean),
    [rawProducts]
  );

  const filteredSortedData = React.useMemo(() => {
    const search = querySearch.trim().toLowerCase();
    const items = rawProducts.filter(
      (p) =>
        (!search ||
          p.name.toLowerCase().includes(search) ||
          (p.description || "").toLowerCase().includes(search)) &&
        (!queryCategory || p.category.toLowerCase() === queryCategory.toLowerCase()) &&
        (queryMinPrice === null || p.price >= queryMinPrice) &&
        (queryMaxPrice === null || p.price <= queryMaxPrice) &&
        (!queryInStock || p.stock > 0)
    );
    return items.sort((a, b) => {
      const comparison =
        querySortBy === "price"
          ? a.price - b.price
          : querySortBy === "name"
            ? a.name.localeCompare(b.name)
            : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return querySortOrder === "asc" ? comparison : -comparison;
    });
  }, [
    rawProducts,
    querySearch,
    queryCategory,
    queryMinPrice,
    queryMaxPrice,
    queryInStock,
    querySortBy,
    querySortOrder,
  ]);

  const totalItems = filteredSortedData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const currentPage = Math.max(1, Math.min(queryPage, totalPages));
  const paginatedProducts = filteredSortedData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  const updateFilters = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    Object.entries(updates).forEach(([key, value]) =>
      value === null || value === "" ? params.delete(key) : params.set(key, value)
    );
    router.push(`${pathname}${params.size ? `?${params}` : ""}`, { scroll: false });
  };
  const resetFilters = () => router.push(pathname, { scroll: false });
  const activeFilters = [
    ...(querySearch ? [{ key: "searchTerm", label: `“${querySearch}”` }] : []),
    ...(queryCategory ? [{ key: "category", label: queryCategory }] : []),
    ...(queryMinPrice !== null
      ? [{ key: "minPrice", label: `From ${formatUSD(queryMinPrice)}` }]
      : []),
    ...(queryMaxPrice !== null
      ? [{ key: "maxPrice", label: `Up to ${formatUSD(queryMaxPrice)}` }]
      : []),
    ...(queryInStock ? [{ key: "inStockOnly", label: "In stock" }] : []),
  ];
  const changePage = (page: number) => {
    updateFilters({ page: String(page) });
    document.getElementById("catalog")?.scrollIntoView({ block: "start" });
  };

  return (
    <div className={`${home.home} ${styles.shop}`}>
      <a className={home.skipLink} href="#catalog">
        Skip to products
      </a>
      <SpaceHeader onBrowseCategories={() => setFiltersOpen(true)} />
      <main>
        <section className={styles.hero} aria-labelledby="shop-heading">
          <CosmicParticles count={38} />
          <div className={`${home.container} ${styles.heroInner}`}>
            <div className={styles.heroCopy}>
              <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
                <Link href="/">Home</Link>
                <ChevronRight size={12} />
                <span>Shop</span>
              </nav>
              <span className={home.eyebrow}>
                <span className={home.liveDot} /> THE CMART COLLECTION
              </span>
              <h1 id="shop-heading">
                Great tech.
                <br />
                <span>Endless possibilities.</span>
              </h1>
              <p>
                For the makers, the dreamers, and the everyday explorers.
                <br className={styles.desktopBreak} /> Find the gear that takes your world further.
              </p>
              <a href="#catalog" className={home.primaryButton}>
                Explore the collection <ArrowDown size={16} />
              </a>
              <span className={styles.heroNote}>YOUR NEXT DISCOVERY STARTS HERE</span>
            </div>
            <div className={styles.heroArt}>
              <div className={styles.orbit} aria-hidden="true" />
              <Image
                src="/assests/3.png"
                alt="Astronaut floating into a new universe of possibilities"
                fill
                priority
                sizes="(max-width: 700px) 170vw, 85vw"
                className={styles.astronaut}
              />
              <span className={styles.artLabel}>
                <Sparkles size={15} /> A little beyond ordinary.
              </span>
              <span className={styles.coordinates} aria-hidden="true">
                CM / 002 — DISCOVER YOUR ORBIT
              </span>
            </div>
          </div>
        </section>
        <div className={styles.benefitStrip}>
          <div className={home.container}>
            <span>
              <Truck size={17} /> Free shipping on orders $100+
            </span>
            <span>
              <ShieldCheck size={17} /> A clear, simple checkout
            </span>
            <span>
              <Sparkles size={17} /> Gear for your next great idea
            </span>
          </div>
        </div>
        <div className={home.container}>
          <section id="catalog" className={styles.catalog} aria-labelledby="catalog-heading">
            <div className={styles.catalogHeading}>
              <div>
                <span className={home.eyebrow}>FIND YOUR NEXT FAVORITE</span>
                <h2 id="catalog-heading">Explore the collection.</h2>
              </div>
              <span className={styles.sectionNote}>Your setup. Your world.</span>
            </div>
            <div className={styles.catalogLayout}>
              <aside id="categories" className={styles.sidebar} aria-label="Product filters">
                <div className={styles.filterTitle}>
                  <span>
                    <SlidersHorizontal size={17} /> Refine your orbit
                  </span>
                  <button onClick={resetFilters}>Reset</button>
                </div>
                <button
                  className={styles.mobileFilters}
                  aria-expanded={filtersOpen}
                  aria-controls="shop-filters"
                  onClick={() => setFiltersOpen(!filtersOpen)}
                >
                  <SlidersHorizontal size={17} /> Filters{" "}
                  {activeFilters.length > 0 && `(${activeFilters.length})`}
                  <span>{filtersOpen ? "−" : "+"}</span>
                </button>
                <div
                  id="shop-filters"
                  className={`${styles.filterBody} ${filtersOpen ? styles.filtersExpanded : ""}`}
                >
                  <form
                    key={`search-${querySearch}`}
                    onSubmit={(event) => {
                      event.preventDefault();
                      updateFilters({
                        searchTerm: String(
                          new FormData(event.currentTarget).get("searchTerm") || ""
                        ).trim(),
                      });
                    }}
                  >
                    <label htmlFor="catalog-search" className={styles.filterLabel}>
                      Search collection
                    </label>
                    <div className={styles.search}>
                      <input
                        id="catalog-search"
                        name="searchTerm"
                        type="search"
                        placeholder="What are you looking for?"
                        defaultValue={querySearch}
                      />
                      <button aria-label="Search collection" type="submit">
                        <Search size={17} />
                      </button>
                    </div>
                  </form>
                  <div className={styles.filterGroup}>
                    <h3>Categories</h3>
                    <div className={styles.categories}>
                      <button
                        aria-pressed={!queryCategory}
                        onClick={() => updateFilters({ category: null })}
                      >
                        <Layers3 size={16} />
                        <span>All products</span>
                        <small>{rawProducts.length}</small>
                      </button>
                      {uniqueCategories.map((category) => {
                        const Icon = categoryIcons[category] || Layers3;
                        return (
                          <button
                            key={category}
                            aria-pressed={queryCategory?.toLowerCase() === category.toLowerCase()}
                            onClick={() => updateFilters({ category })}
                          >
                            <Icon size={16} />
                            <span>{category}</span>
                            <small>
                              {rawProducts.filter((p) => p.category === category).length}
                            </small>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <form
                    className={styles.filterGroup}
                    key={`price-${queryMinPrice}-${queryMaxPrice}`}
                    onSubmit={(event) => {
                      event.preventDefault();
                      const data = new FormData(event.currentTarget);
                      updateFilters({
                        minPrice: String(data.get("minPrice") || ""),
                        maxPrice: String(data.get("maxPrice") || ""),
                      });
                    }}
                  >
                    <h3>Price range</h3>
                    <div className={styles.priceInputs}>
                      <label>
                        Min ($)
                        <input
                          type="number"
                          name="minPrice"
                          min="0"
                          step="any"
                          placeholder="0"
                          defaultValue={queryMinPrice ?? ""}
                        />
                      </label>
                      <span>—</span>
                      <label>
                        Max ($)
                        <input
                          type="number"
                          name="maxPrice"
                          min="0"
                          step="any"
                          placeholder="Any"
                          defaultValue={queryMaxPrice ?? ""}
                        />
                      </label>
                    </div>
                    <button className={styles.applyPrice} type="submit">
                      Apply price range <ArrowRight size={14} />
                    </button>
                  </form>
                  <div className={styles.filterGroup}>
                    <h3>Availability</h3>
                    <label className={styles.stockToggle}>
                      <input
                        type="checkbox"
                        key={String(queryInStock)}
                        defaultChecked={queryInStock}
                        onChange={(event) =>
                          updateFilters({ inStockOnly: event.target.checked ? "true" : null })
                        }
                      />{" "}
                      In stock only <Check size={14} />
                    </label>
                  </div>
                </div>
                <div className={styles.sidebarNote}>
                  <Sparkles size={19} />
                  <p>
                    Big ideas start
                    <br />
                    with the right gear.
                  </p>
                  <span>KEEP EXPLORING.</span>
                </div>
              </aside>
              <div className={styles.results}>
                <div className={styles.toolbar}>
                  <p role="status">
                    {isLoading ? (
                      "Finding your next discovery…"
                    ) : isError ? (
                      "Collection unavailable"
                    ) : (
                      <>
                        <strong>{totalItems}</strong> {totalItems === 1 ? "product" : "products"}
                        {queryCategory ? ` in ${queryCategory}` : " to explore"}
                      </>
                    )}
                  </p>
                  <label>
                    Sort by
                    <select
                      aria-label="Sort catalog"
                      value={`${querySortBy}_${querySortOrder}`}
                      onChange={(event) => {
                        const [sortBy, sortOrder] = event.target.value.split("_");
                        updateFilters({ sortBy, sortOrder });
                      }}
                    >
                      <option value="createdAt_desc">Newest arrivals</option>
                      <option value="price_asc">Price: Low to high</option>
                      <option value="price_desc">Price: High to low</option>
                      <option value="name_asc">Name: A to Z</option>
                      <option value="name_desc">Name: Z to A</option>
                    </select>
                  </label>
                </div>
                {activeFilters.length > 0 && (
                  <div className={styles.activeFilters}>
                    {activeFilters.map(({ key, label }) => (
                      <button
                        key={key}
                        onClick={() => updateFilters({ [key]: null })}
                        aria-label={`Remove filter ${label}`}
                      >
                        {label}
                        <X size={12} />
                      </button>
                    ))}
                    <button onClick={resetFilters}>Clear all</button>
                  </div>
                )}
                {isLoading ? (
                  <div role="status" aria-label="Loading products">
                    <ProductGridSkeleton count={ITEMS_PER_PAGE} />
                  </div>
                ) : isError ? (
                  <div className={styles.catalogState}>
                    <PackageSearch size={36} />
                    <h3>Our catalog is taking a moment.</h3>
                    <p>We couldn’t load the collection. Give it another try.</p>
                    <button className={home.secondaryButton} onClick={() => refetch()}>
                      Try again <ArrowRight size={16} />
                    </button>
                  </div>
                ) : paginatedProducts.length === 0 ? (
                  <div className={styles.catalogState}>
                    <Search size={36} />
                    <h3>
                      {rawProducts.length
                        ? "No discoveries in this orbit."
                        : "New discoveries are on the way."}
                    </h3>
                    <p>
                      {rawProducts.length
                        ? "Try another search or give your filters a little more room."
                        : "Check back soon for your next upgrade."}
                    </p>
                    <button
                      className={home.secondaryButton}
                      onClick={rawProducts.length ? resetFilters : () => refetch()}
                    >
                      {rawProducts.length ? "Clear filters" : "Refresh collection"}
                      <ArrowRight size={16} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className={`grid ${styles.productGrid}`}>
                      {paginatedProducts.map((product) => (
                        <article key={product.id} className={`${home.product} ${styles.product}`}>
                          <Link
                            href={`/products/${product.id}`}
                            className={`${home.productImage} ${styles.productImage}`}
                            aria-label={`View details for ${product.name}`}
                          >
                            <HomeProductImage src={product.imageUrl} name={product.name} />
                            <span className={home.stock}>
                              <span
                                className={`${home.stockDot} ${product.stock > 0 ? "" : home.stockDotOut}`}
                              />
                              {product.stock > 0 ? "In stock" : "Out of stock"}
                            </span>
                            <span className={styles.productArrow}>
                              <ArrowUpRight size={18} />
                            </span>
                          </Link>
                          <div className={`${home.productBody} ${styles.productBody}`}>
                            <span className={home.eyebrow}>{product.category}</span>
                            <h3>
                              <Link href={`/products/${product.id}`}>{product.name}</Link>
                            </h3>
                            <p>
                              {product.description || "Discover the details of your next upgrade."}
                            </p>
                            <div className={home.productBottom}>
                              <strong>{formatUSD(product.price)}</strong>
                              <Link href={`/products/${product.id}`} className={home.textLink}>
                                View Details <ArrowUpRight size={14} />
                              </Link>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                    <div className={styles.resultFooter}>
                      <span>
                        Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
                        {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} of {totalItems}{" "}
                        products
                      </span>
                      {totalPages > 1 && (
                        <nav className={styles.pagination} aria-label="Product pages">
                          <button
                            aria-label="Previous page"
                            disabled={currentPage === 1}
                            onClick={() => changePage(currentPage - 1)}
                          >
                            <ChevronLeft size={16} />
                          </button>
                          <span>
                            Page {currentPage} of {totalPages}
                          </span>
                          <button
                            aria-label="Next page"
                            disabled={currentPage === totalPages}
                            onClick={() => changePage(currentPage + 1)}
                          >
                            <ChevronRight size={16} />
                          </button>
                        </nav>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </section>
          <section
            id="collections"
            className={styles.collections}
            aria-label="Explore featured categories"
          >
            <article className={styles.collection}>
              <div className={styles.collectionCopy}>
                <span className={home.eyebrow}>FIND YOUR FREQUENCY</span>
                <h2>
                  A world of
                  <br />
                  <span>your own.</span>
                </h2>
                <p>Less noise. More of what moves you.</p>
                <Link href="/products?category=Audio#catalog" className={home.textLink}>
                  Explore Audio <ArrowUpRight size={17} />
                </Link>
              </div>
              <Image
                src="/assests/p1.png"
                alt="Violet astronaut helmet filled with butterflies"
                fill
                sizes="(max-width: 700px) 100vw, 50vw"
              />
            </article>
            <article className={`${styles.collection} ${styles.secondCollection}`}>
              <div className={styles.collectionCopy}>
                <span className={home.eyebrow}>MADE FOR POSSIBILITY</span>
                <h2>
                  Small details.
                  <br />
                  <span>Big discoveries.</span>
                </h2>
                <p>Make your everyday a little extraordinary.</p>
                <Link href="/products?category=Accessories#catalog" className={home.textLink}>
                  Explore Accessories <ArrowUpRight size={17} />
                </Link>
              </div>
              <Image
                src="/assests/p2.png"
                alt="Astronaut with a glowing galaxy visor and purple butterflies"
                fill
                sizes="(max-width: 700px) 100vw, 50vw"
              />
            </article>
          </section>
        </div>
      </main>
      <footer className={styles.footer}>
        <div className={home.container}>
          <div className={styles.footerTop}>
            <Link href="/" className={home.brand}>
              CMart<span className={home.brandDot}>.</span>
            </Link>
            <p>Down to earth prices. Out of this world gear.</p>
            <a href="#catalog" className={home.textLink}>
              Keep exploring <ArrowUpRight size={16} />
            </a>
          </div>
          <div className={home.footerBottom}>
            <span>© {new Date().getFullYear()} CMart. All rights reserved.</span>
            <span>
              <span className={home.liveDot} /> BUILT FOR YOUR NEXT CHAPTER
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
export type { ProductsListContent as ProductsListContentType };
