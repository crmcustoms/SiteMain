'use client';

import React from 'react';
import ErrorBoundary from '../components/ErrorBoundary';
import Link from 'next/link';

interface BlogClientPageProps {
  lang: string;
  slug: string;
  articleTitle?: string;
}

export default function BlogArticleClientPage({ lang, slug, articleTitle }: BlogClientPageProps) {
  return (
    <ErrorBoundary
      fallback={
        <div className="mt-4">
          <Link href={`/${lang}/blog`} className="text-blue-500 hover:underline">
            Вернуться к блогу
          </Link>
        </div>
      }
    >
      <div className="container py-12">
        <Link href={`/${lang}/blog`} className="mb-4 block text-blue-500 hover:underline">
          Назад к блогу
        </Link>
        
        <div>
          <h1 className="text-3xl font-bold mb-4">{articleTitle || 'Загрузка статьи...'}</h1>
          <p className="mb-4">Идентификатор статьи: {slug}</p>
        </div>
      </div>
    </ErrorBoundary>
  );
} 