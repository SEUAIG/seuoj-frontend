import React from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";

interface Contributor {
  login: string;
  name: string;
  avatar: string;
  github: string;
}

const leadContributors: Contributor[] = [
  {
    login: "huan-yp",
    name: "huan-yp",
    avatar: "https://avatars.githubusercontent.com/u/85162020?v=4",
    github: "https://github.com/huan-yp",
  },
  {
    login: "harkerhand",
    name: "Harker Hand",
    avatar: "https://avatars.githubusercontent.com/u/74459478?v=4",
    github: "https://github.com/harkerhand",
  },
];

const contributors: Contributor[] = [
  {
    login: "wbxnll",
    name: "wbxnll",
    avatar: "https://avatars.githubusercontent.com/u/144982048?v=4",
    github: "https://github.com/wbxnll",
  },
  {
    login: "twilight0702",
    name: "Twilight",
    avatar: "https://avatars.githubusercontent.com/u/149226706?v=4",
    github: "https://github.com/twilight0702",
  },
  {
    login: "RunMarshal",
    name: "Ziyang Guo",
    avatar: "https://avatars.githubusercontent.com/u/121015044?v=4",
    github: "https://github.com/RunMarshal",
  },
  {
    login: "PingGuoLiZiJvZi",
    name: "Apple Plum Orange",
    avatar: "https://avatars.githubusercontent.com/u/184715950?v=4",
    github: "https://github.com/PingGuoLiZiJvZi",
  },
  {
    login: "hahavguoqu",
    name: "Haowen Zheng",
    avatar: "https://avatars.githubusercontent.com/u/186530647?v=4",
    github: "https://github.com/hahavguoqu",
  },
];

function ContributorCard({ contributor, gold }: { contributor: Contributor; gold?: boolean }) {
  return (
    <a
      href={contributor.github}
      target="_blank"
      rel="noopener noreferrer"
      className={`group flex flex-col items-center gap-3 rounded-xl border bg-background/70 p-5 transition-all hover:shadow-md ${
        gold
          ? "border-amber-400/60 hover:border-amber-400 shadow-[0_0_8px_-2px_rgba(251,191,36,0.2)]"
          : "hover:border-primary/30"
      }`}
    >
      <img
        src={contributor.avatar}
        alt={contributor.name}
        className={`h-20 w-20 rounded-full ring-2 transition-all ${
          gold
            ? "ring-amber-400/50 group-hover:ring-amber-400"
            : "ring-border group-hover:ring-primary/40"
        }`}
      />
      <div className="text-center">
        <div className="font-medium">{contributor.name}</div>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <span>@{contributor.login}</span>
          <ExternalLink className="h-3 w-3" />
        </div>
      </div>
    </a>
  );
}

export default function ContributorsPage() {
  return (
    <div className="w-4/5 mx-auto py-6 space-y-6 min-h-screen overflow-x-hidden">
      <Helmet>
        <title>贡献者 - SEUOJ</title>
      </Helmet>

      <div className="text-2xl font-semibold">贡献者</div>

      <Card className="border bg-card/60">
        <CardContent className="p-6 space-y-8">
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {leadContributors.map((c) => (
              <ContributorCard key={c.login} contributor={c} gold />
            ))}
            {contributors.map((c) => (
              <ContributorCard key={c.login} contributor={c} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
