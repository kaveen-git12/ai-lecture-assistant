const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const Lecture = require('../models/Lecture');
const { authMiddleware } = require('../utils/auth');
const PDFDocument = require('pdfkit');
const { Document, Packer, Paragraph, HeadingLevel } = require('docx');

// Export note as PDF
router.get('/note/:id/pdf', authMiddleware, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    
    if (!note || note.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="note.pdf"');

    doc.pipe(res);
    
    doc.fontSize(20).text('Lecture Notes', { underline: true });
    doc.fontSize(12).text(`\n${note.content}\n`);

    if (note.flashcards && note.flashcards.length > 0) {
      doc.fontSize(16).text('Flashcards', { underline: true });
      note.flashcards.forEach((fc, idx) => {
        doc.fontSize(11).text(`Q${idx + 1}: ${fc.question}`);
        doc.fontSize(10).text(`A: ${fc.answer}\n`);
      });
    }

    if (note.quiz && note.quiz.length > 0) {
      doc.fontSize(16).text('Quiz', { underline: true });
      note.quiz.forEach((q, idx) => {
        doc.fontSize(11).text(`Q${idx + 1}: ${q.question}`);
        q.options.forEach((opt, i) => {
          doc.fontSize(10).text(`  ${String.fromCharCode(65 + i)}) ${opt}`);
        });
        doc.text('');
      });
    }

    doc.end();
  } catch (error) {
    res.status(500).json({ error: 'PDF export failed' });
  }
});

// Export note as Markdown
router.get('/note/:id/markdown', authMiddleware, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    
    if (!note || note.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    let markdown = `# Lecture Notes\n\n${note.content}\n\n`;

    if (note.flashcards && note.flashcards.length > 0) {
      markdown += `## Flashcards\n\n`;
      note.flashcards.forEach((fc, idx) => {
        markdown += `**Q${idx + 1}: ${fc.question}**\n\nA: ${fc.answer}\n\n`;
      });
    }

    if (note.quiz && note.quiz.length > 0) {
      markdown += `## Quiz\n\n`;
      note.quiz.forEach((q, idx) => {
        markdown += `**Q${idx + 1}: ${q.question}**\n`;
        q.options.forEach((opt, i) => {
          markdown += `- ${String.fromCharCode(65 + i)}) ${opt}\n`;
        });
        markdown += `\n`;
      });
    }

    res.setHeader('Content-Type', 'text/markdown');
    res.setHeader('Content-Disposition', 'attachment; filename="notes.md"');
    res.send(markdown);
  } catch (error) {
    res.status(500).json({ error: 'Markdown export failed' });
  }
});

// Export lecture summary as DOCX
router.get('/lecture/:id/docx', authMiddleware, async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id);
    
    if (!lecture || lecture.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const doc = new Document({
      sections: [{
        children: [
          new Paragraph({
            text: lecture.title,
            heading: HeadingLevel.HEADING_1
          }),
          new Paragraph(`Subject: ${lecture.subject}`),
          new Paragraph(`\n${lecture.transcription}\n`),
          new Paragraph({
            text: 'Key Points',
            heading: HeadingLevel.HEADING_2
          }),
          ...lecture.keyPoints.map((point, idx) =>
            new Paragraph(`${idx + 1}. ${point}`)
          )
        ]
      }]
    });

    const buffer = await Packer.toBuffer(doc);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', 'attachment; filename="lecture.docx"');
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ error: 'DOCX export failed' });
  }
});

module.exports = router;
