/**
 * LMS Package Generator
 * =====================
 * Creates Canvas/Moodle/SCORM-compatible course packages
 */

import fs from 'fs/promises';
import { createWriteStream } from 'fs';
import path from 'path';
import archiver from 'archiver';
import { marked } from 'marked';

/**
 * Convert markdown to HTML with styling
 */
function markdownToHTML(markdown, chapterTitle) {
  const html = marked.parse(markdown);

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Parts-Co E-Commerce Training: ${chapterTitle}">
    <title>${chapterTitle}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            max-width: 900px;
            margin: 0 auto;
            padding: 20px;
            color: #333;
        }

        h1 {
            color: #0066CC;
            border-bottom: 3px solid #FF6600;
            padding-bottom: 10px;
        }

        h2 {
            color: #0066CC;
            margin-top: 30px;
        }

        h3 {
            color: #FF6600;
        }

        code {
            background-color: #f4f4f4;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', Courier, monospace;
        }

        pre {
            background-color: #f4f4f4;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
            border-left: 4px solid #0066CC;
            position: relative;
        }

        pre code {
            background-color: transparent;
            padding: 0;
        }

        /* Accessibility: High contrast focus indicators */
        a:focus, button:focus, code:focus {
            outline: 3px solid #FF6600;
            outline-offset: 2px;
        }

        /* Accessibility: Skip to content link */
        .skip-link {
            position: absolute;
            top: -40px;
            left: 0;
            background: #000;
            color: #fff;
            padding: 8px;
            text-decoration: none;
            z-index: 100;
        }

        .skip-link:focus {
            top: 0;
        }

        blockquote {
            border-left: 4px solid #FF6600;
            padding-left: 20px;
            margin-left: 0;
            color: #666;
            background-color: #FFF5E6;
            padding: 10px 20px;
            border-radius: 5px;
        }

        table {
            border-collapse: collapse;
            width: 100%;
            margin: 20px 0;
        }

        th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
        }

        th {
            background-color: #0066CC;
            color: white;
        }

        tr:nth-child(even) {
            background-color: #f9f9f9;
        }

        .callout {
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
            border-left: 4px solid;
        }

        .callout-tip {
            background-color: #E8F5E9;
            border-color: #4CAF50;
        }

        .callout-warning {
            background-color: #FFF3E0;
            border-color: #FF9800;
        }

        .callout-note {
            background-color: #E3F2FD;
            border-color: #2196F3;
        }

        .callout-important {
            background-color: #FFEBEE;
            border-color: #F44336;
        }

        @media print {
            body {
                max-width: 100%;
            }

            pre {
                page-break-inside: avoid;
            }
        }
    </style>
</head>
<body>
    <a href="#main-content" class="skip-link">Skip to main content</a>
    <main id="main-content" role="main" aria-label="Chapter content">
        ${html}
    </main>
</body>
</html>`;
}

/**
 * Create Canvas module manifest
 */
function createCanvasManifest(chapterInfo) {
  return {
    resource_link_id: `chapter-${chapterInfo.number}`,
    tool_name: "Parts-Co Training System",
    tool_description: chapterInfo.title,
    launch_url: "index.html",
    item_type: "assignment",
    text: `Chapter ${chapterInfo.number}: ${chapterInfo.title}`,
    indent: 0,
    published: true
  };
}

/**
 * Create Moodle backup manifest
 */
function createMoodleManifest(chapterInfo) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<activity id="1" moduleid="1" modulename="page" contextid="1">
  <page id="1">
    <name>Chapter ${chapterInfo.number}: ${chapterInfo.title}</name>
    <intro>Full-stack web development training chapter</intro>
    <introformat>1</introformat>
    <content></content>
    <contentformat>1</contentformat>
    <legacyfiles>0</legacyfiles>
    <legacyfileslast>0</legacyfileslast>
    <display>5</display>
    <displayoptions>a:1:{s:12:"printheading";s:1:"1";}</displayoptions>
    <revision>1</revision>
    <timemodified>${Math.floor(Date.now() / 1000)}</timemodified>
  </page>
</activity>`;
}

/**
 * Create SCORM 1.2 manifest
 */
function createSCORMManifest(chapterInfo) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="com.partsco.chapter${chapterInfo.number}" version="1.0"
          xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2"
          xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:schemaLocation="http://www.imsproject.org/xsd/imscp_rootv1p1p2 imscp_rootv1p1p2.xsd
                              http://www.imsglobal.org/xsd/imsmd_rootv1p2p1 imsmd_rootv1p2p1.xsd
                              http://www.adlnet.org/xsd/adlcp_rootv1p2 adlcp_rootv1p2.xsd">
  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>1.2</schemaversion>
  </metadata>
  <organizations default="ORG-1">
    <organization identifier="ORG-1">
      <title>Chapter ${chapterInfo.number}: ${chapterInfo.title}</title>
      <item identifier="ITEM-1" identifierref="RES-1">
        <title>Chapter ${chapterInfo.number}: ${chapterInfo.title}</title>
      </item>
    </organization>
  </organizations>
  <resources>
    <resource identifier="RES-1" type="webcontent" adlcp:scormtype="sco" href="index.html">
      <file href="index.html"/>
    </resource>
  </resources>
</manifest>`;
}

/**
 * Generate LMS package for a chapter
 */
export async function generateLMSPackage(outputDir, chapterInfo, format = 'all') {
  const formats = format === 'all' ? ['canvas', 'moodle', 'scorm'] : [format];
  const results = {};

  for (const fmt of formats) {
    const packageDir = path.join(outputDir, `lms-${fmt}`);
    await fs.mkdir(packageDir, { recursive: true });

    // Read all chapter components
    const bookChapter = await fs.readFile(path.join(outputDir, 'book-chapter.txt'), 'utf-8');
    const exercises = await fs.readFile(path.join(outputDir, 'exercises.txt'), 'utf-8');
    const quiz = await fs.readFile(path.join(outputDir, 'quiz.txt'), 'utf-8');
    const qa = await fs.readFile(path.join(outputDir, 'qa.txt'), 'utf-8');

    // Combine into single HTML page
    const combinedMarkdown = `# Chapter ${chapterInfo.number}: ${chapterInfo.title}

${bookChapter}

---

# Hands-On Exercises

${exercises}

---

# Quiz

${quiz}

---

# Frequently Asked Questions

${qa}
`;

    const htmlContent = markdownToHTML(combinedMarkdown, `Chapter ${chapterInfo.number}: ${chapterInfo.title}`);
    await fs.writeFile(path.join(packageDir, 'index.html'), htmlContent, 'utf-8');

    // Create format-specific manifests
    if (fmt === 'canvas') {
      const manifest = createCanvasManifest(chapterInfo);
      await fs.writeFile(
        path.join(packageDir, 'module-meta.json'),
        JSON.stringify(manifest, null, 2),
        'utf-8'
      );
    } else if (fmt === 'moodle') {
      const manifest = createMoodleManifest(chapterInfo);
      await fs.writeFile(path.join(packageDir, 'moodle_backup.xml'), manifest, 'utf-8');
    } else if (fmt === 'scorm') {
      const manifest = createSCORMManifest(chapterInfo);
      await fs.writeFile(path.join(packageDir, 'imsmanifest.xml'), manifest, 'utf-8');
    }

    // Create ZIP package
    const zipPath = path.join(outputDir, `chapter-${String(chapterInfo.number).padStart(2, '0')}-${fmt}.zip`);
    await createZip(packageDir, zipPath);

    // Clean up temp directory
    await fs.rm(packageDir, { recursive: true, force: true });

    results[fmt] = {
      format: fmt,
      zipPath: zipPath,
      size: (await fs.stat(zipPath)).size
    };
  }

  return results;
}

/**
 * Create ZIP archive
 */
async function createZip(sourceDir, outputPath) {
  return new Promise((resolve, reject) => {
    const output = createWriteStream(outputPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => resolve());
    archive.on('error', (err) => reject(err));

    archive.pipe(output);
    archive.directory(sourceDir, false);
    archive.finalize();
  });
}
