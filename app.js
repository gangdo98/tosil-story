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

  let checks = store.get(KEY.check, {}) || {};
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
  const PHOTOS = [
    {
      week: 7, day: 4, date: '2026. 8. 28', src: 'assets/ultra-20260828-07w4d.jpg',
      title: '아기집 확인', note: '7주 4일 · 첫 초음파'
    },
    {
      week: 12, day: 1, date: '2026. 9. 29', src: 'assets/ultra-20260929-12w1d-a.jpg',
      title: '몸이 만들어지던 때', note: '12주 1일 · 입체초음파'
    },
    {
      week: 12, day: 1, date: '2026. 9. 29', src: 'assets/ultra-20260929-12w1d-b.jpg',
      title: '다른 각도로 한 장 더', note: '12주 1일 · 같은 날 두 번째 컷'
    },
    {
      week: 14, day: 5, date: '2026. 10. 17', src: 'assets/ultra-20261017-14w5d.jpg',
      title: '다리·발이 보이던 날', note: '14주 5일 · 초음파'
    },
    {
      week: 20, day: 1, date: '2026. 11. 24', src: 'assets/ultra-20261124-20w1d.jpg',
      title: '얼굴이 나왔어요', note: '20주 1일 · 옆얼굴 입체초음파'
    }
  ];

  const MILESTONES = [
    { week: 7, label: '첫 만남' },
    { week: 12, label: '1차 검사' },
    { week: 14, label: '중간 초음파' },
    { week: 16, label: '' },
    { week: 20, label: '정밀초음파' },
    { week: 24, label: '' },
    { week: 28, label: '' },
    { week: 32, label: '성장초음파' },
    { week: 36, label: '막달 검사' },
    { week: 40, label: '만나요' }
  ];

  const NOTES = [
    { date: '2026. 8. 28', text: '7주 4일, 첫 초음파. 아기집이 보였어요.' },
    { date: '2026. 9. 29', text: '12주 1일. 코와 입, 팔·다리 윤곽이 잡혔어요.' },
    { date: '2026. 10. 17', text: '14주 5일. 중간에 한 번 더 보고 사진으로 남겼어요.' },
    { date: '2026. 11. 24', text: '20주 1일. 옆얼굴이 나왔어요. 볼이 통통해졌어요.' },
    { date: '2026. 11. 25', text: '루안느 산후조리원 B프레스티지 9박 10일 계약 확인.' }
  ];

  function renderAlbum() {
    const host = $('#album');
    const now = CURRENT.week;

    host.innerHTML = MILESTONES.map((m) => {
      const shots = PHOTOS.filter((p) => p.week === m.week);
      const isNow = m.week === now;

      if (shots.length) {
        return `
        <div class="album__row">
          <p class="album__week">${m.week}주<small>${m.label || ''}</small></p>
          <div class="shots">${shots.map((s) => `
            <figure class="shot${isNow ? ' is-now' : ''}">
              <a href="${s.src}" target="_blank" rel="noopener">
                <img src="${s.src}" alt="${esc(s.title)} (${esc(s.date)})" loading="lazy">
              </a>
              <figcaption>
                <b>${esc(s.title)}</b>
                <span>${esc(s.date)} · ${esc(s.note)}</span>
              </figcaption>
            </figure>`).join('')}</div>
        </div>`;
      }

      return `
      <div class="album__row">
        <p class="album__week">${m.week}주<small>${m.label || ''}</small></p>
        <div class="frame${isNow ? ' is-now' : ''}">
          ${isNow ? '<span class="frame__tag">이번 주</span>' : ''}
          <div>
            <p class="frame__icon" aria-hidden="true">${isNow ? '📷' : '🖼️'}</p>
            <p class="frame__text">${isNow ? '이번 주 초음파를 기다리고 있어요' : '사진을 보내면 여기에 담겨요'}</p>
          </div>
        </div>
      </div>`;
    }).join('');

    $('#photoCount').textContent = PHOTOS.length + '장';

    $('#growthNotes').innerHTML = `
      <div class="stack">
        ${NOTES.map((n) => `
          <div class="card note-row">
            <p class="note-row__date">${esc(n.date)}</p>
            <p class="note-row__text">${esc(n.text)}</p>
          </div>`).join('')}
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
    { id: 'etc', label: '기타' },
    { id: 'jpbuy', label: '찌구매but일본구매', hot: true },
    { id: 'jiehye', label: '지혜구매', hot: true, friend: true }
  ];
  const CAT_LABEL = Object.fromEntries(CATS.map((c) => [c.id, c.label]));

  const STATUS = {
    reserved: { label: '예약·진행중', cls: 'badge--peach' },
    consider: { label: '구매고려', cls: 'badge--grey' },
    danggeun: { label: '당근', cls: 'badge--sun' },
    gift: { label: '선물', cls: 'badge--rose' },
    company: { label: '회사 복지', cls: 'badge--rose' },
    ref: { label: '지인 참고', cls: 'badge--grey' },
    done: { label: '완료', cls: 'badge--done' }
  };
  const STATUS_FILTERS = [
    { id: 'all', label: '전체' },
    { id: 'reserved', label: '예약·진행중' },
    { id: 'consider', label: '구매고려' },
    { id: 'company', label: '회사 복지' },
    { id: 'danggeun', label: '당근' },
    { id: 'gift', label: '선물' },
    { id: 'done', label: '완료' }
  ];

  const SHOP_GROUPS = [
    { id: 'jpbuy', title: '찌구매but일본구매', sub: '후쿠오카 2027. 1. 7~10 · 1/8 아카짱혼포·블라썸39' },
    { id: 'birth', title: '출산 직후 바로 쓸 3종', sub: '2027. 3. 20경 구매 · 캘린더에 등록' },
    { id: 'essentials', title: '신생아 준비물', sub: '체크하면 완료로 바뀌어요' },
    { id: 'company', title: '회사 출산축하선물 · 5종 중 1택', sub: 'CV 복지 · 출산 후 신청' },
    { id: 'friend', title: '지혜구매 · 지인(홈런이) 리스트', sub: '2026. 11. 2 기준 · 지혜구매 분류에서만 보여요' }
  ];

  /* ── 일본(후쿠오카)에서 사 올 것 — 우리 부부 구매분만 ── */
  const JPBUY = [
    {
      id: 'k-tripp', cat: 'sleep', group: 'jpbuy', status: 'reserved',
      name: '스토케 트립트랩 5-in-1 뉴본 세트', price: '세전 ¥68,900',
      tags: ['이와타야 블라썸39', '2027. 1. 8 방문'],
      notes: [
        '체어 34,300 + 트레이 8,400 + 뉴본세트 19,400 + 하네스 6,800 (베이비세트 무료)',
        '체어 1순위 내츄럴 · 뉴본 바닐라화이트 · 트레이 바닐라화이트 · 하네스 베이지',
        '2026-11-24 예약 폼 접수 완료 · 1/7 저녁 픽업 가능 여부까지 요청'
      ],
      next: '<b>12월 8일경</b> 매장 확인 메일이 와요 → 가격·조건 동의 회신 → 최종 확정까지 7~9일. 자동 접수 메일은 확정이 아니에요.'
    },
    {
      id: 'k-bugaboo', cat: 'travel', group: 'jpbuy', status: 'reserved',
      name: '부가부 드래곤플라이 플러스 유모차', price: '세전 ¥126,000',
      tags: ['본체 9.9kg', '5% 쿠폰 시 ¥119,700'],
      notes: [
        '베이스 111,200 + 캐노피 14,800 = 세전 126,000엔',
        '1순위 더스티핑크 + 블랙 / 2순위 데저트토프 + 블랙 + 브라운그립으로 요청',
        '접은 크기 36×52×90cm → 기내 반입 불가, 전용 위탁(박스 포함 13~15kg)'
      ],
      next: '트립트랩과 같은 블라썸39 건으로 함께 확정돼요. 1/7 저녁 픽업이 안 되면 1/8 낮 12시 이전 방문.'
    },
    {
      id: 'k-cybex', cat: 'travel', group: 'jpbuy', status: 'consider',
      name: '싸이벡스 카시트 (+ 베이스)', price: '¥44,000 ~ ¥82,500(세후)',
      tags: ['라라포트 3층', '아카짱혼포 · DADWAY 비교'],
      notes: [
        '시로나 S ¥53,900 + 베이스S ¥35,200 / 시로나 Si 세트 세후 ¥82,500 (12.7kg)',
        '클라우드T i-Size ¥44,000 + 베이스 별도 — 신생아 인레이 포함 여부 확인',
        '지인은 국내에서 시크 카시트(바구니카시트 포함) 89만 원에 샀어요 — 국내 구매도 비교해 볼 것',
        '백화점은 외국인에게 카시트 판매 불가 · 같은 층 DADWAY도 싸이벡스 취급'
      ],
      next: '<b>시로나 S + 베이스S</b> 조합과 클라우드T+베이스를 매장에서 무게·장착으로 비교. 국내 시크 89만 원과도 견줘 보세요.'
    },
    {
      id: 'k-artipoppe', cat: 'travel', group: 'jpbuy', status: 'reserved',
      name: '아티포페 아기띠 (호텔 배송)', price: '약 ¥51,300 ~ 52,200',
      tags: ['일 팔라조 수령', '추천 €50 할인'],
      notes: [
        '일 팔라조 프런트 수령 승낙 완료 (2026-11-25 · 예약번호 1801960216)',
        '출국 5~7일 전 공홈에서 국가를 일본(JPY)으로 바꿔 결제 — 국내보다 7~10만 원 절약',
        '배송 라벨에 DOWAN KANG + Jan 7, 2027 + 호텔 주소(3-13-1 Haruyoshi, Chuo-ku)'
      ],
      next: '12월 말~1월 1일경 주문. 네덜란드에서 3~5일(최대 7일) 걸려요. 체크인 때 프런트에서 받고 박스는 버려도 돼요.'
    },
    {
      id: 'j-nose', cat: 'bath', group: 'jpbuy', status: 'consider',
      name: '피죤 슈폿 전동 콧물흡입기', price: '¥14,300',
      tags: ['한정 베이지'],
      notes: ['콧물이 굳기 전에 빼 주는 게 좋아요']
    },
    {
      id: 'j-fever', cat: 'bath', group: 'jpbuy', status: 'consider',
      name: '네츠사마 해열시트', price: '¥547',
      tags: ['아카짱혼포'],
      notes: ['한 봉만 사 두면 새벽에 급할 때 써요']
    },
    {
      id: 'j-bib', cat: 'cloth', group: 'jpbuy', status: 'consider',
      name: '베이비뵨 턱받이 2매', price: '¥2,970',
      tags: ['아카짱혼포'],
      notes: ['이유식 시작 전이지만 세트로 사면 싸요']
    },
    {
      id: 'j-seatmat', cat: 'travel', group: 'jpbuy', status: 'consider',
      name: '카시트 보호매트', price: '¥2,612',
      tags: ['아카짱혼포'],
      notes: ['카시트 아래 깔면 시트가 덜 젖어요']
    },
    {
      id: 'j-spoon', cat: 'etc', group: 'jpbuy', status: 'consider',
      name: '릿첼 온도감지 스푼', price: '¥2,310',
      tags: ['이유식 시작할 때'],
      notes: []
    },
    {
      id: 'j-mesh', cat: 'etc', group: 'jpbuy', status: 'consider',
      name: '앙젤레트 과즙망', price: '¥1,210',
      tags: ['이유식 시작할 때'],
      notes: []
    },
    {
      id: 'j-bath', cat: 'bath', group: 'jpbuy', status: 'consider',
      name: '스키나베브 입욕제', price: '¥500대',
      tags: ['아카짱혼포'],
      notes: ['태열·건조할 때 목욕물에']
    },
    {
      id: 'j-diaper', cat: 'bath', group: 'jpbuy', status: 'consider',
      name: '기저귀 소량 (무니 · 메리즈)', price: '한 팩만',
      tags: ['아카짱혼포', '부피 커요'],
      notes: ['지인은 “발진 없는 브랜드를 찾을 때까지 샘플로 소량씩”이라고 했어요', '일본 기저귀는 부피가 커서 한 팩만, 나머지는 국내에서']
    }
  ];

  /* ── 출산 직후 바로 쓸 3종 ── */
  const BIRTH3 = [
    {
      id: 'b3-bottle', cat: 'feed', group: 'birth', status: 'consider',
      name: '헤겐 PPSU 애착 젖병 트윈 세트 4P', price: '출산 10일 전 구매',
      tags: ['150ml 2P 화이트 / 240ml 2P 오번', '2027. 3. 20경'],
      notes: [
        '지인이 실제로 쓴 조합 — “아기마다 잘 맞는 젖병이 달라 미리 많이 사지 말라”는 후기',
        '150ml 2P는 신생아, 240ml 2P는 수유량이 늘 때'
      ]
    },
    {
      id: 'b3-stocking', cat: 'mom', group: 'birth', status: 'consider',
      name: '솔리디아 이태리 1등급 의료기기 압박스타킹', price: '94,250원',
      tags: ['발등 덮고 무릎 위', 'ROSA / S', '2027. 3. 20경'],
      notes: [
        '제왕절개 후 바로 필요해요. 지인 추천 “무조건 발등 덮고 무릎 올라가는 걸로”',
        '출산 직후 붓기·혈전 예방용이라 미리 사 두고 가방에 넣어 두세요'
      ]
    },
    {
      id: 'b3-belt', cat: 'mom', group: 'birth', status: 'consider',
      name: 'Mom+ 제왕절개 복대 (이중 고정)', price: '출산 10일 전 구매',
      tags: ['Formams by moms', '2027. 3. 20경'],
      notes: [
        '지인 후기 — “넓은 타입은 아니지만 이중으로 잡아주는 구조라 고정이 힘있게 잘 잡혀요”',
        '병원에서 복대를 주는지 먼저 확인하고, 없으면 이걸로'
      ]
    }
  ];

  /* ── 회사 출산축하선물 ── */
  const COMPANY = [
    {
      id: 'c-thermo', cat: 'bath', group: 'company', status: 'company',
      name: '① 브라운 체온계 (IRT-6030)',
      tags: ['5종 중 1택'],
      notes: ['지인은 체온계를 96,900원에 따로 샀어요 — 이걸 받으면 안 사도 돼요', '귀 체온계 · 신생아부터']
    },
    {
      id: 'c-pot', cat: 'feed', group: 'company', status: 'company',
      name: '② 코넘 휴대용 분유포트 500ml',
      tags: ['5종 중 1택'],
      notes: ['지인은 분유포트를 83,600원에 따로 샀어요', '500ml는 소용량 — 새벽 수유 때 들고 따르기엔 대용량이 편하다는 의견도']
    },
    {
      id: 'c-cushion', cat: 'feed', group: 'company', status: 'company',
      name: '③ 제이앤제나 역류방지쿠션 23도 (오리지널 백수 화이트 + 뒷면순면)',
      tags: ['5종 중 1택'],
      notes: ['수유쿠션·역방쿠를 따로 안 사도 돼요', '각도가 높은 제품은 피하고 23도 정도가 안전해요']
    },
    {
      id: 'c-bin', cat: 'bath', group: 'company', status: 'company',
      name: '④ 매직캔 크롬히포 오토실링 휴지통 21L + 리필봉투 5매 (화이트)',
      tags: ['5종 중 1택'],
      notes: ['지인은 기저귀 쓰레기통을 34,800원에 샀어요', '기저귀·물티슈 같이 버리기 좋아요']
    },
    {
      id: 'c-chair', cat: 'sleep', group: 'company', status: 'company',
      name: '⑤ 본베베 범보의자 (크림바닐라)',
      tags: ['5종 중 1택'],
      notes: ['이유식 시작할 때(생후 5~6개월) 쓰는 낮은 의자', '지인은 하이체어(트램트립)를 846,100원에 따로 샀어요']
    }
  ];

  /* ── 신생아 준비물 ── */
  const ESSENTIALS = [
    /* 수유 */
    { id: 'e-steril', name: '젖병 소독기 (열탕 또는 전자레인지)', cat: 'feed', note: '지인은 브레짜 열탕 소독기 109,000원 + UV 픽셀 사은품' },
    { id: 'e-formula', name: '분유 1통', cat: 'feed', note: '조리원에서 쓰는 브랜드로 소량만' },
    { id: 'e-pump', name: '유축기 (전동)', cat: 'feed', note: '필요해지면 사거나 대여해도 늦지 않아요' },
    { id: 'e-bra', name: '수유브라 2~3개 · 수유패드', cat: 'feed' },
    /* 수면·가구 */
    { id: 'e-bed', name: '아기 침대 (또는 범퍼침대)', cat: 'sleep', note: '조리원에서 돌아오는 4월 중순까지 세팅' },
    { id: 'e-swaddle', name: '속싸개 3~4장', cat: 'sleep', note: '지인은 스와들업·스와들수트로 대체했어요' },
    { id: 'e-sleepbag', name: '슬리핑백 (봄·여름 대비)', cat: 'sleep' },
    { id: 'e-blanket', name: '아기 이불 · 요 세트', cat: 'sleep' },
    { id: 'e-mat', name: '놀이 매트', cat: 'sleep', note: '뒤집기 시작하면 필요해져요' },
    { id: 'e-rug', name: '원형 러그', cat: 'sleep', note: '낮잠·터미타임 자리를 따로 만들어요' },
    /* 목욕·위생 */
    { id: 'e-tubclean', name: '아기 욕조 세정제 · 토이클리너', cat: 'bath' },
    { id: 'e-detergent', name: '아기 세제 · 섬유유연제', cat: 'bath', note: '액체류는 위탁수하물로' },
    { id: 'e-diaper', name: '기저귀 신생아 1팩 · 물티슈', cat: 'bath', note: '선물로 들어오는 경우가 많아 소량만' },
    { id: 'e-towel', name: '아기 수건 (밤부베베)', cat: 'bath', note: '지인은 거즈 20장 + 엠보 6장' },
    { id: 'e-lotion', name: '로션 · 수딩젤 · 발진크림', cat: 'bath', note: '샘플로 먼저 써 보고 맞는 걸로' },
    /* 의류 */
    { id: 'e-bae', name: '배냇저고리 5장 이상', cat: 'cloth' },
    { id: 'e-naebok', name: '내복(우주복) 5장', cat: 'cloth' },
    { id: 'e-socks', name: '양말 · 손싸개', cat: 'cloth' },
    { id: 'e-hat', name: '모자 · 겉싸개', cat: 'cloth', note: '지인은 속싸개·겉싸개를 천기저귀로 대체' },
    { id: 'e-out', name: '외출복 2벌 (봄)', cat: 'cloth' },
    /* 외출·이동 */
    { id: 'e-bagd', name: '기저귀가방', cat: 'travel' },
    { id: 'e-liner', name: '유모차 시트 라이너 (선택)', cat: 'travel' },
    { id: 'e-sanitizer', name: '손소독제 · 물티슈 캡', cat: 'travel' },
    /* 산모 */
    { id: 'm-pad', name: '산모패드 (대형)', cat: 'mom', note: '지인은 디펜드 안심깔개매트 + 입는 오버나이트' },
    { id: 'm-cool', name: '회음부 냉찜질 패드', cat: 'mom' },
    { id: 'm-bra', name: '수유브라 여유분', cat: 'mom' },
    { id: 'm-pajama', name: '넉넉한 파자마 2벌', cat: 'mom', note: '지인은 수유잠옷 2벌 65,600원' },
    { id: 'm-care', name: '산모 스킨케어 · 세면도구', cat: 'mom' },
    { id: 'm-socks', name: '무압박 양말', cat: 'mom', note: '지인은 6개 6,640원' },
    { id: 'm-cream', name: '유두보호크림 · 양배추팩', cat: 'mom', note: '지인은 란시노 17,900원 + 튼튼맘스 17,500원' },
    /* 기타 */
    { id: 'e-towel2', name: '목욕 타월 2장', cat: 'etc' },
    { id: 'e-humid', name: '가열식 가습기', cat: 'etc', note: '보일러 쓸 때 공기까지 따뜻해져요' },
    { id: 'e-thermohygro', name: '온습도계', cat: 'etc', note: '싼 것보다 정확한 걸로 (지인은 달랑하니 2개)' },
    { id: 'e-noise', name: '백색소음기 (수유등 겸용)', cat: 'etc' },
    { id: 'e-tooth', name: 'HAMICO 칫솔', cat: 'etc' },
    { id: 'e-guard', name: '콘센트 안전커버 · 모서리 보호대', cat: 'etc', note: '기어다니기 전에 미리' }
  ].map((x) => ({ ...x, group: 'essentials', status: 'consider', tags: [] }));

  /* ── 지인 리스트 ── */
  /* 지인 리스트는 지혜구매 분류 전용 — 다른 분류에는 절대 섞이지 않아요 */
  const FRIEND = (window.FRIEND_ITEMS || [])
    .map((x, i) => ({
      id: 'f' + i,
      group: 'friend',
      cat: x.c || 'etc',
      status: 'ref',
      name: x.n,
      sec: x.sec,
      price: x.p ? x.p.toLocaleString('ko-KR') + '원' : '',
      tags: [x.b, x.q, x.s].filter(Boolean),
      note: x.m || ''
    }));

  /* 우리(강도완·김명주) 구매 리스트 — 지인 리스트와 완전히 분리 */
  const OUR_ITEMS = [...JPBUY, ...BIRTH3, ...ESSENTIALS, ...COMPANY];
  const shopState = { cat: 'all', status: 'all' };

  const effStatus = (it) => (checks[it.id] ? 'done' : it.status);

  function shopCard(it) {
    const st = STATUS[effStatus(it)] || STATUS.consider;
    const done = !!checks[it.id];
    const compact = it.group === 'friend';
    return `
      <article class="item${done ? ' is-checked' : ''}${compact ? ' item--compact' : ''}" data-item="${it.id}">
        <div class="item__head">
          <div>
            <h4 class="item__title">${esc(it.name)}</h4>
            <div class="item__meta">
              <span class="badge ${st.cls}">${st.label}</span>
              ${compact ? '' : `<span class="tag">${CAT_LABEL[it.cat] || '기타'}</span>`}
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
    /* 지혜구매 = 지인 리스트 전용 분류. 다른 분류에는 지인 항목이 섞이지 않아요. */
    const friendView = shopState.cat === 'jiehye';
    if (friendView) shopState.status = 'all';

    catHost.innerHTML = [{ id: 'all', label: '전체' }, ...CATS]
      .map((c) => `<button class="fchip${shopState.cat === c.id ? ' is-on' : ''}${c.hot ? ' fchip--hot' : ''}" type="button" data-cat="${c.id}">${c.label}</button>`)
      .join('');
    stHost.style.display = friendView ? 'none' : '';
    stHost.innerHTML = STATUS_FILTERS
      .map((s) => `<button class="fchip${shopState.status === s.id ? ' is-on' : ''}" type="button" data-status="${s.id}">${s.label}</button>`)
      .join('');

    const pool = friendView ? FRIEND : (shopState.cat === 'jpbuy' ? JPBUY : OUR_ITEMS);
    const filtered = pool.filter((it) =>
      (shopState.cat === 'all' || shopState.cat === 'jiehye' || shopState.cat === 'jpbuy' || it.cat === shopState.cat) &&
      (shopState.status === 'all' || effStatus(it) === shopState.status));

    const ready = OUR_ITEMS.filter((it) => checks[it.id]).length;
    $('#shopSummary').textContent = friendView
      ? `지혜구매 · 지인 리스트 ${FRIEND.length}개 · 우리 구매 ${OUR_ITEMS.length}개와는 따로 보여요 · 지금 보이는 ${filtered.length}개`
      : `우리 구매 ${OUR_ITEMS.length}개 · 준비 완료 ${ready}개 · 지금 보이는 ${filtered.length}개`;

    if (!filtered.length) {
      $('#shopList').innerHTML = `
        <div class="empty">
          <p class="empty__icon" aria-hidden="true">🧺</p>
          <p class="empty__title">여기엔 아직 없어요</p>
          <p class="empty__body">이 분류에 담긴 물건이 없어요. 다른 분류를 눌러 보세요.</p>
        </div>`;
      return;
    }

    $('#shopList').innerHTML = SHOP_GROUPS.map((g) => {
      const list = filtered.filter((it) => it.group === g.id);
      if (!list.length) return '';

      let inner = '';
      if (g.id === 'friend') {
        let sec = null;
        let buf = [];
        const flush = () => {
          if (!buf.length) return;
          inner += `<p class="subhead">${esc(sec || '기타')}</p><div class="stack stack--compact">${buf.join('')}</div>`;
          buf = [];
        };
        list.forEach((it) => {
          if (it.sec !== sec) { flush(); sec = it.sec; }
          buf.push(shopCard(it));
        });
        flush();
      } else {
        inner = `<div class="stack">${list.map(shopCard).join('')}</div>`;
      }

      return `
        <div class="grouphead"><h3>${g.title}${g.id === 'jpbuy' ? '<span class="grouphead__hot">일본</span>' : ''}</h3><span>${list.length}개 · ${g.sub}</span></div>
        ${inner}`;
    }).join('');
  }

  /* ───────────────────────── 3. 할 일 ───────────────────────── */
  const TASK_STAGES = [
    {
      id: 'mid', title: '임신 중기', sub: '20~27주 · 2026.11 ~ 2027.01', items: [
        { id: 't-card', text: '국민행복카드 미리 발급', note: '조리원 입소 전에 카드가 있어야 첫만남이용권을 바로 써요' },
        { id: 't-ultra20', text: '20주 정밀초음파 예약 (일신기독병원)', note: '11월 말~12월 초 · 장기·얼굴·태반 위치까지' },
        { id: 't-sugar', text: '임당검사 예약 (24~28주)', note: '12월 중순~1월 초, 금식 안내 확인' },
        { id: 't-care', text: '조리원 잔금 결제 순서 정리', note: '루안느 B프레스티지 9박10일 · 잔금 3,465,000원(할인 시 3,365,000원)' },
        { id: 't-helper', text: '산후도우미 신청 가능 여부 확인', note: '중위소득 150% 이하 전국 공통 · 인기 관리사는 일찍 마감' },
        { id: 't-fetus', text: '태아보험 22주 마감선 확인', note: '이미 20주 — 저체중아·선천성 특약은 22주 전에 결정' },
        { id: 't-post', text: '우체국 태아보험·자동차보험 태아 특약 확인', note: '임신확인서 제출 · 보험사마다 할인율이 달라요' },
        { id: 't-ob', text: '임신부 외래진료비 20% 감면 적용', note: '진료받을 때 “임산부입니다” 말하면 본인부담 20% 감면' },
        { id: 't-tdap', text: '백일해(Tdap) 접종', note: '임신 27~36주 권장 — 12월 중 예약' },
        { id: 't-flu', text: '독감 예방접종 여부 확인', note: '임신 중 접종 권장' },
        { id: 't-park', text: '임산부 배지 · 주차증 신청 (동구보건소)', note: '정부24 맘편한임신으로 한 번에' },
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
        { id: 't-care2', text: '조리원 입실일 · 퇴소일 확정', note: '출산 일정이 정해지면 루안느(051-815-1004)로 연락' },
        { id: 't-ktx', text: '맘편한 KTX·SRT 임산부 할인 등록', note: 'KTX 일반실 40% · 특실 요금 면제 (출산예정일 +1년까지)' },
        { id: 't-leave1', text: '명주님 육아휴직 신청서 제출', note: '기본 1년 먼저 신청' },
        { id: 't-insur', text: '아기 건강보험·태아보험 정리', note: '출생신고 때 건강보험 피부양자 등록' }
      ]
    },
    {
      id: 'final', title: '막달', sub: '37~40주 · 2027.03 ~ 2027.04', items: [
        { id: 't-buy3', text: '출산 직후 필수 3종 구매 (3월 20일경)', note: '헤겐 젖병 트윈세트 · 솔리디아 압박스타킹 · Mom+ 복대 → 3/20 캘린더' },
        { id: 't-nst', text: '35~37주 막달검사 · 태동검사', note: '분만 준비 상태 확인' },
        { id: 't-bag', text: '출산 가방 차에 실어 두기', note: '가방 탭 체크리스트로 최종 확인' },
        { id: 't-settle', text: '조리원 잔금 결제 (순서대로)', note: '부산형 산후조리비 → 개인카드 200만 원 → 남은 금액 첫만남이용권' },
        { id: 't-route', text: '병원 가는 길 · 새벽 교통 확인', note: '일신기독병원까지 택시 호출 앱·주차 위치까지' },
        { id: 't-name', text: '이름 최종 결정', note: '출생신고 전에 둘이서 하나로' },
        { id: 't-docs', text: '출생신고 서류 준비', note: '신분증·가족관계증명서·출생신고서' },
        { id: 't-contact', text: '가족·지인 연락 순서 정하기', note: '양가 부모님께 알릴 순서' }
      ]
    },
    {
      id: 'after', title: '출산 직후', sub: '2027.04 ~', items: [
        { id: 't-birth', text: '출생신고 + 행복출산 원스톱 신청', note: '출생 1개월 안 · 주민센터 방문이 제일 빨라요' },
        { id: 't-voucher', text: '첫만남이용권 신청', note: '원스톱으로 한 번에 · 출생일부터 2년 안에 사용' },
        { id: 't-parent', text: '부모급여 · 아동수당 신청', note: '출생일 포함 60일 안에 → 출생월부터 소급' },
        { id: 't-elec', text: '전기요금 할인 신청', note: '행복출산 원스톱 때 같이 · 아파트는 관리사무소에도 통보' },
        { id: 't-gift', text: '회사 출산축하선물 신청 (4/12)', note: '출산증명서 → ksh0328@cvpartners.co.kr · 김상훈 010-2789-9576' },
        { id: 't-alarm', text: '출산 후 2·5·7·10일 알림 챙기기', note: '태어났다고 알리면 2·5·7·10일 뒤 알림을 추가' },
        { id: 't-busan', text: '부산형 산후조리비 신청', note: '출생 6개월 안에 쓰고, 1년 안에 보건소·정부24' },
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

  const CARE_DOCS = [
    { src: 'assets/luanne-contract.jpg?v=20261125m', title: '예약확인서 원본', sub: '2026. 8. 28 · 루안느 산후조리원' },
    { src: 'assets/luanne-payment.jpg?v=20261125m', title: '예약금 결제완료', sub: '385,000원 · 김코디 · 신용카드' },
    { src: 'assets/medi-spa-free.jpg', title: '메디스파 무료 혜택', sub: '룸 타입별 1회 무료 서비스' },
    { src: 'assets/medi-spa-price.jpg', title: '메디스파 요금표', sub: '1회 / 10회 가격' }
  ];

  function renderHospital() {
    $('#careGallery').innerHTML = CARE_DOCS.map((d) => `
      <a class="gal__item" href="${d.src}" target="_blank" rel="noopener">
        <img src="${d.src}" alt="${esc(d.title)}" loading="lazy">
        <span class="gal__cap"><b>${esc(d.title)}</b>${esc(d.sub)}</span>
      </a>`).join('');

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
      tags: ['소득기준 없음']
    },
    {
      title: '부모급여', amount: '월 100만 → 50만 원', sub: '만 2세 미만 · 24개월 1,800만 원',
      body: '0~11개월은 월 100만 원, 12~23개월은 월 50만 원. 매월 25일에 들어와요.',
      list: ['어린이집을 다니면 보육료를 먼저 쓰고 차액만 현금으로 (2026년 기준 0세 41만 6천 원)', '출생일 포함 60일 안에 신청하면 출생한 달부터 소급'],
      tags: ['소득기준 없음', '아동수당과 함께 받아요']
    },
    {
      title: '아동수당', amount: '월 10만 5천 원', sub: '부산은 비수도권 +5천 원',
      body: '2026년 기준 9세 미만 아동에게 매월 25일 지급해요. 아동수당과 부모급여는 따로 들어와요.',
      list: ['지급 연령이 2030년까지 13세 미만으로 한 살씩 올라가요', '인구감소지역은 더 높지만 부산 동구는 해당 없음'],
      tags: ['소득기준 없음', '9세까지 받으면 1,080만 원']
    },
    {
      title: '전기요금 할인', amount: '전기료 30%', sub: '생후 36개월 미만 가구 · 월 최대 1만 6천 원',
      body: '주민센터에서 행복출산 원스톱 신청할 때 “전기요금 할인도 같이” 말하면 한 번에 돼요.',
      list: ['3년 합산 57만 6천 원', '아파트는 관리사무소에도 따로 알려야 적용돼요', '누락되면 한전ON 또는 ☎123'],
      tags: ['소득기준 없음']
    },
    {
      title: '부산형 산후조리경비', amount: '최대 100만 원', sub: '산후조리원 몫은 50만 원까지',
      body: '산후조리원·산모신생아 건강관리 본인부담·퇴원 후 진료비를 영수증으로 정산해요. 지원금은 산모 계좌로 들어와요.',
      list: ['산후조리원 최대 50만 / 건강관리 본인부담 90% / 병·의원 진료비(한방 포함) — 합산 100만', '출생 후 6개월 안에 쓰고, 출생일 다음 날부터 1년 안에 신청 (정부24·보건소)', '바우처 카드로 결제한 금액은 제외돼요'],
      tags: ['동구보건소 051-440-6564', '쌍둥이 200만 원']
    },
    {
      title: '임신·출산 진료비', amount: '100만 원', sub: '국민행복카드 이용권',
      body: '임신 1회당 단태아 100만 원(다태아 140만 원). 병·의원과 약국 본인부담 결제에 써요.',
      list: ['분만예정일부터 2년까지 사용', '산부인과에서 신청서를 받아 카드사·공단·정부24에서 신청', '이미 신청했는지 한 번 확인해 보세요'],
      tags: ['소득기준 없음']
    },
    {
      title: '가정양육수당', amount: '월 10만 원', sub: '24~86개월 · 어린이집 안 다닐 때',
      body: '어린이집·유치원을 이용하지 않는 아동에게 지급해요. 부모급여가 끝난 뒤 구간이에요.',
      list: ['24~86개월 월 10만 원', '보육료·유아학비와 중복은 안 돼요'],
      tags: ['소득기준 없음']
    },
    {
      title: '부산형 365 시간제어린이집 · 가족사랑카드', amount: '시간당 1,000원', sub: '부산에서만 받는 것',
      body: '평일 저녁 6시~자정, 주말·공휴일 9시~18시 시간당 1,000원(원래 4,000원). 2026년 4월 기준 13곳.',
      list: ['가족사랑카드: 2자녀 이상 공영주차·시설 할인, 3자녀 이상 도시철도 50%'],
      tags: ['부산시', '첫째는 가족사랑카드 대상 아님']
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
      body: '동구에 주민등록을 두고 실제 거주하는 둘째 이후 가정에 지급해요. 첫째는 구 자체 지원이 0원이에요.',
      list: ['셋째부터는 20만 원씩 10회로 나눠 들어와요', '출생일부터 3개월 안에 동 행정복지센터'],
      tags: ['첫째 해당 없음']
    }
  ];

  const COMPANY_GIFTS = [
    '① 브라운 체온계 (IRT-6030)',
    '② 코넘 휴대용 분유포트 500ml',
    '③ 제이앤제나 역류방지쿠션 23도 (오리지널 백수 화이트 + 뒷면순면)',
    '④ 매직캔 크롬히포 오토실링 휴지통 21L + 리필봉투 5매 (화이트)',
    '⑤ 본베베 범보의자 (크림바닐라)'
  ];

  function renderMoney() {
    $('#moneyTotal').innerHTML = `
      <p class="total__k">출생부터 24개월까지</p>
      <p class="total__v">약 2,252만 원</p>
      <p class="total__l">첫만남이용권 200만 + 부모급여 1,800만 + 아동수당 252만(월 10만 5천 × 24개월)</p>
      <div class="total__chips">
        <span>+ 부산형 산후조리경비 최대 100만</span>
        <span>+ 진료비 바우처 100만</span>
        <span>+ 전기요금 할인 57만</span>
        <span>+ 회사 출산축하선물</span>
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

    $('#companyGifts').innerHTML = COMPANY_GIFTS.map((g) => `<li>${esc(g)}</li>`).join('');

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
        <li>부산형 산후조리경비는 조리원 몫이 50만 원까지예요. 100만 원 전부를 조리원비로 돌려받는 건 아니에요.</li>
        <li>바우처 카드로 결제한 조리원비는 산후조리경비 지원도, 의료비 세액공제도 안 돼요. 결제 순서를 꼭 지키세요.</li>
        <li>6+6은 부모가 같은 자녀로 휴직을 시작할 때 자녀가 생후 18개월 이내여야 해요. 도완 2차(2027.12)는 생후 8개월이라 조건에 들어요.</li>
        <li>휴직을 나눠 쓸 때 첫 6개월 상한을 통산하는 방식은 지급액이 달라질 수 있어요. 고용센터에 미리 계산을 맡겨 두세요.</li>
        <li>2027년 7월 이후 출생아부터 '아이맞이지원금·아동기본수당'으로 바뀌는 정부안이 논의 중이에요(2026-11 기준 법 개정 전). 우리 예정일 4/12는 그 전이라 현행 제도가 적용될 가능성이 높아요.</li>
      </ul>`;
  }

  /* ───────────────────────── 6. 출산 가방 ───────────────────────── */
  const BAG = [
    {
      id: 'bag-birth', title: '출산 직후 바로 쓸 것', icon: '🩹', items: [
        { id: 'b-x1', text: '헤겐 PPSU 애착 젖병 트윈 세트 4P', note: '150ml 2P + 240ml 2P' },
        { id: 'b-x2', text: '솔리디아 압박스타킹 94,250원', note: '발등 덮고 무릎 위 · 제왕절개 대비' },
        { id: 'b-x3', text: 'Mom+ 제왕절개 복대', note: '이중 고정' }
      ]
    },
    {
      id: 'bag-luanne', title: '루안느 입실 준비물', icon: '🏨', items: [
        { id: 'b-l1', text: '산모 오로패드' },
        { id: 'b-l2', text: '수유패드' },
        { id: 'b-l3', text: '아기 물티슈 2개' },
        { id: 'b-l4', text: '마스크' },
        { id: 'b-l5', text: '모유보관팩' },
        { id: 'b-l6', text: '텀블러' },
        { id: 'b-l7', text: '양말 · 손수건' },
        { id: 'b-l8', text: '개인 세면도구' }
      ]
    },
    {
      id: 'bag-mom', title: '산모용', icon: '🤍', items: [
        { id: 'b-m1', text: '산모패드 (대형)', note: '' },
        { id: 'b-m2', text: '수유브라 · 수유패드' },
        { id: 'b-m3', text: '회음부 냉찜질 패드' },
        { id: 'b-m4', text: '넉넉한 파자마 2벌 · 양말' },
        { id: 'b-m5', text: '세면도구 · 스킨케어' },
        { id: 'b-m6', text: '수건 3장 · 슬리퍼' },
        { id: 'b-m7', text: '물병 · 빨대 (누워서 마시기)' },
        { id: 'b-m8', text: '속옷 여유분' },
        { id: 'b-m9', text: '수면양말 · 보호자 침구' },
        { id: 'b-m10', text: '롤휴지 · 핸드워시' },
        { id: 'b-m11', text: '휴대폰 충전기 · 보조배터리 · 멀티탭' },
        { id: 'b-m12', text: '손목보호대 · 마스크' },
        { id: 'b-m13', text: '산모용 영양제 · 붓기차' },
        { id: 'b-m14', text: '아이패드 · 에어팟' }
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
        { id: 'b-b7', text: '젖병 · 분유 (병원 지시 시)' },
        { id: 'b-b8', text: '로션 · 크림' },
        { id: 'b-b9', text: '초점책 · 장난감' }
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

  /* ───────────────────────── 실시간 동기화 (도완 폰 ↔ 명주 폰) ───────────────────────── */
  const FB_CONFIG = {
    apiKey: 'AIzaSyCgZ6AYYIxzbEe135USUhTX_pB684zita8',
    authDomain: 'tosil-story.firebaseapp.com',
    databaseURL: 'https://tosil-story-default-rtdb.firebaseio.com',
    projectId: 'tosil-story',
    storageBucket: 'tosil-story.firebasestorage.app',
    messagingSenderId: '407302916302',
    appId: '1:407302916302:web:f62c3acaea531fae18689f'
  };
  const FB_PATH = 'tosil_story/state/checks';
  const SYNC_ON = '실시간 동기화 중';
  const sync = { ref: null, timer: null, applying: false };

  function paintSync(state, text, title) {
    const el = $('#syncState');
    if (!el) return;
    el.dataset.state = state;
    const t = $('.sync__text', el);
    if (t) t.textContent = text;
    el.title = title || text;
  }

  /* DB에는 체크된 항목은 true, 해제한 항목은 false로 남겨 두 폰의 판단이 엇갈리지 않게 해요 */
  const asMap = (obj) => {
    const out = {};
    Object.keys(obj || {}).forEach((k) => { if (obj[k]) out[k] = true; });
    return out;
  };
  const remoteToChecks = (remote) => {
    const out = {};
    Object.keys(remote || {}).forEach((k) => { if (remote[k] === true) out[k] = true; });
    return out;
  };
  const sameMap = (a, b) => {
    const ka = Object.keys(a).sort();
    const kb = Object.keys(b).sort();
    return ka.length === kb.length && ka.every((k, i) => k === kb[i]);
  };

  function refreshChecksUI() {
    renderShop();
    renderTasks();
    renderBag();
  }

  function applyRemote(remote, quiet) {
    const next = remoteToChecks(remote);
    if (sameMap(next, checks)) return;
    sync.applying = true;
    checks = next;
    saveChecks();
    refreshChecksUI();
    sync.applying = false;
    if (!quiet) toast('다른 폰에서 바뀐 체크를 맞췄어요');
  }

  function pushCheck(id, on) {
    if (!sync.ref || sync.applying) return;
    try {
      sync.ref.child(id).set(!!on).catch(() => {
        paintSync('err', '동기화 안 됨', '지금은 이 기기에만 저장돼요. 연결되면 다시 올려요.');
      });
    } catch (e) { /* 오프라인이면 localStorage에만 남아요 */ }
  }

  function initSync() {
    if (!window.firebase || typeof window.firebase.database !== 'function') {
      paintSync('err', '동기화 연결 실패', '실시간 동기화를 불러오지 못했어요. 체크는 이 기기에만 저장돼요.');
      return;
    }
    try {
      const app = firebase.apps && firebase.apps.length ? firebase.app() : firebase.initializeApp(FB_CONFIG);
      const db = firebase.database(app);
      sync.ref = db.ref(FB_PATH);

      db.ref('.info/connected').on('value', (snap) => {
        const on = snap.val() === true;
        paintSync(on ? 'on' : 'off',
          on ? SYNC_ON : '연결 대기 중',
          on ? '두 폰의 체크 상태를 함께 쓰고 있어요'
             : '인터넷이 끊겨 있어요. 연결되면 자동으로 맞춰져요.');
      });

      let first = true;
      sync.ref.on('value', (snap) => {
        const val = snap.val();
        const remote = val && typeof val === 'object' ? val : null;
        if (!remote || !Object.keys(remote).length) {
          // DB가 비어 있으면 이 기기에 쌓여 있던 체크를 올려 둬요
          const mine = asMap(checks);
          if (Object.keys(mine).length) sync.ref.set(mine).catch(() => {});
          first = false;
          paintSync('on', SYNC_ON, '두 폰의 체크 상태를 함께 쓰고 있어요');
          return;
        }
        if (first) {
          // 첫 연결: DB에 없는 이 기기의 체크만 더해 두고, 나머지는 DB를 따라요
          const patch = {};
          Object.keys(checks).forEach((k) => { if (!(k in remote)) patch[k] = true; });
          if (Object.keys(patch).length) sync.ref.update(patch).catch(() => {});
          applyRemote(remote, true);
        } else {
          applyRemote(remote, false);
        }
        first = false;
        paintSync('on', SYNC_ON, '두 폰의 체크 상태를 함께 쓰고 있어요');
      }, (err) => {
        console.warn('[tosil] 동기화 읽기 실패', err && err.code);
        paintSync('err', '동기화 끊김', '체크 상태를 불러오지 못했어요. 이 기기에만 저장돼요.');
      });
    } catch (e) {
      console.warn('[tosil] 동기화 시작 실패', e);
      paintSync('err', '동기화 끊김', '체크 상태는 이 기기에만 저장돼요.');
    }
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

  /* ───────────────────────── 2. 휴직일정 (월별 달력) ───────────────────────── */
  const LEAVE_GLANCE = [
    { k: '연차', v: '15일 모두 사용', n: '1/7~8 2일 · 2/10~26 13일' },
    { k: '리프레시', v: '4일 사용', n: '3/2(화)~3/5(금)' },
    { k: '출산휴가', v: '90일', n: '2027.3.8~6.5 · 3월 24 + 4월 30 + 5월 31 + 6월 5' },
    { k: '육아휴직', v: '6/6 시작', n: '출산휴가 다음 날부터' }
  ];

  /* 기간으로 칠하는 일정 (tone 색으로 배경 표시) */
  const LEAVE_RANGES = [
    { from: '2027-01-07', to: '2027-01-08', tone: 'leave', tag: '연차', tagEvery: true },
    { from: '2027-02-01', to: '2027-02-05', tone: 'work', tag: '근무' },
    { from: '2027-02-06', to: '2027-02-09', tone: 'holiday' },
    { from: '2027-02-10', to: '2027-02-12', tone: 'leave', tag: '연차' },
    { from: '2027-02-15', to: '2027-02-19', tone: 'leave', tag: '연차' },
    { from: '2027-02-22', to: '2027-02-26', tone: 'leave', tag: '연차' },
    { from: '2027-03-02', to: '2027-03-05', tone: 'leave', tag: '리프레시' },
    { from: '2027-03-08', to: '2027-06-05', tone: 'birth' },
    { from: '2027-06-06', to: '2027-06-30', tone: 'parent' }
  ];

  /* 하루짜리 표시 (기간 위에 덮어쓰기) */
  const LEAVE_DAYS = {
    '2027-01-01': { tone: 'holiday', tag: '신정' },
    '2027-01-25': { tone: 'exam', tag: '검진' },
    '2027-02-04': { tone: 'exam' },
    '2027-02-05': { tone: 'exam', tag: '검진' },
    '2027-02-07': { tag: '설날' },
    '2027-02-09': { tag: '대체' },
    '2027-03-01': { tone: 'holiday', tag: '삼일절' },
    '2027-03-08': { tag: '휴가시작' },
    '2027-04-12': { tone: 'due', tag: 'D-DAY' },
    '2027-05-01': { hol: true },
    '2027-05-03': { hol: true },
    '2027-05-05': { hol: true },
    '2027-05-13': { hol: true },
    '2027-06-05': { tag: '휴가종료' },
    '2027-06-06': { tag: '휴직시작', hol: true }
  };

  const LEAVE_MONTHS = [
    {
      y: 2027, m: 1,
      chips: ['연차 2일', '검진 1회'],
      notes: [
        '<b>1/1(금)</b> 신정 — 공휴일',
        '<b>1/7(목)~1/8(금)</b> 연차 2일 — 연차 15일 중 2일 사용, 잔여 13일',
        '<b>1/7(목)~1/10(일)</b> 후쿠오카 여행 (3박 4일)',
        '<b>1/25(월)</b> 태아검진 — 2주 간격 시작, 반차 미사용'
      ]
    },
    {
      y: 2027, m: 2,
      chips: ['설 연휴 4일', '연차 13일'],
      notes: [
        '<b>2/1(월)~2/5(금)</b> 정상 근무 — <b>2/4(목)·2/5(금)</b> 중 태아검진, 반차 미사용',
        '<b>2/6(토)~2/9(화)</b> 설날 연휴 — 2/7 설날(일), 2/9 대체공휴일',
        '<b>2/10(수)~2/26(금)</b> 잔여 연차 13일 — 2/10~12 · 2/15~19 · 2/22~26'
      ]
    },
    {
      y: 2027, m: 3,
      chips: ['삼일절', '리프레시 4일', '출산휴가 시작'],
      notes: [
        '<b>3/1(월)</b> 삼일절 — 공휴일',
        '<b>3/2(화)~3/5(금)</b> 리프레시 4일 — 2월 연차 13일과 합쳐 17일 모두 사용 완료',
        '<b>3/8(월)</b> 출산휴가 90일 시작'
      ]
    },
    {
      y: 2027, m: 4,
      chips: ['출산휴가', 'D-DAY 4/12'],
      notes: [
        '출산휴가 계속 — 3/8~6/5 중 4월 몫 30일',
        '<b>4/12(월)</b> 토실이 출산 예정일 (40주 0일)'
      ]
    },
    {
      y: 2027, m: 5,
      chips: ['출산휴가'],
      notes: [
        '출산휴가 계속 — 5월 몫 31일',
        '<b>5/1(토)</b> 노동절 · <b>5/3(월)</b> 대체공휴일 · <b>5/5(수)</b> 어린이날 · <b>5/13(목)</b> 부처님오신날 — 휴가 중이라 따로 쓰지 않아요'
      ]
    },
    {
      y: 2027, m: 6,
      chips: ['출산휴가 종료', '육아휴직 시작'],
      notes: [
        '<b>6/5(토)</b> 출산휴가 90일 종료 — 3월 24일 + 4월 30일 + 5월 31일 + 6월 5일',
        '<b>6/6(일)</b> 육아휴직 시작 (현충일)'
      ]
    }
  ];

  const LEAVE_TONE_NAMES = {
    leave: '연차·리프레시', work: '정상 근무', holiday: '공휴일', exam: '검진',
    birth: '출산휴가', parent: '육아휴직', due: '출산 예정일'
  };

  function leaveISO(t) { return new Date(t).toISOString().slice(0, 10); }

  function leaveDayMap() {
    const map = {};
    const put = (k, v) => { map[k] = Object.assign(map[k] || {}, v); };

    LEAVE_RANGES.forEach((r) => {
      const s = Date.parse(r.from + 'T00:00:00Z');
      const e = Date.parse(r.to + 'T00:00:00Z');
      for (let t = s; t <= e; t += 86400000) {
        const k = leaveISO(t);
        put(k, { tone: r.tone });
        if (r.tag && (t === s || r.tagEvery)) put(k, { tag: r.tag });
      }
    });
    Object.keys(LEAVE_DAYS).forEach((k) => put(k, LEAVE_DAYS[k]));
    return map;
  }

  function renderLeave() {
    const host = $('#leaveCal');
    if (!host) return;

    $('#leaveGlance').innerHTML = LEAVE_GLANCE.map((g) => `
      <div class="lg">
        <p class="lg__k">${esc(g.k)}</p>
        <p class="lg__v">${esc(g.v)}</p>
        <p class="lg__n">${esc(g.n)}</p>
      </div>`).join('');

    const map = leaveDayMap();
    const DOW = ['일', '월', '화', '수', '목', '금', '토'];

    host.innerHTML = LEAVE_MONTHS.map((mo) => {
      const pad = new Date(Date.UTC(mo.y, mo.m - 1, 1)).getUTCDay();
      const last = new Date(Date.UTC(mo.y, mo.m, 0)).getUTCDate();

      let cells = DOW.map((d, i) => `<span class="cal__dow${i === 0 ? ' is-sun' : i === 6 ? ' is-sat' : ''}">${d}</span>`).join('');
      cells += '<span class="cal__day is-empty" aria-hidden="true"></span>'.repeat(pad);

      for (let d = 1; d <= last; d++) {
        const k = `${mo.y}-${String(mo.m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const info = map[k] || {};
        const dow = (pad + d - 1) % 7;
        const cls = ['cal__day'];
        if (dow === 0) cls.push('is-sun');
        if (dow === 6) cls.push('is-sat');
        if (info.hol) cls.push('is-hol');

        const bits = [`${mo.m}월 ${d}일 ${DOW[dow]}요일`];
        if (LEAVE_TONE_NAMES[info.tone]) bits.push(LEAVE_TONE_NAMES[info.tone]);
        if (info.tag) bits.push(info.tag);
        if (info.hol) bits.push('공휴일');
        const label = esc(bits.join(' · '));

        cells += `<span class="${cls.join(' ')}"${info.tone ? ` data-tone="${info.tone}"` : ''} aria-label="${label}" title="${label}">`
          + `<span class="cal__num">${d}</span>`
          + (info.tag ? `<span class="cal__tag">${esc(info.tag)}</span>` : '')
          + '</span>';
      }

      return `
      <section class="cal">
        <div class="cal__head">
          <p class="cal__month">${mo.m}월<small>${mo.y}</small></p>
          <div class="cal__chips">${mo.chips.map((c) => `<span>${esc(c)}</span>`).join('')}</div>
        </div>
        <div class="cal__grid">${cells}</div>
        <ul class="cal__notes">${mo.notes.map((n) => `<li>${n}</li>`).join('')}</ul>
      </section>`;
    }).join('');
  }

  /* ───────────────────────── 탭 ───────────────────────── */
  const TABS = ['photo', 'leave', 'shop', 'task', 'hospital', 'money', 'bag', 'names'];

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
        const on = !checks[id];
        if (on) checks[id] = true;
        else delete checks[id];
        saveChecks();
        pushCheck(id, on);
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
      pushCheck(id, box.checked);
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
    renderLeave();
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
    initSync();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
