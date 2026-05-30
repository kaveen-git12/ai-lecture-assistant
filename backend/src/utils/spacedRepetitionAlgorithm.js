/**
 * Spaced Repetition Algorithm (SM-2)
 * Based on: https://en.wikipedia.org/wiki/Spaced_repetition#SM-2
 * 
 * This algorithm optimizes learning by scheduling reviews at optimal intervals
 */

class SpacedRepetitionAlgorithm {
  /**
   * Calculate next review date using SM-2 algorithm
   * 
   * @param {number} quality - Quality of user response (0-5)
   *   5 = perfect response
   *   4 = correct response after some hesitation
   *   3 = correct response with serious difficulty
   *   2 = incorrect response but correct answer recalled
   *   1 = incorrect response, correct answer remembered
   *   0 = complete blackout
   * @param {number} repetitions - Number of times reviewed
   * @param {number} interval - Days since last review
   * @param {number} easeFactor - Current ease factor
   * @returns {object} { nextInterval, nextEaseFactor, nextReviewDate }
   */
  calculateNextReview(quality, repetitions, interval, easeFactor) {
    let newEaseFactor = easeFactor;
    let newInterval = interval;
    let newRepetitions = repetitions;

    // Calculate new ease factor
    newEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

    // Ensure ease factor doesn't go below 1.3
    if (newEaseFactor < 1.3) {
      newEaseFactor = 1.3;
    }

    // Quality is low, reset to first interval
    if (quality < 3) {
      newRepetitions = 0;
      newInterval = 1;
    } else {
      newRepetitions++;

      if (newRepetitions === 1) {
        newInterval = 1;
      } else if (newRepetitions === 2) {
        newInterval = 3;
      } else {
        newInterval = Math.round(interval * newEaseFactor);
      }
    }

    // Calculate next review date
    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

    return {
      nextInterval: newInterval,
      nextEaseFactor: newEaseFactor,
      nextRepetitions: newRepetitions,
      nextReviewDate,
      quality
    };
  }

  /**
   * Get all cards due for review
   */
  getDueCards(spacedRepetitionRecords) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return spacedRepetitionRecords.filter(record => {
      const reviewDate = new Date(record.nextReviewDate);
      reviewDate.setHours(0, 0, 0, 0);
      return reviewDate <= today;
    });
  }

  /**
   * Get learning statistics
   */
  getStatistics(records) {
    const stats = {
      total: records.length,
      dueToday: 0,
      dueSoon: 0, // within 7 days
      avgEaseFactor: 0,
      avgRepetitions: 0,
      accuracy: 0
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    let totalEaseFactor = 0;
    let totalRepetitions = 0;
    let correctCount = 0;

    records.forEach(record => {
      const reviewDate = new Date(record.nextReviewDate);
      reviewDate.setHours(0, 0, 0, 0);

      if (reviewDate <= today) stats.dueToday++;
      if (reviewDate <= nextWeek) stats.dueSoon++;

      totalEaseFactor += record.easeFactor || 2.5;
      totalRepetitions += record.repetitions || 0;
      correctCount += record.correctCount || 0;
    });

    stats.avgEaseFactor = records.length > 0 ? (totalEaseFactor / records.length).toFixed(2) : 2.5;
    stats.avgRepetitions = records.length > 0 ? (totalRepetitions / records.length).toFixed(1) : 0;

    const totalResponses = correctCount + records.reduce((sum, r) => sum + (r.incorrectCount || 0), 0);
    stats.accuracy = totalResponses > 0
      ? Math.round((correctCount / totalResponses) * 100)
      : 0;

    return stats;
  }

  /**
   * Generate review schedule for next N days
   */
  generateSchedule(records, daysAhead = 30) {
    const schedule = [];
    const today = new Date();

    for (let i = 0; i < daysAhead; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      date.setHours(0, 0, 0, 0);

      const dueCount = records.filter(record => {
        const reviewDate = new Date(record.nextReviewDate);
        reviewDate.setHours(0, 0, 0, 0);
        return reviewDate.getTime() === date.getTime();
      }).length;

      if (dueCount > 0) {
        schedule.push({
          date: date.toISOString().split('T')[0],
          count: dueCount
        });
      }
    }

    return schedule;
  }

  /**
   * Recommend optimal daily review goal
   */
  getRecommendedDailyGoal(records) {
    const stats = this.getStatistics(records);
    
    // Recommend reviewing at least 20 minutes worth (roughly 20-30 cards)
    const recommendedDaily = Math.max(20, Math.ceil(stats.dueToday / 7));

    return {
      recommendedDaily,
      currentDue: stats.dueToday,
      projectedNewCards: Math.ceil(records.length / 10)
    };
  }
}

module.exports = new SpacedRepetitionAlgorithm();
