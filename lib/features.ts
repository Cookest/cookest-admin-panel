/** Runtime feature flags injected via env vars from the CLI config */
export const features = {
  ai: process.env.COOKEST_AI_ENABLED === "true",
  stripe: process.env.COOKEST_STRIPE_ENABLED === "true",
  pdfPipeline: process.env.COOKEST_PDF_PIPELINE_ENABLED === "true",
  instanceName: process.env.COOKEST_INSTANCE_NAME || "Cookest",
};
