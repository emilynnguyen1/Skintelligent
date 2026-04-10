import { startTransition, useDeferredValue, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  usePersonalizedProductsQuery,
  useRemoveSavedProductMutation,
  useSaveProductMutation,
} from "../api/hooks";
import { PageTransition, Reveal, StaggerGroup } from "../components/Motion";
import { SectionHeadingSkeleton } from "../components/PageSkeletons";
import ProductCard from "../components/ProductCard";
import { ProductGridSkeleton } from "../components/ProductCardSkeleton";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { useNotificationEffect } from "../hooks/useNotificationEffect";
import { formatApiError } from "../lib/formatters";
import { useNotifications } from "../providers/NotificationProvider";
import { colors, fonts } from "../styles/tokens";
import * as s from "../styles/shared";

const categories = ["", "serum", "moisturizer", "cleanser", "treatment"];

export default function LookupPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const deferredSearch = useDeferredValue(search);
  const debouncedSearch = useDebouncedValue(deferredSearch, 350);
  const searchEnabled = debouncedSearch.trim().length >= 2;

  const productsQuery = usePersonalizedProductsQuery(
    {
      search: searchEnabled ? debouncedSearch.trim() : undefined,
      category: category || undefined,
      limit: 12,
    },
    searchEnabled,
  );
  const saveProductMutation = useSaveProductMutation();
  const removeSavedProductMutation = useRemoveSavedProductMutation();
  const notifications = useNotifications();
  const searchError = formatApiError(productsQuery.error);
  const saveError = formatApiError(saveProductMutation.error || removeSavedProductMutation.error);

  useNotificationEffect(
    searchError,
    (api, message) => api.error(message, { title: "Search failed" }),
    [productsQuery.error],
  );
  useNotificationEffect(
    saveError,
    (api, message) => api.error(message, { title: "Couldn't update saved products" }),
    [saveProductMutation.error, removeSavedProductMutation.error],
  );

  const toggleSave = async (product) => {
    if (product.saved) {
      await removeSavedProductMutation.mutateAsync(product.product_id);
      notifications.info(`${product.product_name} removed from saved.`, {
        title: "Removed from saved",
        duration: 2800,
      });
      return;
    }
    await saveProductMutation.mutateAsync(product.product_id);
    notifications.success(`${product.product_name} added to your saved list.`, {
      title: "Saved product",
      duration: 2800,
    });
  };
  const hasResults = Boolean(productsQuery.data?.length);
  const showSkeletonGrid = searchEnabled && productsQuery.isLoading && !hasResults;
  const isUpdatingResults = searchEnabled && productsQuery.isFetching && hasResults;

  return (
    <PageTransition style={{ ...s.page, paddingTop: "6rem" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 3rem" }}>
        <Reveal as="p" delay={40} style={s.sectionLabel}>
          Product Lookup
        </Reveal>
        <Reveal as="h2" delay={100} style={{ ...s.sectionTitle, marginBottom: "0.5rem" }}>
          Search any <em style={s.sectionTitleEm}>product</em>
        </Reveal>
        <Reveal as="p" delay={160} style={{ ...s.sectionSub, marginBottom: "2rem" }}>
          Search by product or brand. Personalized fit scoring starts after two characters.
        </Reveal>

        <Reveal delay={220}>
          <input
            className="motion-input motion-liquid-focus"
            value={search}
            onChange={(event) => {
              const nextValue = event.target.value;
              startTransition(() => setSearch(nextValue));
            }}
            placeholder="Search products or brands..."
            style={{ ...s.inputLarge, marginBottom: "1rem" }}
          />
        </Reveal>

        <StaggerGroup style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem", flexWrap: "wrap" }}>
          {categories.map((entry, index) => (
            <button
              key={entry || "all"}
              type="button"
              className="motion-chip motion-chip-button"
              style={{ ...s.filterPill(category === entry), "--stagger-index": index }}
              onClick={() => setCategory(entry)}
            >
              {entry || "All"}
            </button>
          ))}
        </StaggerGroup>

        <div style={{ minHeight: 560, display: "grid", alignContent: "start" }}>
          {!searchEnabled ? (
            <Reveal
              className="motion-card motion-liquid-surface"
              style={{ ...s.card, textAlign: "center", minHeight: 240, display: "grid", placeItems: "center" }}
            >
              <div>
                <div style={{ fontSize: "2rem", marginBottom: "0.85rem", color: colors.deepRose }}>&#9906;</div>
                <div style={{ fontFamily: fonts.display, fontSize: "1.2rem", marginBottom: "0.45rem" }}>
                  Start typing to search
                </div>
                <p style={{ margin: 0, color: colors.mid, lineHeight: 1.65 }}>
                  Enter at least two characters to search the product catalog with fit scoring.
                </p>
              </div>
            </Reveal>
          ) : showSkeletonGrid ? (
            <>
              <SectionHeadingSkeleton titleWidth="38%" subWidth="28%" marginBottom="1.5rem" />
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                  gap: "1.5rem",
                }}
              >
                <ProductGridSkeleton count={6} />
              </div>
            </>
          ) : hasResults ? (
            <div style={{ position: "relative" }}>
              <div
                style={{
                  fontSize: "0.78rem",
                  color: colors.lightMid,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  marginBottom: "1rem",
                  opacity: isUpdatingResults ? 1 : 0.82,
                  transition: "opacity 180ms ease",
                }}
              >
                {isUpdatingResults ? "Updating results..." : `${productsQuery.data.length} matches`}
              </div>
              <StaggerGroup
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                  gap: "1.5rem",
                  opacity: isUpdatingResults ? 0.84 : 1,
                  transition: "opacity 200ms ease",
                }}
              >
                {productsQuery.data.map((product, index) => (
                  <Reveal key={product.product_id} index={index} variant="reveal" className="product-card-reveal">
                    <ProductCard
                      product={product}
                      onOpen={() => navigate(`/products/${product.product_id}`)}
                      onToggleSave={() => toggleSave(product)}
                      isBusy={saveProductMutation.isPending || removeSavedProductMutation.isPending}
                    />
                  </Reveal>
                ))}
              </StaggerGroup>
            </div>
          ) : (
            <Reveal
              className="motion-card motion-liquid-surface"
              style={{ ...s.card, textAlign: "center", minHeight: 240, display: "grid", placeItems: "center" }}
            >
              <div>
                <div style={{ fontSize: "2rem", marginBottom: "0.85rem", color: colors.deepRose }}>!</div>
                <div style={{ fontFamily: fonts.display, fontSize: "1.2rem", marginBottom: "0.45rem" }}>
                  No products matched
                </div>
                <p style={{ margin: 0, color: colors.mid, lineHeight: 1.65 }}>
                  Try a broader search term or switch back to all categories.
                </p>
              </div>
            </Reveal>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
