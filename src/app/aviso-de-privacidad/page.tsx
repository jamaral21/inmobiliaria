import type { Metadata } from "next";
import { DemoNotice } from "@/components/DemoNotice";

export const metadata: Metadata = {
  title: "Aviso de privacidad",
  description: "Aviso de privacidad de demostración para Habita Querétaro.",
  robots: { index: false, follow: true },
};

export default function PrivacyPage() {
  return (
    <div className="container page-shell privacy-page">
      <div className="page-intro">
        <span className="eyebrow">Información importante</span>
        <h1>Aviso de privacidad</h1>
        <p>Última actualización: 25 de noviembre de 2026</p>
      </div>
      <DemoNotice />
      <div className="privacy-copy">
        <div className="approval-warning">
          Este texto es solo una vista de demostración y no es un aviso legal aprobado.
          Los formularios no transmiten ni guardan datos.
        </div>
        <h2>Responsable del tratamiento</h2>
        <p>
          Antes de publicar el sitio, el responsable del negocio debe completar y aprobar
          este aviso, incluyendo su denominación, domicilio, medios de contacto y datos
          aplicables al tratamiento.
        </p>
        <h2>Finalidades y derechos</h2>
        <p>
          Las finalidades, transferencias, medios para ejercer derechos y mecanismos para
          limitar el uso de datos deben ser definidos y revisados por el responsable antes
          de habilitar formularios o analítica.
        </p>
        <h2>Demostración</h2>
        <p>
          Esta versión no recopila información personal. No uses datos reales en este
          entorno. Sustituye y valida este contenido antes de cualquier lanzamiento público.
        </p>
      </div>
    </div>
  );
}
