import { RootState } from "@/app/store";
import {
  fetchKnowledgeGraph,
  KnowledgeGraphData,
  KnowledgeGraphLink,
  KnowledgeGraphNode,
} from "@/services/ai/knowledgeLearning";
import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  Simulation,
  SimulationLinkDatum,
  SimulationNodeDatum,
} from "d3-force";
import { Helmet } from "react-helmet-async";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";

const CATEGORY_COLORS: Record<string, string> = {
  core: "#0f766e",
  "data-structure": "#16a34a",
  algorithm: "#d97706",
  application: "#0ea5e9",
  complexity: "#dc2626",
};

const CATEGORY_LABELS: Record<string, string> = {
  core: "核心概念",
  "data-structure": "数据结构",
  algorithm: "算法技术",
  application: "应用场景",
  complexity: "复杂度分析",
};

const GRAPH_WIDTH = 1100;
const GRAPH_HEIGHT = 720;
const DRAG_THRESHOLD = 6;
const MIN_ZOOM = 0.35;
const MAX_ZOOM = 2.6;

type PositionedNode = KnowledgeGraphNode & { x: number; y: number };
type ForceNode = PositionedNode & SimulationNodeDatum;
type ForceLink = SimulationLinkDatum<ForceNode> & {
  source: string | ForceNode;
  target: string | ForceNode;
  strength?: number;
};

function getCategoryColor(category: string) {
  return CATEGORY_COLORS[category] ?? "#64748b";
}

function computeNodePositions(nodes: KnowledgeGraphNode[]): PositionedNode[] {
  if (nodes.length === 0) return [];
  const groups = new Map<string, KnowledgeGraphNode[]>();
  nodes.forEach((node) => {
    const key = node.category || "other";
    const rows = groups.get(key) ?? [];
    rows.push(node);
    groups.set(key, rows);
  });

  const categories = [...groups.keys()];
  const centerX = GRAPH_WIDTH / 2;
  const centerY = GRAPH_HEIGHT / 2;
  const orbitRadius = Math.min(GRAPH_WIDTH, GRAPH_HEIGHT) * 0.3;
  const localRadius = 110;

  const result: PositionedNode[] = [];
  categories.forEach((category, categoryIndex) => {
    const list = groups.get(category) ?? [];
    const categoryAngle = (Math.PI * 2 * categoryIndex) / Math.max(categories.length, 1);
    const baseX = centerX + Math.cos(categoryAngle) * orbitRadius;
    const baseY = centerY + Math.sin(categoryAngle) * orbitRadius;

    list.forEach((node, nodeIndex) => {
      const angle = (Math.PI * 2 * nodeIndex) / Math.max(list.length, 1);
      const radius = list.length === 1 ? 0 : localRadius;
      result.push({
        ...node,
        x: baseX + Math.cos(angle) * radius,
        y: baseY + Math.sin(angle) * radius,
      });
    });
  });

  return result;
}

function clampNode(node: ForceNode) {
  node.x = Math.max(28, Math.min(GRAPH_WIDTH - 28, node.x ?? GRAPH_WIDTH / 2));
  node.y = Math.max(28, Math.min(GRAPH_HEIGHT - 28, node.y ?? GRAPH_HEIGHT / 2));
}

export default function KnowledgeGraphPage() {
  const { jwt } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(false);
  const [graphData, setGraphData] = useState<KnowledgeGraphData | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [simNodes, setSimNodes] = useState<ForceNode[]>([]);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [viewTransform, setViewTransform] = useState({ x: 0, y: 0, k: 1 });
  const simulationRef = useRef<Simulation<ForceNode, ForceLink> | null>(null);
  const nodesRef = useRef<ForceNode[]>([]);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const pendingDragRef = useRef<{ nodeId: string; x: number; y: number } | null>(null);
  const panningRef = useRef<{
    startClientX: number;
    startClientY: number;
    startX: number;
    startY: number;
  } | null>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetchKnowledgeGraph(jwt)
      .then((data) => {
        if (!alive) return;
        setGraphData(data);
      })
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : "获取知识图谱失败");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [jwt]);

  const positionedNodes = useMemo(
    () => computeNodePositions(graphData?.nodes ?? []),
    [graphData?.nodes]
  );

  useEffect(() => {
    if (!graphData || positionedNodes.length === 0) {
      setSimNodes([]);
      return;
    }

    simulationRef.current?.stop();
    const nodes: ForceNode[] = positionedNodes.map((node) => ({
      ...node,
      x: node.x,
      y: node.y,
      vx: 0,
      vy: 0,
      fx: null,
      fy: null,
    }));
    const links: ForceLink[] = graphData.links.map((link: KnowledgeGraphLink) => ({
      source: link.source,
      target: link.target,
      strength: link.strength,
    }));

    nodesRef.current = nodes;
    setSimNodes(nodes.map((node) => ({ ...node })));

    const simulation = forceSimulation<ForceNode>(nodes)
      .force(
        "link",
        forceLink<ForceNode, ForceLink>(links)
          .id((d) => d.id)
          .distance(125)
          .strength((l) => 0.12 * (l.strength ?? 1))
      )
      .force("charge", forceManyBody<ForceNode>().strength(-260))
      .force("center", forceCenter(GRAPH_WIDTH / 2, GRAPH_HEIGHT / 2))
      .force("collide", forceCollide<ForceNode>().radius((d) => 22 + (d.mastery ?? 0) / 9))
      .alpha(0.8)
      .alphaDecay(0.04)
      .velocityDecay(0.28);

    simulation.on("tick", () => {
      nodesRef.current.forEach(clampNode);
      setSimNodes(nodes.map((node) => ({ ...node })));
    });

    simulationRef.current = simulation;
    return () => {
      simulation.stop();
      simulationRef.current = null;
    };
  }, [graphData, positionedNodes]);

  const nodeMap = useMemo(() => {
    const map = new Map<string, ForceNode>();
    simNodes.forEach((node) => map.set(node.id, node));
    return map;
  }, [simNodes]);

  const selectedNode = useMemo(
    () => (selectedNodeId ? nodeMap.get(selectedNodeId) ?? null : null),
    [selectedNodeId, nodeMap]
  );

  const masteredCount = useMemo(
    () => (graphData?.nodes ?? []).filter((node) => (node.mastery ?? 0) >= 80).length,
    [graphData]
  );
  const learningCount = useMemo(
    () =>
      (graphData?.nodes ?? []).filter((node) => {
        const mastery = node.mastery ?? 0;
        return mastery >= 30 && mastery < 80;
      }).length,
    [graphData]
  );
  const pendingCount = useMemo(
    () => (graphData?.nodes ?? []).filter((node) => (node.mastery ?? 0) < 30).length,
    [graphData]
  );

  const progressPercent = useMemo(() => {
    const nodes = graphData?.nodes ?? [];
    if (nodes.length === 0) return 0;
    const total = nodes.reduce((sum, node) => sum + (node.mastery ?? 0), 0);
    return Math.round(total / nodes.length);
  }, [graphData]);

  const recommendedNodes = useMemo(() => {
    return [...(graphData?.nodes ?? [])]
      .filter((node) => {
        const mastery = node.mastery ?? 0;
        return mastery < 70 && mastery >= 20;
      })
      .sort((a, b) => (b.mastery ?? 0) - (a.mastery ?? 0))
      .slice(0, 5);
  }, [graphData]);

  const connectedNodeIds = useMemo(() => {
    if (!selectedNodeId || !graphData) return new Set<string>();
    const set = new Set<string>([selectedNodeId]);
    graphData.links.forEach((link) => {
      if (link.source === selectedNodeId) set.add(link.target);
      if (link.target === selectedNodeId) set.add(link.source);
    });
    return set;
  }, [selectedNodeId, graphData]);

  function clientToGraph(clientX: number, clientY: number) {
    if (!svgRef.current) return null;
    const rect = svgRef.current.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    const svgX = ((clientX - rect.left) / rect.width) * GRAPH_WIDTH;
    const svgY = ((clientY - rect.top) / rect.height) * GRAPH_HEIGHT;
    const x = (svgX - viewTransform.x) / viewTransform.k;
    const y = (svgY - viewTransform.y) / viewTransform.k;
    return {
      x: Math.max(0, Math.min(GRAPH_WIDTH, x)),
      y: Math.max(0, Math.min(GRAPH_HEIGHT, y)),
    };
  }

  function zoomAt(svgX: number, svgY: number, nextK: number) {
    setViewTransform((prev) => {
      const k = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, nextK));
      if (Math.abs(k - prev.k) < 1e-6) return prev;
      const x = svgX - ((svgX - prev.x) / prev.k) * k;
      const y = svgY - ((svgY - prev.y) / prev.k) * k;
      return { x, y, k };
    });
  }

  function zoomBy(factor: number) {
    zoomAt(GRAPH_WIDTH / 2, GRAPH_HEIGHT / 2, viewTransform.k * factor);
  }

  function resetZoom() {
    setViewTransform({ x: 0, y: 0, k: 1 });
  }

  function onStartDrag(nodeId: string, clientX: number, clientY: number) {
    const simulation = simulationRef.current;
    const target = nodesRef.current.find((node) => node.id === nodeId);
    const point = clientToGraph(clientX, clientY);
    if (!simulation || !target || !point) return;
    setDraggingNodeId(nodeId);
    setSelectedNodeId(nodeId);
    target.fx = point.x;
    target.fy = point.y;
    simulation.alphaTarget(0.22).restart();
    setSimNodes(nodesRef.current.map((node) => ({ ...node })));
  }

  function onMoveDrag(clientX: number, clientY: number) {
    if (panningRef.current && svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      if (rect.width && rect.height) {
        const dx = ((clientX - panningRef.current.startClientX) / rect.width) * GRAPH_WIDTH;
        const dy = ((clientY - panningRef.current.startClientY) / rect.height) * GRAPH_HEIGHT;
        setViewTransform((prev) => ({
          ...prev,
          x: panningRef.current!.startX + dx,
          y: panningRef.current!.startY + dy,
        }));
      }
      return;
    }

    if (!draggingNodeId && pendingDragRef.current) {
      const dx = clientX - pendingDragRef.current.x;
      const dy = clientY - pendingDragRef.current.y;
      if (Math.sqrt(dx * dx + dy * dy) >= DRAG_THRESHOLD) {
        onStartDrag(pendingDragRef.current.nodeId, clientX, clientY);
      }
    }

    if (!draggingNodeId) return;
    const point = clientToGraph(clientX, clientY);
    const target = nodesRef.current.find((node) => node.id === draggingNodeId);
    if (!point || !target) return;
    target.fx = point.x;
    target.fy = point.y;
    setSimNodes(nodesRef.current.map((node) => ({ ...node })));
  }

  function onEndDrag() {
    if (panningRef.current) {
      panningRef.current = null;
      return;
    }
    if (pendingDragRef.current && !draggingNodeId) {
      pendingDragRef.current = null;
      return;
    }
    if (!draggingNodeId) return;

    const simulation = simulationRef.current;
    const target = nodesRef.current.find((node) => node.id === draggingNodeId);
    if (target) {
      target.fx = null;
      target.fy = null;
    }
    simulation?.alphaTarget(0);
    setDraggingNodeId(null);
    pendingDragRef.current = null;
    setSimNodes(nodesRef.current.map((node) => ({ ...node })));
  }

  return (
    <div className="flex min-h-0 flex-1 bg-background">
      <Helmet>
        <title>知识图谱 - SEUOJ</title>
      </Helmet>

      <div className="flex min-h-0 flex-1 overflow-hidden border-t bg-card">
        <main className="flex min-h-0 flex-1 flex-col">
          <div className="border-b px-6 py-4">
            <h1 className="text-xl font-semibold">知识图谱</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              探索算法知识点之间的关联，规划你的学习路径。
            </p>
          </div>

          <div className="min-h-0 flex-1 overflow-auto p-4">
            {loading ? (
              <div className="flex h-full items-center justify-center rounded-lg border border-dashed">
                <p className="text-sm text-muted-foreground">正在加载知识图谱...</p>
              </div>
            ) : !graphData || simNodes.length === 0 ? (
              <div className="flex h-full items-center justify-center rounded-lg border border-dashed">
                <p className="text-sm text-muted-foreground">暂无可用知识图谱数据</p>
              </div>
            ) : (
              <div className="relative h-full min-h-[620px] overflow-hidden rounded-lg border bg-background">
                <svg
                  ref={svgRef}
                  viewBox={`0 0 ${GRAPH_WIDTH} ${GRAPH_HEIGHT}`}
                  className="h-full w-full"
                  onWheel={(event) => {
                    event.preventDefault();
                    const rect = event.currentTarget.getBoundingClientRect();
                    const svgX = ((event.clientX - rect.left) / rect.width) * GRAPH_WIDTH;
                    const svgY = ((event.clientY - rect.top) / rect.height) * GRAPH_HEIGHT;
                    const factor = event.deltaY > 0 ? 0.9 : 1.1;
                    zoomAt(svgX, svgY, viewTransform.k * factor);
                  }}
                  onPointerDown={(event) => {
                    if (event.target !== event.currentTarget) return;
                    panningRef.current = {
                      startClientX: event.clientX,
                      startClientY: event.clientY,
                      startX: viewTransform.x,
                      startY: viewTransform.y,
                    };
                    event.currentTarget.setPointerCapture(event.pointerId);
                  }}
                  onPointerMove={(event) => onMoveDrag(event.clientX, event.clientY)}
                  onPointerUp={onEndDrag}
                  onPointerLeave={onEndDrag}
                  onClick={(event) => {
                    if (!draggingNodeId && event.target === event.currentTarget) {
                      setSelectedNodeId(null);
                    }
                  }}
                >
                  <g transform={`translate(${viewTransform.x} ${viewTransform.y}) scale(${viewTransform.k})`}>
                    {graphData.links.map((link, index) => {
                      const source = nodeMap.get(link.source);
                      const target = nodeMap.get(link.target);
                      if (!source || !target) return null;
                      const isConnected =
                        !selectedNodeId ||
                        link.source === selectedNodeId ||
                        link.target === selectedNodeId;
                      const midX = (source.x + target.x) / 2;
                      const midY = (source.y + target.y) / 2;
                      return (
                        <g key={`${link.source}-${link.target}-${index}`}>
                          <line
                            x1={source.x}
                            y1={source.y}
                            x2={target.x}
                            y2={target.y}
                            stroke={isConnected ? "#64748b" : "#cbd5e1"}
                            strokeOpacity={isConnected ? 0.75 : 0.25}
                            strokeWidth={isConnected ? 2 : 1}
                          />
                          {link.type ? (
                            <text
                              x={midX}
                              y={midY - 4}
                              textAnchor="middle"
                              fontSize="10"
                              fill={isConnected ? "#475569" : "#94a3b8"}
                              className="select-none"
                              pointerEvents="none"
                            >
                              {link.type}
                            </text>
                          ) : null}
                        </g>
                      );
                    })}

                    {simNodes.map((node) => {
                      const active = connectedNodeIds.has(node.id);
                      const selected = selectedNodeId === node.id;
                      const radius = 14 + Math.round((node.mastery ?? 0) / 10);
                      return (
                        <g key={node.id}>
                          <circle
                            cx={node.x}
                            cy={node.y}
                            r={selected ? radius + 5 : radius + 2}
                            fill={getCategoryColor(node.category)}
                            opacity={selected ? 0.25 : 0.12}
                          />
                          <circle
                            cx={node.x}
                            cy={node.y}
                            r={radius}
                            fill={getCategoryColor(node.category)}
                            stroke={selected ? "#0f172a" : "#ffffff"}
                            strokeWidth={selected ? 3 : 2}
                            opacity={selectedNodeId && !active ? 0.45 : 0.95}
                            className="cursor-grab transition-opacity active:cursor-grabbing"
                            onClick={(event) => {
                              event.stopPropagation();
                              setSelectedNodeId((prev) => (prev === node.id ? null : node.id));
                            }}
                            onPointerDown={(event) => {
                              event.stopPropagation();
                              pendingDragRef.current = {
                                nodeId: node.id,
                                x: event.clientX,
                                y: event.clientY,
                              };
                            }}
                          />
                          <text
                            x={node.x}
                            y={node.y + radius + 18}
                            textAnchor="middle"
                            fontSize="11"
                            fill="#334155"
                            className="select-none"
                            pointerEvents="none"
                          >
                            {node.name.length > 8 ? `${node.name.slice(0, 8)}...` : node.name}
                          </text>
                        </g>
                      );
                    })}
                  </g>
                </svg>

                <div className="absolute left-3 top-3 rounded-md border bg-card/90 p-2 backdrop-blur">
                  <div className="flex items-center gap-1.5">
                    <button type="button" onClick={() => zoomBy(1.18)} className="rounded border px-2 py-1 text-xs hover:bg-accent">
                      放大
                    </button>
                    <button type="button" onClick={() => zoomBy(0.85)} className="rounded border px-2 py-1 text-xs hover:bg-accent">
                      缩小
                    </button>
                    <button type="button" onClick={resetZoom} className="rounded border px-2 py-1 text-xs hover:bg-accent">
                      重置
                    </button>
                  </div>
                </div>

                <div className="absolute right-3 top-3 rounded-md border bg-card/90 p-3 backdrop-blur">
                  <p className="mb-2 text-xs font-medium text-muted-foreground">知识图谱类别</p>
                  <div className="space-y-1.5">
                    {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                      <div key={key} className="flex items-center gap-2 text-xs">
                        <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: getCategoryColor(key) }} />
                        <span>{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="absolute bottom-3 left-3 rounded-md border bg-card/90 px-3 py-2 text-xs text-muted-foreground backdrop-blur">
                  基于 d3-force，可拖拽节点
                </div>
              </div>
            )}
          </div>
        </main>

        <aside className="flex w-[340px] shrink-0 flex-col border-l bg-muted/20">
          <div className="border-b p-4">
            <h2 className="text-base font-semibold">学习进度</h2>
          </div>
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-md border bg-card p-3">
                <p className="text-2xl font-semibold text-primary">{masteredCount}</p>
                <p className="text-xs text-muted-foreground">已掌握</p>
              </div>
              <div className="rounded-md border bg-card p-3">
                <p className="text-2xl font-semibold text-amber-500">{learningCount}</p>
                <p className="text-xs text-muted-foreground">学习中</p>
              </div>
              <div className="rounded-md border bg-card p-3">
                <p className="text-2xl font-semibold text-slate-500">{pendingCount}</p>
                <p className="text-xs text-muted-foreground">待学习</p>
              </div>
              <div className="rounded-md border bg-card p-3">
                <p className="text-2xl font-semibold text-emerald-500">{progressPercent}%</p>
                <p className="text-xs text-muted-foreground">总进度</p>
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-medium text-muted-foreground">推荐知识点</h3>
              <div className="space-y-2">
                {recommendedNodes.map((node) => (
                  <button
                    type="button"
                    key={node.id}
                    onClick={() => setSelectedNodeId(node.id)}
                    className={`w-full rounded-md border p-3 text-left transition ${
                      selectedNodeId === node.id ? "border-primary/40 bg-primary/5" : "bg-card hover:border-primary/30"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: getCategoryColor(node.category) }} />
                      <p className="text-sm font-medium">{node.name}</p>
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{node.description || "暂无描述"}</p>
                    <p className="mt-2 text-xs text-muted-foreground">掌握度：{node.mastery ?? 0}%</p>
                  </button>
                ))}
              </div>
            </div>

            {selectedNode ? (
              <div className="rounded-md border bg-card p-3">
                <p className="text-sm font-semibold">{selectedNode.name}</p>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">{selectedNode.description || "暂无描述"}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {(selectedNode.tags ?? []).map((tag) => (
                    <span key={tag} className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </aside>
      </div>
    </div>
  );
}
