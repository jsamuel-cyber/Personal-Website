# Joshua Samuel — Personal Website

A fast, easy-to-edit personal website built with plain HTML, CSS, and JavaScript. No build step, no server, no database.

## Quick Start

The website is live at: https://joshuasamuel.org

Changes you make are published automatically within ~1 minute after you commit to GitHub Pages.

## Custom Domain

The website uses a custom domain (joshuasamuel.org). The `CNAME` file in the repo root contains the domain configuration and must not be deleted. If you need to change the custom domain in the future:
1. Edit the `CNAME` file with the new domain name
2. Update the repository settings at Settings → Pages → Custom domain

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
- Hero text, places list and PDF buttons (top of the page)
- Education section (schools, degrees, activities, notable work cards)
- "Skills, Interests, and Projects" section (skills and interests chips, plus projects)
- Projects are the `<article class="card project">` blocks in that section; copy one to add another.

**PDF files in `docs/`** — Upload new PDFs with the same name to replace them.

### Editing the Education / Skills text

In `index.html`, find the section by its id and edit the text in place:
- `id="education"`: schools, degrees, activities (each activity is one `<li>`; numbers are added automatically) and notable work cards
- `id="more"`: the skills and interests lists (one `<li>` per chip) and the projects

### Adding photos

1. Upload images to the **`images/`** folder (JPEG, PNG, or WebP)
   - Suggested naming: `fpd-1.jpg`, `tedx-2.jpg`
   - Keep each under ~500 KB

2. In `content.js`, add photos to any experience's `photos` array:
   ```javascript
   photos: [
     { src: 'images/fpd-1.jpg', alt: 'Team photo', caption: 'Summer internship', position: 'center 30%' }
   ]
   ```
   `position` is optional: a CSS `object-position` for the cropped thumbnail (default `center 30%`); use it when the default crop cuts off a face, for example `'10% 30%'`. Captions are not shown under the thumbnails; they appear only in the photo viewer, where photos can be browsed with the arrow keys, arrow buttons, or a swipe gesture.

3. For Skills section photos, edit `skillsPhotos` at the bottom of `content.js`:
   ```javascript
   const skillsPhotos = [
     { src: 'images/skills-1.jpg', alt: 'Description' }
   ];
   ```

4. For Education section photos (e.g., documentary award), edit `documentaryPhotos` in `content.js`:
   ```javascript
   const documentaryPhotos = [
     { src: 'images/torties-1.jpg', alt: 'Description', caption: 'Caption' }
   ];
   ```

### Replacing PDFs

In the **`docs/`** folder on GitHub:
1. Click the PDF you want to replace
2. Click the **trash icon** (or upload a file with the same name)
3. Commit the change
4. If the new PDF has a different number of pages, update the `PDF_PAGES` lookup near the bottom of `script.js` (above `decorateLinks`) (for example `'docs/resume.pdf': 1`). The page count shown in each PDF pill ("PDF · 1 page") comes from that lookup; PDFs not listed there just show "PDF".

## For Developers

The site is completely static—no build step, no server, no database. Files are served directly by GitHub Pages.

### Running locally

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000 in your browser.

### Architecture

- `index.html` — Page structure and static content
- `styles.css` — All styles (colour, type and spacing tokens are at the top; fonts: Libre Caslon Display and Text for headings, Inter for body, loaded from Google Fonts in `index.html`)
- `content.js` — Editable experience data (your resume)
- `script.js` — Vanilla JavaScript (no dependencies)
- `images/` — Photos for galleries
- `docs/` — PDFs (resume, briefs, writing samples)

## Search and sharing

- The link preview (iMessage, LinkedIn, Slack, etc.) uses `images/og-card.png` (1200x630). Regenerate it if the headshot (`images/headshot.jpg`) changes. The hero portrait on the page is `images/photo.jpg` and the contact photo is `images/tedx-2.jpg`.
- `robots.txt` and `sitemap.xml` live in the repo root.
- After the domain is live, verify it in Google Search Console and submit the sitemap (`https://joshuasamuel.org/sitemap.xml`).
