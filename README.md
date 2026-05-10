# hexo-txt-reader

A Hexo tag plugin that turns plain-text novel chapters into clickable cards with a built-in reader, TOC sidebar, and keyboard navigation.

*(Current release: UI in Simplified Chinese — edit `txt-reader.js` directly for English or other languages.)*

## Features

- `{% txt_reader %}` block tag: wrap `###` headings and body text to auto-generate chapter cards
- One card per `h3` chapter, with title and read button
- Built-in modal reader with TOC sidebar, prev/next chapter navigation
- Keyboard shortcuts: `←` / `→` to switch chapters, `Esc` to close
- Responsive grid layout; mobile-friendly TOC drawer

## Install

Copy `txt-reader.js` to your Hexo theme's `scripts/tags/` directory.

For example, with the **NexT** theme: `themes/next/scripts/tags/txt-reader.js`

Or place it at the blog root: `scripts/tags/txt-reader.js`

Both locations work; placing it under the theme keeps the plugin bundled with your theme config.

## Usage

In your post Markdown, wrap chapters with the block tag:

```markdown
{% txt_reader %}

### Ch.1

content 1

### Ch.2

content 2

{% endtxt_reader %}
```

Each ### heading becomes a chapter card. Click `📖 阅读` to open the reader.
