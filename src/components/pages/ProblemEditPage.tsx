import React from 'react'
import { Helmet } from 'react-helmet-async'
import { useParams } from 'react-router-dom'
import ProblemEditForm from '../bussiness/ProblemEditForm'

export default function ProblemEditPage() {
  const { id } = useParams()
  
  return (
    <div className="w-4/5 mx-auto py-6">
      <Helmet>
        <title>{`编辑题目 #${id} - SeuOJ`}</title>
      </Helmet>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">编辑题目 #{id}</h1>
      </div>
      <ProblemEditForm pid={id || ''} />
    </div>
  )
}