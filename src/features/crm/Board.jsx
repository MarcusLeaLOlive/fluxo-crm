import { useState } from "react";
import { motion } from "motion/react";
import { Highlight } from "../../components/ui/Highlight.jsx";
import { STAGES, isOpenStage } from "../../config/crm.js";
import { formatCurrency } from "../../lib/format.js";
import { Avatar } from "../../components/ui/Avatar.jsx";
import { ActivityBadge } from "./ActivityBadge.jsx";

const STAGE_KEYS = STAGES.map((s) => s.key);

/**
 * Cartão do negócio. Arraste com o mouse ou, pelo teclado,
 * use Shift + ← / → para mover entre etapas.
 */
function DealCard({ deal, onOpen, onMove, preview, query }) {
  const [dragging, setDragging] = useState(false);

  const onKeyDown = (event) => {
    if (!event.shiftKey || !["ArrowLeft", "ArrowRight"].includes(event.key)) return;
    event.preventDefault();
    const index = STAGE_KEYS.indexOf(deal.etapa) + (event.key === "ArrowRight" ? 1 : -1);
    if (index >= 0 && index < STAGE_KEYS.length) onMove(deal, STAGE_KEYS[index]);
  };

  return (
    <button
      type="button"
      className={`deal ${dragging ? "is-dragging" : ""}`}
      draggable={!preview}
      tabIndex={preview ? -1 : 0}
      onClick={() => onOpen?.(deal)}
      onKeyDown={preview ? undefined : onKeyDown}
      onDragStart={(event) => {
        event.dataTransfer.setData("text/plain", deal.id);
        event.dataTransfer.effectAllowed = "move";
        setDragging(true);
      }}
      onDragEnd={() => setDragging(false)}
      aria-keyshortcuts="Shift+ArrowLeft Shift+ArrowRight"
    >
      <span className="deal__title"><Highlight text={deal.titulo} query={query} /></span>
      <span className="deal__company"><Highlight text={deal.empresa || deal.contato || "Sem empresa"} query={query} /></span>
      <span className="deal__meta">
        <span className="deal__value">{formatCurrency(deal.valor)}</span>
        <Avatar name={deal.resp} />
      </span>
      <ActivityBadge deal={deal} />
      {deal.etapa === "perdido" && deal.motivoPerda && <span className="deal__reason">{deal.motivoPerda}</span>}
    </button>
  );
}

function Column({ stage, deals, onOpen, onMove, preview, query }) {
  const [over, setOver] = useState(false);
  const total = deals.reduce((sum, d) => sum + d.valor, 0);
  // Na prévia decorativa da apresentação, a coluna não entra na hierarquia de títulos.
  const Heading = preview ? "p" : "h3";

  return (
    <section
      className={`column ${over ? "is-over" : ""}`}
      style={{ "--stage": stage.color }}
      aria-label={`${stage.label}: ${deals.length} negócios`}
      onDragOver={(event) => {
        if (preview) return;
        event.preventDefault();
        setOver(true);
      }}
      onDragLeave={(event) => !event.currentTarget.contains(event.relatedTarget) && setOver(false)}
      onDrop={(event) => {
        event.preventDefault();
        setOver(false);
        onMove?.(event.dataTransfer.getData("text/plain"), stage.key);
      }}
    >
      <header className="column__head">
        <Heading className="column__title">
          <i className="swatch" style={{ "--swatch": stage.color }} aria-hidden="true" />
          {stage.label}
          <span className="column__count">{deals.length}</span>
        </Heading>
        <p>
          {formatCurrency(total)}
          {isOpenStage(stage.key) && <span className="column__prob">{stage.probability}%</span>}
        </p>
      </header>
      <ul className="column__list" role="list">
        {deals.length ? (
          deals.map((deal) => (
            // layoutId: ao mudar de etapa, o cartão "voa" até a nova coluna (Motion).
            <motion.li
              key={deal.id}
              layout={!preview}
              layoutId={preview ? undefined : `deal-${deal.id}`}
              transition={{ type: "spring", stiffness: 520, damping: 42, mass: 0.9 }}
            >
              <DealCard deal={deal} onOpen={onOpen} onMove={onMove} preview={preview} query={query} />
            </motion.li>
          ))
        ) : (
          <li className="column__empty">{preview ? "Sem negócios" : "Arraste negócios para cá"}</li>
        )}
      </ul>
    </section>
  );
}

export function Board({ deals, onOpen, onMove, stages = STAGES, preview = false, query = "" }) {
  return (
    <div className={`board ${preview ? "board--preview" : ""}`} style={{ "--columns": stages.length }}>
      {stages.map((stage) => (
        <Column
          key={stage.key}
          stage={stage}
          preview={preview}
          query={query}
          deals={deals
            .filter((d) => d.etapa === stage.key)
            .sort((a, b) => (a.atvData || "9999").localeCompare(b.atvData || "9999"))}
          onOpen={onOpen}
          onMove={(dealOrId, stageKey) => onMove?.(dealOrId, stageKey)}
        />
      ))}
    </div>
  );
}
