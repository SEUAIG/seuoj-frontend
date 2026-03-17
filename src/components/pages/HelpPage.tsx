import React from "react";
import { Helmet } from "react-helmet-async";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function HelpPage() {
  const quickLinks = [
    {
      title: "题库",
      desc: "按关键词与标签检索题目，进入题目详情后可直接提交代码。",
    },
    {
      title: "比赛",
      desc: "支持按时间、状态、赛制筛选比赛，并可报名/取消报名。",
    },
    { title: "班级", desc: "支持创建、加入、成员管理、关联比赛与题单。" },
    {
      title: "题单",
      desc: "支持创建题单、维护题单信息、查看题单题目数量与公开性。",
    },
    {
      title: "评测",
      desc: "查看提交记录分页列表，快速跳转到提交详情与题目详情。",
    },
    { title: "个人中心", desc: "查看个人提交统计、热力图与历史提交信息。" },
  ];

  return (
    <div className="w-4/5 mx-auto py-6 space-y-6 min-h-screen overflow-x-hidden">
      <Helmet>
        <title>帮助 - SeuOJ</title>
      </Helmet>

      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-semibold">帮助中心</div>
        </div>
        <Badge variant="secondary">持续更新</Badge>
      </div>

      <Card className="border bg-card/60">
        <CardContent className="p-5 space-y-4">
          <div className="text-base font-semibold">快速导览</div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {quickLinks.map((item) => (
              <div
                key={item.title}
                className="rounded-lg border bg-background/70 p-3 space-y-1"
              >
                <div className="font-medium">{item.title}</div>
                <div className="text-sm text-muted-foreground">{item.desc}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border bg-card/60">
        <CardContent className="p-5">
          <Accordion type="multiple" className="w-full">
            <AccordionItem value="account">
              <AccordionTrigger>账号与登录</AccordionTrigger>
              <AccordionContent className="space-y-3 text-sm text-muted-foreground">
                <p>
                  你可以在登录页完成登录，也可以在注册页创建新账号；如果忘记密码，可使用找回入口。
                </p>
                <p>登录后，右上角头像菜单可进入个人中心或退出登录。</p>
                <p>
                  建议先完成账号注册与登录，再进行做题、报名比赛和班级相关操作。
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="problems">
              <AccordionTrigger>题库与做题</AccordionTrigger>
              <AccordionContent className="space-y-3 text-sm text-muted-foreground">
                <p>
                  在题库中可通过关键词和标签快速找题，适合按知识点或题目类型安排练习。
                </p>
                <p>
                  进入题目详情后可查看题面、限制和样例，并选择语言进行提交。
                </p>
                <p>
                  提交后可在提交详情查看评测结果、测试点信息与提交代码，便于复盘。
                </p>
                <p>
                  常见结果包括
                  AC、WA、TLE、MLE、RE、CE，你可以据此快速判断问题方向。
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="contest">
              <AccordionTrigger>
                比赛模块（列表、详情、报名、题目）
              </AccordionTrigger>
              <AccordionContent className="space-y-3 text-sm text-muted-foreground">
                <p>
                  比赛列表支持按标题、状态、赛制和时间范围筛选，方便快速定位目标比赛。
                </p>
                <p>
                  比赛详情页会展示比赛时间、赛制、说明与题目列表，并支持报名或取消报名。
                </p>
                <p>报名后可进入比赛题目进行提交，并查看比赛内的提交记录。</p>
                <p>
                  比赛组织者可创建和维护比赛信息，如标题、赛制、时间区间与可见性设置。
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="problemset">
              <AccordionTrigger>题单模块（创建、查看、维护）</AccordionTrigger>
              <AccordionContent className="space-y-3 text-sm text-muted-foreground">
                <p>
                  题单列表会展示标题、题目数量与公开状态，方便你按专题浏览练习内容。
                </p>
                <p>你可以创建自己的题单，并维护题单内的题目顺序与内容。</p>
                <p>题单详情可直接跳转到具体题目，适合按阶段制定学习计划。</p>
                <p>你也可以随时更新题单信息，让题单持续贴合训练目标。</p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="class">
              <AccordionTrigger>
                班级模块（成员、关联比赛、关联题单）
              </AccordionTrigger>
              <AccordionContent className="space-y-3 text-sm text-muted-foreground">
                <p>
                  班级列表支持创建、加入、更新和删除班级，便于组织课程与作业练习。
                </p>
                <p>
                  班级详情分为成员列表、已关联比赛、已关联题单三部分，管理结构清晰。
                </p>
                <p>
                  你可以在班级中管理成员，也可以把比赛和题单加入班级统一学习。
                </p>
                <p>如果内容不再需要，可随时解除班级与比赛/题单的关联。</p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="evaluation">
              <AccordionTrigger>评测记录与提交详情</AccordionTrigger>
              <AccordionContent className="space-y-3 text-sm text-muted-foreground">
                <p>
                  评测页会集中展示你的提交记录，包括题号、状态、结果、语言和提交时间。
                </p>
                <p>评测中的记录会实时变化，你可以手动刷新查看最新结果。</p>
                <p>
                  点击任意记录可进入提交详情，查看更完整的评测信息和代码内容。
                </p>
                <p>
                  点击题号可回到题目详情继续练习，形成“做题—提交—复盘”的连续流程。
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="personal">
              <AccordionTrigger>个人中心与统计</AccordionTrigger>
              <AccordionContent className="space-y-3 text-sm text-muted-foreground">
                <p>个人中心可查看个人资料、提交统计、近期活跃情况与热力图。</p>
                <p>
                  你可以按时间查看历史提交，快速找到最近做过的题目和对应结果。
                </p>
                <p>
                  通过右上角头像菜单可快速进入个人中心，也可安全退出当前账号。
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
