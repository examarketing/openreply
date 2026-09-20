"use client";

/**
 * Fluxo em bloquinhos (estilo ManyChat) da automação.
 *
 * Espelha o estado do construtor: cada etapa vira um cartão ligado ao próximo.
 * Arrastar reposiciona (só visual); clicar num cartão leva para a seção do
 * formulário correspondente. Etapas desligadas aparecem esmaecidas, para o
 * André ver o caminho completo que a pessoa percorre.
 */

import { useEffect, useMemo, useState } from "react";
import {
  Background,
  Controls,
  Handle,
  Position,
  ReactFlow,
  type Edge,
  type Node,
  type NodeProps,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

export type FlowStepKey =
  | "gatilho"
  | "palavra"
  | "resposta"
  | "abertura"
  | "seguir"
  | "dm"
  | "followup";

export interface FlowStep {
  key: FlowStepKey;
  titulo: string;
  resumo: string;
  ativo: boolean;
  cor: string; // cabeçalho
  icone: string; // path SVG
}

// React Flow exige que `data` seja indexável por string.
type StepNodeData = FlowStep & {
  onSelect?: (key: FlowStepKey) => void;
  [extra: string]: unknown;
};
type StepNode = Node<StepNodeData, "step">;

function StepNodeView({ data }: NodeProps<StepNode>) {
  return (
    <div
      onClick={() => data.onSelect?.(data.key)}
      className={`w-64 cursor-pointer rounded-xl border bg-white shadow-sm transition-shadow hover:shadow-md ${
        data.ativo ? "border-[#D6DAE0]" : "border-dashed border-[#C5CCD6] opacity-60"
      }`}
    >
      <Handle type="target" position={Position.Top} className="!h-2 !w-2 !bg-[#98A2B3]" />
      <div
        className="flex items-center gap-2 rounded-t-xl px-3 py-2 text-xs font-semibold text-white"
        style={{ background: data.cor }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d={data.icone} />
        </svg>
        <span className="truncate">{data.titulo}</span>
        {!data.ativo && <span className="ml-auto rounded bg-white/25 px-1.5 py-0.5 text-[10px]">desligado</span>}
      </div>
      <div className="px-3 py-2.5 text-xs leading-relaxed text-[#344054]">
        {data.resumo || <span className="text-[#98A2B3]">Toque para configurar</span>}
      </div>
      <Handle type="source" position={Position.Bottom} className="!h-2 !w-2 !bg-[#98A2B3]" />
    </div>
  );
}

const nodeTypes = { step: StepNodeView };

export default function FlowCanvas({
  steps,
  onSelect,
}: {
  steps: FlowStep[];
  onSelect?: (key: FlowStepKey) => void;
}) {
  // Posições iniciais em coluna; o usuário pode arrastar depois.
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({});

  const initialNodes = useMemo<StepNode[]>(
    () =>
      steps.map((s, i) => ({
        id: s.key,
        type: "step",
        position: positions[s.key] ?? { x: 40, y: 24 + i * 132 },
        data: { ...s, onSelect },
        draggable: true,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [steps, onSelect]
  );
  const initialEdges = useMemo<Edge[]>(
    () =>
      steps.slice(1).map((s, i) => ({
        id: `${steps[i].key}-${s.key}`,
        source: steps[i].key,
        target: s.key,
        animated: s.ativo && steps[i].ativo,
        style: { stroke: s.ativo ? "#2A78D6" : "#C5CCD6", strokeWidth: 2 },
      })),
    [steps]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState<StepNode>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initialEdges);

  // Quando o formulário muda, atualiza conteúdo mantendo onde o usuário arrastou.
  useEffect(() => {
    setNodes((prev) =>
      initialNodes.map((n) => {
        const old = prev.find((p) => p.id === n.id);
        return old ? { ...n, position: old.position } : n;
      })
    );
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  return (
    <div className="h-[640px] w-full overflow-hidden rounded-xl border border-border bg-[#F7F8FA]">
      <ReactFlow<StepNode, Edge>
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={(_, node) =>
          setPositions((p) => ({ ...p, [node.id]: node.position }))
        }
        fitView
        fitViewOptions={{ padding: 0.2 }}
        nodesConnectable={false}
        proOptions={{ hideAttribution: true }}
        minZoom={0.4}
        maxZoom={1.4}
      >
        <Background gap={20} color="#E4E7EC" />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
