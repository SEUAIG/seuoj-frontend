import React from 'react';
import { Helmet } from 'react-helmet-async';
import ProblemEditForm from '../bussiness/ProblemEditForm';

export default function ProblemCreatePage() {
  return (
    <div className="w-4/5 mx-auto py-6">
      <Helmet>
        <title>新建题目 - SEUOJ</title>
      </Helmet>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">新建题目</h1>
      </div>
      <ProblemEditForm />
    </div>
  );
}
