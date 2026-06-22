#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# MOWANI — Cafe24 스킨 업로드 패키지 빌더
# 현재 작업 디렉토리를 Cafe24 디자인 복원용 tar.gz로 묶습니다.
#   - base/ 래퍼 구조 (Cafe24 export와 동일)
#   - 로컬 전용 파일(assets/, __*, hero-preview, *.md 등) 자동 제외
#   - 출력: dist/ (gitignore됨, Downloads 아님)
#
# 사용법:  bash __build-skin.sh
# 결과물:  dist/<스킨파일명>.tar.gz  →  Cafe24 관리자 → 디자인 보관함 → 복원
# ─────────────────────────────────────────────────────────────
set -e

# Cafe24 스킨 파일명 = {몰ID}_s2_{타임스탬프}_d_{스킨코드}_E
#   - 고정부(몰ID/s2/스킨코드/E)는 이 몰·스킨 식별값이라 유지
#   - 타임스탬프(YYMMDDHHMMSS)는 빌드할 때마다 현재 시각으로 새로 생성
#     (Cafe24가 타임스탬프로 업로드를 구분 → 매번 달라야 충돌 없음)
MALL="mowanistudio"; SLOT="s2"; SKINCODE="base"; SUFFIX="E"
STAMP="$(date +%y%m%d%H%M%S)"
SKIN_NAME="${MALL}_${SLOT}_${STAMP}_d_${SKINCODE}_${SUFFIX}"

ROOT="$(cd "$(dirname "$0")" && pwd)"
DIST="$ROOT/dist"
STAGE="$(mktemp -d)"
OUT="$DIST/${SKIN_NAME}.tar.gz"

mkdir -p "$DIST"
mkdir -p "$STAGE/base"

# 이전 빌드 정리 — 항상 최신 1개만 남겨 헷갈리지 않게
rm -f "$DIST/${MALL}_${SLOT}_"*"_d_${SKINCODE}_${SUFFIX}.tar.gz"

# 작업 디렉토리 → base/ 로 복사 (로컬 전용 제외)
rsync -a \
  --exclude '.git/' \
  --exclude 'dist/' \
  --exclude 'assets/' \
  --exclude '__*' \
  --exclude 'hero-preview.html' \
  --exclude '*.md' \
  --exclude '.DS_Store' \
  --exclude 'node_modules/' \
  --exclude '.gitignore' \
  "$ROOT"/ "$STAGE/base"/

# base/ 래퍼 유지한 채 tar.gz (Cafe24 export와 동일 구조)
( cd "$STAGE" && COPYFILE_DISABLE=1 tar -czf "$OUT" base )
rm -rf "$STAGE"

echo "✅ 빌드 완료: $OUT"
echo "   크기: $(du -h "$OUT" | cut -f1)"
echo "   → Cafe24 관리자 → 디자인(PRO) → 디자인 보관함 → 복원 에서 이 파일 업로드"
