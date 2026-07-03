import { AppScaffold } from "../../components/app-scaffold";
import { getCurrentUser } from "../../lib/api/auth";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  return (
    <AppScaffold active="Profile">
      <div className="page-header">
        <div className="page-header__eyebrow">Account</div>
        <h1 className="page-header__title">Profile</h1>
        <p className="page-header__subtitle">
          Manage identity, workspace context, provider preferences, and notification defaults.
        </p>
      </div>

      <div className="grid grid--2" style={{ alignItems: "start", marginBottom: "32px" }}>
        <div className="block">
          <div className="block__title">Personal details</div>
          <div className="block__content" style={{ display: "grid", gap: "12px" }}>
            <div>
              <label className="text-sm text-muted" style={{ display: "block", marginBottom: "4px" }}>Name</label>
              <input value={user?.name ?? "Guest user"} readOnly className="input" />
            </div>
            <div>
              <label className="text-sm text-muted" style={{ display: "block", marginBottom: "4px" }}>Email</label>
              <input value={user?.email ?? "Not signed in"} readOnly className="input" />
            </div>
            <div>
              <label className="text-sm text-muted" style={{ display: "block", marginBottom: "4px" }}>Role</label>
              <input value={user?.role ?? "Guest"} readOnly className="input" />
            </div>
          </div>
        </div>

        <div className="block">
          <div className="block__title">Workspace defaults</div>
          <div className="block__content" style={{ display: "grid", gap: "12px" }}>
            <div>
              <label className="text-sm text-muted" style={{ display: "block", marginBottom: "4px" }}>Workspace</label>
              <input value={user?.workspace ?? "No workspace"} readOnly className="input" />
            </div>
            <div>
              <label className="text-sm text-muted" style={{ display: "block", marginBottom: "4px" }}>Default model</label>
              <input value="openai/gpt-4o-mini" readOnly className="input" />
            </div>
            <div>
              <label className="text-sm text-muted" style={{ display: "block", marginBottom: "4px" }}>Memory scope</label>
              <input value="workspace" readOnly className="input" />
            </div>
          </div>
        </div>
      </div>

      <div className="block">
        <div className="block__title">Runtime preferences</div>
        <div className="block__content">
          <div className="grid gap-3">
            {[
              { label: "Require approval for high-impact actions", enabled: true },
              { label: "Save checkpoints before retries", enabled: true },
              { label: "Notify on failed runs", enabled: true },
              { label: "Allow live generation when enabled by env", enabled: true },
            ].map((pref) => (
              <div key={pref.label} className="flex justify-between items-center" style={{ padding: "12px", background: "var(--color-base)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)" }}>
                <span className="text-sm">{pref.label}</span>
                <span className={`badge ${pref.enabled ? "badge--success" : "badge--default"}`}>
                  {pref.enabled ? "On" : "Off"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppScaffold>
  );
}
