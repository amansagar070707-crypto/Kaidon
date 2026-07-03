import {
  advanceRuntimeRun,
  cancelRuntimeRun,
  checkpointRuntimeRun,
  completeRuntimeRun,
  createRuntimeRunState,
  createRuntimeTask,
  retryRuntimeRun,
  sampleRuntimeRun,
  startRuntimeRun,
} from "./index";
import { sampleAgentDefinition } from "../../apl/src/fixtures";

const task = createRuntimeTask(sampleAgentDefinition, {
  prompt: "Find 2026 AI engineer jobs.",
});

const seededRun = createRuntimeRunState(task);
const startedRun = startRuntimeRun(seededRun);
const advancedRun = advanceRuntimeRun(startedRun, {
  message: "Collected search results.",
  progress: 34,
  currentStep: "Searching public sources.",
});
const checkpointedRun = checkpointRuntimeRun(advancedRun, "Saved after search pass.");
const retriedRun = retryRuntimeRun(checkpointedRun, "Retrying search normalization.");
const canceledRun = cancelRuntimeRun(retriedRun, "Stopped by operator.");
const completedRun = completeRuntimeRun(canceledRun, "Run complete.", {
  resultCount: 3,
});

if (seededRun.status !== "queued") {
  throw new Error("Seeded runtime run should start queued.");
}

if (startedRun.status !== "starting") {
  throw new Error("Runtime run should enter starting state.");
}

if (advancedRun.progress !== 34) {
  throw new Error("Runtime run progress did not update.");
}

if (checkpointedRun.checkpoints.length !== 1) {
  throw new Error("Runtime run checkpoint was not recorded.");
}

if (retriedRun.status !== "retrying") {
  throw new Error("Runtime run retry state mismatch.");
}

if (canceledRun.status !== "canceled") {
  throw new Error("Runtime run cancel state mismatch.");
}

if (completedRun.status !== "succeeded" || completedRun.progress !== 100) {
  throw new Error("Runtime run completion state mismatch.");
}

if (sampleRuntimeRun.status !== "running") {
  throw new Error("Sample runtime run fixture mismatch.");
}
