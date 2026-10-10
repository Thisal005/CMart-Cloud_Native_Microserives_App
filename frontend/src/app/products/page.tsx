import { Suspense } from "react";
import ProductsListContent from "./products-list-content";
import styles from "../home.module.css";

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className={styles.home}>
          <div className={styles.catalogState} role="status">
            Loading the collection…
          </div>
        </div>
      }
    >
      <ProductsListContent />
    </Suspense>
  );
}
