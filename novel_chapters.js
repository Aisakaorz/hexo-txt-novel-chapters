'use strict';

/**
 * Hexo 纯文本小说章节卡片标签
 * 用法：
 *   {% novel_chapters %}
 *   ### 第一章 标题
 *   内容...
 *   ### 第二章 标题
 *   内容...
 *   {% endnovel_chapters %}
 */

hexo.extend.tag.register('novel_chapters', function(args, content) {
  // 先把包裹的 Markdown 渲染成 HTML
  const html = hexo.render.renderSync({ text: content, engine: 'markdown' });

  // 按 <h3> 分割章节
  const chapters = [];
  const h3Regex = /<h3[^>]*>(.*?)<\/h3>/gi;
  let match;
  let lastIndex = 0;

  while ((match = h3Regex.exec(html)) !== null) {
    if (chapters.length > 0) {
      chapters[chapters.length - 1].content = html.slice(lastIndex, match.index);
    }
    // 去掉 Hexo 自动生成的锚点链接，提取纯文本标题
    const titleHtml = match[1];
    const titleText = titleHtml.replace(/<a[^>]*class="[^"]*header-anchor[^"]*"[^>]*>.*?<\/a>/gi, '').replace(/<[^>]+>/g, '').trim();
    chapters.push({ title: titleText, content: '' });
    lastIndex = match.index + match[0].length;
  }

  if (chapters.length === 0) {
    // 没有三级标题，直接返回原文
    return html;
  }

  chapters[chapters.length - 1].content = html.slice(lastIndex);

  const containerId = 'novel-data-' + Math.random().toString(36).substr(2, 9);
  let cards = '';

  chapters.forEach(function(ch, idx) {
    cards += `
<div class="novel-card" onclick="HexoNovelReader.open('${containerId}', ${idx})">
  <h4 class="novel-title">${ch.title}</h4>
  <button class="novel-btn read" onclick="event.stopPropagation(); HexoNovelReader.open('${containerId}', ${idx})">📖 阅读</button>
</div>
    `;
  });

  let dataDivs = '';
  chapters.forEach(function(ch, idx) {
    dataDivs += `<div data-chapter="${idx}" data-title="${ch.title.replace(/"/g, '&quot;')}">${ch.content}</div>`;
  });

  return `
<div class="novel-grid">${cards}</div>
<div style="display:none;" id="${containerId}">${dataDivs}</div>
  `.trim();
}, { ends: true });

// ==================== 样式（独立命名空间，与 epub.js 不冲突）====================
const css = `
<style>
/* 章节卡片网格 */
.novel-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; margin: 1.5em 0; }
.novel-card { 
  display: flex; 
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 12px;
  background: var(--content-bg-color, #fff); 
  border-radius: 10px; 
  padding: 24px 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08); 
  border: 1px solid var(--border-color, #eee); 
  transition: transform .2s, box-shadow .2s; 
  cursor: pointer; 
}
.novel-card:hover { transform: translateY(-3px); box-shadow: 0 6px 20px rgba(0,0,0,0.12); }
.novel-title { 
  margin: 0; 
  font-size: 1.05em; 
  line-height: 1.4; 
  color: var(--text-color, #333); 
  text-align: center;
}
.novel-btn { 
  padding: 6px 24px; 
  border-radius: 6px; 
  font-size: .85em; 
  text-decoration: none; 
  border: none; 
  cursor: pointer; 
  text-align: center; 
  transition: opacity .2s; 
}
.novel-btn:hover { opacity: .85; }
.novel-btn.read { background: #5B8FF9; color: #fff; }

/* 阅读器模态框（独立 ID，与 epub 不冲突） */
#hexo-novel-modal { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.92); z-index: 99998; flex-direction: column; }
#hexo-novel-modal.active { display: flex; }
.hexo-novel-bar { height: 50px; background: #1a1a1a; color: #fff; display: flex; align-items: center; padding: 0 18px; gap: 10px; border-bottom: 1px solid #333; flex-shrink: 0; }
.hexo-novel-bar button { background: #333; color: #fff; border: none; padding: 5px 12px; border-radius: 4px; cursor: pointer; }
.hexo-novel-bar button:hover { background: #444; }
.hexo-novel-bar .bar-title { margin-left: auto; font-size: .9em; opacity: .9; max-width: 45%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* 主区域 */
.hexo-novel-main { flex: 1; display: flex; overflow: hidden; position: relative; }

/* 目录面板 */
#hexo-novel-toc { 
  width: 280px; min-width: 280px; 
  background: #f5f5f5; border-right: 1px solid #ddd; 
  display: none; flex-direction: column; 
  overflow: hidden; 
}
#hexo-novel-toc.active { display: flex; }
.hexo-novel-toc-header { 
  padding: 14px 16px; 
  background: #e8e8e8; 
  border-bottom: 1px solid #ddd; 
  font-weight: bold; color: #333; font-size: .95em; 
}
.hexo-novel-toc-list { 
  flex: 1; overflow-y: auto; padding: 8px 0; 
}
.hexo-novel-toc-item { 
  display: block; padding: 8px 18px; 
  color: #333; text-decoration: none; font-size: .88em; 
  border-bottom: 1px solid #eee; 
  cursor: pointer; transition: background .15s; 
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; 
  min-height: 20px;
}
.hexo-novel-toc-item:hover { background: #e0e0e0; }
.hexo-novel-toc-item.active { background: #5B8FF9; color: #fff; }

/* 阅读区 */
.hexo-novel-view { flex: 1; position: relative; background: #fff; overflow: hidden; overflow-y: auto; }
#hexo-novel-stage { width: 100%; min-height: 100%; }

/* 纯文本章节排版 */
.novel-chapter-content { padding: 40px; line-height: 1.8; font-size: 1.05em; max-width: 800px; margin: 0 auto; color: #333; }
.novel-chapter-content h3 { 
  margin-top: 0; 
  font-size: 1.8em; 
  font-weight: bold;
  text-align: center;
  border-bottom: 1px solid #eee; 
  padding-bottom: 16px; 
  margin-bottom: 32px; 
}
.novel-chapter-content p { margin: 0 0 1em; text-indent: 2em; }
.novel-chapter-content p:first-of-type { margin-top: 0; }

@media (max-width: 600px) { 
  .novel-grid { grid-template-columns: 1fr; } 
  .novel-card { padding: 18px 16px; } 
  #hexo-novel-toc { width: 220px; min-width: 220px; position: absolute; z-index: 20; height: 100%; box-shadow: 2px 0 8px rgba(0,0,0,0.15); }
  .novel-chapter-content { padding: 20px; font-size: 1em; }
  .novel-chapter-content h3 { font-size: 1.5em; margin-bottom: 24px; }
}
</style>
`;

// ==================== DOM + JS（独立命名空间）====================
const html = `
<div id="hexo-novel-modal">
  <div class="hexo-novel-bar">
    <button onclick="HexoNovelReader.close()">✕</button>
    <button onclick="HexoNovelReader.prev()">←</button>
    <button onclick="HexoNovelReader.next()">→</button>
    <button onclick="HexoNovelReader.toggleToc()">☰ 目录</button>
    <span class="bar-title" id="hexo-novel-tit">Reader</span>
  </div>
  <div class="hexo-novel-main">
    <div id="hexo-novel-toc">
      <div class="hexo-novel-toc-header">章节目录</div>
      <div class="hexo-novel-toc-list" id="hexo-novel-toc-list"></div>
    </div>
    <div class="hexo-novel-view">
      <div id="hexo-novel-stage"></div>
    </div>
  </div>
</div>
<script>
window.HexoNovelReader = {
  chapters: [],
  currentIdx: 0,
  containerId: null,

  open: function(containerId, idx) {
    this.containerId = containerId;
    const container = document.getElementById(containerId);
    if (!container) return;

    this.chapters = [];
    const self = this;
    container.querySelectorAll(':scope > div[data-chapter]').forEach(function(div, i) {
      self.chapters.push({
        title: div.dataset.title || '',
        content: div.innerHTML
      });
    });

    if (this.chapters.length === 0) return;

    this.currentIdx = idx || 0;
    document.getElementById('hexo-novel-modal').classList.add('active');
    this.render();
  },

  render: function() {
    const chapter = this.chapters[this.currentIdx];
    document.getElementById('hexo-novel-tit').textContent = chapter.title;

    const tocList = document.getElementById('hexo-novel-toc-list');
    tocList.innerHTML = '';
    const self = this;
    this.chapters.forEach(function(ch, i) {
      const a = document.createElement('a');
      a.className = 'hexo-novel-toc-item';
      a.textContent = ch.title;
      a.title = ch.title;
      a.onclick = function(e) {
        e.preventDefault();
        self.currentIdx = i;
        self.render();
        if (window.innerWidth <= 600) document.getElementById('hexo-novel-toc').classList.remove('active');
      };
      tocList.appendChild(a);
    });
    this.highlightToc(this.currentIdx);

    const titleHtml = chapter.title ? '<h3>' + chapter.title + '</h3>' : '';
    const stage = document.getElementById('hexo-novel-stage');
    stage.innerHTML = '<div class="novel-chapter-content">' + titleHtml + chapter.content + '</div>';
  },

  highlightToc: function(idx) {
    document.querySelectorAll('.hexo-novel-toc-item').forEach(function(el, i) {
      el.classList.toggle('active', i === idx);
    });
  },

  toggleToc: function() {
    document.getElementById('hexo-novel-toc').classList.toggle('active');
  },

  prev: function() {
    if (this.currentIdx > 0) {
      this.currentIdx--;
      this.render();
    }
  },

  next: function() {
    if (this.currentIdx < this.chapters.length - 1) {
      this.currentIdx++;
      this.render();
    }
  },

  close: function() {
    this.chapters = [];
    this.currentIdx = 0;
    this.containerId = null;
    document.getElementById('hexo-novel-modal').classList.remove('active');
    document.getElementById('hexo-novel-toc').classList.remove('active');
    document.getElementById('hexo-novel-stage').innerHTML = '';
    document.getElementById('hexo-novel-toc-list').innerHTML = '';
  }
};

document.addEventListener('keydown', function(e) {
  const m = document.getElementById('hexo-novel-modal');
  if (!m.classList.contains('active')) return;
  if (e.key === 'ArrowLeft') HexoNovelReader.prev();
  if (e.key === 'ArrowRight') HexoNovelReader.next();
  if (e.key === 'Escape') HexoNovelReader.close();
});
</script>
`;

try {
  hexo.extend.injector.register('head_end', css, 'default');
  hexo.extend.injector.register('body_end', html, 'default');
} catch (e) {
  console.log('[hexo-novel-chapters] 自动注入失败');
}