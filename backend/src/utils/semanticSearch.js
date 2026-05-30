const multiLLM = require('./multiLLM');

/**
 * Semantic Search - Find similar content using embeddings
 */
class SemanticSearch {
  /**
   * Calculate cosine similarity between two vectors
   */
  cosineSimilarity(vecA, vecB) {
    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      magnitudeA += vecA[i] * vecA[i];
      magnitudeB += vecB[i] * vecB[i];
    }

    magnitudeA = Math.sqrt(magnitudeA);
    magnitudeB = Math.sqrt(magnitudeB);

    if (magnitudeA === 0 || magnitudeB === 0) {
      return 0;
    }

    return dotProduct / (magnitudeA * magnitudeB);
  }

  /**
   * Generate embedding for search query
   */
  async embedQuery(query) {
    const embedding = await multiLLM.generateEmbeddings(query);
    return embedding;
  }

  /**
   * Search lectures by semantic similarity
   */
  async searchLectures(query, lectureEmbeddings, topK = 5) {
    const queryEmbedding = await this.embedQuery(query);

    // Calculate similarity scores
    const scores = lectureEmbeddings.map((lecture, idx) => ({
      ...lecture,
      score: this.cosineSimilarity(queryEmbedding, lecture.embedding)
    }));

    // Sort by score and return top K
    return scores
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .filter(item => item.score > 0.3); // Only return relevant results
  }

  /**
   * Find similar notes from note repository
   */
  async findSimilarNotes(noteContent, allNotes, topK = 3) {
    const queryEmbedding = await this.embedQuery(noteContent);

    const similarities = allNotes.map(note => ({
      _id: note._id,
      title: note.title,
      content: note.content.substring(0, 200),
      similarity: this.cosineSimilarity(queryEmbedding, note.embedding)
    }));

    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK)
      .filter(item => item.similarity > 0.5);
  }

  /**
   * Recommend related lectures based on topics
   */
  async recommendLectures(userHistory, allLectures, topK = 5) {
    if (!userHistory || userHistory.length === 0) {
      return [];
    }

    // Create user profile from history
    const userTopics = userHistory.map(l => l.topic).join(' ');
    const userEmbedding = await this.embedQuery(userTopics);

    // Find similar lectures not yet viewed
    const viewedIds = new Set(userHistory.map(l => l._id));
    const recommendations = allLectures
      .filter(l => !viewedIds.has(l._id))
      .map(lecture => ({
        ...lecture,
        similarity: this.cosineSimilarity(userEmbedding, lecture.embedding)
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);

    return recommendations;
  }

  /**
   * Cluster lectures into topics using embeddings
   */
  async clusterLectures(lectures, numClusters = 5) {
    // Simple K-means clustering
    const embeddings = lectures.map(l => l.embedding);
    
    // Initialize centroids randomly
    const centroids = [];
    for (let i = 0; i < numClusters; i++) {
      centroids.push(embeddings[Math.floor(Math.random() * embeddings.length)]);
    }

    let clusters = [];
    let converged = false;
    let iterations = 0;
    const maxIterations = 10;

    while (!converged && iterations < maxIterations) {
      iterations++;

      // Assign points to nearest centroid
      clusters = Array.from({ length: numClusters }, () => []);
      embeddings.forEach((embedding, idx) => {
        let nearestCluster = 0;
        let maxSimilarity = -1;

        centroids.forEach((centroid, cidx) => {
          const similarity = this.cosineSimilarity(embedding, centroid);
          if (similarity > maxSimilarity) {
            maxSimilarity = similarity;
            nearestCluster = cidx;
          }
        });

        clusters[nearestCluster].push(idx);
      });

      // Update centroids
      const newCentroids = clusters.map(cluster => {
        if (cluster.length === 0) return centroids[0];

        const avg = Array(embeddings[0].length).fill(0);
        cluster.forEach(idx => {
          embeddings[idx].forEach((val, i) => {
            avg[i] += val;
          });
        });

        return avg.map(val => val / cluster.length);
      });

      // Check convergence
      converged = newCentroids.every((c, i) => 
        this.cosineSimilarity(c, centroids[i]) > 0.99
      );

      centroids.length = 0;
      centroids.push(...newCentroids);
    }

    // Return clustered lectures
    return clusters.map((clusterIndices, clusterIdx) => ({
      cluster: clusterIdx,
      lectures: clusterIndices.map(idx => lectures[idx])
    }));
  }

  /**
   * Extract key topics from lecture collection
   */
  async extractTopics(lectures, numTopics = 5) {
    const lectureTexts = lectures.map(l => l.keyPoints?.join(' ') || l.title).join('\n');
    
    // Use LLM to extract topics
    const response = await multiLLM.generateText(
      `Extract the top ${numTopics} main topics from these lectures:\n\n${lectureTexts}`,
      {
        systemPrompt: 'Extract main topics as a JSON array of strings. Only return the JSON array, no other text.',
        maxTokens: 500
      }
    );

    try {
      return JSON.parse(response.text);
    } catch (e) {
      return ['General Learning'];
    }
  }
}

module.exports = new SemanticSearch();
