import type { Metadata } from "next";
import { DemoLeadForm } from "@/components/DemoLeadForm";
import { DemoNotice } from "@/components/DemoNotice";

export const metadata: Metadata = {
  title: "Vende tu casa",
  description: "Conoce cómo promover tu casa en Querétaro.",
  robots: { index: false, follow: true },
};

export default function SellPage() {
  return (
    <div className="container page-shell">
      <div className="page-intro narrow-intro">
        <span className="eyebrow">Para propietarios</span>
        <h1>Tu siguiente capítulo empieza con una buena conversación.</h1>
        <p>Conoce cómo podríamos ayudarte a presentar tu propiedad a las personas indicadas.</p>
      </div>
      <DemoNotice />
      <div className="seller-steps">
        <div><span>01</span><h2>Nos cuentas</h2><p>Comparte información básica sobre tu propiedad.</p></div>
        <div><span>02</span><h2>La conocemos</h2><p>Revisamos contigo sus características y objetivos.</p></div>
        <div><span>03</span><h2>Diseñamos el plan</h2><p>Acordamos cómo promoverla y dar seguimiento.</p></div>
      </div>
      <DemoLeadForm />
    </div>
  );
}
