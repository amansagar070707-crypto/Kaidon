import { AppScaffold } from "../../components/app-scaffold";

export default function CliPage() {
  return (
    <AppScaffold active="CLI">
      <div className="page-header">
        <div className="page-header__eyebrow">Command Line</div>
        <h1 className="page-header__title">CLI</h1>
        <p className="page-header__subtitle">
          The fastest path from local agent definition to validated run and deployment workflow.
        </p>
      </div>

      <div className="grid grid--4" style={{ marginBottom: "32px" }}>
        <div className="block stat-block">
          <div className="stat-block__label">Commands</div>
          <div className="stat-block__value">5</div>
        </div>
        <div className="block stat-block">
          <div className="stat-block__label">Templates</div>
          <div className="stat-block__value">3</div>
        </div>
        <div className="block stat-block">
          <div className="stat-block__label">Checks</div>
          <div className="stat-block__value">9</div>
        </div>
        <div className="block stat-block">
          <div className="stat-block__label">Targets</div>
          <div className="stat-block__value">2</div>
        </div>
      </div>

      <div className="grid grid--3">
        <div className="block">
          <div className="block__eyebrow">Bootstrap</div>
          <div className="block__title">Init</div>
          <div className="block__description">
            Scaffold a project with the right files, contracts, and dev defaults from day one.
          </div>
          <div className="block__content">
            <div className="code-block">kaidon init</div>
          </div>
        </div>
        <div className="block">
          <div className="block__eyebrow">Compile</div>
          <div className="block__title">Validate</div>
          <div className="block__description">
            Catch contract, permission, and packaging errors before runtime execution.
          </div>
          <div className="block__content">
            <div className="code-block">kaidon validate</div>
          </div>
        </div>
        <div className="block">
          <div className="block__eyebrow">Deploy</div>
          <div className="block__title">Run & Deploy</div>
          <div className="block__description">
            Execute locally with trace output, then package the same definition for deployment.
          </div>
          <div className="block__content">
            <div className="code-block">kaidon run | kaidon deploy</div>
          </div>
        </div>
      </div>
    </AppScaffold>
  );
}
