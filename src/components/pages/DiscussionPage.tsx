import React from 'react'
import { Helmet } from 'react-helmet-async'
import AIChat from '../common/AIChat'

export default function DiscussionPage() {
  return (
    <div>
      <Helmet>
        <title>讨论 - SeuOJ</title>
      </Helmet>
      DiscussionPage
      <AIChat/>
    </div>
  )
}
