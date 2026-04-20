import { RootState } from "@/app/store";
import { Helmet } from "react-helmet-async";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { fetchLearningChains, LearningChain } from "@/services/ai/knowledgeLearning";

function getDifficultyClass(difficulty: string) {
  if (difficulty === "EASY") {
    return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300";
  }
  if (difficulty === "MEDIUM") {
    return "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300";
  }
  if (difficulty === "HARD") {
    return "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300";
  }
  return "bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-300";
}

function getDifficultyText(difficulty: string) {
  if (difficulty === "EASY") return "入门";
  if (difficulty === "MEDIUM") return "进阶";
  if (difficulty === "HARD") return "挑战";
  return difficulty;
}

export default function LearningChainPage() {
  const { isAuthenticated, jwt } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(false);
  const [chains, setChains] = useState<LearningChain[]>([]);
  const [recommendedIds, setRecommendedIds] = useState<string[]>([]);
  const [activeChains, setActiveChains] = useState(0);
  const [masteredNodes, setMasteredNodes] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      setChains([]);
      setRecommendedIds([]);
      setActiveChains(0);
      setMasteredNodes(0);
      return;
    }

    let alive = true;
    setLoading(true);
    fetchLearningChains(jwt)
      .then((data) => {
        if (!alive) return;
        setChains(data.chains ?? []);
        setRecommendedIds(data.recommended ?? []);
        setActiveChains(data.userProgress?.activeChains ?? 0);
        setMasteredNodes(data.userProgress?.masteredNodes ?? 0);
      })
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : "获取学习链失败");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [isAuthenticated, jwt]);

  const recommendedChains = useMemo(
    () => chains.filter((item) => recommendedIds.includes(item.id)),
    [chains, recommendedIds]
  );

  function startChain(chain: LearningChain) {
    toast.info(`已选择学习链：${chain.name}`);
    console.log("开始学习链:", chain);
  }

  return (
    <div className="flex min-h-0 flex-1 bg-background">
      <Helmet>
        <title>学习链 - SeuOJ</title>
      </Helmet>

      <div className="flex min-h-0 flex-1 overflow-hidden border-t bg-card">
        <div className="min-h-0 flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-6xl">
            <div className="mb-8 rounded-2xl border bg-gradient-to-r from-primary/10 via-primary/5 to-cyan-500/10 p-6">
              <div className="flex flex-wrap items-center justify-between gap-6">
                <div>
                  <h1 className="text-xl font-semibold">学习链</h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    选择一条学习链，开启系统化的算法学习。
                  </p>
                </div>
                <div className="flex gap-8 text-center">
                  <div>
                    <p className="text-3xl font-semibold text-primary">{activeChains}</p>
                    <p className="text-xs text-muted-foreground">进行中</p>
                  </div>
                  <div>
                    <p className="text-3xl font-semibold text-emerald-500">{masteredNodes}</p>
                    <p className="text-xs text-muted-foreground">已掌握节点</p>
                  </div>
                </div>
              </div>
            </div>

            {!isAuthenticated ? (
              <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                请先登录后查看学习链
              </div>
            ) : loading ? (
              <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                正在加载学习链...
              </div>
            ) : (
              <>
                {recommendedChains.length > 0 ? (
                  <section className="mb-8">
                    <h2 className="mb-4 text-lg font-semibold">为你推荐</h2>
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                      {recommendedChains.map((chain) => (
                        <button
                          type="button"
                          key={chain.id}
                          onClick={() => startChain(chain)}
                          className="rounded-xl border border-primary/30 bg-card p-5 text-left transition hover:border-primary hover:shadow-sm"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-base font-semibold">{chain.name}</p>
                              <p className="mt-1 text-sm text-muted-foreground">{chain.description}</p>
                            </div>
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs ${getDifficultyClass(chain.difficulty)}`}
                            >
                              {getDifficultyText(chain.difficulty)}
                            </span>
                          </div>

                          <div className="mt-4">
                            <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                              <span>进度</span>
                              <span>{chain.progress ?? 0}%</span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-muted">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${Math.max(0, Math.min(100, chain.progress ?? 0))}%`,
                                  backgroundColor: chain.color ?? "hsl(var(--primary))",
                                }}
                              />
                            </div>
                            <p className="mt-2 text-xs text-muted-foreground">
                              预计用时：{chain.estimatedTime || "-"}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </section>
                ) : null}

                <section>
                  <h2 className="mb-4 text-lg font-semibold">全部学习链</h2>
                  {chains.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                      暂无学习链数据
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {chains.map((chain) => (
                        <button
                          type="button"
                          key={chain.id}
                          onClick={() => startChain(chain)}
                          className="rounded-xl border bg-card p-4 text-left transition hover:border-primary/40 hover:shadow-sm"
                        >
                          <div className="mb-2 flex items-center justify-between gap-2">
                            <p className="line-clamp-1 font-semibold">{chain.name}</p>
                            <span
                              className={`rounded px-1.5 py-0.5 text-xs ${getDifficultyClass(chain.difficulty)}`}
                            >
                              {getDifficultyText(chain.difficulty)}
                            </span>
                          </div>
                          <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
                            {chain.description}
                          </p>
                          <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                            <span>{chain.nodes?.length ?? 0} 个知识点</span>
                            <span>{chain.estimatedTime || "-"}</span>
                          </div>
                          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${Math.max(0, Math.min(100, chain.progress ?? 0))}%`,
                                backgroundColor: chain.color ?? "hsl(var(--primary))",
                              }}
                            />
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </section>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

