import { hasCapability } from "@/lib/capabilities";
import { Navigate } from "react-router-dom";
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/store';
import ProblemEditForm from '../bussiness/ProblemEditForm';
import ProblemImportDialog from '../bussiness/ProblemImportDialog';

export default function ProblemCreatePage() {
  const user = useSelector((state: RootState) => state.auth.user);
  const canImportProblem = hasCapability(user, "PROBLEM_CREATE");
  if (!canImportProblem) return <Navigate to="/unauthorized" replace />;

  return (
    <div className="w-4/5 mx-auto py-6">
      <Helmet>
        <title>新建题目 - SEUOJ</title>
      </Helmet>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">新建题目</h1>
          {canImportProblem ? (
            <p className="text-sm text-muted-foreground mt-1">
              也可以直接导入一个题目包，一次性完成建题、测试数据上传与评测配置
            </p>
          ) : null}
        </div>
        {canImportProblem ? <ProblemImportDialog /> : null}
      </div>
      <ProblemEditForm />
    </div>
  );
}
