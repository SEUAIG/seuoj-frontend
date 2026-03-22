import React from 'react'
import { Helmet } from 'react-helmet-async'
import { useParams, useNavigate } from 'react-router-dom'
import ProblemEditForm from '../bussiness/ProblemEditForm'
import { Button } from '../ui/button'
import { Settings } from 'lucide-react'

export default function ProblemEditPage() {
  const { id } = useParams()
  const nav = useNavigate()
  
  return (
    <div className="w-4/5 mx-auto py-6">
      <Helmet>
        <title>{`编辑题目 #${id} - SeuOJ`}</title>
      </Helmet>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">编辑题目 #{id}</h1>
        <Button variant="outline" onClick={() => nav(`/problemsLibrary/${id}/judgeConfig`)}>
          <Settings className="w-4 h-4 mr-2" />
          配置数据点
        </Button>
      </div>
      <ProblemEditForm pid={id || ''} />
    </div>
  )
}