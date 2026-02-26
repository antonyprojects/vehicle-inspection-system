import { useState, useEffect } from "react";
import type { Vehicle, Check } from "./types";
import { api } from "./api";

type IssueFilter = "all" | "true" | "false";

interface Props {
  refreshTrigger?: number;
  onDelete: () => void;
  showToast: (message: string, type: "success" | "error") => void;
}

export function CheckHistory({ refreshTrigger, onDelete, showToast }: Props) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [hasIssueFilter, setHasIssueFilter] = useState<IssueFilter>("all");
  const [checks, setChecks] = useState<Check[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [lastFetchedParams, setLastFetchedParams] = useState<{
    vehicle: string;
    filter: IssueFilter;
    trigger: number | undefined;
  } | null>(null);

  const loading =
    selectedVehicle !== "" &&
    (lastFetchedParams === null ||
      lastFetchedParams.vehicle !== selectedVehicle ||
      lastFetchedParams.filter !== hasIssueFilter ||
      lastFetchedParams.trigger !== refreshTrigger);

  useEffect(() => {
    api.getVehicles().then(setVehicles).catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedVehicle) {
      return;
    }

    let cancelled = false;
    const currentParams = {
      vehicle: selectedVehicle,
      filter: hasIssueFilter,
      trigger: refreshTrigger,
    };

    const hasIssueParam =
      hasIssueFilter === "all" ? undefined : hasIssueFilter === "true";

    api
      .getChecks(selectedVehicle, hasIssueParam)
      .then((data) => {
        if (!cancelled) {
          setChecks(data);
          setLastFetchedParams(currentParams);
        }
      })
      .catch(console.error);

    return () => {
      cancelled = true;
    };
  }, [selectedVehicle, hasIssueFilter, refreshTrigger]);

  const handleVehicleChange = (vehicleId: string) => {
    setSelectedVehicle(vehicleId);
    if (!vehicleId) {
      setChecks([]);
      setLastFetchedParams(null);
    }
  };

  const handleDelete = async (checkId: string) => {
    if (!confirm("Are you sure you want to delete this inspection record?")) {
      return;
    }

    setDeletingId(checkId);
    try {
      await api.deleteCheck(checkId);
      setChecks((prev) => prev.filter((c) => c.id !== checkId));
      showToast("Inspection record deleted.", "success");
      onDelete();
    } catch {
      showToast("Failed to delete inspection record.", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleString();
  };

  return (
    <div className="check-history">
      <h2>View Inspection History</h2>

      <div className="filters">
        <div className="form-group">
          <label htmlFor="vehicle-filter">Vehicle</label>
          <select
            id="vehicle-filter"
            value={selectedVehicle}
            onChange={(e) => handleVehicleChange(e.target.value)}>
            <option value="">Select a vehicle</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.registration} - {v.make} {v.model}
              </option>
            ))}
          </select>
        </div>

        {selectedVehicle && (
          <div className="form-group">
            <label htmlFor="issue-filter">Filter by issues</label>
            <select
              id="issue-filter"
              value={hasIssueFilter}
              onChange={(e) =>
                setHasIssueFilter(e.target.value as IssueFilter)
              }>
              <option value="all">All checks</option>
              <option value="true">With issues only</option>
              <option value="false">No issues only</option>
            </select>
          </div>
        )}
      </div>

      {loading && <p>Loading checks...</p>}

      {!loading && selectedVehicle && checks.length === 0 && (
        <p className="no-results">No checks found for this vehicle.</p>
      )}

      {!loading && checks.length > 0 && (
        <div className="checks-list">
          {checks.map((check) => (
            <div
              key={check.id}
              className={`check-card ${check.hasIssue ? "has-issue" : ""}`}>
              <div className="check-header">
                <span className="check-date">
                  {formatDate(check.createdAt)}
                </span>
                <div className="check-header-actions">
                  <span
                    className={`status-badge ${check.hasIssue ? "fail" : "ok"}`}>
                    {check.hasIssue ? "⚠ Has Issues" : "✓ All OK"}
                  </span>
                  <button
                    type="button"
                    className="delete-btn"
                    disabled={deletingId === check.id}
                    onClick={() => handleDelete(check.id)}
                    title="Delete inspection record">
                    {deletingId === check.id ? "…" : "✕"}
                  </button>
                </div>
              </div>

              <div className="check-details">
                <p>
                  <strong>Odometer:</strong> {check.odometerKm.toLocaleString()}{" "}
                  km
                </p>

                <div className="check-items">
                  <strong>Checklist:</strong>
                  <ul>
                    {check.items.map((item) => (
                      <li
                        key={item.key}
                        className={item.status === "FAIL" ? "fail" : "ok"}>
                        <span className="item-key">{item.key}:</span>
                        <span className="item-status">{item.status}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {check.note && (
                  <div className="check-note">
                    <strong>Notes:</strong>
                    <p>{check.note}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
