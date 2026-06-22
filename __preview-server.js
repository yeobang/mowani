/* ───────────────────────────────────────────────────────────
   MOWANI 로컬 프리뷰 서버 (테마 시각 검증 전용)
   Cafe24 스마트디자인 지시문을 대략 해석해 서브페이지를
   브라우저에서 볼 수 있게 합니다. 실제 Cafe24 렌더링과
   100% 동일하지 않으며, 오직 톤앤무드 확인용입니다.
   배포 대상 아님 (파일명 __ 접두사).
   ─────────────────────────────────────────────────────────── */
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const PORT = 4173;

const MIME = {
  html: 'text/html; charset=utf-8', css: 'text/css; charset=utf-8',
  js: 'application/javascript; charset=utf-8', json: 'application/json',
  png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp',
  gif: 'image/gif', svg: 'image/svg+xml', ico: 'image/x-icon',
  woff: 'font/woff', woff2: 'font/woff2', ttf: 'font/ttf', mp4: 'video/mp4',
};

// 자주 쓰이는 템플릿 변수 → 미리보기용 더미값
const VARS = {
  mall_name: 'MOWANI', company_name: '모와니', president_name: '홍길동',
  phone: '1588-0000', inquiry_email: 'help@mowani.com',
  runtime: '평일 10:00 - 17:00', current_language: '한국어',
  mileage_name: '적립금', mileage: '0원', deposit_name: '예치금', deposit: '0원',
  coupon_cnt: '0', interest_prd_cnt: '0', basket_cnt: '0', basket_count: '0',
  basket_price: '0원', board_name: '공지사항', mall_zipcode: '00000',
  mall_addr1: '서울특별시', mall_addr2: '강남구', company_regno: '000-00-00000',
  network_regno: '제0000호', cpo_name: '홍길동', title_text_or_image: 'PRODUCTS',
};

function readFileSafe(p) { try { return fs.readFileSync(p, 'utf8'); } catch (e) { return null; } }

// {$var} / {$form.x} / {$x|filter} 치환
function resolveVars(html) {
  // 폼 필드는 입력박스로
  html = html.replace(/\{\$form\.[a-zA-Z0-9_]+\}/g,
    '<input type="text" style="height:45px;border:1px solid #e6d8c6;padding:0 14px;width:100%;max-width:340px;border-radius:2px;" />');
  return html.replace(/\{\$([a-zA-Z0-9_]+)(\|[a-zA-Z0-9_]+)?\}/g, (m, name) => {
    if (Object.prototype.hasOwnProperty.call(VARS, name)) return VARS[name];
    return ''; // 알 수 없는 변수는 비움(속성 안전)
  });
}

// @import / @css / @js / @layout / 조건·반복 블록 처리
function processDirectives(html, depth) {
  if (depth > 8) return html;

  // @import(path) → 파일 인라인 (재귀)
  html = html.replace(/<!--@import\(([^)]+)\)-->/g, (m, p) => {
    const sub = readFileSafe(path.join(ROOT, p.trim()));
    return sub != null ? processDirectives(sub, depth + 1) : `<!-- import 실패: ${p} -->`;
  });

  // @css(path) → link
  html = html.replace(/<!--@css\(([^)]+)\)-->/g,
    (m, p) => `<link rel="stylesheet" href="${p.trim()}">`);

  // @js(path) → 미리보기 안정성을 위해 스킵
  html = html.replace(/<!--@js\([^)]+\)-->/g, '');

  // 조건/반복 마커는 제거(내부 HTML은 1회 노출)
  html = html.replace(/<!--@(if|elseif|else|endif|loop|endloop|contents)[^>]*-->/g, '');

  return html;
}

function renderPage(filePath) {
  let page = readFileSafe(filePath);
  if (page == null) return null;

  // @layout(path) 추출
  let layoutPath = null;
  page = page.replace(/<!--@layout\(([^)]+)\)-->/g, (m, p) => { layoutPath = p.trim(); return ''; });

  let html;
  if (layoutPath) {
    const layout = readFileSafe(path.join(ROOT, layoutPath));
    if (layout != null) {
      // 본문을 먼저 레이아웃에 끼운 뒤 지시문을 처리(@contents 마커 보존)
      const combined = layout.replace('<!--@contents-->', page);
      html = processDirectives(combined, 0);
    } else {
      html = processDirectives(page, 0);
    }
  } else {
    html = processDirectives(page, 0);
  }

  html = resolveVars(html);
  // EZ 스크립트 태그가 깨지지 않도록 ez-prop 블록 숨김
  html = html.replace(/<script type="text\/ez-prop">[\s\S]*?<\/script>/g, '');
  html = html.replace(/<ez-prop[\s\S]*?<\/ez-prop>/g, '');

  // 프리뷰 보정: JS로 제어되는 오버레이/모달을 숨겨 본문이 보이게 함
  const fix = `<style id="__preview_fix">
    .worldshipLayer, #layoutDimmed, .layer_shadow, #progressPaybar,
    div[module="Layout_multishopShipping"], div[module="Layout_SearchHeader"],
    .main_top_banner, #right_quick, .bottom-nav__top { display:none !important; }
    .top_search_box, .autoDrop { display:none !important; }
    #contents { display:block !important; visibility:visible !important; opacity:1 !important; }
    .ePlaceholder { position:static !important; }
  </style></head>`;
  html = html.replace('</head>', fix);
  return html;
}

http.createServer((req, res) => {
  let url = decodeURIComponent(req.url.split('?')[0]);
  if (url === '/') url = '/index.html';
  const filePath = path.join(ROOT, url);
  const ext = filePath.split('.').pop().toLowerCase();

  if (ext === 'html') {
    const html = renderPage(filePath);
    if (html == null) { res.writeHead(404); res.end('Not found: ' + url); return; }
    res.writeHead(200, { 'Content-Type': MIME.html });
    res.end(html);
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(PORT, '127.0.0.1', () => console.log('preview ready http://127.0.0.1:' + PORT));
