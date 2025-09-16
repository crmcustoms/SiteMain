"use client"

import Link from 'next/link';
import DirectImage from '@/components/common/DirectImage';
import DirectHtmlContent from './DirectHtmlContent';

interface BlogDetailProps {
  articleData: any;
  lang: string;
  htmlContent: string;
  backLinkText?: string;
  relatedArticles?: any[];
}

export default function BlogDetail({
  articleData = {},
  lang = 'ua',
  htmlContent = '',
  backLinkText = "Назад к блогу",
  relatedArticles = []
}: BlogDetailProps) {
  // Получаем URL изображения
  const coverImageUrl = articleData?.property_2 || 
                        articleData?.property_photo1 || 
                        articleData?.image || 
                        articleData?.cover?.file?.url || 
                        '';
  
  return (
    <div className="w-full bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div>
          <Link href={`/${lang}/blog`} className="text-blue-600 hover:underline mb-6 inline-block">
            ← {backLinkText}
          </Link>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-2/3">
            <article className="bg-white rounded-lg shadow-md overflow-hidden">
              {coverImageUrl && (
                <div className="w-full h-64 md:h-96 relative">
                  <DirectImage 
                    src={coverImageUrl}
                    alt={articleData.name || 'Обложка статьи'}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div className="p-6">
                <h1 className="text-3xl font-bold mb-4">{articleData.name || articleData.title || ''}</h1>
                <DirectHtmlContent html={htmlContent} />
              </div>
            </article>
          </div>
          
          {relatedArticles && relatedArticles.length > 0 && (
          <div className="w-full lg:w-1/3">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold mb-4">Похожие статьи</h2>
                <ul className="space-y-4">
                  {relatedArticles.map((article: any, index: number) => (
                    <li key={article.id || index}>
                      <Link href={`/${lang}/blog/${article.slug || article.property_link_name || ''}`} className="flex items-center gap-4 hover:bg-gray-50 p-2 rounded">
                        {article.property_2 && (
                          <div className="w-16 h-16 relative flex-shrink-0">
                            <DirectImage 
                              src={article.property_2}
                              alt={article.name || article.title || ''}
                              className="w-full h-full object-cover rounded"
                            />
                          </div>
                        )}
                        <span className="font-medium">{article.name || article.title || ''}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
