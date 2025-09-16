'use client';

import React from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import Link from 'next/link';

interface BlogPageClientProps {
  lang: string;
}

export default function BlogPageClient({ lang }: BlogPageClientProps) {
  return (
    <ErrorBoundary
      fallback={
        <div className="mt-4">
          <Link href={`/${lang}`} className="text-blue-500 hover:underline">
            На главную
          </Link>
        </div>
      }
    >
      <div className="container py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Блог</h1>
          <p className="mb-6">Загрузка статей...</p>
          <Link href={`/${lang}`} className="text-blue-500 hover:underline">
            На главную
          </Link>
        </div>
      </div>
    </ErrorBoundary>
  );
} 