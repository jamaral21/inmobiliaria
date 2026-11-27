"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { applyCsv, previewCsv } from "@/app/admin/import/actions";
import type { CsvPreview } from "@/lib/inventory-import";

export function AdminCsvImportForm() {
  const [csv, setCsv] = useState("");
  const [preview, setPreview] = useState<CsvPreview | null>(null);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const router = useRouter();

  async function showPreview() {
    setPending(true);
    setMessage("");
    try {
      const result = await previewCsv(csv);
      setPreview(result);
    } catch {
      setMessage("No se pudo previsualizar el archivo. Verifica tu sesión e inténtalo de nuevo.");
    } finally {
      setPending(false);
    }
  }

  async function importCsv() {
    setPending(true);
    setMessage("");
    try {
      const result = await applyCsv(csv);
      setPreview(result);
      setMessage(
        `${result.imported} fila(s) nueva(s) o actualizada(s). Los registros nuevos quedaron como borrador.`,
      );
      router.refresh();
    } catch {
      setMessage("No se pudo aplicar la importación. Verifica tu sesión e inténtalo de nuevo.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="admin-form-card">
      <label className="admin-field admin-field-full">
        Archivo CSV
        <input
          type="file"
          accept=".csv,text/csv"
          onChange={async (event) => {
            const file = event.target.files?.[0];
            setPreview(null);
            setMessage("");
            if (!file) return;
            if (file.size > 1_000_000) {
              setCsv("");
              setMessage("El archivo supera el límite de 1 MB.");
              return;
            }
            try {
              setCsv(await file.text());
            } catch {
              setCsv("");
              setMessage("No se pudo leer el archivo seleccionado.");
            }
          }}
        />
        <span className="admin-field-help">Máximo 1 MB y 1,000 filas.</span>
      </label>
      <div className="admin-form-actions">
        <button type="button" disabled={!csv || pending} onClick={showPreview}>
          {pending ? "Procesando…" : "Previsualizar cambios"}
        </button>
        {preview && preview.entries.length > 0 && (
          <button type="button" disabled={pending} onClick={importCsv}>
            Aplicar filas válidas
          </button>
        )}
      </div>
      {message && <p className="admin-message" role="status">{message}</p>}
      {preview && (
        <div className="admin-import-preview">
          <h2>Vista previa</h2>
          <p>{preview.entries.length} fila(s) válidas para revisar · {preview.issues.length} error(es)</p>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Fila</th><th>Referencia</th><th>Acción</th><th>Cambios</th></tr></thead>
              <tbody>
                {preview.entries.map((entry) => (
                  <tr key={`${entry.row}-${entry.sourceReference}`}>
                    <td>{entry.row}</td>
                    <td>{entry.sourceReference}</td>
                    <td>{entry.action}</td>
                    <td>{entry.changes.length ? entry.changes.join(", ") : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {preview.issues.length > 0 && (
            <>
              <h3>Filas con errores</h3>
              <ul>
                {preview.issues.map((issue, index) => <li key={`${issue.row}-${index}`}>Fila {issue.row}: {issue.message}</li>)}
              </ul>
            </>
          )}
        </div>
      )}
    </section>
  );
}
