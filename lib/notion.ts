import { Client } from "@notionhq/client"
import { NotionToMarkdown } from "notion-to-md"

const notion = new Client({ auth: process.env.NOTION_SECRET || "" })
const n2m = new NotionToMarkdown({ notionClient: notion })

const databaseId = "13f1abc6131b80168787f15b59c68e19"

export async function getNotionPosts() {
  const response = await notion.databases.query({
    database_id: databaseId,
    filter: { property: "Status", multi_select: { contains: "Опубликовано" } },
    sorts: [{ property: "Date of publication", direction: "descending" }],
  })
  return response.results
}

export async function getNotionPostById(pageId: string) {
  // Получаем свойства страницы
  const page = await notion.pages.retrieve({ page_id: pageId })
  // Получаем содержимое страницы (блоки)
  const blocks = await notion.blocks.children.list({ block_id: pageId })
  // Преобразуем блоки в markdown
  const mdBlocks = await n2m.pageToMarkdown(pageId)
  const mdString = n2m.toMarkdownString(mdBlocks)
  return {
    properties: (page as any).properties || {},
    content: mdString,
  }
} 