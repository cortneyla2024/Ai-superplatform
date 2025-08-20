import { SearchIndexer } from "./search-indexer";
import { db, Post, KnowledgeEntry } from "../db/file-db";

interface SearchResult {
  id: string;
  type: "post" | "knowledge";
  title: string;
  content: string;
  tags: string[];
  score: number;
  createdAt: string;
}

export class SearchQuery {
  private indexer: SearchIndexer;

  constructor() {
    this.indexer = new SearchIndexer();
  }

  async buildIndex(): Promise<void> {
    console.log("Building search index...");

    // Index posts
    const posts = await db.getPosts();
    posts.forEach(post => {
      this.indexer.addDocument({
        id: post.id,
        title: post.title,
        content: post.content,
        tags: post.tags,
      });
    });

    // Index knowledge entries
    const knowledgeEntries = await db.getKnowledgeEntries();
    knowledgeEntries.forEach(entry => {
      this.indexer.addDocument({
        id: entry.id,
        title: entry.title,
        content: entry.content,
        tags: entry.tags,
      });
    });

    const stats = this.indexer.getIndexStats();
    console.log(`Search index built: ${stats.totalDocuments} documents, ${stats.totalTerms} terms`);
  }

  async search(query: string, limit: number = 10): Promise<SearchResult[]> {
    if (!query.trim()) {
      return [];
    }

    const searchResults = this.indexer.search(query, limit);
    const results: SearchResult[] = [];

    for (const result of searchResults) {
      // Try to find in posts first
      const post = await db.getPostById(result.documentId);
      if (post) {
        results.push({
          id: post.id,
          type: "post",
          title: post.title,
          content: post.content,
          tags: post.tags,
          score: result.score,
          createdAt: post.createdAt,
        });
        continue;
      }

      // Try to find in knowledge entries
      const knowledgeEntries = await db.getKnowledgeEntries();
      const knowledgeEntry = knowledgeEntries.find(entry => entry.id === result.documentId);
      if (knowledgeEntry) {
        results.push({
          id: knowledgeEntry.id,
          type: "knowledge",
          title: knowledgeEntry.title,
          content: knowledgeEntry.content,
          tags: knowledgeEntry.tags,
          score: result.score,
          createdAt: knowledgeEntry.createdAt,
        });
      }
    }

    return results.sort((a, b) => b.score - a.score);
  }

  async addDocument(type: "post" | "knowledge", document: Post | KnowledgeEntry): Promise<void> {
    this.indexer.addDocument({
      id: document.id,
      title: document.title,
      content: document.content,
      tags: document.tags,
    });
  }

  async removeDocument(documentId: string): Promise<void> {
    this.indexer.removeDocument(documentId);
  }

  async updateDocument(type: "post" | "knowledge", document: Post | KnowledgeEntry): Promise<void> {
    this.indexer.updateDocument({
      id: document.id,
      title: document.title,
      content: document.content,
      tags: document.tags,
    });
  }

  getIndexStats(): { totalTerms: number; totalDocuments: number } {
    return this.indexer.getIndexStats();
  }
}
