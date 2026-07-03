import {
  kaidonComponentRegistry,
  listPublicComponents,
  getRegisteredComponent,
  type KaidonRenderedComponent,
} from "./index";

export const sampleComponentRender: KaidonRenderedComponent = {
  definition: kaidonComponentRegistry[0],
  props: {
    title: "Live run",
    status: "running",
    progress: 42,
  },
};

export const samplePublicComponentCount = listPublicComponents().length;
export const sampleResolvedComponent = getRegisteredComponent("runtime-status-card");
