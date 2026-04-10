function option(label, value = label.toLowerCase()) {
  return { label, value };
}

export const genderOptions = [
  option("Male", "male"),
  option("Female", "female"),
  option("Prefer not to say", "prefer not to say"),
];

export const skinTypeOptions = [
  option("Oily", "oily"),
  option("Dry", "dry"),
  option("Combination", "combination"),
  option("Normal", "normal"),
  option("Sensitive", "sensitive"),
];

export const concernOptions = [
  option("Acne", "acne"),
  option("Dark Spots", "dark spots"),
  option("Large Pores", "large pores"),
  option("Oiliness", "oiliness"),
  option("Dryness", "dryness"),
  option("Redness", "redness"),
  option("Sensitive Skin", "sensitive skin"),
  option("Dullness", "dullness"),
  option("Uneven Skin Tone", "uneven skin tone"),
  option("Texture", "texture"),
  option("Acne Scars", "acne scars"),
  option("Fine Lines / Wrinkles", "fine lines / wrinkles"),
];

export const ingredientPreferenceOptions = [
  option("Niacinamide", "niacinamide"),
  option("Ceramides", "ceramides"),
  option("Hyaluronic Acid", "hyaluronic acid"),
  option("Retinol", "retinol"),
  option("Vitamin C", "vitamin c"),
  option("Salicylic Acid", "salicylic acid"),
  option("Peptides", "peptides"),
  option("Squalane", "squalane"),
  option("Azelaic Acid", "azelaic acid"),
  option("Green Tea", "green tea"),
  option("Tranexamic Acid", "tranexamic acid"),
];

export const ingredientAvoidOptions = [
  option("Fragrance", "fragrance"),
  option("Alcohol", "alcohol"),
  option("Tea Tree", "tea tree"),
  option("Essential Oils", "essential oils"),
  option("Silicones", "silicones"),
  option("Mineral Oil", "mineral oil"),
];

export const sensitivityOptions = [
  option("Low", "low"),
  option("Medium", "medium"),
  option("High", "high"),
  option("Very High", "very high"),
];

export const budgetOptions = [
  option("Low", "low"),
  option("Mid", "mid"),
  option("High", "high"),
  option("Luxury", "luxury"),
];

export const routineOptions = [
  option("Basic", "basic"),
  option("Intermediate", "intermediate"),
  option("Advanced", "advanced"),
];

export const productTypeOptions = [
  option("Serum", "serum"),
  option("Moisturizer", "moisturizer"),
  option("Cleanser", "cleanser"),
  option("Treatment", "treatment"),
  option("SPF", "spf"),
];

export const defaultProfileValues = {
  skin_type: "combination",
  skin_concerns: [],
  ingredient_preferences: [],
  ingredient_avoid: [],
  acne_prone: false,
  fragrance_allergy: false,
  skin_sensitivity: "medium",
  budget_range: "mid",
  routine_level: "basic",
  preferred_product_types: [],
};
