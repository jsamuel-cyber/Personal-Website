# Joshua Samuel — Personal Website

A fast, easy-to-edit personal website built with plain HTML, CSS, and JavaScript. No build step, no server, no database.

## Quick Start

The website is live at: https://jsamuel-cyber.github.io/Personal-Website/

Changes you make are published automatically within ~1 minute after you commit to GitHub Pages.

To enable GitHub Pages:
1. Go to https://github.com/jsamuel-cyber/Personal-Website/settings/pages
2. Set Source to "Deploy from a branch"
3. Select the `main` branch and `/ (root)`

## How to Edit Your Website

### Editing via GitHub's web editor

1. Go to https://github.com/jsamuel-cyber/Personal-Website
2. Click the **pencil icon** on any file to edit in your browser
3. Make your changes and click **Commit changes**
4. Your site updates within ~1 minute

### Which files to edit

**`content.js`** — Work experience and photos:
- Update the `experiences` array with your jobs
- Each experience has: `title`, `role`, `loc`, `dates`, and `bullets`
- Add photos to the `photos` array for any experience

**`index.html`** — Everything else:
- Education section (schools, dates, involvement)
- "Skills & Interests" list

**PDF files in `docs/`** — Upload new PDFs with the same name to replace them.

### Editing the Education / Skills text

In `index.html`:
- Lines 56–108: Education section (schools, degrees, involvement, notable work)
- Lines 118–143: Skills & Interests list

### Adding photos

1. Upload images to the **`images/`** folder (JPEG, PNG, or WebP)
   - Suggested naming: `fpd-1.jpg`, `tedx-2.jpg`
   - Keep each under ~500 KB

2. In `content.js`, add photos to any experience's `photos` array:
   ```javascript
   photos: [
     { src: 'images/fpd-1.jpg', alt: 'Team photo', caption: 'Summer internship' }
   ]
   ```

3. For Skills section photos, edit `skillsPhotos` at the bottom of `content.js`:
   ```javascript
   const skillsPhotos = [
     { src: 'images/skills-1.jpg', alt: 'Description' }
   ];
   ```

### Replacing PDFs

In the **`docs/`** folder on GitHub:
1. Click the PDF you want to replace
2. Click the **trash icon** (or upload a file with the same name)
3. Commit the change

## For Developers

The site is completely static—no build step, no server, no database. Files are served directly by GitHub Pages.

### Running locally

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000 in your browser.

### Architecture

- `index.html` — Page structure and static content
- `styles.css` — All styles
- `content.js` — Editable experience data (your resume)
- `script.js` — Vanilla JavaScript (no dependencies)
- `images/` — Photos for galleries
- `docs/` — PDFs (resume, briefs, writing samples)
