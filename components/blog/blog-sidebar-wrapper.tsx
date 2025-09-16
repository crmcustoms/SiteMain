'use client';

import dynamic from 'next/dynamic';
import { Card, CardContent } from "@/components/ui/card";

// Динамический импорт клиентского компонента с отключенным SSR
const BlogSidebar = dynamic(() => import('./blog-sidebar'), { 
  ssr: false,
  loading: () => <BlogSidebarSkeleton />
});

// Скелетон для отображения во время загрузки
function BlogSidebarSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((item) => (
        <Card key={item}>
          <div className="p-6">
            <div className="h-6 w-3/4 bg-muted rounded mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="h-4 bg-muted rounded w-5/6"></div>
              <div className="h-4 bg-muted rounded w-4/6"></div>
            </div>
          </div>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3].map((btn) => (
                <div key={btn} className="h-8 w-20 bg-muted rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function BlogSidebarWrapper({ dict, lang = 'ua' }: { dict: any; lang?: string }) {
  return <BlogSidebar dict={dict} lang={lang} />;
} 