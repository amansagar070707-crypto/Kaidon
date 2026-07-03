import { kaidonComponentRegistry, type KaidonRenderedComponent } from "./index";

export const sampleRenderedComponents: KaidonRenderedComponent[] = [
  {
    definition: kaidonComponentRegistry[0],
    props: {
      title: "Live run",
      status: "running",
      progress: 42,
    },
  },
  {
    definition: kaidonComponentRegistry[1],
    props: {
      steps: ["run.created", "run.started", "tool.started"],
    },
  },
  {
    definition: kaidonComponentRegistry[2],
    props: {
      action: "checkpoint",
      label: "Save checkpoint",
    },
  },
];
