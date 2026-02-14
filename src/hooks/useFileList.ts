type FileNode = {
  name: string;
  children?: FileNode[];
};
export function useFileList(tree: FileNode[]) {
  const files: string[] = [];
  const walk = (nodes: FileNode[], prefix: string) => {
    nodes.forEach((node) => {
      const currentPath = prefix ? `${prefix}/${node.name}` : node.name;
      if (node.children && node.children.length > 0) {
        walk(node.children, currentPath);
        return;
      }
      files.push(currentPath);
    });
  };
  walk(tree, "");
  return files;
//   一个dfs 函数 标注对应的小分支 和 前缀
}
//以下为tree 的结构示例 [
//     {
//       "name": "src",
//       "children": [
//         { "name": "main.rs" },
//         { "name": "lib.rs" }
//       ]
//     },
//     { "name": "Cargo.toml" },
//     { "name": "README.md" }
//   ]
