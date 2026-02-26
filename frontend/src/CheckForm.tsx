import { useState, useEffect } from "react";
import type {
  Vehicle,
  CheckItem,
  CheckItemKey,
  CheckItemStatus,
  ErrorResponse,
} from "./types";
import { api } from "./api";

const CHECK_ITEMS: CheckItemKey[] = [
  "TYRES",
  "BRAKES",
  "LIGHTS",
  "OIL",
  "COOLANT",
];

const NOTE_MAX_LENGTH = 300;

interface Props {
  onSuccess: () => void;
  showToast: (message: string, type: "success" | "error") => void;
}

function buildDefaultItems(): CheckItem[] {
  return CHECK_ITEMS.map((key) => ({ key, status: "OK" as CheckItemStatus }));
}

export function CheckForm({ onSuccess, showToast }: Props) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [odometerKm, setOdometerKm] = useState("");
  const [items, setItems] = useState<CheckItem[]>(buildDefaultItems());
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    api.getVehicles().then(setVehicles).catch(console.error);
  }, []);

  const handleItemStatusChange = (
    key: CheckItemKey,
    status: CheckItemStatus,
  ) => {
    setItems((prev) =>
      prev.map((item) => (item.key === key ? { ...item, status } : item)),
    );
  };

  const handleOdometerChange = (value: string) => {
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setOdometerKm(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setValidationErrors([]);
    setLoading(true);

    try {
      await api.createCheck({
        vehicleId: selectedVehicle,
        odometerKm: parseFloat(odometerKm),
        items,
        ...(note.trim() && { note: note.trim() }),
      });

      setSelectedVehicle("");
      setOdometerKm("");
      setItems(buildDefaultItems());
      setNote("");
      onSuccess();
      showToast("Inspection submitted successfully!", "success");
    } catch (err: unknown) {
      const errorResponse = err as ErrorResponse;
      if (errorResponse.error?.details) {
        const messages = errorResponse.error.details.map(
          (d) => `${d.field}: ${d.reason}`,
        );
        setValidationErrors(messages);
        showToast(
          `Validation failed: ${errorResponse.error.details.length} error(s)`,
          "error",
        );
      } else {
        setError("Failed to submit check. Please try again.");
        showToast("Failed to submit inspection. Please try again.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="check-form">
      <h2>Submit Vehicle Inspection Result</h2>

      {error && <div className="error-banner">{error}</div>}
      {validationErrors.length > 0 && (
        <div className="error-banner">
          <strong>Validation errors:</strong>
          <ul>
            {validationErrors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="form-group">
        <label htmlFor="vehicle">Vehicle *</label>
        <select
          id="vehicle"
          value={selectedVehicle}
          onChange={(e) => setSelectedVehicle(e.target.value)}
          required>
          <option value="">Select a vehicle</option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.registration} - {v.make} {v.model} ({v.year})
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="odometer">Odometer (km) *</label>
        <input
          id="odometer"
          type="text"
          inputMode="decimal"
          value={odometerKm}
          onChange={(e) => handleOdometerChange(e.target.value)}
          placeholder="Enter odometer reading"
          required
        />
      </div>

      <div className="form-group">
        <label>Checklist Items *</label>
        <div className="checklist">
          {items.map((item) => (
            <div key={item.key} className="checklist-item">
              <span className="item-label">{item.key}</span>
              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    name={`status-${item.key}`}
                    checked={item.status === "OK"}
                    onChange={() => handleItemStatusChange(item.key, "OK")}
                  />
                  OK
                </label>
                <label>
                  <input
                    type="radio"
                    name={`status-${item.key}`}
                    checked={item.status === "FAIL"}
                    onChange={() => handleItemStatusChange(item.key, "FAIL")}
                  />
                  FAIL
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="note">Notes (optional)</label>
        <textarea
          id="note"
          value={note}
          onChange={(e) => {
            if (e.target.value.length <= NOTE_MAX_LENGTH) {
              setNote(e.target.value);
            }
          }}
          placeholder="Add any notes about this inspection..."
          rows={3}
          maxLength={NOTE_MAX_LENGTH}
        />
        <small>
          {note.length}/{NOTE_MAX_LENGTH}
        </small>
      </div>

      <button type="submit" disabled={loading}>
        {loading ? "Submitting..." : "Submit Check"}
      </button>
    </form>
  );
}
