# Photos

Add photos to this folder that will be displayed on your website.

**Suggested naming:** Use descriptive names like `fpd-1.jpg`, `tedx-2.jpg`, etc. Keep each file under ~500 KB.

**Supported formats:** JPEG, PNG, WebP

**How to add photos to experiences:** Edit `content.js` and add entries to the `photos` array for each experience:

```javascript
photos: [
  { src: 'images/fpd-1.jpg', alt: 'Team at Federal Public Defender office', caption: 'Summer 2026' }
]
```

**How to add photos to the Skills section gallery:** Add entries to the `skillsPhotos` array in `content.js`:

```javascript
const skillsPhotos = [
  { src: 'images/skills-1.jpg', alt: 'At a speaking event', caption: 'Public Speaking' }
];
```
