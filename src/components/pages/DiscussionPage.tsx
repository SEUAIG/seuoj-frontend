import React from 'react'
import { Helmet } from 'react-helmet-async'
import AIChat from '../common/AIChat'

export default function DiscussionPage() {
  return (
    <div>
      <Helmet>
        <title>讨论 - SEUOJ</title>
      </Helmet>
      DiscussionPage
      <AIChat/>
    </div>
  )
}
