export interface KnowledgeGraphNode {
  id: string;
  name: string;
  category: string;
  description?: string;
  tags?: string[];
  mastery?: number;
}

export interface KnowledgeGraphLink {
  source: string;
  target: string;
  type?: string;
  strength?: number;
}

export interface KnowledgeGraphData {
  nodes: KnowledgeGraphNode[];
  links: KnowledgeGraphLink[];
}

export type ChainDifficulty = "EASY" | "MEDIUM" | "HARD" | string;

export interface LearningChain {
  id: string;
  name: string;
  description: string;
  difficulty: ChainDifficulty;
  estimatedTime: string;
  progress: number;
  nodes: string[];
  tags?: string[];
  icon?: string;
  color?: string;
}

export interface LearningChainsData {
  chains: LearningChain[];
  recommended: string[];
  userProgress?: {
    completedChains?: number;
    activeChains?: number;
    totalNodes?: number;
    masteredNodes?: number;
  };
}

// --- 核心知识图谱数据 ---
const MOCK_KNOWLEDGE_GRAPH: KnowledgeGraphData = {
nodes: [
    // 第2章：分治法
    { id: "dc", name: "分治法", category: "ch2", description: "将大问题分解为若干个规模更小的子问题，递归求解并合并结果。", tags: ["分治", "算法思想", "第2章"], mastery: 70 },
    { id: "recursion", name: "递归", category: "ch2", description: "函数直接或间接调用自身的算法设计方式，是分治的实现基础。", tags: ["递归", "第2章"], mastery: 65 },
    { id: "dc-steps", name: "分治三步骤", category: "ch2", description: "分解、递归求解、合并结果。", tags: ["步骤", "第2章"], mastery: 68 },
    { id: "dc-divide", name: "分解问题", category: "ch2", description: "将原问题分解为若干规模更小的子问题。", tags: ["divide", "第2章"] },
    { id: "dc-conquer", name: "递归求解", category: "ch2", description: "递归求解各子问题。", tags: ["conquer", "第2章"] },
    { id: "dc-merge", name: "合并结果", category: "ch2", description: "将子问题的解合并为原问题的解。", tags: ["merge", "第2章"] },
    { id: "dc-condition", name: "分治适用条件", category: "ch2", description: "问题可分解、子问题独立、可合并。", tags: ["条件", "第2章"], mastery: 66 },
    { id: "binary-search", name: "二分搜索", category: "ch2", description: "每次将问题规模减半的经典分治算法。", tags: ["经典算法", "第2章"], mastery: 75 },
    { id: "recurrence", name: "递推关系", category: "ch2", description: "描述分治算法复杂度的数学表达式 T(n)=aT(n/b)+f(n)。", tags: ["复杂度", "第2章"], mastery: 72 },
    { id: "master", name: "主方法", category: "ch2", description: "用于快速求解递推式复杂度的定理。", tags: ["Master定理", "第2章"], mastery: 70 },
    { id: "recursion-tree", name: "递归树法", category: "ch2", description: "通过递归树展开来分析递推关系复杂度。", tags: ["复杂度分析", "第2章"], mastery: 60 },
    { id: "substitution", name: "替换法", category: "ch2", description: "通过数学归纳法证明复杂度上界。", tags: ["数学归纳", "第2章"], mastery: 55 },

    // 第3章：比较排序
    { id: "sorting", name: "排序算法", category: "ch3", description: "将数据重排为有序序列的算法。", tags: ["排序", "第3章"], mastery: 80 },
    { id: "comparison-sort", name: "基于比较排序", category: "ch3", description: "通过元素比较来确定顺序的排序算法。", tags: ["分类", "第3章"], mastery: 78 },
    { id: "insertion", name: "插入排序", category: "ch3", description: "逐步插入构造有序序列的算法。", tags: ["简单排序", "第3章"], mastery: 75 },
    { id: "merge-sort", name: "归并排序", category: "ch3", description: "典型分治排序算法，时间复杂度稳定 O(n log n)。", tags: ["分治", "第3章"], mastery: 85 },
    { id: "quick-sort", name: "快速排序", category: "ch3", description: "基于划分策略的分治排序算法，平均 O(n log n)。", tags: ["分治", "第3章"], mastery: 85 },
    { id: "heap-sort", name: "堆排序", category: "ch3", description: "基于堆结构的排序算法，O(n log n)。", tags: ["堆", "第3章"], mastery: 80 },
    { id: "heap", name: "堆结构", category: "ch3", description: "完全二叉树结构，满足堆序性质（父节点大于/小于子节点）。", tags: ["数据结构", "第3章"], mastery: 70 },

    // 第4章：非比较排序与下界
    { id: "non-comparison-sort", name: "非比较排序", category: "ch4", description: "不通过元素比较实现排序，利用其他信息。", tags: ["分类", "第4章"], mastery: 70 },
    { id: "counting-sort", name: "计数排序", category: "ch4", description: "非比较排序，利用计数统计实现排序，稳定 O(n+k)。", tags: ["线性排序", "第4章"], mastery: 75 },
    { id: "decision-tree", name: "决策树模型", category: "ch4", description: "用于分析比较排序复杂度的理论模型。", tags: ["理论", "第4章"], mastery: 72 },
    { id: "lower-bound", name: "排序下界", category: "ch4", description: "比较排序最少需要 O(n log n) 次比较。", tags: ["理论", "第4章"], mastery: 75 },

    // 第6章：动态规划
    { id: "dp", name: "动态规划", category: "ch6", description: "动态规划是一种用于求解优化问题的算法设计方法，通过保存子问题结果，避免重复计算，并由子问题的最优解推出原问题的最优解。", tags: ["动态规划", "算法思想", "优化问题", "第6章"], mastery: 46 },
    { id: "dp-basic-principle", name: "基本原理", category: "ch6", description: "动态规划的核心思想是将问题分解为子问题，保存子问题结果，并按照一定顺序递推得到原问题答案。", tags: ["基本原理", "递推", "子问题", "第6章"], mastery: 42 },
    { id: "dp-initialization", name: "初始化", category: "ch6", description: "确定最小规模子问题或边界状态的初始值，是动态规划递推计算的起点。", tags: ["初始化", "边界条件", "第6章"], mastery: 48 },
    { id: "dp-bottom-up-induction", name: "自下而上归纳", category: "ch6", description: "先求解小规模子问题，再逐步推出更大规模问题的解，最终得到原问题答案。", tags: ["自底向上", "递推", "归纳", "第6章"], mastery: 44 },
    { id: "dp-basic-steps", name: "基本步骤", category: "ch6", description: "动态规划的一般解题流程包括分段、分析和求解。", tags: ["基本步骤", "解题流程", "第6章"], mastery: 40 },
    { id: "dp-segmentation", name: "分段", category: "ch6", description: "将原问题划分为若干阶段或若干规模递增的子问题。", tags: ["分段", "阶段", "第6章"], mastery: 39 },
    { id: "dp-analysis", name: "分析", category: "ch6", description: "分析问题是否具有最优子结构和重叠子问题，并确定状态、状态转移关系和边界条件。", tags: ["分析", "状态", "转移", "第6章"], mastery: 37 },
    { id: "dp-solving", name: "求解", category: "ch6", description: "按照状态依赖顺序填表或递推，求出最优值，并在需要时恢复最优方案。", tags: ["求解", "填表", "递推", "第6章"], mastery: 36 },
    { id: "dp-features", name: "特征", category: "ch6", description: "动态规划问题通常具有重叠子问题和最优子结构两个关键特征。", tags: ["特征", "判定条件", "第6章"], mastery: 45 },
    { id: "dp-overlapping-subproblems", name: "重叠子问题", category: "ch6", description: "在递归求解过程中，许多子问题会被反复求解，动态规划通过保存结果避免重复计算。", tags: ["重叠子问题", "缓存", "第6章"], mastery: 43 },
    { id: "dp-optimal-substructure", name: "最优子结构", category: "ch6", description: "原问题的最优解可以由其子问题的最优解组合得到。", tags: ["最优子结构", "最优性", "第6章"], mastery: 41 },
    { id: "dp-common-use-cases", name: "常见用例", category: "ch6", description: "书中动态规划部分涉及的典型应用场景，包括矩阵连乘、最长公共子序列、最优二叉搜索树、多级图和最长递增子序列。", tags: ["常见用例", "第6章"], mastery: 40 },
    { id: "matrix-chain", name: "矩阵连乘问题", category: "ch6", description: "给定多个矩阵的连乘顺序，寻找乘法次数最少的完全括号化方式。", tags: ["矩阵连乘", "区间DP", "动态规划用例", "第6章"], mastery: 38 },
    { id: "matrix-chain-application", name: "DNA序列组合", category: "ch6", description: "可类比用于需要优化组合顺序、减少计算代价的序列组合类问题。", tags: ["应用", "序列组合", "第6章"], mastery: 32 },
    { id: "matrix-chain-time", name: "O(n³)", category: "ch6", description: "矩阵连乘动态规划需要枚举区间长度、起点和断点，因此典型时间复杂度为 O(n³)。", tags: ["时间复杂度", "第6章"], mastery: 35 },
    { id: "matrix-chain-space", name: "O(n²)", category: "ch6", description: "需要二维表保存子问题最优值及断点信息，因此空间复杂度通常为 O(n²)。", tags: ["空间复杂度", "第6章"], mastery: 36 },
    { id: "lcs", name: "最长公共子序列", category: "ch6", description: "给定两个序列，求二者共有的、相对顺序一致且长度最长的子序列。", tags: ["最长公共子序列", "序列DP", "动态规划用例", "第6章"], mastery: 41 },
    { id: "lcs-application", name: "文本相似度检测", category: "ch6", description: "可用于比较两个序列的相似性，例如文本比较。", tags: ["应用", "相似度检测", "第6章"], mastery: 34 },
    { id: "lcs-time", name: "O(mn)", category: "ch6", description: "对于长度分别为 m 和 n 的两个序列，需要计算 m×n 个状态。", tags: ["时间复杂度", "第6章"], mastery: 36 },
    { id: "lcs-space", name: "O(mn)", category: "ch6", description: "通常使用二维表保存两个序列前缀之间的最长公共子序列长度。", tags: ["空间复杂度", "第6章"], mastery: 35 },
    { id: "optimal-bst", name: "最优二叉搜索树", category: "ch6", description: "在已知关键字及其查找概率的情况下，构造期望查找代价最小的二叉搜索树。", tags: ["最优二叉搜索树", "区间DP", "动态规划用例", "第6章"], mastery: 30 },
    { id: "optimal-bst-application", name: "字典查找优化", category: "ch6", description: "适用于需要根据访问概率优化查找代价的场景，例如字典、符号表和索引结构设计。", tags: ["应用", "查找优化", "第6章"], mastery: 27 },
    { id: "optimal-bst-time", name: "O(n³)", category: "ch6", description: "需要枚举区间以及区间内可能的根节点，普通动态规划实现时间复杂度为 O(n³)。", tags: ["时间复杂度", "第6章"], mastery: 28 },
    { id: "optimal-bst-space", name: "O(n²)", category: "ch6", description: "需要二维表保存各区间的最优期望代价和最优根节点。", tags: ["空间复杂度", "第6章"], mastery: 28 },
    { id: "multistage-graph", name: "多级图", category: "ch6", description: "顶点按阶段分层，边通常从前一阶段指向后一阶段，可用动态规划求从起点到终点的最优路径。", tags: ["多级图", "图上DP", "动态规划用例", "第6章"], mastery: 34 },
    { id: "multistage-graph-application", name: "最优路径规划", category: "ch6", description: "适用于分阶段决策下的路径优化问题，例如从起点到终点选择总代价最小或收益最大的路径。", tags: ["应用", "路径规划", "第6章"], mastery: 31 },
    { id: "multistage-graph-time", name: "O(|E|)", category: "ch6", description: "按照阶段或拓扑顺序处理每条边，时间复杂度通常与边数成正比。", tags: ["时间复杂度", "第6章"], mastery: 30 },
    { id: "multistage-graph-space", name: "O(|V|)", category: "ch6", description: "通常需要保存每个顶点的最优值和前驱信息，因此空间复杂度与顶点数相关。", tags: ["空间复杂度", "第6章"], mastery: 30 },
    { id: "lis", name: "最长递增子序列", category: "ch6", description: "在一个序列中寻找长度最长的严格递增子序列，子序列不要求连续。", tags: ["最长递增子序列", "序列DP", "动态规划用例", "第6章"], mastery: 43 },
    { id: "lis-application", name: "序列趋势分析", category: "ch6", description: "适用于分析序列中最长递增趋势，例如数值序列、成绩变化或时间序列趋势。", tags: ["应用", "趋势分析", "第6章"], mastery: 36 },
    { id: "lis-time", name: "O(n²)", category: "ch6", description: "基本动态规划做法需要对每个位置枚举其前面的所有位置，因此时间复杂度为 O(n²)。", tags: ["时间复杂度", "第6章"], mastery: 37 },
    { id: "lis-space", name: "O(n)", category: "ch6", description: "需要一维数组保存以每个元素结尾的最长递增子序列长度。", tags: ["空间复杂度", "第6章"], mastery: 38 },

    // 第7章：贪心算法
    { id: "greedy", name: "贪心算法", category: "ch7", description: "每一步选择当前最优解的算法策略", tags: ["核心", "第7章"], mastery: 60 },
    { id: "greedy-strategy", name: "贪心策略", category: "ch7", description: "局部最优选择策略", tags: ["思想", "第7章"] },
    { id: "greedy-process", name: "构造过程", category: "ch7", description: "初始解 + 迭代改进 + 最终解", tags: ["流程", "第7章"] },
    { id: "coin-change", name: "硬币找零问题", category: "ch7", description: "典型贪心问题示例", tags: ["入门", "第7章"] },
    { id: "post-office", name: "最佳邮局问题", category: "ch7", description: "最少邮局覆盖所有住户", tags: ["区间覆盖", "第7章"] },
    { id: "activity-selection", name: "活动安排问题", category: "ch7", description: "选择最多不重叠活动", tags: ["调度", "第7章"] },
    { id: "huffman", name: "哈夫曼编码", category: "ch7", description: "最优前缀编码压缩算法", tags: ["压缩", "第7章"] },
    { id: "prefix-code", name: "前缀码", category: "ch7", description: "无歧义编码方式", tags: ["编码", "第7章"] },
    { id: "huffman-tree", name: "哈夫曼树", category: "ch7", description: "构建最优编码的二叉树", tags: ["树", "第7章"] },
    { id: "fuel-problem", name: "最佳加油问题", category: "ch7", description: "最小成本补给策略", tags: ["路径规划", "第7章"] },

    // 第8章：图的周游算法
    { id: "graph-traversal", name: "图的周游", category: "ch8", description: "系统性地访问图中所有顶点的过程，是图算法的基础。", tags: ["基础", "周游", "第8章"], mastery: 95 },
    { id: "bfs", name: "广度优先搜索 (BFS)", category: "ch8", description: "使用队列按层次访问顶点，先访问距离起点近的顶点。", tags: ["BFS", "层次遍历", "第8章"], mastery: 93 },
    { id: "dfs", name: "深度优先搜索 (DFS)", category: "ch8", description: "使用栈或递归尽可能深地访问顶点，回溯探索其他分支。", tags: ["DFS", "递归", "第8章"], mastery: 92 },
    { id: "bfs-queue", name: "队列实现", category: "ch8", description: "BFS 使用 FIFO 队列保证按层次顺序访问顶点。", tags: ["队列", "实现", "第8章"] },
    { id: "dfs-stack", name: "栈实现", category: "ch8", description: "DFS 使用栈保存待访问顶点，递归本质上也是栈的应用。", tags: ["栈", "实现", "第8章"] },
    { id: "edge-classification", name: "边的分类", category: "ch8", description: "DFS 周游中边可分为树边、后向边、前向边和横向边。", tags: ["边", "分类", "第8章"] },
    { id: "tree-edge", name: "树边", category: "ch8", description: "DFS 过程中首次发现顶点时经过的边。", tags: ["树边", "第8章"] },
    { id: "back-edge", name: "后向边", category: "ch8", description: "指向祖先顶点的边，存在于环中，DFS 可用于环检测。", tags: ["后向边", "第8章"] },
    { id: "forward-edge", name: "前向边", category: "ch8", description: "指向后代顶点的边。", tags: ["前向边", "第8章"] },
    { id: "cross-edge", name: "横向边", category: "ch8", description: "连接无祖先-后代关系的顶点的边。", tags: ["横向边", "第8章"] },
    { id: "traversal-forest", name: "周游森林", category: "ch8", description: "非连通图的 DFS 或 BFS 生成的多棵树构成森林。", tags: ["森林", "连通分量", "第8章"] },
    { id: "topo-sort", name: "拓扑排序", category: "ch8", description: "对有向无环图 (DAG) 的顶点线性排序，使得所有边从前往后。", tags: ["DAG", "排序", "第8章"], mastery: 92 },
    { id: "topo-kahn", name: "Kahn 算法", category: "ch8", description: "基于入度的拓扑排序，不断删除入度为0的顶点。", tags: ["Kahn", "入度", "第8章"] },
    { id: "topo-dfs", name: "DFS 后序拓扑排序", category: "ch8", description: "基于 DFS 完成时间的拓扑排序，后序遍历reverse。", tags: ["DFS", "后序", "第8章"] },
    { id: "aov-network", name: "AOV 网", category: "ch8", description: "Activity On Vertex 网络，顶点表示活动，边表示优先级约束。", tags: ["AOV", "建模", "第8章"] },
    { id: "cycle-detection", name: "环检测", category: "ch8", description: "利用 DFS 后向边检测图中是否存在环。", tags: ["环检测", "应用", "第8章"], mastery: 88 },

    // 第9章：最小生成树 (MST)
    { id: "mst", name: "最小生成树", category: "ch9", description: "无向连通图中边权值之和最小的生成树。", tags: ["MST", "生成树", "第9章"], mastery: 90 },
    { id: "prim", name: "Prim 算法", category: "ch9", description: "基于顶点，从已访问集合出发贪心选择最小边扩展。", tags: ["Prim", "贪心", "第9章"], mastery: 88 },
    { id: "prim-principle", name: "Prim 基本原理", category: "ch9", description: "任意时刻保持已选顶点集是一棵树，逐步扩展。", tags: ["原理", "第9章"] },
    { id: "prim-process", name: "Prim 执行过程", category: "ch9", description: "维护切分，当一条边横跨切分时选择最短横切边。", tags: ["切分", "横切边", "第9章"] },
    { id: "kruskal", name: "Kruskal 算法", category: "ch9", description: "基于边的贪心策略，按权值排序后依次选择不形成环的最小边。", tags: ["Kruskal", "贪心", "第9章"], mastery: 88 },
    { id: "kruskal-principle", name: "Kruskal 基本原理", category: "ch9", description: "每次选择全局最小权边，若不形成环则加入生成树。", tags: ["原理", "第9章"] },
    { id: "union-find", name: "并查集", category: "ch9", description: "支持不相交集合合并与查询的数据结构，用于 Kruskal 判断环。", tags: ["并查集", "数据结构", "第9章"] },
    { id: "union-find-find", name: "Find 操作", category: "ch9", description: "查找元素所在集合的代表元，常用路径压缩优化。", tags: ["Find", "路径压缩", "第9章"] },
    { id: "union-find-union", name: "Union 操作", category: "ch9", description: "合并两个集合，可用按秩/按大小合并优化。", tags: ["Union", "启发式合并", "第9章"] },
    { id: "cut-property", name: "切割性质", category: "ch9", description: "任何横跨两个集合的边中，权重最小边必属于某 MST。", tags: ["理论", "MST性质", "第9章"] },
    { id: "greedy-choice", name: "贪心选择性质", category: "ch9", description: "MST 可以通过一系列局部最优选择（贪心）来构建。", tags: ["贪心", "性质", "第9章"] },
    { id: "mst-application", name: "MST 应用", category: "ch9", description: "网络设计、聚类分析、近似算法（如旅行商问题的 2-近似）。", tags: ["应用", "网络设计", "第9章"], mastery: 82 },

    // 第10章：最短路径
    { id: "shortest-path", name: "最短路径", category: "ch10", description: "在带权图中寻找从一个顶点到其他顶点权值之和最小的路径。", tags: ["最短路", "基础", "第10章"], mastery: 88 },
    { id: "dijkstra", name: "Dijkstra 算法", category: "ch10", description: "单源最短路径算法，适用于非负权边，使用贪心选择最近顶点。", tags: ["Dijkstra", "贪心", "第10章"], mastery: 85 },
    { id: "dijkstra-principle", name: "Dijkstra 基本原理", category: "ch10", description: "已确定最短距离的顶点集逐步扩大，每次选最近未确定顶点。", tags: ["原理", "第10章"] },
    { id: "dijkstra-relaxation", name: "松弛操作", category: "ch10", description: "对从已确定顶点出发的边，若经该边可缩短目标距离则更新。", tags: ["松弛", "操作", "第10章"] },
    { id: "dijkstra-negative", name: "负权边问题", category: "ch10", description: "Dijkstra 要求边权非负，负权边可能导致已选顶点距离被更新。", tags: ["负权", "局限性", "第10章"] },
    { id: "dijkstra-time", name: "时间复杂度", category: "ch10", description: "朴素实现 O(V²)，使用二叉堆 O((V+E)logV)，斐波那契堆可到 O(E+VlogV)。", tags: ["时间复杂度", "第10章"] },
    { id: "bellman-ford", name: "Bellman-Ford 算法", category: "ch10", description: "处理含负权边的单源最短路径算法，可检测负环。", tags: ["Bellman-Ford", "动态规划", "第10章"], mastery: 80 },
    { id: "bellman-ford-principle", name: "Bellman-Ford 基本原理", category: "ch10", description: "对所有边进行 V-1 次松弛操作，保证最短路径至多含 V-1 条边。", tags: ["原理", "第10章"] },
    { id: "bellman-ford-negative-cycle", name: "负环检测", category: "ch10", description: "第 V 次松弛后若仍可缩短距离，则存在负环。", tags: ["负环", "检测", "第10章"] },
    { id: "spfa", name: "SPFA 算法", category: "ch10", description: "Bellman-Ford 的队列优化版本，只对距离改变的顶点进行松弛。", tags: ["SPFA", "队列优化", "第10章"] },
    { id: "floyd-warshall", name: "Floyd-Warshall 算法", category: "ch10", description: "全源最短路径算法，动态规划求解任意两点间最短路径。", tags: ["Floyd", "全源", "第10章"], mastery: 78 },
    { id: "floyd-principle", name: "Floyd 基本原理", category: "ch10", description: "dp[k][i][j] 表示允许经过前 k 个顶点时 i 到 j 的最短路。", tags: ["动态规划", "原理", "第10章"] },
    { id: "floyd-time", name: "时间复杂度", category: "ch10", description: "三层循环，时间复杂度 O(V³)，空间复杂度 O(V²)。", tags: ["时间复杂度", "第10章"] },
    { id: "shortest-path-application", name: "最短路应用", category: "ch10", description: "GPS 导航、网络路由、航班调度、时间优化等问题。", tags: ["应用", "导航", "第10章"], mastery: 75 },

    // 第11章：网络流
    { id: "network-flow", name: "网络流", category: "ch11", description: "研究网络中流量传输优化问题的理论，最大流最小割是核心定理。", tags: ["网络流", "基础", "第11章"], mastery: 78 },
    { id: "max-flow", name: "最大流问题", category: "ch11", description: "在容量网络中找到从源点到汇点的最大可行流量。", tags: ["最大流", "问题", "第11章"], mastery: 75 },
    { id: "flow-network", name: "流网络定义", category: "ch11", description: "带容量限制的有向图，含源点 s 和汇点 t，每条边有容量上界。", tags: ["定义", "容量", "第11章"] },
    { id: "flow-conservation", name: "流量守恒", category: "ch11", description: "除源汇点外，每个中间顶点的入流等于出流。", tags: ["守恒", "约束", "第11章"] },
    { id: "residual-network", name: "残留网络", category: "ch11", description: "表示当前流量状态下还能增加多少流量，含正向残留和反向残留。", tags: ["残留", "Ford-Fulkerson", "第11章"] },
    { id: "augmenting-path", name: "增广路", category: "ch11", description: "残留网络中从源点到汇点的路径，可沿该路径增加流量。", tags: ["增广路", "核心概念", "第11章"] },
    { id: "ford-fulkerson", name: "Ford-Fulkerson 方法", category: "ch11", description: "不断寻找增广路直到不存在可行路径，框架而非具体算法。", tags: ["Ford-Fulkerson", "方法论", "第11章"] },
    { id: "edmonds-karp", name: "Edmonds-Karp 算法", category: "ch11", description: "Ford-Fulkerson 的 BFS 实现，保证每次找到最短增广路。", tags: ["Edmonds-Karp", "BFS", "第11章"] },
    { id: "max-flow-min-cut", name: "最大流最小割定理", category: "ch11", description: "最大流的容量等于最小割的容量，是网络流理论核心定理。", tags: ["定理", "对偶", "第11章"], mastery: 72 },
    { id: "s-t-cut", name: "s-t 割", category: "ch11", description: "将顶点划分为包含源点和汇点两个集合的切割，割容量为横跨边容量之和。", tags: ["割", "定义", "第11章"] },
    { id: "min-cut", name: "最小割", category: "ch11", description: "容量最小的 s-t 割，对偶于最大流问题。", tags: ["最小割", "第11章"], mastery: 72 },
    { id: "bipartite-matching", name: "二分匹配", category: "ch11", description: "将最大匹配问题转化为最大流问题求解。", tags: ["匹配", "二分图", "第11章"] },
    { id: "network-flow-application", name: "网络流应用", category: "ch11", description: "交通网络、图像分割、最大割、信息流等实际问题。", tags: ["应用", "建模", "第11章"], mastery: 70 },

    // 第14章：NP完全问题 (已移除)
  ],
  links: [
    // 第2章：分治法
    { source: "dc", target: "recursion", type: "实现" },
    { source: "dc", target: "dc-steps", type: "包含" },
    { source: "dc-steps", target: "dc-divide", type: "步骤" },
    { source: "dc-steps", target: "dc-conquer", type: "步骤" },
    { source: "dc-steps", target: "dc-merge", type: "步骤" },
    { source: "dc", target: "dc-condition", type: "适用条件" },
    { source: "dc", target: "binary-search", type: "应用" },
    { source: "dc", target: "recurrence", type: "复杂度建模" },
    { source: "recurrence", target: "master", type: "求解" },
    { source: "recurrence", target: "recursion-tree", type: "求解" },
    { source: "recurrence", target: "substitution", type: "求解" },

    // 第3-4章：排序算法
    { source: "sorting", target: "comparison-sort", type: "分类" },
    { source: "sorting", target: "non-comparison-sort", type: "分类" },
    { source: "comparison-sort", target: "insertion", type: "包含" },
    { source: "comparison-sort", target: "merge-sort", type: "包含" },
    { source: "comparison-sort", target: "quick-sort", type: "包含" },
    { source: "comparison-sort", target: "heap-sort", type: "包含" },
    { source: "non-comparison-sort", target: "counting-sort", type: "包含" },
    { source: "dc", target: "merge-sort", type: "应用" },
    { source: "dc", target: "quick-sort", type: "应用" },
    { source: "heap-sort", target: "heap", type: "依赖" },
    { source: "comparison-sort", target: "decision-tree", type: "分析模型" },
    { source: "decision-tree", target: "lower-bound", type: "推导" },

    // 第6章：动态规划
    { source: "dp", target: "dp-basic-principle", type: "包含", strength: 2 },
    { source: "dp", target: "dp-basic-steps", type: "包含", strength: 2 },
    { source: "dp", target: "dp-features", type: "具有", strength: 2 },
    { source: "dp", target: "dp-common-use-cases", type: "常见用例", strength: 2 },
    { source: "dp-basic-principle", target: "dp-initialization", type: "包含", strength: 1.8 },
    { source: "dp-basic-principle", target: "dp-bottom-up-induction", type: "包含", strength: 1.8 },
    { source: "dp-basic-steps", target: "dp-segmentation", type: "包含", strength: 1.8 },
    { source: "dp-basic-steps", target: "dp-analysis", type: "包含", strength: 1.8 },
    { source: "dp-basic-steps", target: "dp-solving", type: "包含", strength: 1.8 },
    { source: "dp-features", target: "dp-overlapping-subproblems", type: "包含", strength: 1.9 },
    { source: "dp-features", target: "dp-optimal-substructure", type: "包含", strength: 1.9 },
    { source: "dp-common-use-cases", target: "matrix-chain", type: "常见用例", strength: 1.8 },
    { source: "dp-common-use-cases", target: "lcs", type: "常见用例", strength: 1.8 },
    { source: "dp-common-use-cases", target: "optimal-bst", type: "常见用例", strength: 1.8 },
    { source: "dp-common-use-cases", target: "multistage-graph", type: "常见用例", strength: 1.8 },
    { source: "dp-common-use-cases", target: "lis", type: "常见用例", strength: 1.8 },
    { source: "matrix-chain", target: "matrix-chain-application", type: "应用", strength: 1.6 },
    { source: "matrix-chain", target: "matrix-chain-time", type: "时间复杂度", strength: 1.6 },
    { source: "matrix-chain", target: "matrix-chain-space", type: "空间复杂度", strength: 1.6 },
    { source: "lcs", target: "lcs-application", type: "应用", strength: 1.6 },
    { source: "lcs", target: "lcs-time", type: "时间复杂度", strength: 1.6 },
    { source: "lcs", target: "lcs-space", type: "空间复杂度", strength: 1.6 },
    { source: "optimal-bst", target: "optimal-bst-application", type: "应用", strength: 1.6 },
    { source: "optimal-bst", target: "optimal-bst-time", type: "时间复杂度", strength: 1.6 },
    { source: "optimal-bst", target: "optimal-bst-space", type: "空间复杂度", strength: 1.6 },
    { source: "multistage-graph", target: "multistage-graph-application", type: "应用", strength: 1.6 },
    { source: "multistage-graph", target: "multistage-graph-time", type: "时间复杂度", strength: 1.6 },
    { source: "multistage-graph", target: "multistage-graph-space", type: "空间复杂度", strength: 1.6 },
    { source: "lis", target: "lis-application", type: "应用", strength: 1.6 },
    { source: "lis", target: "lis-time", type: "时间复杂度", strength: 1.6 },
    { source: "lis", target: "lis-space", type: "空间复杂度", strength: 1.6 },

    // 第7章：贪心算法
    { source: "greedy", target: "greedy-strategy", type: "核心思想" },
    { source: "greedy", target: "greedy-process", type: "实现过程" },
    { source: "greedy", target: "coin-change", type: "基础示例" },
    { source: "greedy", target: "post-office", type: "应用" },
    { source: "greedy", target: "activity-selection", type: "应用" },
    { source: "greedy", target: "huffman", type: "应用" },
    { source: "greedy", target: "fuel-problem", type: "应用" },
    { source: "huffman", target: "prefix-code", type: "基础" },
    { source: "huffman", target: "huffman-tree", type: "实现" },
    // 跨章节连接
    { source: "greedy", target: "prim", type: "联系", strength: 1.8 },
    { source: "greedy", target: "kruskal", type: "联系", strength: 1.8 },
    { source: "greedy", target: "dijkstra", type: "联系", strength: 1.8 },

    // 第8章：图的周游
    { source: "graph-traversal", target: "bfs", type: "包含", strength: 2 },
    { source: "graph-traversal", target: "dfs", type: "包含", strength: 2 },
    { source: "bfs", target: "bfs-queue", type: "实现", strength: 1.8 },
    { source: "dfs", target: "dfs-stack", type: "实现", strength: 1.8 },
    { source: "dfs", target: "edge-classification", type: "引出", strength: 1.8 },
    { source: "edge-classification", target: "tree-edge", type: "分类", strength: 1.5 },
    { source: "edge-classification", target: "back-edge", type: "分类", strength: 1.5 },
    { source: "edge-classification", target: "forward-edge", type: "分类", strength: 1.5 },
    { source: "edge-classification", target: "cross-edge", type: "分类", strength: 1.5 },
    { source: "bfs", target: "traversal-forest", type: "扩展", strength: 1.6 },
    { source: "dfs", target: "traversal-forest", type: "扩展", strength: 1.6 },
    { source: "graph-traversal", target: "topo-sort", type: "应用", strength: 1.8 },
    { source: "topo-sort", target: "topo-kahn", type: "算法", strength: 1.8 },
    { source: "topo-sort", target: "topo-dfs", type: "算法", strength: 1.8 },
    { source: "topo-sort", target: "aov-network", type: "应用", strength: 1.6 },
    { source: "dfs", target: "cycle-detection", type: "应用", strength: 1.8 },
    { source: "bfs", target: "shortest-path", type: "基础", strength: 1.5 },

    // 第9章：最小生成树
    { source: "mst", target: "prim", type: "包含", strength: 2 },
    { source: "mst", target: "kruskal", type: "包含", strength: 2 },
    { source: "prim", target: "prim-principle", type: "原理", strength: 1.8 },
    { source: "prim", target: "prim-process", type: "过程", strength: 1.8 },
    { source: "kruskal", target: "kruskal-principle", type: "原理", strength: 1.8 },
    { source: "kruskal", target: "union-find", type: "依赖", strength: 2 },
    { source: "union-find", target: "union-find-find", type: "操作", strength: 1.8 },
    { source: "union-find", target: "union-find-union", type: "操作", strength: 1.8 },
    { source: "prim", target: "cut-property", type: "理论", strength: 1.6 },
    { source: "kruskal", target: "greedy-choice", type: "理论", strength: 1.6 },
    { source: "mst", target: "mst-application", type: "应用", strength: 1.6 },
    { source: "prim", target: "dijkstra", type: "相似性", strength: 1.5 },

    // 第10章：最短路径
    { source: "shortest-path", target: "dijkstra", type: "包含", strength: 2 },
    { source: "shortest-path", target: "bellman-ford", type: "包含", strength: 2 },
    { source: "shortest-path", target: "floyd-warshall", type: "包含", strength: 1.8 },
    { source: "dijkstra", target: "dijkstra-principle", type: "原理", strength: 1.8 },
    { source: "dijkstra", target: "dijkstra-relaxation", type: "核心操作", strength: 1.8 },
    { source: "dijkstra", target: "dijkstra-negative", type: "局限性", strength: 1.6 },
    { source: "dijkstra", target: "dijkstra-time", type: "复杂度", strength: 1.5 },
    { source: "bellman-ford", target: "bellman-ford-principle", type: "原理", strength: 1.8 },
    { source: "bellman-ford", target: "bellman-ford-negative-cycle", type: "负环检测", strength: 1.8 },
    { source: "bellman-ford", target: "spfa", type: "优化", strength: 1.6 },
    { source: "floyd-warshall", target: "floyd-principle", type: "原理", strength: 1.8 },
    { source: "floyd-warshall", target: "floyd-time", type: "复杂度", strength: 1.5 },
    { source: "shortest-path", target: "shortest-path-application", type: "应用", strength: 1.5 },

    // 第11章：网络流
    { source: "network-flow", target: "max-flow", type: "包含", strength: 2 },
    { source: "network-flow", target: "max-flow-min-cut", type: "核心定理", strength: 2 },
    { source: "max-flow", target: "flow-network", type: "定义", strength: 1.8 },
    { source: "max-flow", target: "flow-conservation", type: "约束", strength: 1.8 },
    { source: "max-flow", target: "residual-network", type: "核心概念", strength: 2 },
    { source: "residual-network", target: "augmenting-path", type: "引出", strength: 1.8 },
    { source: "max-flow", target: "ford-fulkerson", type: "方法", strength: 1.8 },
    { source: "ford-fulkerson", target: "edmonds-karp", type: "实现", strength: 1.6 },
    { source: "max-flow-min-cut", target: "s-t-cut", type: "定义", strength: 1.8 },
    { source: "max-flow-min-cut", target: "min-cut", type: "对偶", strength: 2 },
    { source: "network-flow", target: "bipartite-matching", type: "应用", strength: 1.6 },
    { source: "network-flow", target: "network-flow-application", type: "应用", strength: 1.5 },
    { source: "dijkstra", target: "max-flow", type: "联系", strength: 1.2 },

    // 第14章：NP完全问题 (已移除)
    // 相关链接已移除
  ],
};

// --- 学习/备课链条 ---
const MOCK_LEARNING_CHAINS: LearningChainsData = {
  chains: [
    // 第6章：动态规划
    {
      id: "chain_dp_001",
      name: "动态规划基础认知链",
      description: "从动态规划的定义、基本原理到初始化和自下而上递推，建立动态规划入门框架。",
      difficulty: "EASY",
      estimatedTime: "1小时",
      progress: 46,
      nodes: ["dp", "dp-basic-principle", "dp-initialization", "dp-bottom-up-induction"],
      tags: ["动态规划", "基础", "递推"],
      icon: "timeline",
      color: "#10b981",
    },
    {
      id: "chain_dp_002",
      name: "动态规划解题流程链",
      description: "围绕分段、分析和求解三个步骤，掌握动态规划问题的标准建模流程。",
      difficulty: "MEDIUM",
      estimatedTime: "1.5小时",
      progress: 38,
      nodes: ["dp-basic-steps", "dp-segmentation", "dp-analysis", "dp-solving"],
      tags: ["解题流程", "状态设计", "状态转移"],
      icon: "account_tree",
      color: "#f59e0b",
    },
    {
      id: "chain_dp_003",
      name: "动态规划特征判断链",
      description: "学习如何判断一个问题是否适合使用动态规划，重点掌握重叠子问题和最优子结构。",
      difficulty: "MEDIUM",
      estimatedTime: "1小时",
      progress: 43,
      nodes: ["dp-features", "dp-overlapping-subproblems", "dp-optimal-substructure"],
      tags: ["判定条件", "最优子结构", "重叠子问题"],
      icon: "rule",
      color: "#3b82f6",
    },
    {
      id: "chain_dp_004",
      name: "经典动态规划用例链",
      description: "通过矩阵连乘、最长公共子序列、最优二叉搜索树、多级图和最长递增子序列理解动态规划应用。",
      difficulty: "HARD",
      estimatedTime: "3小时",
      progress: 35,
      nodes: ["dp-common-use-cases", "matrix-chain", "lcs", "optimal-bst", "multistage-graph", "lis"],
      tags: ["经典问题", "应用", "第6章"],
      icon: "hub",
      color: "#ef4444",
    },
    {
      id: "chain_dp_005",
      name: "复杂度与应用分析链",
      description: "比较不同动态规划问题的应用场景、时间复杂度和空间复杂度。",
      difficulty: "HARD",
      estimatedTime: "2.5小时",
      progress: 31,
      nodes: [
        "matrix-chain-application", "matrix-chain-time", "matrix-chain-space",
        "lcs-application", "lcs-time", "lcs-space",
        "optimal-bst-application", "optimal-bst-time", "optimal-bst-space",
        "multistage-graph-application", "multistage-graph-time", "multistage-graph-space",
        "lis-application", "lis-time", "lis-space",
      ],
      tags: ["复杂度", "应用场景", "对比分析"],
      icon: "analytics",
      color: "#8b5cf6",
    },

    // 第7章：贪心算法
    {
      id: "chain_greedy_basic",
      name: "贪心算法基础链",
      description: "理解贪心算法基本思想与流程",
      difficulty: "EASY",
      estimatedTime: "1小时",
      progress: 0,
      nodes: ["greedy", "greedy-strategy", "greedy-process", "coin-change"],
    },
    {
      id: "chain_greedy_app",
      name: "贪心算法应用链",
      description: "掌握经典贪心问题",
      difficulty: "MEDIUM",
      estimatedTime: "2小时",
      progress: 0,
      nodes: ["post-office", "activity-selection", "fuel-problem"],
    },
    {
      id: "chain_huffman",
      name: "哈夫曼编码链",
      description: "理解编码与压缩算法",
      difficulty: "HARD",
      estimatedTime: "2小时",
      progress: 0,
      nodes: ["prefix-code", "huffman-tree", "huffman"],
    },

    // 第8章：图的周游
    {
      id: "chain_008",
      name: "Ch8: 图的遍历基础",
      description: "掌握周游算法及其在拓扑排序中的应用。",
      difficulty: "EASY",
      estimatedTime: "2小时",
      progress: 100,
      nodes: ["graph-traversal", "topo-sort"],
      tags: ["周游", "完成"],
      icon: "account_tree",
      color: "#10b981",
    },

    // 第9-10章：最小生成树与最短路径
    {
      id: "chain_009_010",
      name: "Ch9-10: 贪心与最短路",
      description: "理解 MST 构造与 Dijkstra 的核心逻辑。",
      difficulty: "MEDIUM",
      estimatedTime: "4小时",
      progress: 85,
      nodes: ["prim", "kruskal", "dijkstra", "bellman-ford"],
      tags: ["重点", "教学"],
      icon: "route",
      color: "#3b82f6",
    },

    // 第11章：网络流
    {
      id: "chain_011",
      name: "Ch11: 网络流建模",
      description: "最大流最小割定理及其算法实现。",
      difficulty: "HARD",
      estimatedTime: "5小时",
      progress: 60,
      nodes: ["max-flow", "min-cut"],
      tags: ["建模", "进阶"],
      icon: "water_drop",
      color: "#8b5cf6",
    },
  ],
  recommended: [
    "chain_dp_001", "chain_dp_002", "chain_dp_003",
    "chain_greedy_basic", "chain_greedy_app",
    "chain_011",
  ],
  userProgress: {
    completedChains: 1,
    activeChains: 8,
    totalNodes: 55,
    masteredNodes: 6,
  },
};

function clone<T>(data: T): T {
  return JSON.parse(JSON.stringify(data)) as T;
}

export async function fetchKnowledgeGraph(_jwt?: string): Promise<KnowledgeGraphData> {
  return clone(MOCK_KNOWLEDGE_GRAPH);
}

export async function fetchLearningChains(_jwt?: string): Promise<LearningChainsData> {
  return clone(MOCK_LEARNING_CHAINS);
}
