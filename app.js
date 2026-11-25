/* 토실이 준비 노트 — 강도완 · 김명주 (2027.04.12) */
(() => {
  'use strict';

  /* ───────────────────────── 기본 ───────────────────────── */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  const PASSWORD = '0716';
  const DUE_UTC = Date.UTC(2027, 3, 12);      // 2027-04-12 = 임신 40주 0일
  const TOTAL_DAYS = 280;
  const KEY = {
    lock: 'tosil.lock.v1',
    check: 'tosil.checks.v1',
    memo: 'tosil.memo.v1',
    names: 'tosil.names.v1',
    gifts: 'tosil.gifts.v1'
  };

  const store = {
    raw(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    get(k, fb) {
      try { const v = localStorage.getItem(k); return v == null ? fb : JSON.parse(v); }
      catch (e) { return fb; }
    },
    set(k, v) {
      try { localStorage.setItem(k, JSON.stringify(v)); return true; }
      catch (e) { return false; }
    },
    setRaw(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
    del(k) { try { localStorage.removeItem(k); } catch (e) {} }
  };

  const checks = store.get(KEY.check, {}) || {};
  const saveChecks = () => store.set(KEY.check, checks);

  function toast(msg) {
    const el = $('#toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('is-on');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => el.classList.remove('is-on'), 2200);
  }

  /* ───────────────────────── 임신 주수 계산 ───────────────────────── */
  function kstUTC() {
    const p = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit'
    }).formatToParts(new Date());
    const g = (t) => Number(p.find((x) => x.type === t).value);
    return Date.UTC(g('year'), g('month') - 1, g('day'));
  }
  function gestation() {
    const dday = Math.round((DUE_UTC - kstUTC()) / 86400000);
    return { dday, gd: TOTAL_DAYS - dday };
  }

  const SIZE = {
    16: ['아보카도', '약 12cm', '약 100g', '🥑'],
    17: ['배', '약 13cm', '약 140g', '🍐'],
    18: ['피망', '약 14cm', '약 190g', '🫑'],
    19: ['망고', '약 15cm', '약 240g', '🥭'],
    20: ['바나나', '약 25cm', '약 300g', '🍌'],
    21: ['당근', '약 27cm', '약 360g', '🥕'],
    22: ['파파야', '약 28cm', '약 430g', '🥭'],
    23: ['자몽', '약 29cm', '약 500g', '🍊'],
    24: ['옥수수', '약 30cm', '약 600g', '🌽'],
    25: ['무', '약 34cm', '약 660g', '🥬'],
    26: ['대파 한 단', '약 35cm', '약 760g', '🧅'],
    27: ['콜리플라워', '약 36cm', '약 875g', '🥦'],
    28: ['가지', '약 37cm', '약 1.0kg', '🍆'],
    29: ['단호박', '약 38cm', '약 1.15kg', '🎃'],
    30: ['배추', '약 39cm', '약 1.3kg', '🥬'],
    31: ['코코넛', '약 41cm', '약 1.5kg', '🥥'],
    32: ['양배추', '약 42cm', '약 1.7kg', '🥬'],
    33: ['파인애플', '약 43cm', '약 1.9kg', '🍍'],
    34: ['멜론', '약 45cm', '약 2.1kg', '🍈'],
    35: ['허니듀 멜론', '약 46cm', '약 2.4kg', '🍈'],
    36: ['상추 한 통', '약 47cm', '약 2.6kg', '🥬'],
    37: ['근대 한 단', '약 48cm', '약 2.9kg', '🌿'],
    38: ['대파 세 단', '약 49cm', '약 3.1kg', '🧅'],
    39: ['작은 수박', '약 50cm', '약 3.3kg', '🍉'],
    40: ['수박', '약 51cm', '약 3.5kg', '🍉']
  };

  let CURRENT = { week: 20, day: 2 };

  function renderHero() {
    const { dday, gd } = gestation();
    const afterBirth = dday < 0;

    if (afterBirth) {
      $('#heroWeek').textContent = `만난 지 ${-dday}일`;
      $('#heroDday').textContent = 'D+' + (-dday);
      $('#heroDue').textContent = '2027. 4. 12 태어났어요';
      $('#progBar').style.width = '100%';
      $('#progTick').style.left = '100%';
      $('#progLabel').textContent = '280일을 가득 채웠어요 · 이제 진짜 시작';
      $('#sizeEmoji').textContent = '👶';
      $('#sizeName').textContent = '우리 품에 있어요';
      $('#sizeNote').textContent = '토실이랑 보내는 첫날들';
      $('#daysToGo').textContent = '함께 ' + (-dday) + '일째';
      return;
    }

    const week = Math.floor(gd / 7);
    const day = gd % 7;
    CURRENT = { week, day };

    $('#heroWeek').textContent = `${week}주 ${day}일`;
    $('#heroDday').textContent = dday === 0 ? 'D-DAY' : `D-${dday}`;
    $('#heroDue').textContent = '출산 예정일 2027. 4. 12';
    $('#daysToGo').textContent = dday === 0 ? '오늘이에요' : `${dday}일 뒤 만나요`;

    const pct = Math.max(0, Math.min(100, (gd / TOTAL_DAYS) * 100));
    $('#progBar').style.width = pct.toFixed(1) + '%';
    $('#progTick').style.left = pct.toFixed(1) + '%';
    $('#progLabel').textContent = `280일 중 ${gd}일 지남 · ${pct.toFixed(1)}%`;

    const s = SIZE[week] || SIZE[40];
    $('#sizeEmoji').textContent = s[3];
    $('#sizeName').textContent = s[0] + '만 해요';
    $('#sizeNote').textContent = `키 ${s[1]} · 몸무게 ${s[2]}`;
  }

  /* ───────────────────────── 1. 사진 ───────────────────────── */
  const ALBUM = [
    { week: 12, label: '첫 만남' },
    { week: 16, label: '' },
    { week: 20, label: '정밀초음파' },
    { week: 24, label: '' },
    { week: 28, label: '' },
    { week: 32, label: '성장초음파' },
    { week: 36, label: '막달 검사' },
    { week: 40, label: '만나요' }
  ];

  function renderAlbum() {
    const host = $('#album');
    const now = CURRENT.week;
    host.innerHTML = ALBUM.map((a) => {
      const isNow = a.week === now;
      return `
      <div class="album__row">
        <p class="album__week">${a.week}주<small>${a.label || ''}</small></p>
        <div class="frame${isNow ? ' is-now' : ''}">
          ${isNow ? '<span class="frame__tag">이번 주</span>' : ''}
          <div>
            <p class="frame__icon" aria-hidden="true">${isNow ? '📷' : '🖼️'}</p>
            <p class="frame__text">${isNow ? '이번 주 초음파 사진을 기다리고 있어요' : '사진을 보내면 여기에 담겨요'}</p>
          </div>
        </div>
      </div>`;
    }).join('');

    $('#photoCount').textContent = '0장';

    $('#growthNotes').innerHTML = `
      <div class="empty">
        <p class="empty__icon" aria-hidden="true">🌱</p>
        <p class="empty__title">아직 기록이 없어요</p>
        <p class="empty__body">초음파 사진과 한 줄을 피클에게 보내 주시면,<br>이 타임라인과 함께 차곡차곡 쌓아 둘게요.</p>
      </div>`;
  }

  /* ───────────────────────── 2. 살 것 ───────────────────────── */
  const CATS = [
    { id: 'travel', label: '외출·이동' },
    { id: 'sleep', label: '수면·가구' },
    { id: 'feed', label: '수유' },
    { id: 'bath', label: '목욕·위생' },
    { id: 'cloth', label: '의류' },
    { id: 'mom', label: '산모' },
    { id: 'etc', label: '기타' }
  ];
  const CAT_LABEL = Object.fromEntries(CATS.map((c) => [c.id, c.label]));

  const STATUS = {
    reserved: { label: '예약·진행중', cls: 'badge--peach' },
    consider: { label: '구매고려', cls: 'badge--grey' },
    danggeun: { label: '당근', cls: 'badge--sun' },
    gift: { label: '선물', cls: 'badge--rose' },
    done: { label: '완료', cls: 'badge--done' }
  };
  const STATUS_FILTERS = [
    { id: 'all', label: '전체' },
    { id: 'reserved', label: '예약·진행중' },
    { id: 'consider', label: '구매고려' },
    { id: 'danggeun', label: '당근' },
    { id: 'gift', label: '선물' },
    { id: 'done', label: '완료' }
  ];

  const FUKUOKA = [
    {
      id: 'k-tripp', group: 'fukuoka', name: '스토케 트립트랩 5-in-1 뉴본 세트',
      cat: 'sleep', status: 'reserved', price: '세전 ¥68,900',
      tags: ['이와타야 블라썸39', '2027. 1. 8 방문'],
      notes: [
        '체어 34,300 + 트레이 8,400 + 뉴본세트 19,400 + 하네스 6,800 (베이비세트 무료)',
        '체어 1순위 내츄럴 · 뉴본 바닐라화이트 · 트레이 바닐라화이트 · 하네스 베이지',
        '2026-11-24 예약 폼 접수 완료 · 1/7 저녁 픽업 가능 여부까지 요청'
      ],
      next: '<b>12월 8일경</b> 매장 확인 메일이 와요 → 가격·조건 동의 회신 → 최종 확정까지 7~9일. 자동 접수 메일은 확정이 아니에요.'
    },
    {
      id: 'k-bugaboo', group: 'fukuoka', name: '부가부 드래곤플라이 플러스 유모차',
      cat: 'travel', status: 'reserved', price: '세전 ¥126,000',
      tags: ['본체 9.9kg', '5% 쿠폰 시 ¥119,700'],
      notes: [
        '베이스 111,200 + 캐노피 14,800 = 세전 126,000엔',
        '1순위 더스티핑크 + 블랙 / 2순위 데저트토프 + 블랙 + 브라운그립으로 요청',
        '접은 크기 36×52×90cm → 기내 반입 불가, 전용 위탁(박스 포함 13~15kg)'
      ],
      next: '트립트랩과 같은 블라썸39 건으로 함께 확정돼요. 1/7 저녁 픽업이 안 되면 1/8 낮 12시 이전 방문.'
    },
    {
      id: 'k-cybex', group: 'fukuoka', name: '싸이벡스 카시트 (+ 베이스)',
      cat: 'travel', status: 'consider', price: '¥44,000 ~ ¥82,500(세후)',
      tags: ['라라포트 3층', '아카짠혼포 · DADWAY 비교'],
      notes: [
        '시로나 S ¥53,900 + 베이스S ¥35,200 / 시로나 Si 세트 세후 ¥82,500 (12.7kg)',
        '클라우드T i-Size ¥44,000 + 베이스 별도 — 신생아 인레이 포함 여부 확인',
        '같은 층 DADWAY도 싸이벡스 취급. 백화점은 외국인에게 카시트 판매 불가'
      ],
      next: '베이스는 한국에서 따로 구하기 어려워요. <b>시로나 S + 베이스S</b> 조합과 클라우드T+베이스를 매장에서 무게·장착으로 비교.'
    },
    {
      id: 'k-artipoppe', group: 'fukuoka', name: '아티포페 아기띠 (호텔 배송)',
      cat: 'travel', status: 'reserved', price: '약 ¥51,300 ~ 52,200',
      tags: ['일 팔라조 수령', '추천 €50 할인'],
      notes: [
        '일 팔라조 프런트 수령 승낙 완료 (2026-11-25 · 예약번호 1801960216)',
        '출국 5~7일 전 공홈에서 국가를 일본(JPY)으로 바꿔 결제 — 국내보다 7~10만 원 절약',
        '배송 라벨에 DOWAN KANG + Jan 7, 2027 + 호텔 주소(3-13-1 Haruyoshi, Chuo-ku)'
      ],
      next: '12월 말~1월 1일경 주문. 네덜란드에서 3~5일(최대 7일) 걸려요. 체크인 때 프런트에서 받고 박스는 버려도 돼요.'
    }
  ];

  const ESSENTIALS = [
    /* 수유 */
    { id: 'e-bottle', name: '젖병 160ml·240ml 각 2개 (더블하트)', cat: 'feed', note: '온라인 면세점에서 사면 조금 싸요' },
    { id: 'e-steril', name: '젖병 소독기 (또는 열탕·전자레인지 소독 용기)', cat: 'feed' },
    { id: 'e-formula', name: '분유 1통', cat: 'feed', note: '병원에서 쓰는 브랜드로 소량만' },
    { id: 'e-cushion', name: '수유쿠션', cat: 'feed', note: '팔이 덜 아프고 자세가 편해져요' },
    { id: 'e-pump', name: '유축기 (전동)', cat: 'feed', note: '출산 후 필요해지면 사도 늦지 않아요' },
    { id: 'e-bra', name: '수유브라 2~3개 · 수유패드', cat: 'feed' },
    /* 수면·가구 */
    { id: 'e-bed', name: '아기 침대 (또는 범퍼침대)', cat: 'sleep', note: '조리원에서 돌아오는 4월 중순까지 세팅' },
    { id: 'e-swaddle', name: '속싸개 3~4장', cat: 'sleep' },
    { id: 'e-sleepbag', name: '슬리핑백 (봄·여름 대비)', cat: 'sleep' },
    { id: 'e-blanket', name: '아기 이불 · 요 세트', cat: 'sleep' },
    { id: 'e-mat', name: '놀이 매트', cat: 'sleep', note: '뒤집기 시작하면 필요해져요' },
    /* 목욕·위생 */
    { id: 'e-tub', name: '아기 욕조 (+ 목욕 의자)', cat: 'bath' },
    { id: 'e-nail', name: '피죤 신생아 손톱가위 ¥987', cat: 'bath', note: '아카짠혼포 라라포트점' },
    { id: 'e-nose', name: '피죤 슈폿 전동 콧물흡입기 ¥14,300', cat: 'bath', note: '한정 베이지 색상' },
    { id: 'e-thermo', name: '체온계', cat: 'bath' },
    { id: 'e-fever', name: '네츠사마 해열시트 ¥547', cat: 'bath' },
    { id: 'e-cotton', name: '피죤 점착면봉 ¥308', cat: 'bath' },
    { id: 'e-detergent', name: '아기 세제 · 세정제', cat: 'bath', note: '액체류는 위탁수하물로' },
    { id: 'e-diaper', name: '기저귀 신생아 1팩 · 물티슈', cat: 'bath', note: '선물로 들어오는 경우가 많아 소량만' },
    { id: 'e-towel', name: '아기 수건 (밤부베베)', cat: 'bath', note: '온라인 면세점 주문' },
    /* 의류 */
    { id: 'e-bae', name: '배냇저고리 5장 이상', cat: 'cloth' },
    { id: 'e-naebok', name: '내복(우주복) 5장', cat: 'cloth' },
    { id: 'e-socks', name: '양말 · 손싸개', cat: 'cloth' },
    { id: 'e-bib', name: '베이비뵨 턱받이 2매 ¥2,970', cat: 'cloth', note: '아카짠혼포' },
    { id: 'e-out', name: '외출복 2벌 (봄)', cat: 'cloth', note: '유니클로 라라포트점 아기옷' },
    { id: 'e-hat', name: '모자 · 겉싸개', cat: 'cloth' },
    /* 외출·이동 */
    { id: 'e-bagd', name: '기저귀가방', cat: 'travel' },
    { id: 'e-seatmat', name: '카시트 보호매트 ¥2,612', cat: 'travel', note: '아카짠혼포' },
    { id: 'e-liner', name: '유모차 시트 라이너 (선택)', cat: 'travel' },
    { id: 'e-sanitizer', name: '손소독제 · 물티슈 캡', cat: 'travel' },
    /* 산모 */
    { id: 'm-pad', name: '산모패드 (대형)', cat: 'mom' },
    { id: 'm-cool', name: '회음부 냉찜질 패드', cat: 'mom' },
    { id: 'm-bra', name: '수유브라 여유분', cat: 'mom' },
    { id: 'm-belt', name: '산후복대', cat: 'mom', note: '병원 지시가 있을 때만' },
    { id: 'm-pajama', name: '넉넉한 파자마 2벌', cat: 'mom' },
    { id: 'm-care', name: '산모 스킨케어 · 세면도구', cat: 'mom' },
    /* 기타 */
    { id: 'e-towel2', name: '목욕 타월 2장', cat: 'etc' },
    { id: 'e-spoon', name: '릿첼 온도감지 스푼 ¥2,310', cat: 'etc', note: '이유식 시작할 때' },
    { id: 'e-mesh', name: '앙젤레트 과즙망 ¥1,210', cat: 'etc' },
    { id: 'e-teether', name: '에디슨 바나나 치발기 ¥748', cat: 'etc' },
    { id: 'e-tooth', name: 'HAMICO 칫솔', cat: 'etc' },
    { id: 'e-bath', name: '스키나베브 입욕제', cat: 'etc' },
    { id: 'e-paci', name: '쪽쪽이 · 미피 스트랩 (피죤·NUK)', cat: 'etc' }
  ].map((x) => ({ ...x, group: 'essentials', status: 'consider', tags: [] }));

  const SHOP_ITEMS = [...FUKUOKA, ...ESSENTIALS];
  const shopState = { cat: 'all', status: 'all' };

  const effStatus = (it) => (checks[it.id] ? 'done' : it.status);

  function shopCard(it) {
    const st = STATUS[effStatus(it)] || STATUS.consider;
    const done = !!checks[it.id];
    return `
      <article class="item${done ? ' is-checked' : ''}" data-item="${it.id}">
        <div class="item__head">
          <div>
            <h4 class="item__title">${esc(it.name)}</h4>
            <div class="item__meta">
              <span class="badge ${st.cls}">${st.label}</span>
              <span class="tag">${CAT_LABEL[it.cat] || '기타'}</span>
              ${it.price ? `<span class="tag tag--price">${esc(it.price)}</span>` : ''}
              ${(it.tags || []).map((t) => `<span class="tag">${esc(t)}</span>`).join('')}
            </div>
          </div>
          <button class="item__check" type="button" data-check="${it.id}"
            aria-pressed="${done}" aria-label="${esc(it.name)} 준비 완료 표시">✓</button>
        </div>
        ${it.notes && it.notes.length ? `<ul class="item__notes">${it.notes.map((n) => `<li>${n}</li>`).join('')}</ul>` : ''}
        ${it.note ? `<ul class="item__notes"><li>${esc(it.note)}</li></ul>` : ''}
        ${it.next ? `<p class="item__next">${it.next}</p>` : ''}
      </article>`;
  }

  function renderShop() {
    const catHost = $('#catFilters');
    const stHost = $('#statusFilters');

    catHost.innerHTML = [{ id: 'all', label: '전체' }, ...CATS]
      .map((c) => `<button class="fchip${shopState.cat === c.id ? ' is-on' : ''}" type="button" data-cat="${c.id}">${c.label}</button>`)
      .join('');
    stHost.innerHTML = STATUS_FILTERS
      .map((s) => `<button class="fchip${shopState.status === s.id ? ' is-on' : ''}" type="button" data-status="${s.id}">${s.label}</button>`)
      .join('');

    const filtered = SHOP_ITEMS.filter((it) =>
      (shopState.cat === 'all' || it.cat === shopState.cat) &&
      (shopState.status === 'all' || effStatus(it) === shopState.status));

    const ready = SHOP_ITEMS.filter((it) => checks[it.id]).length;
    $('#shopSummary').textContent = `전체 ${SHOP_ITEMS.length}개 · 준비 완료 ${ready}개 · 지금 보이는 ${filtered.length}개`;

    if (!filtered.length) {
      $('#shopList').innerHTML = `
        <div class="empty">
          <p class="empty__icon" aria-hidden="true">🧺</p>
          <p class="empty__title">여기엔 아직 없어요</p>
          <p class="empty__body">이 분류에 담긴 물건이 없어요. 다른 분류를 눌러 보세요.</p>
        </div>`;
      return;
    }

    const groups = [
      { id: 'fukuoka', title: '후쿠오카에서 사 올 것', sub: '2027. 1. 7 ~ 10' },
      { id: 'essentials', title: '신생아 준비물', sub: '체크하면 완료로 바뀌어요' }
    ];

    $('#shopList').innerHTML = groups.map((g) => {
      const list = filtered.filter((it) => it.group === g.id);
      if (!list.length) return '';
      return `
        <div class="grouphead"><h3>${g.title}</h3><span>${list.length}개 · ${g.sub}</span></div>
        <div class="stack">${list.map(shopCard).join('')}</div>`;
    }).join('');
  }

  /* ───────────────────────── 3. 할 일 ───────────────────────── */
  const TASK_STAGES = [
    {
      id: 'mid', title: '임신 중기', sub: '20~27주 · 2026.11 ~ 2027.01', items: [
        { id: 't-ultra20', text: '20주 정밀초음파', note: '11월 말~12월 초 · 장기·얼굴·태반 위치까지 확인' },
        { id: 't-sugar', text: '임당검사 예약 (24~28주)', note: '12월 중순~1월 초, 금식 안내 확인' },
        { id: 't-care', text: '산후조리원 후보 2~3곳 비교', note: '범일동·연산동 거리, 4월 예약 현황' },
        { id: 't-helper', text: '산후도우미 신청 가능 여부 확인', note: '보건소 문의 · 소득 기준 있음' },
        { id: 't-tdap', text: '백일해(Tdap) 접종', note: '임신 27~36주 권장 — 12월 중 예약' },
        { id: 't-flu', text: '독감 예방접종 여부 확인', note: '임신 중 접종 권장' },
        { id: 't-fukuoka', text: '1/7~10 후쿠오카 쇼핑 동선 확정', note: '블라썸39 픽업 → 라라포트 → 아티포페 수령' },
        { id: 't-flight', text: '진에어 임신부 탑승 조건 확인', note: '주수별 탑승 제한·서류 필요 여부' },
        { id: 't-work', text: '회사에 휴직 계획 공유', note: '배우자 출산전후휴가 20일 + 육아휴직 3개월' }
      ]
    },
    {
      id: 'late', title: '임신 후기', sub: '28~36주 · 2027.01 ~ 2027.03', items: [
        { id: 't-sugar2', text: '임당검사 결과 확인 · 식이 관리', note: '필요하면 영양 상담' },
        { id: 't-grow', text: '32~34주 성장초음파', note: '아기 몸무게·양수·태반 위치' },
        { id: 't-nest', text: '아기방 · 침대 배치, 세탁·소독', note: '속싸개·내복은 미리 한 번 빨아 두기' },
        { id: 't-assemble', text: '유모차 · 카시트 · 트립트랩 조립 테스트', note: '박스는 버리지 말고 한 번 펼쳐 보기' },
        { id: 't-care2', text: '산후조리원 최종 예약 · 계약금', note: '입소일·퇴소일 확정' },
        { id: 't-leave1', text: '명주님 육아휴직 신청서 제출', note: '기본 1년 먼저 신청' },
        { id: 't-insur', text: '아기 건강보험·태아보험 정리', note: '출생신고 때 건강보험 피부양자 등록' }
      ]
    },
    {
      id: 'final', title: '막달', sub: '37~40주 · 2027.03 ~ 2027.04', items: [
        { id: 't-nst', text: '35~37주 막달검사 · 태동검사', note: '분만 준비 상태 확인' },
        { id: 't-bag', text: '출산 가방 차에 실어 두기', note: '가방 탭 체크리스트로 최종 확인' },
        { id: 't-route', text: '병원 가는 길 · 새벽 교통 확인', note: '택시 호출 앱·주차 위치까지' },
        { id: 't-name', text: '이름 최종 결정', note: '출생신고 전에 둘이서 하나로' },
        { id: 't-docs', text: '출생신고 서류 준비', note: '신분증·가족관계증명서·출생신고서' },
        { id: 't-contact', text: '가족·지인 연락 순서 정하기', note: '양가 부모님께 알릴 순서' }
      ]
    },
    {
      id: 'after', title: '출산 직후', sub: '2027.04 ~', items: [
        { id: 't-birth', text: '출생신고', note: '출생 1개월 안 · 병원에서 서류 받아 가기' },
        { id: 't-voucher', text: '첫만남이용권 신청', note: '출생신고 때 행복출산으로 한 번에' },
        { id: 't-parent', text: '부모급여 · 아동수당 신청', note: '출생일 포함 60일 안에 → 출생월부터 소급' },
        { id: 't-busan', text: '부산형 산후조리비 신청', note: '출생 6개월 안에 사용, 1년 안에 보건소·정부24' },
        { id: 't-care3', text: '산모·신생아 건강관리 서비스 신청', note: '퇴원 후 바로 시작하려면 미리 신청' },
        { id: 't-dadleave', text: '배우자 출산전후휴가 20일 사용', note: '출생일부터 120일 안에 모두' },
        { id: 't-leave2', text: '명주님 6개월 유급 연장 신청', note: '도완 1차 3개월 완료 증빙 첨부' }
      ]
    }
  ];

  function checkedCount(ids) {
    return ids.filter((id) => checks[id]).length;
  }

  function renderTasks() {
    const allIds = TASK_STAGES.flatMap((s) => s.items.map((i) => i.id));
    const done = checkedCount(allIds);
    const pct = allIds.length ? Math.round((done / allIds.length) * 100) : 0;
    $('#taskTotal').innerHTML = `
      <p class="totalbar__num">${done} / ${allIds.length}</p>
      <div class="bar"><span style="width:${pct}%"></span></div>
      <p class="totalbar__text">${pct}% 완료</p>`;

    $('#taskStages').innerHTML = TASK_STAGES.map((st) => {
      const ids = st.items.map((i) => i.id);
      const d = checkedCount(ids);
      const p = Math.round((d / ids.length) * 100);
      return `
        <section class="stage">
          <div class="stage__head">
            <div>
              <h3 class="stage__title">${st.title}</h3>
              <p class="stage__sub">${st.sub}</p>
            </div>
            <span class="stage__count">${d}/${ids.length}</span>
          </div>
          <div class="bar"><span style="width:${p}%"></span></div>
          ${st.items.map((it) => `
            <label class="chk">
              <input type="checkbox" data-chk="${it.id}" ${checks[it.id] ? 'checked' : ''}>
              <span class="chk__box" aria-hidden="true">✓</span>
              <span class="chk__text">${esc(it.text)}${it.note ? `<span class="chk__note">${esc(it.note)}</span>` : ''}</span>
            </label>`).join('')}
        </section>`;
    }).join('');
  }

  /* ───────────────────────── 4. 병원 ───────────────────────── */
  const EXAMS = [
    {
      week: '20~22', title: '정밀초음파',
      body: '태아의 장기·얼굴·심장·손발을 자세히 확인해요. 태반 위치와 양수량도 함께 봐요.',
      tip: '시간이 30분 이상 걸려요. 여유 있게 도착하고, 검사 전에 물을 조금 마셔 두세요.'
    },
    {
      week: '24~28', title: '임당 · 빈혈 검사',
      body: '임신성 당뇨와 빈혈을 확인해요. 병원에 따라 선별검사 후 확진검사를 해요.',
      tip: '전날 밤 9시 이후 금식 안내가 일반적이에요. 병원 안내를 먼저 따르세요.'
    },
    {
      week: '32~34', title: '성장초음파',
      body: '아기 몸무게와 성장 속도, 양수·태반 상태를 다시 확인해요.',
      tip: '몸무게가 많이 늘거나 줄면 식이 상담을 받아 보세요.'
    },
    {
      week: '35~37', title: '막달 · 태동검사',
      body: '태동검사(NST)와 분만 준비 상태를 확인해요. 출산 가방은 이때 차에 실어 두세요.',
      tip: '태동이 평소와 다르면 검사일을 기다리지 말고 바로 병원에 연락하세요.'
    }
  ];

  function renderHospital() {
    $('#exams').innerHTML = EXAMS.map((e) => `
      <article class="card exam">
        <div class="exam__week">${e.week}<small>주</small></div>
        <div>
          <h3 class="exam__title">${e.title}</h3>
          <p class="exam__body">${e.body}</p>
          <p class="exam__tip">💡 ${e.tip}</p>
        </div>
      </article>`).join('');

    const memo = $('#memo');
    memo.value = store.raw(KEY.memo) || '';
    let t = null;
    memo.addEventListener('input', () => {
      clearTimeout(t);
      const hint = $('#memoHint');
      hint.textContent = '저장 중…';
      t = setTimeout(() => {
        store.setRaw(KEY.memo, memo.value);
        hint.textContent = '이 기기에 저장됐어요 ✓';
        setTimeout(() => { hint.textContent = '입력하면 자동으로 저장돼요.'; }, 1800);
      }, 350);
    });
  }

  /* ───────────────────────── 5. 지원금 ───────────────────────── */
  const MONEY = [
    {
      title: '첫만남이용권', amount: '200만 원', sub: '한 번에 · 국민행복카드 포인트',
      body: '출생신고 때 행복출산으로 한 번에 신청할 수 있어요. 첫째 200만 원, 둘째부터 300만 원.',
      list: ['출생일부터 2년 안에 써야 하고, 남은 금액은 사라져요', '유흥·사행업종만 빼고 온라인 결제도 돼요'],
      tags: ['소득기준 없음', '가족 100만 원 미만은 아동 명의 계좌로']
    },
    {
      title: '부모급여', amount: '월 100만 → 50만 원', sub: '만 2세 미만 · 24개월 1,800만 원',
      body: '0~11개월은 월 100만 원, 12~23개월은 월 50만 원. 매월 25일에 들어와요.',
      list: ['어린이집을 다니면 보육료를 먼저 쓰고 차액만 현금으로 (0세 41만 6천 원)', '출생일 포함 60일 안에 신청하면 출생한 달부터 소급'],
      tags: ['소득기준 없음', '아동수당과 함께 받아요']
    },
    {
      title: '아동수당', amount: '월 10만 5천 원', sub: '부산은 비수도권 +5천 원',
      body: '2026년 기준 9세 미만 아동에게 매월 25일 지급해요. 아동수당과 부모급여는 따로 들어와요.',
      list: ['지급 연령이 2030년까지 13세 미만으로 한 살씩 올라가요', '인구감소지역은 더 높지만 부산 동구는 해당 없음'],
      tags: ['소득기준 없음', '보육료·양육수당과 별개']
    },
    {
      title: '부산형 산후조리비', amount: '최대 100만 원', sub: '쓴 만큼 돌려받는 방식',
      body: '산후조리원·산모신생아 건강관리 본인부담·퇴원 후 진료비를 영수증으로 정산해요.',
      list: ['산후조리원 최대 50만 / 건강관리 본인부담 90% / 병·의원 진료비(한방 포함)', '출생 후 6개월 안에 쓰고, 1년 안에 신청 (정부24·행복출산 또는 보건소)', '바우처 카드로 결제한 금액은 제외돼요'],
      tags: ['2026.1.1 이후 출생아', '쌍둥이 200만 원']
    },
    {
      title: '임신·출산 진료비', amount: '100만 원', sub: '국민행복카드 이용권',
      body: '임신 1회당 단태아 100만 원(다태아 140만 원). 병·의원과 약국 본인부담 결제에 써요.',
      list: ['분만예정일부터 2년까지 사용', '산부인과에서 신청서를 받아 카드사·공단·정부24에서 신청', '이미 신청했는지 한 번 확인해 보세요'],
      tags: ['소득기준 없음']
    },
    {
      title: '배우자 출산전후휴가', amount: '20일 유급', sub: '도완 님 몫',
      body: '배우자 출산예정일 50일 전부터 쓸 수 있고, 출생일부터 120일 안에 모두 써야 해요.',
      list: ['3회까지 나눠 쓸 수 있어요(4구간)', '출생신고·서류 준비·산후조리원 이동에 나눠 쓰기 좋아요'],
      tags: ['2026.9.18 명칭 변경', '회사 규정도 함께 확인']
    },
    {
      title: '부산시 출산지원금', amount: '둘째부터 100만 원', sub: '우리는 해당 없음', na: true,
      body: '부산시에 주민등록된 둘째 이후 출생아에게 100만 원 일시금. 첫째는 대상이 아니에요.',
      list: ['출생일부터 3개월 안에 신청, 다음 달 10일 전후 입금'],
      tags: ['첫째 해당 없음']
    },
    {
      title: '동구 출산축하금', amount: '둘째 20만 원', sub: '셋째부터 200만 원', na: true,
      body: '동구에 주민등록을 두고 실제 거주하는 둘째 이후 가정에 지급해요. 첫째는 대상이 아니에요.',
      list: ['셋째부터는 20만 원씩 10회로 나눠 들어와요', '출생일부터 3개월 안에 동 행정복지센터'],
      tags: ['첫째 해당 없음']
    }
  ];

  function renderMoney() {
    $('#moneyTotal').innerHTML = `
      <p class="total__k">출생부터 24개월까지</p>
      <p class="total__v">약 2,252만 원</p>
      <p class="total__l">첫만남이용권 200만 + 부모급여 1,800만 + 아동수당 252만(월 10만 5천 × 24개월)</p>
      <div class="total__chips">
        <span>+ 부산형 산후조리비 최대 100만</span>
        <span>+ 진료비 바우처 100만</span>
      </div>`;

    $('#moneyList').innerHTML = MONEY.map((m) => `
      <article class="card money${m.na ? ' is-na' : ''}">
        <div class="money__top">
          <h3 class="money__title">${m.title}</h3>
          ${m.na ? '<span class="badge badge--grey">해당 없음</span>' : '<span class="badge badge--mint">받을 수 있어요</span>'}
        </div>
        <p class="money__amount">${m.amount}<small>${m.sub}</small></p>
        <p class="money__body">${m.body}</p>
        ${m.list && m.list.length ? `<ul class="money__list">${m.list.map((l) => `<li>${l}</li>`).join('')}</ul>` : ''}
        <div class="money__tags">${(m.tags || []).map((t) => `<span class="tag">${esc(t)}</span>`).join('')}</div>
      </article>`).join('');

    $('#leaveSummary').innerHTML = `
      <div class="leave-summary__grid">
        <div class="who">
          <p class="who__name">도완</p>
          <p class="who__plan">6개월 · 3개월 + 3개월</p>
          <p class="who__detail">2027년 4월(3개월) + 연말(3개월). 두 번째도 생후 18개월 이내라 6+6이 합산돼요.</p>
        </div>
        <div class="who who--alt">
          <p class="who__name">명주</p>
          <p class="who__plan">18개월</p>
          <p class="who__detail">기본 1년 신청 후, 도완 3개월 완료 증빙으로 6개월 유급 연장.</p>
        </div>
      </div>
      <p class="money__body" style="margin-top:12px">같은 자녀로 부모가 각각 3개월 이상 쓰면 휴직이 6개월 늘어나요. 부부 합산 최대 5,820만 원.</p>`;

    const plan = [
      { date: '2027. 4. 12', title: '토실이 출산 (예정)', body: '출생신고는 1개월 안에, 지원금 신청은 60일 안에' },
      { date: '2027. 4 ~ 6', title: '도완 1차 육아휴직 3개월', body: '첫 3개월 상한 250 · 250 · 300만 원' },
      { date: '2027. 4 ~ 2028. 9', title: '명주 육아휴직 18개월', body: '기본 1년 + 6개월 유급 연장' },
      { date: '2027. 12 ~ 2028. 2', title: '도완 2차 육아휴직 3개월', body: '생후 8개월에 시작 → 상한 350 · 400 · 450만 원' },
      { date: '2028. 2', title: '명주 6개월 연장 증빙 마무리', body: '도완 3개월 사용 확인서를 회사·고용센터에 제출' }
    ];
    $('#leavePlan').innerHTML = plan.map((p) => `
      <div class="plan__item">
        <span class="plan__dot" aria-hidden="true"></span>
        <p class="plan__date">${p.date}</p>
        <p class="plan__title">${p.title}</p>
        <p class="plan__body">${p.body}</p>
      </div>`).join('');

    $('#leaveCalc').innerHTML = `
      <div class="calc__row"><span>도완 · 6개월 (3+3개월)</span><b>1,950만</b></div>
      <div class="calc__row"><span>명주 · 첫 6개월</span><b>1,950만</b></div>
      <div class="calc__row"><span>명주 · 7~18개월 (월 160만 × 12)</span><b>1,920만</b></div>
      <div class="calc__sum"><span>부부 합산</span><b>5,820만 원</b></div>
      <p class="calc__note">통상임금 400만 원 기준. 통상임금이 450만 원 이상이면 1인 2,000만 · 합산 5,920만 원까지 올라가요. 7개월째부터는 통상임금 80% · 월 160만 원 상한.</p>`;

    $('#leaveCaution').innerHTML = `
      <p class="caution__title">신청 전에 확인할 것</p>
      <ul>
        <li>2027년 금액은 2026년 기준이에요. 매년 상한과 지원금이 바뀌니 신청 전 고용24·복지로에서 다시 확인하세요.</li>
        <li>6+6은 부모가 같은 자녀로 휴직을 시작할 때 자녀가 생후 18개월 이내여야 해요. 도완 2차(2027.12)는 생후 8개월이라 조건에 들어요.</li>
        <li>휴직을 나눠 쓸 때 첫 6개월 상한을 통산하는 방식은 지급액이 달라질 수 있어요. 고용센터에 미리 계산을 맡겨 두세요.</li>
        <li>명주 18개월의 6개월 연장은 부모가 각각 3개월 이상 사용이 조건이라, 도완 1차 완료 증빙이 꼭 필요해요.</li>
        <li>고용보험 피보험단위기간 180일 등 수급 요건과 회사 취업규칙도 함께 확인하세요.</li>
        <li>2027년 7월 이후 출생아부터 '아이맞이지원금·아동기본수당'으로 바뀌는 정부안이 논의 중이에요(2026-11 기준 법 개정 전). 우리 예정일 4/12는 그 전이라 현행 제도가 적용될 가능성이 높아요.</li>
      </ul>`;
  }

  /* ───────────────────────── 6. 출산 가방 ───────────────────────── */
  const BAG = [
    {
      id: 'bag-mom', title: '산모용', icon: '🤍', items: [
        { id: 'b-m1', text: '산모패드 (대형)', note: '' },
        { id: 'b-m2', text: '수유브라 · 수유패드' },
        { id: 'b-m3', text: '회음부 냉찜질 패드' },
        { id: 'b-m4', text: '넉넉한 파자마 2벌 · 양말' },
        { id: 'b-m5', text: '세면도구 · 스킨케어' },
        { id: 'b-m6', text: '수건 3장 · 슬리퍼' },
        { id: 'b-m7', text: '물병 · 빨대 (누워서 마시기)' },
        { id: 'b-m8', text: '속옷 여유분' }
      ]
    },
    {
      id: 'bag-baby', title: '아기용', icon: '🍼', items: [
        { id: 'b-b1', text: '배냇저고리 2~3장' },
        { id: 'b-b2', text: '내복(우주복) 2장' },
        { id: 'b-b3', text: '기저귀 신생아용 · 물티슈' },
        { id: 'b-b4', text: '속싸개 · 겉싸개' },
        { id: 'b-b5', text: '아기 수건 3장' },
        { id: 'b-b6', text: '손싸개 · 양말 · 모자' },
        { id: 'b-b7', text: '젖병 · 분유 (병원 지시 시)' }
      ]
    },
    {
      id: 'bag-dad', title: '아빠용', icon: '🧢', items: [
        { id: 'b-d1', text: '여벌 옷 1벌' },
        { id: 'b-d2', text: '충전기 · 보조배터리' },
        { id: 'b-d3', text: '간식 · 물' },
        { id: 'b-d4', text: '현금 · 카드' },
        { id: 'b-d5', text: '카시트 (퇴원길)' },
        { id: 'b-d6', text: '가족 연락처 메모' }
      ]
    },
    {
      id: 'bag-doc', title: '서류', icon: '📄', items: [
        { id: 'b-s1', text: '신분증 (부부 모두)' },
        { id: 'b-s2', text: '산모수첩' },
        { id: 'b-s3', text: '건강보험증 · 국민행복카드' },
        { id: 'b-s4', text: '출생신고서 (병원 작성분)' },
        { id: 'b-s5', text: '가족관계증명서 (필요 시)' },
        { id: 'b-s6', text: '보호자 연락처' }
      ]
    }
  ];

  function renderBag() {
    const allIds = BAG.flatMap((g) => g.items.map((i) => i.id));
    const done = checkedCount(allIds);
    const pct = Math.round((done / allIds.length) * 100);
    $('#bagTotal').innerHTML = `
      <p class="totalbar__num">${done} / ${allIds.length}</p>
      <div class="bar"><span style="width:${pct}%"></span></div>
      <p class="totalbar__text">${pct}% 챙겼어요</p>`;

    $('#bagGroups').innerHTML = BAG.map((g) => {
      const ids = g.items.map((i) => i.id);
      const d = checkedCount(ids);
      const p = Math.round((d / ids.length) * 100);
      return `
        <section class="stage">
          <div class="stage__head">
            <div>
              <h3 class="stage__title">${g.icon} ${g.title}</h3>
              <p class="stage__sub">${ids.length}개</p>
            </div>
            <span class="stage__count">${d}/${ids.length}</span>
          </div>
          <div class="bar"><span style="width:${p}%"></span></div>
          ${g.items.map((it) => `
            <label class="chk">
              <input type="checkbox" data-chk="${it.id}" ${checks[it.id] ? 'checked' : ''}>
              <span class="chk__box" aria-hidden="true">✓</span>
              <span class="chk__text">${esc(it.text)}${it.note ? `<span class="chk__note">${esc(it.note)}</span>` : ''}</span>
            </label>`).join('')}
        </section>`;
    }).join('');
  }

  /* ───────────────────────── 7. 이름 · 선물 ───────────────────────── */
  let names = store.get(KEY.names, []) || [];
  let gifts = store.get(KEY.gifts, []) || [];

  function renderNames() {
    $('#nameList').innerHTML = names.length
      ? names.map((n, i) => `
        <span class="namechip">${esc(n)}
          <button type="button" data-delname="${i}" aria-label="${esc(n)} 지우기">×</button>
        </span>`).join('')
      : `<div class="empty" style="width:100%">
          <p class="empty__icon" aria-hidden="true">✏️</p>
          <p class="empty__title">아직 후보가 없어요</p>
          <p class="empty__body">위에 한 글자씩 적어 보세요. 마음에 안 드는 건 ×로 지우면 돼요.</p>
        </div>`;

    const examples = [
      { from: '이모', what: '아기 수건 세트', ex: true },
      { from: '회사 동료', what: '기저귀 케이크', ex: true }
    ];
    const rows = gifts.length ? gifts : examples;
    $('#giftList').innerHTML = `
      <div class="stack">
        ${rows.map((g, i) => `
          <div class="card gift${g.ex ? ' example' : ''}">
            <span class="gift__avatar" aria-hidden="true">${esc((g.from || '?').slice(0, 1))}</span>
            <div class="gift__body">
              <p class="gift__name">${esc(g.from)}${g.ex ? '<span class="example__tag">예시</span>' : ''}</p>
              <p class="gift__what">${esc(g.what)}</p>
            </div>
            ${g.ex ? '' : `<button class="gift__del" type="button" data-delgift="${i}" aria-label="기록 지우기">×</button>`}
          </div>`).join('')}
      </div>
      ${gifts.length ? '' : '<p class="filter-summary" style="margin-top:10px">예시만 보여드렸어요. 기록을 추가하면 여기에 쌓여요.</p>'}`;
  }

  function bindNames() {
    $('#nameForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const input = $('#nameInput');
      const v = input.value.trim();
      if (!v) return;
      if (names.length >= 12) { toast('후보는 12개까지 담을 수 있어요'); return; }
      names.push(v);
      store.set(KEY.names, names);
      input.value = '';
      renderNames();
      toast('이름 후보에 담았어요');
    });

    $('#nameList').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-delname]');
      if (!btn) return;
      names.splice(Number(btn.dataset.delname), 1);
      store.set(KEY.names, names);
      renderNames();
    });

    $('#giftForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const from = $('#giftFrom').value.trim();
      const what = $('#giftWhat').value.trim();
      if (!from || !what) { toast('누가 · 무엇을 둘 다 적어 주세요'); return; }
      gifts.push({ from, what });
      store.set(KEY.gifts, gifts);
      $('#giftFrom').value = '';
      $('#giftWhat').value = '';
      renderNames();
      toast('선물 기록을 남겼어요');
    });

    $('#giftList').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-delgift]');
      if (!btn) return;
      gifts.splice(Number(btn.dataset.delgift), 1);
      store.set(KEY.gifts, gifts);
      renderNames();
    });
  }

  /* ───────────────────────── 잠금 ───────────────────────── */
  let buf = '';
  const lockEl = $('#lock');

  function paintDots() {
    $$('.dot').forEach((d, i) => d.classList.toggle('on', i < buf.length));
  }

  function unlock() {
    store.setRaw(KEY.lock, '1');
    document.documentElement.classList.add('unlocked');
    buf = '';
    paintDots();
    $('#lockMsg').textContent = '';
  }

  function tryUnlock() {
    if (buf === PASSWORD) {
      unlock();
      return;
    }
    lockEl.classList.add('is-error');
    $('#lockMsg').textContent = '비밀번호가 맞지 않아요. 다시 눌러 주세요.';
    if (navigator.vibrate) { try { navigator.vibrate(60); } catch (e) {} }
    setTimeout(() => {
      lockEl.classList.remove('is-error');
      buf = '';
      paintDots();
    }, 420);
  }

  function pressKey(k) {
    if (k === 'reset') { buf = ''; }
    else if (k === 'del') { buf = buf.slice(0, -1); }
    else if (/^\d$/.test(k) && buf.length < 4) { buf += k; }
    $('#lockMsg').textContent = '';
    paintDots();
    if (buf.length === 4) setTimeout(tryUnlock, 90);
  }

  function bindLock() {
    $('#keypad').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-key]');
      if (btn) pressKey(btn.dataset.key);
    });
    document.addEventListener('keydown', (e) => {
      if (document.documentElement.classList.contains('unlocked')) return;
      if (/^\d$/.test(e.key)) pressKey(e.key);
      else if (e.key === 'Backspace') pressKey('del');
      else if (e.key === 'Escape') pressKey('reset');
    });
    $('#lockBtn').addEventListener('click', () => {
      store.del(KEY.lock);
      document.documentElement.classList.remove('unlocked');
      buf = '';
      paintDots();
      $('#lockMsg').textContent = '';
      toast('다시 잠갔어요');
    });
  }

  /* ───────────────────────── 탭 ───────────────────────── */
  const TABS = ['photo', 'shop', 'task', 'hospital', 'money', 'bag', 'names'];

  function showTab(id, save = true, scroll = true) {
    if (!TABS.includes(id)) id = 'photo';
    $$('.panel').forEach((p) => {
      const on = p.id === 'panel-' + id;
      p.classList.toggle('is-active', on);
      p.hidden = !on;
    });
    $$('.tab').forEach((t) => {
      const on = t.dataset.tab === id;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    if (save) {
      try { history.replaceState(null, '', '#' + id); } catch (e) {}
    }
    if (scroll) {
      const tabsTop = $('.tabs').getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: Math.max(0, tabsTop - 1), behavior: 'smooth' });
    }
  }

  function bindTabs() {
    $('#tabs').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-tab]');
      if (btn) showTab(btn.dataset.tab);
    });
    window.addEventListener('hashchange', () => showTab(location.hash.replace('#', ''), false));
  }

  /* ───────────────────────── 이벤트 ───────────────────────── */
  function bindListEvents() {
    document.addEventListener('click', (e) => {
      const cat = e.target.closest('[data-cat]');
      if (cat) { shopState.cat = cat.dataset.cat; renderShop(); return; }

      const st = e.target.closest('[data-status]');
      if (st) { shopState.status = st.dataset.status; renderShop(); return; }

      const chk = e.target.closest('[data-check]');
      if (chk) {
        const id = chk.dataset.check;
        if (checks[id]) delete checks[id];
        else checks[id] = true;
        saveChecks();
        renderShop();
        return;
      }
    });

    document.addEventListener('change', (e) => {
      const box = e.target.closest('[data-chk]');
      if (!box) return;
      const id = box.dataset.chk;
      if (box.checked) checks[id] = true;
      else delete checks[id];
      saveChecks();
      if (id.startsWith('t-')) renderTasks();
      if (id.startsWith('b-')) renderBag();
    });
  }

  function bindToTop() {
    const btn = $('#toTop');
    window.addEventListener('scroll', () => {
      btn.classList.toggle('is-on', window.scrollY > 700);
    }, { passive: true });
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /* ───────────────────────── 시작 ───────────────────────── */
  function init() {
    renderHero();
    renderAlbum();
    renderShop();
    renderTasks();
    renderHospital();
    renderMoney();
    renderBag();
    renderNames();
    bindNames();
    bindLock();
    bindTabs();
    bindListEvents();
    bindToTop();

    showTab(location.hash.replace('#', '') || 'photo', false, false);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
