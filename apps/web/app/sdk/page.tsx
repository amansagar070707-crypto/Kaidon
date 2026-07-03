import { AppScaffold } from "../../components/app-scaffold";

export default function SdkPage() {
  return (
    <AppScaffold active="SDK">
      <div className="page-header">
        <div className="page-header__eyebrow">Developer SDK</div>
        <h1 className="page-header__title">SDK</h1>
        <p className="page-header__subtitle">
          Typed building blocks for agent definitions, runs, tools, and event streams.
        </p>
      </div>

      <div className="grid grid--4" style={{ marginBottom: "32px" }}>
        <div className="block stat-block">
          <div className="stat-block__label">Packages</div>
          <div className="stat-block__value">4</div>
        </div>
        <div className="block stat-block">
          <div className="stat-block__label">Typed Contracts</div>
          <div className="stat-block__value">12</div>
        </div>
        <div className="block stat-block">
          <div className="stat-block__label">Examples</div>
          <div className="stat-block__value">6</div>
        </div>
        <div className="block stat-block">
          <div className="stat-block__label">Adapters</div>
          <div className="stat-block__value">3</div>
        </div>
      </div>

      <div className="grid grid--3">
        <div className="block">
          <div className="block__eyebrow">Spec</div>
          <div className="block__title">Agent Definition</div>
          <div className="block__description">
            Define agent metadata, permissions, tools, and execution semantics through typed contracts.
          </div>
          <div className="block__content">
            <div className="code-block">createAgent()</div>
          </div>
        </div>
        <div className="block">
          <div className="block__eyebrow">Runs</div>
          <div className="block__title">Run Control</div>
          <div className="block__description">
            Start, stop, resume, and inspect runs with explicit lifecycle and durable identifiers.
          </div>
          <div className="block__content">
            <div className="code-block">sdk.runs.execute()</div>
          </div>
        </div>
        <div className="block">
          <div className="block__eyebrow">Tools</div>
          <div className="block__title">Tool Boundary</div>
          <div className="block__description">
            Expose approved tools through stable interfaces instead of prompt-only glue code.
          </div>
          <div className="block__content">
            <div className="code-block">sdk.tools.register()</div>
          </div>
        </div>
      </div>
    </AppScaffold>
  );
}
