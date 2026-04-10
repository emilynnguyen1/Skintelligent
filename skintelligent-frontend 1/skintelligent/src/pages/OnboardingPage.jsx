import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { useGenerateRecommendationsMutation, useUpdateMeMutation, useUpsertProfileMutation } from "../api/hooks";
import AnimatedSelect from "../components/AnimatedSelect";
import ChipSelect from "../components/ChipSelect";
import LoadingScreen from "../components/LoadingScreen";
import { PageTransition, Reveal, StaggerGroup } from "../components/Motion";
import { useNotificationEffect } from "../hooks/useNotificationEffect";
import {
  budgetOptions,
  concernOptions,
  defaultProfileValues,
  genderOptions,
  ingredientAvoidOptions,
  ingredientPreferenceOptions,
  productTypeOptions,
  routineOptions,
  sensitivityOptions,
  skinTypeOptions,
} from "../lib/profileOptions";
import { formatApiError } from "../lib/formatters";
import { useNotifications } from "../providers/NotificationProvider";
import { colors, fonts } from "../styles/tokens";
import * as s from "../styles/shared";

const steps = [
  {
    title: "Tell us about you and your skin",
    subtitle: "We use these basics to personalize the experience before ranking products.",
  },
  {
    title: "What are your top concerns?",
    subtitle: "Choose the outcomes you want the product ranking to optimize for.",
  },
  {
    title: "Ingredients and sensitivities",
    subtitle: "Tell us what your skin likes and what should be avoided.",
  },
  {
    title: "Routine and budget",
    subtitle: "Set the final guardrails for how recommendations are ranked.",
  },
];

const currentYear = new Date().getFullYear();
const birthYearOptions = Array.from({ length: currentYear - 1899 }, (_, index) => {
  const year = currentYear - index;
  return {
    label: String(year),
    value: year,
  };
});

function FieldBlock({ label, children }) {
  return (
    <div style={{ marginTop: "1.5rem" }}>
      <div style={{ fontFamily: fonts.display, fontSize: "1rem" }}>{label}</div>
      {children}
    </div>
  );
}

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [isGeneratingSkinPlan, setIsGeneratingSkinPlan] = useState(false);
  const updateMeMutation = useUpdateMeMutation();
  const upsertProfileMutation = useUpsertProfileMutation();
  const generateRecommendationsMutation = useGenerateRecommendationsMutation();
  const notifications = useNotifications();
  const { control, watch, setValue, handleSubmit, trigger } = useForm({
    defaultValues: {
      ...defaultProfileValues,
      gender: "",
      birth_year: undefined,
    },
  });

  const values = watch();
  const isLastStep = step === steps.length - 1;
  const progress = ((step + 1) / steps.length) * 100;
  const onboardingError = formatApiError(
    updateMeMutation.error || upsertProfileMutation.error || generateRecommendationsMutation.error,
  );

  useNotificationEffect(
    onboardingError,
    (api, message) => api.error(message, { title: "Couldn't finish onboarding" }),
    [updateMeMutation.error, upsertProfileMutation.error, generateRecommendationsMutation.error],
  );

  const stepContent = useMemo(() => {
    if (step === 0) {
      return (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "1rem",
              marginTop: "1.5rem",
            }}
          >
            <Controller
              name="gender"
              control={control}
              rules={{ required: "Select a gender option." }}
              render={({ field, fieldState }) => (
                <AnimatedSelect
                  label="Gender"
                  value={field.value}
                  onChange={field.onChange}
                  options={genderOptions}
                  placeholder="Select gender"
                  error={fieldState.error?.message}
                  meta="Fluid, editable anytime"
                />
              )}
            />
            <Controller
              name="birth_year"
              control={control}
              rules={{
                required: "Select your birth year.",
                min: {
                  value: 1900,
                  message: "Birth year must be 1900 or later.",
                },
                max: {
                  value: currentYear,
                  message: `Birth year cannot be later than ${currentYear}.`,
                },
              }}
              render={({ field, fieldState }) => (
                <AnimatedSelect
                  label="Birth Year"
                  value={field.value}
                  onChange={field.onChange}
                  options={birthYearOptions}
                  placeholder="Choose birth year"
                  searchable
                  layout="grid"
                  searchPlaceholder="Search year"
                  error={fieldState.error?.message}
                  meta={field.value ? "Birth year selected" : "Search or scroll"}
                />
              )}
            />
          </div>
          <FieldBlock label="Skin Type">
            <ChipSelect
              items={skinTypeOptions}
              selected={values.skin_type}
              onChange={(value) => setValue("skin_type", value, { shouldDirty: true })}
              multi={false}
            />
          </FieldBlock>
        </>
      );
    }

    if (step === 1) {
      return (
        <FieldBlock label="Top Concerns">
          <ChipSelect
            items={concernOptions}
            selected={values.skin_concerns}
            onChange={(nextValues) => setValue("skin_concerns", nextValues, { shouldDirty: true })}
          />
        </FieldBlock>
      );
    }

    if (step === 2) {
      return (
        <>
          <FieldBlock label="Ingredients You Love">
            <ChipSelect
              items={ingredientPreferenceOptions}
              selected={values.ingredient_preferences}
              onChange={(nextValues) =>
                setValue("ingredient_preferences", nextValues, { shouldDirty: true })
              }
            />
          </FieldBlock>
          <FieldBlock label="Ingredients to Avoid">
            <ChipSelect
              items={ingredientAvoidOptions}
              selected={values.ingredient_avoid}
              onChange={(nextValues) => setValue("ingredient_avoid", nextValues, { shouldDirty: true })}
            />
          </FieldBlock>
          <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap", marginTop: "1.5rem" }}>
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
          </div>
        </>
      );
    }

    return (
      <>
        <FieldBlock label="Skin Sensitivity">
          <ChipSelect
            items={sensitivityOptions}
            selected={values.skin_sensitivity}
            onChange={(value) => setValue("skin_sensitivity", value, { shouldDirty: true })}
            multi={false}
          />
        </FieldBlock>
        <FieldBlock label="Budget Range">
          <ChipSelect
            items={budgetOptions}
            selected={values.budget_range}
            onChange={(value) => setValue("budget_range", value, { shouldDirty: true })}
            multi={false}
          />
        </FieldBlock>
        <FieldBlock label="Routine Level">
          <ChipSelect
            items={routineOptions}
            selected={values.routine_level}
            onChange={(value) => setValue("routine_level", value, { shouldDirty: true })}
            multi={false}
          />
        </FieldBlock>
        <FieldBlock label="Preferred Product Types">
          <ChipSelect
            items={productTypeOptions}
            selected={values.preferred_product_types}
            onChange={(nextValues) =>
              setValue("preferred_product_types", nextValues, { shouldDirty: true })
            }
          />
        </FieldBlock>
      </>
    );
  }, [control, setValue, step, values]);

  const onSubmit = async () => {
    const { gender, birth_year, ...profileValues } = values;
    setIsGeneratingSkinPlan(true);
    try {
      await updateMeMutation.mutateAsync({ gender, birth_year });
      await upsertProfileMutation.mutateAsync(profileValues);
      await generateRecommendationsMutation.mutateAsync({ limit: 6 });
      notifications.success("Your profile is ready and recommendations are live.", {
        title: "Welcome to Skintelligent",
        duration: 3400,
      });
      navigate("/dashboard", { replace: true });
    } finally {
      setIsGeneratingSkinPlan(false);
    }
  };

  const handleContinue = async () => {
    if (step === 0) {
      const isStepValid = await trigger(["gender", "birth_year"]);
      if (!isStepValid) {
        return;
      }
    }

    setStep((current) => current + 1);
  };

  return (
    <PageTransition
      style={{
        ...s.page,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "2rem",
      }}
    >
      <div style={{ width: "100%", maxWidth: 680 }}>
        <Reveal
          delay={40}
          style={{
            height: 7,
            background: colors.border,
            borderRadius: 100,
            marginBottom: "2.5rem",
            overflow: "hidden",
          }}
        >
          <div
            className="motion-progress-fill progress-sheen"
            style={{
              height: "100%",
              width: `${progress}%`,
              background: `linear-gradient(90deg, ${colors.terracotta}, ${colors.deepRose}, ${colors.blush})`,
              borderRadius: 100,
            }}
          />
        </Reveal>

        <Reveal className="motion-card motion-liquid-surface" style={s.card} variant="liquid">
          <p style={s.sectionLabel}>Step {step + 1} of 4</p>
          <h2 style={{ ...s.sectionTitle, marginBottom: "0.5rem" }}>{steps[step].title}</h2>
          <p style={s.sectionSub}>{steps[step].subtitle}</p>

          <Reveal key={step} delay={80} variant="bounce">
            {stepContent}
          </Reveal>

          <div style={{ display: "flex", gap: "1rem", marginTop: "2.5rem", flexWrap: "wrap" }}>
            {step > 0 ? (
              <button
                type="button"
                className="motion-button"
                style={s.btnGhost}
                onClick={() => setStep((current) => current - 1)}
              >
                Back
              </button>
            ) : null}
            {isLastStep ? (
              <button
                type="button"
                className="motion-button"
                style={s.btnPrimary}
                onClick={handleSubmit(onSubmit)}
                disabled={
                  updateMeMutation.isPending ||
                  upsertProfileMutation.isPending ||
                  generateRecommendationsMutation.isPending
                }
              >
                {updateMeMutation.isPending ||
                upsertProfileMutation.isPending ||
                generateRecommendationsMutation.isPending
                  ? "Saving profile..."
                  : "Save profile"}
              </button>
            ) : (
              <button
                type="button"
                className="motion-button"
                style={s.btnPrimary}
                onClick={handleContinue}
              >
                Continue
              </button>
            )}
          </div>
        </Reveal>
      </div>
      <LoadingScreen
        active={isGeneratingSkinPlan}
        eyebrow="Building your first routine"
        title="Give Us a Moment While We Create Your Perfect Skin"
        message="We’re matching ingredients, skin concerns, sensitivity, and budget to build your first personalized lineup."
        chips={["Matching ingredients", "Scoring product fit", "Preparing your results"]}
      />
    </PageTransition>
  );
}
