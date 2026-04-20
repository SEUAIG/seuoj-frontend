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

const MOCK_KNOWLEDGE_GRAPH: KnowledgeGraphData = {
  nodes: [
    { id: "algo-basics", name: "算法基础", category: "core", description: "算法的基本概念、特性和评价标准", tags: ["入门", "基础"], mastery: 85 },
    { id: "complexity", name: "复杂度分析", category: "complexity", description: "时间复杂度和空间复杂度的分析方法", tags: ["大O表示法", "渐进分析"], mastery: 78 },
    { id: "array", name: "数组", category: "data-structure", description: "连续存储的线性数据结构", tags: ["线性结构", "随机访问"], mastery: 90 },
    { id: "linked-list", name: "链表", category: "data-structure", description: "链式存储的线性数据结构", tags: ["线性结构", "动态存储"], mastery: 75 },
    { id: "stack", name: "栈", category: "data-structure", description: "LIFO后进先出的数据结构", tags: ["LIFO", "函数调用"], mastery: 82 },
    { id: "queue", name: "队列", category: "data-structure", description: "FIFO先进先出的数据结构", tags: ["FIFO", "任务调度"], mastery: 80 },
    { id: "tree", name: "树", category: "data-structure", description: "层次结构的非线性数据结构", tags: ["层次结构", "递归"], mastery: 65 },
    { id: "binary-tree", name: "二叉树", category: "data-structure", description: "每个节点最多有两个子节点的树", tags: ["遍历", "递归"], mastery: 70 },
    { id: "bst", name: "二叉搜索树", category: "data-structure", description: "有序的二叉树结构", tags: ["查找", "有序"], mastery: 62 },
    { id: "heap", name: "堆", category: "data-structure", description: "满足堆性质的完全二叉树", tags: ["优先队列", "排序"], mastery: 55 },
    { id: "graph", name: "图", category: "data-structure", description: "由顶点和边组成的数据结构", tags: ["网络", "关系"], mastery: 50 },
    { id: "hash-table", name: "哈希表", category: "data-structure", description: "基于哈希函数的数据结构", tags: ["O(1)查找", "冲突处理"], mastery: 68 },
    { id: "sorting", name: "排序算法", category: "algorithm", description: "将数据按特定顺序排列的算法", tags: ["比较排序", "非比较排序"], mastery: 72 },
    { id: "searching", name: "搜索算法", category: "algorithm", description: "在数据集中查找目标的算法", tags: ["线性查找", "二分查找"], mastery: 76 },
    { id: "recursion", name: "递归", category: "algorithm", description: "函数调用自身的编程技巧", tags: ["基准情况", "递归调用"], mastery: 70 },
    { id: "divide-conquer", name: "分治法", category: "algorithm", description: "将问题分解为子问题求解", tags: ["分解", "合并"], mastery: 58 },
    { id: "dp", name: "动态规划", category: "algorithm", description: "通过存储子问题解避免重复计算", tags: ["最优子结构", "重叠子问题"], mastery: 45 },
    { id: "greedy", name: "贪心算法", category: "algorithm", description: "每步选择局部最优的策略", tags: ["局部最优", "贪心选择"], mastery: 52 },
    { id: "backtracking", name: "回溯算法", category: "algorithm", description: "通过试探和回退寻找解", tags: ["深度优先", "剪枝"], mastery: 40 },
    { id: "dfs", name: "深度优先搜索", category: "algorithm", description: "沿深度方向遍历图或树", tags: ["栈", "递归"], mastery: 60 },
    { id: "bfs", name: "广度优先搜索", category: "algorithm", description: "按层次遍历图或树", tags: ["队列", "最短路径"], mastery: 58 },
    { id: "shortest-path", name: "最短路径", category: "application", description: "求图中两点间最短距离", tags: ["Dijkstra", "Floyd"], mastery: 35 },
    { id: "mst", name: "最小生成树", category: "application", description: "连接所有顶点的最小代价树", tags: ["Prim", "Kruskal"], mastery: 30 },
    { id: "string-match", name: "字符串匹配", category: "application", description: "在文本中查找模式串", tags: ["KMP", "BM"], mastery: 25 },
  ],
  links: [
    { source: "algo-basics", target: "complexity", type: "包含", strength: 2 },
    { source: "complexity", target: "sorting", type: "应用于", strength: 1.5 },
    { source: "complexity", target: "searching", type: "应用于", strength: 1.5 },
    { source: "array", target: "linked-list", type: "对比", strength: 1 },
    { source: "array", target: "sorting", type: "基础", strength: 2 },
    { source: "linked-list", target: "stack", type: "实现", strength: 1.5 },
    { source: "linked-list", target: "queue", type: "实现", strength: 1.5 },
    { source: "tree", target: "binary-tree", type: "特化", strength: 2 },
    { source: "binary-tree", target: "bst", type: "特化", strength: 2 },
    { source: "binary-tree", target: "heap", type: "特化", strength: 2 },
    { source: "graph", target: "tree", type: "特例", strength: 1.5 },
    { source: "hash-table", target: "array", type: "基于", strength: 1.5 },
    { source: "stack", target: "recursion", type: "支撑", strength: 2 },
    { source: "stack", target: "dfs", type: "实现", strength: 2 },
    { source: "queue", target: "bfs", type: "实现", strength: 2 },
    { source: "recursion", target: "divide-conquer", type: "基础", strength: 2 },
    { source: "divide-conquer", target: "dp", type: "演化", strength: 2 },
    { source: "recursion", target: "backtracking", type: "基础", strength: 2 },
    { source: "dfs", target: "backtracking", type: "应用", strength: 1.5 },
    { source: "heap", target: "sorting", type: "堆排序", strength: 1.5 },
    { source: "bst", target: "searching", type: "应用", strength: 2 },
    { source: "graph", target: "dfs", type: "遍历", strength: 2 },
    { source: "graph", target: "bfs", type: "遍历", strength: 2 },
    { source: "bfs", target: "shortest-path", type: "基础", strength: 2 },
    { source: "greedy", target: "shortest-path", type: "Dijkstra", strength: 2 },
    { source: "greedy", target: "mst", type: "应用", strength: 2 },
    { source: "dp", target: "shortest-path", type: "Floyd", strength: 1.5 },
    { source: "dp", target: "string-match", type: "应用", strength: 1.5 },
  ],
};

const MOCK_LEARNING_CHAINS: LearningChainsData = {
  chains: [
    {
      id: "chain_001",
      name: "数据结构入门之路",
      description: "从基础数据结构开始，逐步掌握线性和非线性数据结构",
      difficulty: "EASY",
      estimatedTime: "2周",
      progress: 65,
      nodes: ["array", "linked-list", "stack", "queue", "tree", "binary-tree"],
      tags: ["入门", "数据结构", "基础"],
      icon: "data_array",
      color: "#10b981",
    },
    {
      id: "chain_002",
      name: "排序算法精通",
      description: "系统学习各种排序算法，理解其时间空间复杂度",
      difficulty: "MEDIUM",
      estimatedTime: "1周",
      progress: 40,
      nodes: ["sorting", "array", "divide-conquer", "heap", "complexity"],
      tags: ["排序", "算法", "复杂度"],
      icon: "sort",
      color: "#f59e0b",
    },
    {
      id: "chain_003",
      name: "动态规划突破",
      description: "从递归到记忆化再到DP，掌握动态规划的思维方式",
      difficulty: "HARD",
      estimatedTime: "3周",
      progress: 20,
      nodes: ["recursion", "divide-conquer", "dp", "string-match", "shortest-path"],
      tags: ["DP", "进阶", "算法"],
      icon: "timeline",
      color: "#8b5cf6",
    },
    {
      id: "chain_004",
      name: "图论算法探索",
      description: "学习图的表示、遍历和经典图算法",
      difficulty: "HARD",
      estimatedTime: "2周",
      progress: 15,
      nodes: ["graph", "dfs", "bfs", "shortest-path", "mst"],
      tags: ["图论", "DFS", "BFS"],
      icon: "hub",
      color: "#ef4444",
    },
    {
      id: "chain_005",
      name: "搜索与回溯",
      description: "掌握搜索算法和回溯思想，解决组合优化问题",
      difficulty: "MEDIUM",
      estimatedTime: "10天",
      progress: 30,
      nodes: ["searching", "recursion", "dfs", "backtracking", "bst"],
      tags: ["搜索", "回溯", "递归"],
      icon: "search",
      color: "#135bec",
    },
  ],
  recommended: ["chain_001", "chain_002"],
  userProgress: {
    completedChains: 0,
    activeChains: 2,
    totalNodes: 24,
    masteredNodes: 8,
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
