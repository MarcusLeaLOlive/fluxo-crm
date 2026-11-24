import { Section } from "../Section.jsx";
import { InterfaceShowcase } from "../InterfaceShowcase.jsx";

export function InterfaceSection() {
  return (
    <Section
      id="interface"
      title="Uma linguagem visual, seis técnicas"
      intro="A interface combina poucas técnicas e as aplica com consistência. Cada uma aparece abaixo isolada, em CSS puro."
    >
      <InterfaceShowcase />
    </Section>
  );
}
