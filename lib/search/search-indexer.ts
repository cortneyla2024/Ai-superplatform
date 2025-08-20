interface Document {
  id: string;
  title: string;
  content: string;
  tags?: string[];
}

interface IndexEntry {
  documentId: string;
  frequency: number;
  positions: number[];
}

interface SearchIndex {
  [term: string]: IndexEntry[];
}

interface DocumentStats {
  [documentId: string]: {
    totalTerms: number;
    uniqueTerms: number;
  };
}

export class SearchIndexer {
  private index: SearchIndex = {};
  private documentStats: DocumentStats = {};
  private stopWords: Set<string> = new Set([
    "a", "an", "and", "are", "as", "at", "be", "by", "for", "from",
    "has", "he", "in", "is", "it", "its", "of", "on", "that", "the",
    "to", "was", "will", "with", "the", "this", "but", "they", "have",
    "had", "what", "said", "each", "which", "she", "do", "how", "their",
    "if", "up", "out", "many", "then", "them", "these", "so", "some",
    "her", "would", "make", "like", "into", "him", "time", "two",
    "more", "go", "no", "way", "could", "my", "than", "first", "been",
    "call", "who", "its", "now", "find", "long", "down", "day", "did",
    "get", "come", "made", "may", "part",
  ]);

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter(word => word.length > 0 && !this.stopWords.has(word));
  }

  private stem(word: string): string {
    // Simple stemming - remove common suffixes
    const suffixes = ["ing", "ed", "er", "est", "ly", "s", "es"];
    for (const suffix of suffixes) {
      if (word.endsWith(suffix) && word.length > suffix.length + 2) {
        return word.slice(0, -suffix.length);
      }
    }
    return word;
  }

  private extractTerms(text: string): string[] {
    return this.tokenize(text).map(word => this.stem(word));
  }

  addDocument(document: Document): void {
    const terms = [
      ...this.extractTerms(document.title),
      ...this.extractTerms(document.content),
      ...(document.tags || []).map(tag => this.extractTerms(tag)).flat(),
    ];

    const termPositions: { [term: string]: number[] } = {};
    const termFrequency: { [term: string]: number } = {};

    // Count term frequencies and positions
    terms.forEach((term, position) => {
      if (!termPositions[term]) {
        termPositions[term] = [];
        termFrequency[term] = 0;
      }
      termPositions[term].push(position);
      termFrequency[term]++;
    });

    // Update index
    Object.entries(termFrequency).forEach(([term, frequency]) => {
      if (!this.index[term]) {
        this.index[term] = [];
      }

      this.index[term].push({
        documentId: document.id,
        frequency,
        positions: termPositions[term],
      });
    });

    // Update document stats
    this.documentStats[document.id] = {
      totalTerms: terms.length,
      uniqueTerms: Object.keys(termFrequency).length,
    };
  }

  removeDocument(documentId: string): void {
    // Remove document from index
    Object.keys(this.index).forEach(term => {
      this.index[term] = this.index[term].filter(entry => entry.documentId !== documentId);
      if (this.index[term].length === 0) {
        delete this.index[term];
      }
    });

    // Remove document stats
    delete this.documentStats[documentId];
  }

  updateDocument(document: Document): void {
    this.removeDocument(document.id);
    this.addDocument(document);
  }

  search(query: string, limit: number = 10): Array<{ documentId: string; score: number }> {
    const queryTerms = this.extractTerms(query);
    const scores: { [documentId: string]: number } = {};

    queryTerms.forEach(term => {
      const entries = this.index[term];
      if (entries) {
        entries.forEach(entry => {
          const tf = entry.frequency / this.documentStats[entry.documentId].totalTerms;
          const idf = Math.log(Object.keys(this.documentStats).length / entries.length);
          const tfidf = tf * idf;

          if (!scores[entry.documentId]) {
            scores[entry.documentId] = 0;
          }
          scores[entry.documentId] += tfidf;
        });
      }
    });

    // Sort by score and return top results
    return Object.entries(scores)
      .map(([documentId, score]) => ({ documentId, score }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  getIndexStats(): { totalTerms: number; totalDocuments: number } {
    return {
      totalTerms: Object.keys(this.index).length,
      totalDocuments: Object.keys(this.documentStats).length,
    };
  }

  clear(): void {
    this.index = {};
    this.documentStats = {};
  }
}
