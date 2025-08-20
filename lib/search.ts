import { readData } from "./database";

export async function buildSearchIndex() {
  const invertedIndex = new Map();
  const allPosts = await readData("posts.json");
  const stopWords = new Set(["a", "an", "the", "is", "in", "it", "to", "and", "or", "for", "of"]);

  for (const post of allPosts) {
    const text = `${post.title} ${post.content}`;
    const tokens = text.toLowerCase().split(/\s+/);
    const termFrequencies = new Map();

    for (const token of tokens) {
      if (!stopWords.has(token) && token.length > 2) {
        const stemmed = token;
        termFrequencies.set(stemmed, (termFrequencies.get(stemmed) || 0) + 1);
      }
    }

    for (const [term, count] of termFrequencies.entries()) {
      if (!invertedIndex.has(term)) {
        invertedIndex.set(term, []);
      }
      invertedIndex.get(term).push({ docId: post.id, tf: count });
    }
  }
  return invertedIndex;
}

export async function searchQuery(query: string) {
  const invertedIndex = await buildSearchIndex();
  const tokens = query.toLowerCase().split(/\s+/);
  const results = new Map();
  const posts = await readData("posts.json");
  const totalDocuments = posts.length;

  for (const token of tokens) {
    const stemmed = token;
    if (invertedIndex.has(stemmed)) {
      const postings = invertedIndex.get(stemmed);
      const idf = Math.log(totalDocuments / postings.length);
      for (const posting of postings) {
        const score = (posting.tf / totalDocuments) * idf;
        results.set(posting.docId, (results.get(posting.docId) || 0) + score);
      }
    }
  }

  const rankedResults = Array.from(results.entries())
    .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
    .map(([docId, score]) => ({ docId, score }));

  return rankedResults;
}
