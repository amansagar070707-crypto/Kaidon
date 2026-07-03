import {
  sampleComponentRender,
  samplePublicComponentCount,
  sampleResolvedComponent,
} from "./contract-fixtures";

if (sampleComponentRender.definition.id !== "runtime-status-card") {
  throw new Error("Sample component render mismatch.");
}

if (samplePublicComponentCount < 4) {
  throw new Error("Expected at least four public components.");
}

if (sampleResolvedComponent?.name !== "Runtime Status Card") {
  throw new Error("Component registry lookup mismatch.");
}
