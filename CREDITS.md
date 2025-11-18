# Credits and Licenses

## Training Builder

Training Builder is developed for creating professional curricular content including book chapters, exercises, quizzes, and instructor materials.

---

## Third-Party Tools and Libraries

### Python Libraries

| Library | License | Usage |
|---------|---------|-------|
| PyPDF2 | BSD 3-Clause | PDF manipulation and merging |
| ReportLab | BSD | Cover page and page number generation |
| Anthropic SDK | MIT | AI content generation |

### Command Line Tools

| Tool | License | Usage |
|------|---------|-------|
| Pandoc | GPL-2.0 | Markdown to PDF conversion |

---

## Research References

The following open-source documentation tools were analyzed for best practices and enhancement ideas:

### mdBook

- **Repository**: https://github.com/rust-lang/mdBook
- **License**: Mozilla Public License 2.0 (MPL-2.0)
- **Copyright**: The Rust Project Developers
- **Usage**: Analyzed for preprocessing pipeline patterns and GitHub-style admonitions

> This project is licensed under the Mozilla Public License 2.0. The MPL-2.0 is a weak copyleft license that permits both open-source and proprietary derivative works.

### HonKit

- **Repository**: https://github.com/honkit/honkit
- **License**: Apache License 2.0
- **Copyright**: HonKit Contributors
- **Usage**: Analyzed for plugin architecture, theme systems, and multi-format output

> Licensed under the Apache License, Version 2.0. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0

### MkDocs

- **Repository**: https://github.com/mkdocs/mkdocs
- **License**: BSD 2-Clause
- **Copyright**: Tom Christie
- **Usage**: Analyzed for YAML configuration patterns and hook-based plugins

> Redistribution and use in source and binary forms, with or without modification, are permitted provided that the copyright notice and disclaimer are retained.

---

## Style Guide References

The Training Builder Style Guide synthesizes best practices from:

1. **Google Markdown Style Guide**
   - URL: https://google.github.io/styleguide/docguide/style.html
   - License: CC-BY 3.0

2. **Gruntwork Markdown Style Guide**
   - URL: https://docs.gruntwork.io/guides/style/markdown-style-guide
   - License: Proprietary (referenced for educational purposes)

3. **Ciro Santilli's Markdown Style Guide**
   - URL: https://cirosantilli.com/markdown-style-guide
   - License: CC-BY-SA 4.0

4. **GitHub Flavored Markdown**
   - URL: https://github.github.com/gfm/
   - License: CC-BY-SA 4.0

---

## Acknowledgments

- **Anthropic** - For the Claude AI models powering content generation
- **OpenAI** - For inspiring accessible AI-powered developer tools
- **The Rust Foundation** - For mdBook's excellent documentation tooling
- **Tom Christie** - For MkDocs and its ecosystem

---

## License Compliance

### What This Means for Training Builder

1. **MPL-2.0 (mdBook)**: Any modifications to mdBook source code must be released under MPL-2.0. Using ideas/patterns from mdBook does not require license compliance.

2. **Apache 2.0 (HonKit)**: Requires attribution if distributing HonKit code. Using ideas/patterns does not require compliance.

3. **BSD (MkDocs, PyPDF2, ReportLab)**: Requires copyright notice retention in source/binary distributions.

4. **GPL-2.0 (Pandoc)**: Using pandoc as a command-line tool does not affect Training Builder's license. If we were to distribute pandoc or link to its code, GPL-2.0 would apply.

### Training Builder License Status

Training Builder is currently a proprietary internal tool. The third-party libraries used are all compatible with proprietary/commercial use:

- PyPDF2 (BSD) - Compatible
- ReportLab (BSD) - Compatible
- Pandoc (GPL) - Used as external tool, compatible
- Anthropic SDK (MIT) - Compatible

---

## Contact

For licensing questions or concerns, please contact the development team.

---

**Last Updated**: 2025-11-18
