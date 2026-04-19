# 🔗 Links Opener

A beautiful, fast, and privacy-focused web app to open multiple URLs in new browser tabs with one click. Now with file upload and batch processing!

![Links Opener Screenshot](https://via.placeholder.com/800x400/0E0E0E/5E6AD2?text=Links+Opener)

## ✨ Features

### Core Features
- **🚀 Lightning Fast**: Open dozens of links instantly
- **🔒 Privacy First**: All processing happens locally - no data sent to servers
- **✨ Smart Validation**: Automatically detects and validates URLs
- **📁 File Upload**: Upload .txt, .csv, .json, or .md files
- **🎯 Batch Processing**: Open links in configurable batches with delays
- **☑️ Selective Opening**: Choose which URLs to open
- **💾 Auto-Save**: Your URLs and settings saved locally
- **⌨️ Keyboard Shortcuts**: `Cmd/Ctrl + Enter` to open all

### File Upload Support
- **.txt** - Plain text files with URLs (one per line)
- **.csv** - Comma-separated URLs
- **.json** - JSON array or object with urls/links property
- **.md** - Markdown files (extracts URLs from content)
- **Drag & Drop** - Simply drag files onto the upload area

### Batch Processing
- Configure batch size (links per batch)
- Set delay between batches (0-30 seconds)
- Visual progress tracking
- Cancel anytime
- Prevents browser overload

## 🚀 Live Demo

**[Try it now →](https://switdeveloper.github.io/links-opener/)**

## 🛠️ Usage

### Quick Start
1. Visit https://switdeveloper.github.io/links-opener/
2. **Paste URLs** or **Upload a file**
3. Review the URL preview with validation indicators
4. Click **"Open All Links"**, **"Open Valid Only"**, or **"Open by Batch"**
5. All links open in new browser tabs!

### File Upload
1. Click the upload area or drag & drop a file
2. Supported formats: .txt, .csv, .json, .md
3. URLs are automatically extracted and validated
4. Review and click open!

### Batch Processing
1. Select URLs you want to open (or select all)
2. Configure batch settings:
   - Links per batch (default: 10)
   - Delay between batches (default: 2000ms)
3. Click "Open by Batch"
4. Watch progress as batches open automatically
5. Cancel anytime if needed

### Example Files

#### example.txt
```
https://google.com
https://github.com
https://stackoverflow.com
```

#### example.csv
```
https://google.com,https://github.com
https://stackoverflow.com
```

#### example.json
```json
[
  "https://google.com",
  "https://github.com",
  "https://stackoverflow.com"
]
```

Or:
```json
{
  "urls": [
    "https://google.com",
    "https://github.com"
  ]
}
```

## 🎨 Design

Built with a clean, Linear-inspired design system:
- Dark theme with subtle gradients
- Purple accent color (#5E6AD2)
- Smooth animations and transitions
- Modern typography with Inter font

## 🛠️ Tech Stack

- **HTML5** - Semantic markup
- **CSS3** - Modern CSS with custom properties
- **Vanilla JavaScript** - No frameworks, pure JS
- **LocalStorage** - Persist URLs and settings
- **FileReader API** - Read uploaded files
- **GitHub Pages** - Free hosting

## 📦 Installation

### Clone the repository
```bash
git clone https://github.com/Switdeveloper/links-opener.git
cd links-opener
```

### Open in browser
```bash
open index.html
```

### Deploy to GitHub Pages
```bash
# Push to GitHub, then enable GitHub Pages in settings
# Your site will be at: https://yourusername.github.io/links-opener/
```

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + Enter` | Open valid URLs |
| `Cmd/Ctrl + K` | Clear all URLs |
| `Cmd/Ctrl + V` | Paste from clipboard |
| `Escape` | Close modals |

## 🔒 Privacy

- ✅ All processing happens locally in your browser
- ✅ No data sent to any server
- ✅ No tracking or analytics
- ✅ Files are read locally, never uploaded
- ✅ Uses browser localStorage only

## 🤝 Contributing

Contributions welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Credits

- Design inspired by [Linear](https://linear.app)
- Icons from [Heroicons](https://heroicons.com)
- Fonts from [Google Fonts](https://fonts.google.com)

## 🔗 Links

- **Live Demo**: https://switdeveloper.github.io/links-opener/
- **GitHub**: https://github.com/Switdeveloper/links-opener
- **Issues**: https://github.com/Switdeveloper/links-opener/issues

---

Made with ❤️ for productivity