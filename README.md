# Bhuvaneshwari G · Portfolio

Clean modular frontend portfolio. Dark premium aesthetic with royal gold + purple accents.

---

## Project Structure

```
portfolio/
├── index.html                    ← Clean semantic HTML, no inline JS/CSS
├── css/
│   └── style.css                 ← All styles + CSS variables
├── js/
│   ├── data.js                   ← ALL content lives here (edit this)
│   ├── render.js                 ← DOM injection functions
│   ├── carousel.js               ← Certificate carousel (isolated)
│   └── main.js                   ← Interactions, scroll, typed effect
└── assets/
    ├── images/
    │   ├── profile/              ← Drop profile.jpg here
    │   ├── projects/             ← Drop project screenshots here
    │   └── certificates/         ← Drop certificate images here
    └── icons/                    ← Custom icons (optional)
```

---

## Quick Start (VS Code + Live Server)

1. Open the `portfolio/` folder in VS Code
2. Install the **Live Server** extension (ritwickdey.liveserver)
3. Right-click `index.html` → **Open with Live Server**
4. Changes to any file auto-refresh the browser

---

## How to Customize

### Update your info
Everything lives in **`js/data.js`**. Edit that file — the site updates automatically.

### Add your profile photo
1. Drop your photo into `assets/images/profile/profile.jpg`
2. In `data.js`, uncomment and set:
   ```js
   profileImage: "assets/images/profile/profile.jpg"
   ```

### Add project screenshots
1. Drop screenshots into `assets/images/projects/`
2. In `data.js` under `projects`, set:
   ```js
   image: "assets/images/projects/your-screenshot.png"
   ```

### Add certificate images
1. Drop images into `assets/images/certificates/`
2. In `data.js` under `certificates`, set:
   ```js
   image: "assets/images/certificates/cert-name.jpg"
   ```

### Enable contact form (FormSubmit)
1. Go to https://formsubmit.co
2. Get your form endpoint email
3. In `data.js`, set:
   ```js
   formSubmitEmail: "your@email.com"
   ```

### Add a resume PDF
1. Drop your resume PDF into `assets/`
2. In `index.html`, find the Download Resume button and update `href`:
   ```html
   <a href="assets/resume.pdf" ...>↓ Download Resume</a>
   ```

---

## Script Load Order

Scripts must load in this order (already set in index.html):
```
data.js → render.js → carousel.js → main.js
```

---

## Future Admin Panel Integration

All data is centralized in `data.js`. When building an admin panel or CMS:
- Replace static `PORTFOLIO` object with API fetch calls in `render.js`
- Each render function already reads from `PORTFOLIO.*` — just swap the data source
- Image paths follow a consistent `assets/images/{type}/filename` convention
