import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { useGenerateRecommendationsMutation, useProfileQuery, useUpsertProfileMutation } from "../api/hooks";
import ChipSelect from "../components/ChipSelect";
import LoadingScreen from "../components/LoadingScreen";
import { PageTransition, Reveal } from "../components/Motion";
import { ProfileFormSkeleton } from "../components/PageSkeletons";
import { formatApiError } from "../lib/formatters";
import { useNotificationEffect } from "../hooks/useNotificationEffect";
import {
  budgetOptions,
  concernOptions,
  defaultProfileValues,
  ingredientAvoidOptions,
  ingredientPreferenceOptions,
  productTypeOptions,
  routineOptions,
  sensitivityOptions,
  skinTypeOptions,
} from "../lib/profileOptions";
import { useNotifications } from "../providers/NotificationProvider";
import { fonts } from "../styles/tokens";
import * as s from "../styles/shared";

function FieldBlock({ label, children, delay = 0 }) {
  return (
    <Reveal delay={delay} style={{ marginBottom: "2rem" }}>
      <div style={{ fontFamily: fonts.display, fontSize: "1rem", marginBottom: "0.3rem" }}>{label}</div>
      {children}
    </Reveal>
  );
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const [isApplyingProfile, setIsApplyingProfile] = useState(false);
  const profileQuery = useProfileQuery();
  const upsertProfileMutation = useUpsertProfileMutation();
  const generateRecommendationsMutation = useGenerateRecommendationsMutation();
  const notifications = useNotifications();
  const { watch, setValue, handleSubmit, reset } = useForm({
    defaultValues: defaultProfileValues,
  });
  const values = watch();
  const profileError = formatApiError(upsertProfileMutation.error || generateRecommendationsMutation.error);

  useNotificationEffect(
    profileError,
    (api, message) => api.error(message, { title: "Couldn't save profile" }),
    [generateRecommendationsMutation.error, upsertProfileMutation.error],
  );

  useEffect(() => {
    if (profileQuery.data) {
      reset({
        ...defaultProfileValues,
        ...profileQuery.data,
      });
    }
  }, [profileQuery.data, reset]);

  const onSubmit = async () => {
    setIsApplyingProfile(true);
    try {
      await upsertProfileMutation.mutateAsync(values);
      await generateRecommendationsMutation.mutateAsync({ limit: 6 });
      notifications.success("Your skin profile is up to date.", { title: "Profile saved" });
      navigate("/dashboard", { replace: true });
    } finally {
      setIsApplyingProfile(false);
    }
  };

  return (
    <PageTransition style={{ ...s.page, paddingTop: "6rem" }}>
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "2rem 3rem" }}>
        {profileQuery.isLoading && !profileQuery.data ? (
          <ProfileFormSkeleton />
        ) : (
          <Reveal className="motion-card motion-liquid-surface" style={s.card} variant="liquid">
            <p style={s.sectionLabel}>Your Profile</p>
            <h2 style={{ ...s.sectionTitle, marginBottom: "2rem" }}>
              Edit skin <em style={s.sectionTitleEm}>profile</em>
            </h2>

            <FieldBlock label="Skin Type" delay={40}>
              <ChipSelect
                items={skinTypeOptions}
                selected={values.skin_type}
                onChange={(value) => setValue("skin_type", value, { shouldDirty: true })}
                multi={false}
              />
            </FieldBlock>
            <FieldBlock label="Concerns" delay={70}>
              <ChipSelect
                items={concernOptions}
                selected={values.skin_concerns}
                onChange={(nextValues) => setValue("skin_concerns", nextValues, { shouldDirty: true })}
              />
            </FieldBlock>
            <FieldBlock label="Ingredients You Love" delay={100}>
              <ChipSelect
                items={ingredientPreferenceOptions}
                selected={values.ingredient_preferences}
                onChange={(nextValues) =>
                  setValue("ingredient_preferences", nextValues, { shouldDirty: true })
                }
              />
            </FieldBlock>
            <FieldBlock label="Ingredients to Avoid" delay={130}>
              <ChipSelect
                items={ingredientAvoidOptions}
                selected={values.ingredient_avoid}
                onChange={(nextValues) => setValue("ingredient_avoid", nextValues, { shouldDirty: true })}
              />
            </FieldBlock>
            <FieldBlock label="Skin Sensitivity" delay={160}>
              <ChipSelect
                items={sensitivityOptions}
                selected={values.skin_sensitivity}
                onChange={(value) => setValue("skin_sensitivity", value, { shouldDirty: true })}
                multi={false}
              />
            </FieldBlock>
            <FieldBlock label="Budget Range" delay={190}>
              <ChipSelect
                items={budgetOptions}
                selected={values.budget_range}
                onChange={(value) => setValue("budget_range", value, { shouldDirty: true })}
                multi={false}
              />
            </FieldBlock>
            <FieldBlock label="Routine Level" delay={220}>
              <ChipSelect
                items={routineOptions}
                selected={values.routine_level}
                onChange={(value) => setValue("routine_level", value, { shouldDirty: true })}
                multi={false}
              />
            </FieldBlock>
            <FieldBlock label="Preferred Product Types" delay={250}>
              <ChipSelect
                items={productTypeOptions}
                selected={values.preferred_product_types}
                onChange={(nextValues) =>
                  setValue("preferred_product_types", nextValues, { shouldDirty: true })
                }
              />
            </FieldBlock>

            <Reveal
              delay={280}
              style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap", marginBottom: "1.5rem" }}
            >
              <button
                type="button"
                className="motion-chip"
                style={s.chip(values.acne_prone)}
                onClick={() => setValue("acne_prone", !values.acne_prone, { shouldDirty: true })}
              >
                Acne-prone
              </button>
              <button
                type="button"
                className="motion-chip"
                style={s.chip(values.fragrance_allergy)}
                onClick={() =>
                  setValue("fragrance_allergy", !values.fragrance_allergy, { shouldDirty: true })
                }
              >
                Fragrance allergy
              </button>
            </Reveal>

            <button
              type="button"
              className="motion-button"
              style={s.btnPrimary}
              onClick={handleSubmit(onSubmit)}
              disabled={upsertProfileMutation.isPending || generateRecommendationsMutation.isPending}
            >
              {upsertProfileMutation.isPending || generateRecommendationsMutation.isPending
                ? "Saving..."
                : "Save Changes"}
            </button>
          </Reveal>
        )}
      </div>
      <LoadingScreen
        active={isApplyingProfile}
        eyebrow="Updating your profile"
        title="Give Us a Moment While We Refresh Your Perfect Skin"
        message="We're saving your updated skin profile and rebuilding the best matches for your new combination."
        chips={["Saving your profile", "Refreshing recommendation scores", "Preparing your dashboard"]}
      />
    </PageTransition>
  );
}
