/**
 * PowerPoint PPTX File Generator
 * ===============================
 * Converts PowerPoint outlines to actual .pptx files using pptxgenjs
 */

import pptxgen from 'pptxgenjs';
import fs from 'fs/promises';
import path from 'path';

/**
 * Parse PowerPoint outline text into structured slides
 */
function parseOutline(outlineText) {
  const slides = [];
  const slideBlocks = outlineText.split(/^## Slide \d+:/gm).filter(block => block.trim());

  for (const block of slideBlocks) {
    const lines = block.split('\n').map(l => l.trim()).filter(l => l);

    const slide = {
      title: '',
      type: '',
      content: [],
      speakerNotes: ''
    };

    let inSpeakerNotes = false;
    let currentSection = 'content';

    for (const line of lines) {
      if (line.startsWith('**Type:**')) {
        slide.type = line.replace('**Type:**', '').trim();
      } else if (line.startsWith('**Speaker Notes:**')) {
        inSpeakerNotes = true;
        currentSection = 'speakerNotes';
      } else if (inSpeakerNotes) {
        slide.speakerNotes += line + '\n';
      } else if (!slide.title && line.length > 0 && !line.startsWith('**')) {
        slide.title = line.replace(/^#+\s*/, '');
      } else if (line.startsWith('•') || line.startsWith('-')) {
        slide.content.push(line.replace(/^[•\-]\s*/, '').trim());
      } else if (line.startsWith('```')) {
        continue; // Skip code fence markers
      } else if (!line.startsWith('**') && !line.startsWith('---')) {
        slide.content.push(line);
      }
    }

    if (slide.title || slide.content.length > 0) {
      slides.push(slide);
    }
  }

  return slides;
}

/**
 * Create PowerPoint presentation from outline
 */
export async function generatePPTX(outlineFilePath, outputFilePath, chapterInfo) {
  const outlineText = await fs.readFile(outlineFilePath, 'utf-8');
  const slides = parseOutline(outlineText);

  const pptx = new pptxgen();

  // Define Parts-Co theme
  pptx.defineLayout({ name: 'PARTS_CO', width: 10, height: 5.625 });
  pptx.layout = 'PARTS_CO';

  pptx.author = 'Parts-Co Training System';
  pptx.company = 'Parts-Co';
  pptx.subject = chapterInfo.title;
  pptx.title = `Chapter ${chapterInfo.number}: ${chapterInfo.title}`;

  // Colors
  const colors = {
    primary: '0066CC',      // Blue
    secondary: 'FF6600',    // Orange
    dark: '333333',         // Dark gray
    light: 'F5F5F5',        // Light gray
    white: 'FFFFFF'
  };

  for (const slideData of slides) {
    const slide = pptx.addSlide();

    // Title slide
    if (slideData.type.toLowerCase().includes('title')) {
      slide.background = { color: colors.primary };

      slide.addText(slideData.title || chapterInfo.title, {
        x: 0.5,
        y: 1.5,
        w: 9,
        h: 1.5,
        fontSize: 44,
        bold: true,
        color: colors.white,
        align: 'center'
      });

      slide.addText('Parts-Co E-Commerce Training System\nFrom Database to Deployment', {
        x: 0.5,
        y: 3.5,
        w: 9,
        h: 0.8,
        fontSize: 20,
        color: colors.white,
        align: 'center'
      });
    }
    // Content slides
    else {
      // Title
      slide.addText(slideData.title, {
        x: 0.5,
        y: 0.4,
        w: 9,
        h: 0.6,
        fontSize: 32,
        bold: true,
        color: colors.primary
      });

      // Underline
      slide.addShape(pptx.ShapeType.rect, {
        x: 0.5,
        y: 1.1,
        w: 9,
        h: 0.05,
        fill: { color: colors.secondary }
      });

      // Content bullets
      if (slideData.content.length > 0) {
        const bulletText = slideData.content.map(item => {
          // Clean up emojis and special formatting
          return {
            text: item.replace(/[🎯💡🔍🌐🏗️💻⚠️📝🔴]/g, '').trim(),
            options: { bullet: true, fontSize: 20, color: colors.dark }
          };
        });

        slide.addText(bulletText, {
          x: 0.8,
          y: 1.5,
          w: 8.4,
          h: 3.5,
          fontSize: 20,
          color: colors.dark,
          valign: 'top'
        });
      }
    }

    // Speaker notes
    if (slideData.speakerNotes) {
      slide.addNotes(slideData.speakerNotes.trim());
    }
  }

  await pptx.writeFile({ fileName: outputFilePath });

  return {
    slidesGenerated: slides.length,
    filePath: outputFilePath,
    fileSize: (await fs.stat(outputFilePath)).size
  };
}
