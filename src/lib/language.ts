export function languageLabel(name: string): string {
  if (/^Cpp\d*$/.test(name)) return name.replace("Cpp", "C++");
  return name === "Nodejs" ? "Node.js" : name;
}
