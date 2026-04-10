import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  useGenerateRecommendationsMutation,
  useMeQuery,
  usePersonalizedProductsQuery,
  useRecommendationsQuery,
  useRemoveSavedProductMutation,
  useSavedProductsQuery,
  useSaveProductMutation,
} from "../api/hooks";
import LoadingScreen from "../components/LoadingScreen";
import { PageTransition, Reveal, StaggerGroup } from "../components/Motion";
import { DashboardHeroSkeleton, SectionHeadingSkeleton } from "../components/PageSkeletons";
import ProductCard from "../components/ProductCard";
import { ProductGridSkeleton } from "../components/ProductCardSkeleton";
import { useNotificationEffect } from "../hooks/useNotificationEffect";
import { formatApiError, formatDateTime } from "../lib/formatters";
import { useAuth } from "../providers/AuthProvider";
import { useNotifications } from "../providers/NotificationProvider";
import { colors, fonts } from "../styles/tokens";
import * as s from "../styles/shared";

const dashboardFetchLimit = 12;
const dashboardVisibleLimit = 6;
const cardExitDurationMs = 520;

function profileLabels(profile) {
  if (!profile) {
    return [];
  }

  return [
    profile.skin_type,
    ...profile.skin_concerns.slice(0, 2),
    ...profile.ingredient_preferences.slice(0, 2),
  ];
}

const filters = [
  { id: "all", label: "All Products" },
  { id: "high-fit", label: "High Fit (75+)" },
  { id: "saved", label: "Saved" },
];

const productGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
  gap: "1.5rem",
  marginTop: "1.5rem",
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [filter, setFilter] = useState("all");
  const [pendingProductId, setPendingProductId] = useState(null);
  const [cardTransitions, setCardTransitions] = useState([]);
  const meQuery = useMeQuery(true);
  const recommendationsQuery = useRecommendationsQuery({ limit: dashboardVisibleLimit, useCached: true }, true);
  const productsQuery = usePersonalizedProductsQuery({ limit: dashboardFetchLimit }, true);
  const savedProductsQuery = useSavedProductsQuery(true);
  const generateRecommendationsMutation = useGenerateRecommendationsMutation();
  const saveProductMutation = useSaveProductMutation();
  const removeSavedProductMutation = useRemoveSavedProductMutation();
  const activeSaveMutation = saveProductMutation.isPending || removeSavedProductMutation.isPending;

  const displayUser = meQuery.data || user;
  const products = productsQuery.data || [];
  const notifications = useNotifications();
  const dataError = formatApiError(productsQuery.error || recommendationsQuery.error || savedProductsQuery.error);
  const refreshError = formatApiError(generateRecommendationsMutation.error);
  const saveError = formatApiError(saveProductMutation.error || removeSavedProductMutation.error);
  const isInitialLoading =
    (productsQuery.isLoading && !productsQuery.data) ||
    (recommendationsQuery.isLoading && !recommendationsQuery.data) ||
    (savedProductsQuery.isLoading && !savedProductsQuery.data);

  useNotificationEffect(
    dataError,
    (api, message) => api.error(message, { title: "Couldn't load recommendations" }),
    [productsQuery.error, recommendationsQuery.error, savedProductsQuery.error],
  );
  useNotificationEffect(
    refreshError,
    (api, message) => api.error(message, { title: "Refresh failed" }),
    [generateRecommendationsMutation.error],
  );
  useNotificationEffect(
    saveError,
    (api, message) => api.error(message, { title: "Couldn't update saved products" }),
    [saveProductMutation.error, removeSavedProductMutation.error],
  );

  const filteredProducts = useMemo(() => {
    const discoveryProducts = products.filter((product) => !product.saved);

    if (filter === "high-fit") {
      return discoveryProducts
        .filter((product) => product.final_score >= 0.75)
        .slice(0, dashboardVisibleLimit);
    }
    if (filter === "saved") {
      return products.filter((product) => product.saved).slice(0, dashboardVisibleLimit);
    }
    return discoveryProducts.slice(0, dashboardVisibleLimit);
  }, [filter, products]);

  const renderedProducts = useMemo(() => {
    if (!cardTransitions.length) {
      return filteredProducts;
    }

    const result = [...filteredProducts];
    cardTransitions
      .filter((entry) => entry.view === filter)
      .sort((left, right) => left.index - right.index)
      .forEach((entry) => {
        if (result.some((product) => product.product_id === entry.product.product_id)) {
          return;
        }
        result.splice(
          Math.min(entry.index, result.length),
          0,
          { ...entry.product, _transitionState: entry.transitionState },
        );
      });

    return result.slice(0, dashboardVisibleLimit);
  }, [cardTransitions, filter, filteredProducts]);

  const loadingScreenConfig = useMemo(() => {
    if (generateRecommendationsMutation.isPending) {
      return {
        eyebrow: "Refreshing your routine",
        title: "Give Us a Moment While We Refresh Your Perfect Skin",
        message:
          "We’re re-ranking your top products and checking the best fit for your updated shortlist.",
        chips: ["Refreshing scores", "Checking ingredient fit", "Rebuilding your feed"],
      };
    }

    if (activeSaveMutation && pendingProductId !== null) {
      return {
        eyebrow: "Updating your shortlist",
        title: "Give Us a Moment While We Update Your Favorites",
        message:
          "We’re saving your latest pick and smoothing the next recommendations into view.",
        chips: ["Saving your favorite", "Preparing the next best match", "Updating your shortlist"],
      };
    }

    if (isInitialLoading) {
      return {
        eyebrow: "Loading your recommendations",
        title: "Give Us a Moment While We Load Your Perfect Skin",
        message:
          "We’re pulling your profile, saved products, and recommended matches into one view.",
        chips: ["Loading your profile", "Fetching product matches", "Preparing your dashboard"],
      };
    }

    return null;
  }, [
    activeSaveMutation,
    generateRecommendationsMutation.isPending,
    isInitialLoading,
    pendingProductId,
  ]);

  const queueCardTransition = (product, transitionState) => {
    const index = renderedProducts.findIndex((entry) => entry.product_id === product.product_id);
    setCardTransitions((current) => [
      ...current.filter((entry) => entry.product.product_id !== product.product_id),
      {
        product,
        transitionState,
        view: product.saved ? "saved" : filter,
        index: index >= 0 ? index : 0,
      },
    ]);

    window.setTimeout(() => {
      setCardTransitions((current) =>
        current.filter((entry) => entry.product.product_id !== product.product_id),
      );
    }, cardExitDurationMs);
  };

  const toggleSave = async (product) => {
    queueCardTransition(product, product.saved ? "releasing" : "saving");
    setPendingProductId(product.product_id);
    try {
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
    } finally {
      setPendingProductId((current) => (current === product.product_id ? null : current));
    }
  };

  return (
    <PageTransition style={{ ...s.page, paddingTop: "6rem" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem 3rem" }}>
        {isInitialLoading ? (
          <DashboardHeroSkeleton />
        ) : (
          <Reveal
            variant="liquid"
            className="motion-card motion-liquid-surface"
            style={{
              ...s.card,
              marginBottom: "3rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "1.5rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "1.2rem" }}>
              <div
                className="motion-stat"
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${colors.blush}, ${colors.sage})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.1rem",
                  color: colors.charcoal,
                }}
              >
                {displayUser?.name?.[0] || "S"}
              </div>
              <div>
                <div style={{ fontFamily: fonts.display, fontSize: "1.15rem", marginBottom: "0.2rem" }}>
                  {displayUser?.name}'s Skin Profile
                </div>
                <div
                  style={{
                    fontSize: "0.78rem",
                    color: colors.lightMid,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {displayUser?.profile?.skin_type || "profile pending"}
                </div>
              </div>
            </div>

            <StaggerGroup style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
              {profileLabels(displayUser?.profile).map((label, index) => (
                <Reveal
                  key={label}
                  as="span"
                  index={index}
                  variant="pop"
                  style={{
                    padding: "0.35rem 0.8rem",
                    borderRadius: "999px",
                    background: "rgba(74,92,69,0.08)",
                    color: colors.moss,
                    fontSize: "0.76rem",
                  }}
                >
                  {label}
                </Reveal>
              ))}
            </StaggerGroup>

            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <button
                type="button"
                className="motion-button"
                style={s.inlineAction}
                onClick={() => navigate("/profile")}
              >
                Edit Profile
              </button>
              <button
                type="button"
                className="motion-button"
                style={s.btnPrimary}
                onClick={async () => {
                  await generateRecommendationsMutation.mutateAsync({ limit: 6 });
                  notifications.info("Your recommendations were refreshed.", {
                    title: "Recommendations updated",
                    duration: 3200,
                  });
                }}
                disabled={generateRecommendationsMutation.isPending}
              >
                {generateRecommendationsMutation.isPending ? "Refreshing..." : "Refresh Recommendations"}
              </button>
            </div>
          </Reveal>
        )}

        {isInitialLoading ? (
          <SectionHeadingSkeleton titleWidth="42%" subWidth="34%" />
        ) : (
          <>
            <Reveal as="p" delay={40} style={s.sectionLabel}>
              Your Recommendations
            </Reveal>
            <Reveal as="h2" delay={100} style={{ ...s.sectionTitle, marginBottom: "0.5rem" }}>
              Products ranked for <em style={s.sectionTitleEm}>your skin</em>
            </Reveal>
            <Reveal as="p" delay={150} style={{ ...s.sectionSub, marginBottom: "2rem" }}>
              Generated {formatDateTime(recommendationsQuery.data?.generated_at)}. Saved shortlist:{" "}
              {savedProductsQuery.data?.length || 0}.
            </Reveal>
          </>
        )}

        <div style={{ minHeight: 36, marginBottom: "2rem" }}>
          {isInitialLoading ? (
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }} aria-hidden="true">
              {filters.map((entry) => (
                <div
                  key={entry.id}
                  style={{
                    height: 36,
                    minWidth: entry.id === "high-fit" ? 120 : 94,
                    borderRadius: 999,
                    background: "linear-gradient(180deg, rgba(255,255,255,0.78), rgba(247,239,233,0.92))",
                    border: "1px solid rgba(196, 120, 88, 0.08)",
                  }}
                />
              ))}
            </div>
          ) : (
            <StaggerGroup style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {filters.map((entry, index) => (
                <button
                  key={entry.id}
                  type="button"
                  className="motion-chip motion-chip-button"
                  style={{ ...s.filterPill(filter === entry.id), "--stagger-index": index }}
                  onClick={() => setFilter(entry.id)}
                >
                  {entry.label}
                </button>
              ))}
            </StaggerGroup>
          )}
        </div>

        <div style={{ minHeight: 430 }}>
          {isInitialLoading ? (
            <div style={productGridStyle}>
              <ProductGridSkeleton count={6} />
            </div>
          ) : filteredProducts.length ? (
            <StaggerGroup style={productGridStyle}>
              {renderedProducts.map((product, index) => (
                <Reveal key={product.product_id} index={index} variant="reveal" className="product-card-reveal">
                  <ProductCard
                    product={product}
                    onOpen={() => navigate(`/products/${product.product_id}`)}
                    onToggleSave={() => toggleSave(product)}
                    isBusy={activeSaveMutation && pendingProductId === product.product_id}
                    transitionState={product._transitionState || "idle"}
                  />
                </Reveal>
              ))}
            </StaggerGroup>
          ) : (
            <Reveal
              className="motion-card motion-liquid-surface"
              style={{ ...s.card, textAlign: "center", minHeight: 220, display: "grid", placeItems: "center" }}
            >
              No products match this filter right now.
            </Reveal>
          )}
        </div>
      </div>
      <LoadingScreen
        active={generateRecommendationsMutation.isPending || isInitialLoading}
        {...loadingScreenConfig}
      />
    </PageTransition>
  );
}
