import {
  sampleRuntimeRunContract,
  sampleRuntimeTask,
} from "./fixtures";
import { sampleRuntimeRun } from "./index";

if (sampleRuntimeRun.status !== "running") {
  throw new Error("Sample runtime run status mismatch.");
}

if (sampleRuntimeRunContract.status !== "queued") {
  throw new Error("Sample runtime run contract status mismatch.");
}

if (sampleRuntimeTask.events[0]?.type !== "task.created") {
  throw new Error("Sample runtime task event mismatch.");
}
