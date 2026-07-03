import { AppScaffold } from "../../components/app-scaffold";

export default function CloudPage() {
  return (
    <AppScaffold active="Cloud">
      <div className="page-header">
        <div className="page-header__eyebrow">Deployments</div>
        <h1 className="page-header__title">Cloud</h1>
        <p className="page-header__subtitle">
          Deployment targets, rollout visibility, and runtime health across environments.
        </p>
      </div>

      <div className="grid grid--4" style={{ marginBottom: "32px" }}>
        <div className="block stat-block">
          <div className="stat-block__label">Environments</div>
          <div className="stat-block__value">3</div>
        </div>
        <div className="block stat-block">
          <div className="stat-block__label">Healthy Runs</div>
          <div className="stat-block__value">97%</div>
        </div>
        <div className="block stat-block">
          <div className="stat-block__label">Pending Rollouts</div>
          <div className="stat-block__value">2</div>
        </div>
        <div className="block stat-block">
          <div className="stat-block__label">Recoveries</div>
          <div className="stat-block__value">6</div>
        </div>
      </div>

      <div className="grid grid--3">
        <div className="block">
          <div className="block__eyebrow">Targets</div>
          <div className="block__title">Environments</div>
          <div className="block__description">
            Bind agents to local, preview, and production targets with clear runtime semantics.
          </div>
          <div className="flex gap-2 mt-3">
            <span className="badge badge--default">local</span>
            <span className="badge badge--default">preview</span>
            <span className="badge badge--success">prod</span>
          </div>
        </div>
        <div className="block">
          <div className="block__eyebrow">Versioning</div>
          <div className="block__title">Rollouts</div>
          <div className="block__description">
            Track what version is active, what is pending, and what must be rolled back.
          </div>
          <div className="flex gap-2 mt-3">
            <span className="badge badge--success">active</span>
            <span className="badge badge--warning">pending</span>
          </div>
        </div>
        <div className="block">
          <div className="block__eyebrow">Durable</div>
          <div className="block__title">Recovery</div>
          <div className="block__description">
            Resume failed work from durable checkpoints instead of restarting whole chains.
          </div>
          <div className="text-sm text-muted mt-3">6 recoveries in last 24h</div>
        </div>
      </div>
    </AppScaffold>
  );
}
