/* intrvl notation - draws staves, notes and key signatures as SVG (no pictures to download, so it works offline).
   Shared by Key Signature Sprint and Clef Sprint (Easy).  Rhythm Tap has its own drawing code. */
window.IVN = (function () {
  'use strict';
  var INK = '#1c1c1c';
  /* Clef and accidental outlines from Noto Music (SIL Open Font License 1.1, (c) The Noto Project Authors).
     Font units (1000 per em), y pointing UP — draw with transform="translate(x,y) scale(s,-s)". */
  var GLYPH = {
    treble: 'M314 801Q300 854 291 906Q282 958 282 1012Q282 1059 288.5 1100.5Q295 1142 307 1177Q320 1217 341 1252.5Q362 1288 385.5 1311Q409 1334 427 1334Q451 1334 493 1249Q514 1206 524 1156Q534 1106 534 1049Q534 978 515 907.5Q496 837 459.5 775Q423 713 372 666L407 498Q422 500 432 501Q442 502 447 502Q508 502 556 467.5Q604 433 632.5 377Q661 321 661 254Q661 177 621.5 115.5Q582 54 503 25Q508 8 532 -117Q538 -147 541 -164.5Q544 -182 545 -195Q546 -208 546 -225Q546 -275 521.5 -314.5Q497 -354 455.5 -376Q414 -398 363 -398Q311 -398 271 -378.5Q231 -359 208 -324.5Q185 -290 185 -245Q185 -197 211.5 -165Q238 -133 287 -133Q329 -133 355.5 -163.5Q382 -194 382 -236Q382 -272 357 -299Q332 -326 292 -326H282Q308 -365 364 -365Q433 -365 472 -320Q511 -275 511 -205Q511 -188 507 -159.5Q503 -131 493 -91Q483 -51 477.5 -25Q472 1 470 12Q436 2 390 2Q304 2 222 52Q142 102 96 184Q50 266 50 361Q50 451 91 530Q132 609 192.5 675Q253 741 314 801ZM341 826Q364 838 390 870.5Q416 903 440 945Q464 987 479 1029.5Q494 1072 494 1106Q494 1142 483 1163Q472 1184 445 1184Q421 1184 398.5 1162Q376 1140 358.5 1103.5Q341 1067 331 1022Q321 977 321 930Q321 898 327.5 872Q334 846 341 826ZM398 379Q371 373 347 353.5Q323 334 308.5 306.5Q294 279 294 248Q294 223 307 196.5Q320 170 339 154Q352 142 365 136Q380 129 380 123Q380 120 370 117Q332 126 301.5 151Q271 176 253.5 211.5Q236 247 236 287Q236 330 253.5 370Q271 410 302.5 442Q334 474 374 490L345 641Q229 547 174.5 456.5Q120 366 120 277Q120 212 154 156Q188 100 247 65.5Q306 31 380 31Q400 31 420.5 35Q441 39 464 45ZM495 55Q593 97 593 227Q593 270 571 305.5Q549 341 512 362Q475 383 429 383Z',
    bass: 'M50 123Q216 231 288 301Q336 348 373 408.5Q410 469 431.5 536Q453 603 453 669Q453 728 435 773.5Q417 819 383 845Q349 871 302 871Q284 871 264.5 867Q245 863 224 855Q181 839 158 813.5Q135 788 135 765Q135 756 143 752Q151 748 158 748Q168 748 183 752Q190 754 196.5 755Q203 756 210 756Q248 756 272 733.5Q296 711 296 674Q296 638 266 612Q236 586 195 586Q146 586 111 617Q76 648 76 697Q76 756 109 802Q142 848 198.5 874Q255 900 324 900Q400 900 460 867Q520 834 555.5 776.5Q591 719 591 646Q591 551 538 464Q511 419 476.5 379Q442 339 389 297.5Q336 256 256 208Q176 160 57 101ZM687 809Q710 809 726 793Q742 777 742 754Q742 731 726 715.5Q710 700 687 700Q664 700 648 715.5Q632 731 632 754Q632 777 648 793Q664 809 687 809ZM687 589Q710 589 726 573Q742 557 742 534Q742 511 726 495.5Q710 480 687 480Q664 480 648 495.5Q632 511 632 534Q632 557 648 573Q664 589 687 589Z',
    sharp: 'M97 46V189L50 177V277L97 290V486H128V298L195 314V509H226V322L275 333V234L226 220V77L275 89V-14L226 -26V-214H195V-34L128 -52V-247H97V-59L50 -71V32ZM195 70V214L128 197V54Z',
    flat: 'M50 615H81V225Q118 262 165 262Q197 262 223 240.5Q249 219 249 178Q249 146 230 119Q211 92 179 65L110 6Q91 -10 76 -25.5Q61 -41 50 -55ZM81 12Q107 40 125 63.5Q143 87 153 105Q164 124 169.5 140Q175 156 175 170Q175 198 162 210.5Q149 223 134 223Q118 223 102.5 211.5Q87 200 81 180Z'
  };
  var SP = 10, K = SP / 250;                       // staff space in px; glyph units -> px
  var BOTTOM = 4 * SP;                             // y of the bottom staff line
  var SIG_POS = {                                  // half-space steps above the bottom line, in order of sharps / flats
    treble: { sharp: [8, 5, 9, 6, 3, 7, 4], flat: [4, 7, 3, 6, 2, 5, 1] },
    bass:   { sharp: [6, 3, 7, 4, 1, 5, 2], flat: [2, 5, 1, 4, 0, 3, -1] }
  };
  function glyph(name, x, y, scale) { return '<path transform="translate(' + x + ',' + y + ') scale(' + scale + ',' + (-scale) + ')" d="' + GLYPH[name] + '"/>'; }
  function lines(x1, x2) {
    var g = '', i;
    for (i = 0; i < 5; i++) g += '<line x1="' + x1 + '" x2="' + x2 + '" y1="' + (BOTTOM - i * SP) + '" y2="' + (BOTTOM - i * SP) + '" stroke="' + INK + '" stroke-width="1"/>';
    return g + '<line x1="' + x1 + '" x2="' + x1 + '" y1="0" y2="' + BOTTOM + '" stroke="' + INK + '" stroke-width="1.4"/>';
  }
  function clefGlyph(clef) {
    return clef === 'treble' ? glyph('treble', 12, BOTTOM, K) : clef === 'bass' ? glyph('bass', 12, BOTTOM - 6 * SP / 9, K) : '';
  }
  function accidental(sharp, x, y) { return sharp ? glyph('sharp', x, y + 131 * K, K) : glyph('flat', x, y + 100 * K, K); }

  // A key signature on a stave.  count: +1..+7 sharps, -1..-7 flats, 0 none.
  function keySigSvg(clef, count, label) {
    var sharp = count >= 0, pos = SIG_POS[clef][sharp ? 'sharp' : 'flat'], i, g = '';
    g += lines(4, 150) + clefGlyph(clef);
    for (i = 0; i < Math.abs(count); i++) g += accidental(sharp, 58 + i * (sharp ? 12 : 10), BOTTOM - pos[i] * SP / 2);
    var words = count === 0 ? 'no sharps or flats' : Math.abs(count) + (sharp ? ' sharp' : ' flat') + (Math.abs(count) > 1 ? 's' : '');
    return '<svg class="ivn-svg" viewBox="0 -22 154 78" role="img" aria-label="' + (label || ('Key signature with ' + words + ' on the ' + clef + ' clef')) + '"><g fill="' + INK + '">' + g + '</g></svg>';
  }

  // One note on a stave.  pos: 0 = bottom line, 1 = first space, ... 8 = top line (negative / above 8 uses ledger lines).
  // acc: 'sharp' | 'flat' | null.  clef: 'treble' | 'bass' | null (null draws the stave with no clef).
  function noteSvg(opts) {
    var pos = opts.pos, y = BOTTOM - pos * SP / 2, g = lines(4, 130) + clefGlyph(opts.clef), x = 86, i;
    for (i = -2; i >= pos; i -= 2) g += '<line x1="' + (x - 11) + '" x2="' + (x + 11) + '" y1="' + (BOTTOM - i * SP / 2) + '" y2="' + (BOTTOM - i * SP / 2) + '" stroke="' + INK + '" stroke-width="1.2"/>';
    for (i = 10; i <= pos; i += 2) g += '<line x1="' + (x - 11) + '" x2="' + (x + 11) + '" y1="' + (BOTTOM - i * SP / 2) + '" y2="' + (BOTTOM - i * SP / 2) + '" stroke="' + INK + '" stroke-width="1.2"/>';
    if (opts.acc === 'sharp' || opts.acc === 'flat') g += accidental(opts.acc === 'sharp', x - 20, y);
    var up = pos < 4;
    g += '<ellipse cx="' + x + '" cy="' + y + '" rx="6.4" ry="4.6" transform="rotate(-20 ' + x + ' ' + y + ')" fill="' + INK + '"/>';
    g += up ? '<line x1="' + (x + 5.8) + '" x2="' + (x + 5.8) + '" y1="' + (y - 1) + '" y2="' + (y - 3.4 * SP) + '" stroke="' + INK + '" stroke-width="1.4"/>'
            : '<line x1="' + (x - 5.8) + '" x2="' + (x - 5.8) + '" y1="' + (y + 1) + '" y2="' + (y + 3.4 * SP) + '" stroke="' + INK + '" stroke-width="1.4"/>';
    return '<svg class="ivn-svg" viewBox="0 -34 134 106" role="img" aria-label="' + (opts.label || 'A note on a stave') + '"><g fill="' + INK + '">' + g + '</g></svg>';
  }
  // A small stave with just a clef on it - used on answer buttons.
  function clefIconSvg(clef) {
    return '<svg class="ivn-svg ivn-clef" viewBox="0 -22 52 78" aria-hidden="true" focusable="false"><g fill="' + INK + '">' + lines(2, 50) + clefGlyph(clef) + '</g></svg>';
  }
  return { keySigSvg: keySigSvg, noteSvg: noteSvg, clefIconSvg: clefIconSvg, SIG_POS: SIG_POS, GLYPH: GLYPH, INK: INK };
})();
