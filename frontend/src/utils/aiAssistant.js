async function aiCall(endpoint, data) {
  const response = await fetch(`/api/llm${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'AI request failed');
  }

  return result;
}

export async function getSummary(notes) {
  const result = await aiCall('/summary', { text: notes });
  return result.summary;
}

export async function extractTopics(notes) {
  const result = await aiCall('/topics', { text: notes });
  return result.topics;
}

export async function completeNotes(notes) {
  const result = await aiCall('/complete', { text: notes });
  return result.completedText;
}

export async function askAI(question, notes, history = [], images = [], provider = 'ollama') {
  const result = await aiCall('/chat', { message: question, context: notes, history, images, provider });
  return result.answer;
}

export async function predictExam(subject) {
  const result = await aiCall('/exam', { subject, level: 'General', examDate: 'TBD' });
  return result.examPrep;
}

export async function studyPlan(subject, days) {
  // Adapt to exam endpoint
  const result = await aiCall('/exam', { subject, level: 'General', examDate: `In ${days} days` });
  return result.examPrep;
}

// Add new functions
export async function findVideos(topic) {
  const result = await aiCall('/youtube', { topic });
  return result.videos;
}

export async function enhanceWithImages(topics) {
  const result = await aiCall('/images', { topics });
  return result.images;
}

export async function generatePDFTitle(text, subject) {
  const result = await aiCall('/pdf-title', { text, subject });
  return result.title;
}

export async function generatePDF(slides) {
  if (!slides || slides.length === 0) {
    throw new Error('No slides available for PDF export.');
  }

  const { jsPDF } = await import('jspdf');
  const pdf = new jsPDF();

  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i];

    if (i > 0) {
      pdf.addPage();
    }

    const imageData = slide.image || slide.img || '';
    if (!imageData) continue;

    // Convert data URL to image for jsPDF
    const img = new Image();
    img.src = imageData;

    await new Promise((resolve) => {
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imgData = canvas.toDataURL('image/jpeg', 0.8);
        pdf.addImage(imgData, 'JPEG', 10, 10, 190, 140);
        resolve();
      };
    });
  }

  pdf.save('lecture-slides.pdf');
}

export async function generateSmartPDF(summaryText, extractedText, topicData) {
  const { jsPDF } = await import('jspdf');
  const pdf = new jsPDF();

  let y = 20;
  const pageHeight = pdf.internal.pageSize.height;

  // Title
  pdf.setFontSize(16);
  pdf.text('Smart Lecture Notes', 20, y);
  y += 20;

  // Summary
  if (summaryText) {
    pdf.setFontSize(14);
    pdf.text('Summary:', 20, y);
    y += 10;

    pdf.setFontSize(12);
    const summaryLines = pdf.splitTextToSize(summaryText, 170);
    summaryLines.forEach(line => {
      if (y > pageHeight - 20) {
        pdf.addPage();
        y = 20;
      }
      pdf.text(line, 20, y);
      y += 7;
    });
    y += 10;
  }

  // Notes
  if (extractedText) {
    if (y > pageHeight - 40) {
      pdf.addPage();
      y = 20;
    }

    pdf.setFontSize(14);
    pdf.text('Notes:', 20, y);
    y += 10;

    pdf.setFontSize(12);
    const noteLines = pdf.splitTextToSize(extractedText, 170);
    noteLines.forEach(line => {
      if (y > pageHeight - 20) {
        pdf.addPage();
        y = 20;
      }
      pdf.text(line, 20, y);
      y += 7;
    });
    y += 10;
  }

  // Topics
  if (topicData && topicData.length > 0) {
    if (y > pageHeight - 40) {
      pdf.addPage();
      y = 20;
    }

    pdf.setFontSize(14);
    pdf.text('Topics:', 20, y);
    y += 10;

    pdf.setFontSize(12);
    const topicsText = topicData.map(topic => `• ${topic.title || topic}`).join('\n');
    const topicLines = pdf.splitTextToSize(topicsText, 170);
    topicLines.forEach(line => {
      if (y > pageHeight - 20) {
        pdf.addPage();
        y = 20;
      }
      pdf.text(line, 20, y);
      y += 7;
    });
  }

  pdf.save('smart-lecture-notes.pdf');
}

