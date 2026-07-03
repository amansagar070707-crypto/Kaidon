import { AppScaffold } from "../../components/app-scaffold";
import { OverviewCard, OverviewGrid, OverviewSection } from "../../components/overview-primitives";
import { StudioBuilder } from "../../components/studio-builder";
import { fetchHarnessList } from "../../lib/api/harness";
import { getProviderStatus } from "../../lib/state/provider";

export default async function StudioPage() {
  const harness = await fetchHarnessList();
  const provider = await getProviderStatus();

  if (!harness.latest) {
    return (
      <AppScaffold active="Studio" subtitle="Visual Builder">
        <OverviewSection eyebrow="Harness backend" title="Studio unavailable">
          <OverviewGrid>
            <OverviewCard
              title="Backend required"
              description="Studio now reads harness state only from the backend service."
              badges={["backend-only", "studio"]}
              meta={harness.error ?? "No harness data returned."}
            />
          </OverviewGrid>
        </OverviewSection>
      </AppScaffold>
    );
  }

  return (
    <AppScaffold active="Studio" subtitle="Visual Builder">
      <StudioBuilder initialModel={harness.latest} provider={provider} />
    </AppScaffold>
  );
}
