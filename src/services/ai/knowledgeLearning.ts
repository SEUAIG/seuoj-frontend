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
    { id: "algo-basics", name: "算法基础", category: "core", description: "理解算法的基本概念与分析方法。", tags: ["基础", "入门"], mastery: 82 },
    { id: "complexity", name: "复杂度分析", category: "complexity", description: "掌握时间复杂度和空间复杂度的评估方法。", tags: ["复杂度", "分析"], mastery: 74 },
    { id: "array", name: "数组", category: "data-structure", description: "线性连续存储结构，支持快速随机访问。", tags: ["线性结构"], mastery: 88 },
    { id: "linked-list", name: "链表", category: "data-structure", description: "由节点连接组成，插入删除灵活。", tags: ["线性结构"], mastery: 72 },
    { id: "stack", name: "栈", category: "data-structure", description: "后进先出结构，常用于表达式与回溯。", tags: ["LIFO"], mastery: 79 },
    { id: "queue", name: "队列", category: "data-structure", description: "先进先出结构，常用于层序遍历。", tags: ["FIFO"], mastery: 77 },
    { id: "tree", name: "树", category: "data-structure", description: "层次结构数据模型。", tags: ["层次结构"], mastery: 63 },
    { id: "graph", name: "图", category: "data-structure", description: "用于表示复杂关系网络。", tags: ["关系建模"], mastery: 54 },
    { id: "sorting", name: "排序算法", category: "algorithm", description: "掌握常见排序方法与适用场景。", tags: ["排序"], mastery: 70 },
    { id: "searching", name: "查找算法", category: "algorithm", description: "学习顺序查找、二分查找等方法。", tags: ["查找"], mastery: 73 },
    { id: "recursion", name: "递归", category: "algorithm", description: "通过函数自调用解决问题。", tags: ["思想"], mastery: 66 },
    { id: "dp", name: "动态规划", category: "algorithm", description: "利用最优子结构与重叠子问题。", tags: ["进阶"], mastery: 46 },
    { id: "dfs", name: "深度优先搜索", category: "application", description: "沿着路径尽可能深入再回溯。", tags: ["图搜索"], mastery: 58 },
    { id: "bfs", name: "广度优先搜索", category: "application", description: "按层推进，常用于最短步数问题。", tags: ["图搜索"], mastery: 57 },
    { id: "shortest-path", name: "最短路径", category: "application", description: "求两点之间代价最小路径。", tags: ["图算法"], mastery: 35 },
  ],
  links: [
    { source: "algo-basics", target: "complexity", type: "基础", strength: 2 },
    { source: "complexity", target: "sorting", type: "分析", strength: 1.6 },
    { source: "array", target: "sorting", type: "应用", strength: 1.8 },
    { source: "array", target: "searching", type: "应用", strength: 1.5 },
    { source: "linked-list", target: "stack", type: "实现", strength: 1.2 },
    { source: "linked-list", target: "queue", type: "实现", strength: 1.2 },
    { source: "tree", target: "dfs", type: "遍历", strength: 1.6 },
    { source: "graph", target: "dfs", type: "遍历", strength: 1.8 },
    { source: "graph", target: "bfs", type: "遍历", strength: 1.8 },
    { source: "recursion", target: "dfs", type: "思想", strength: 1.6 },
    { source: "recursion", target: "dp", type: "进阶", strength: 1.7 },
    { source: "bfs", target: "shortest-path", type: "基础", strength: 1.8 },
    { source: "dp", target: "shortest-path", type: "优化", strength: 1.2 },
    { source: "queue", target: "bfs", type: "支撑", strength: 1.5 },
  ],
};

const MOCK_LEARNING_CHAINS: LearningChainsData = {
  chains: [
    {
      id: "chain_001",
      name: "数据结构入门链",
      description: "从数组、链表到栈和队列，建立线性结构基础。",
      difficulty: "EASY",
      estimatedTime: "2小时",
      progress: 68,
      nodes: ["array", "linked-list", "stack", "queue"],
      tags: ["入门", "数据结构"],
      icon: "data_array",
      color: "#10b981",
    },
    {
      id: "chain_002",
      name: "排序与查找链",
      description: "系统学习排序和查找算法，以及复杂度分析。",
      difficulty: "MEDIUM",
      estimatedTime: "1.5小时",
      progress: 42,
      nodes: ["complexity", "sorting", "searching"],
      tags: ["算法", "分析"],
      icon: "sort",
      color: "#f59e0b",
    },
    {
      id: "chain_003",
      name: "图搜索进阶链",
      description: "掌握 DFS 与 BFS，并应用到最短路径问题。",
      difficulty: "HARD",
      estimatedTime: "3小时",
      progress: 24,
      nodes: ["graph", "dfs", "bfs", "shortest-path"],
      tags: ["图论", "搜索"],
      icon: "hub",
      color: "#ef4444",
    },
    {
      id: "chain_004",
      name: "递归与动态规划链",
      description: "理解递归思想并过渡到动态规划建模。",
      difficulty: "HARD",
      estimatedTime: "2.5小时",
      progress: 18,
      nodes: ["recursion", "dp"],
      tags: ["递归", "DP"],
      icon: "timeline",
      color: "#8b5cf6",
    },
  ],
  recommended: ["chain_001", "chain_002"],
  userProgress: {
    completedChains: 0,
    activeChains: 2,
    totalNodes: 15,
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
