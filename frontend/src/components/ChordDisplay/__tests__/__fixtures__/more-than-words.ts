/**
 * Fixture: CifraClub <pre> innerHTML structure.
 * Captures the three element types we care about:
 *   - plain text (chord lines, lyric lines)
 *   - <b> chord name tags
 *   - <span class="tablatura"> tab blocks (may nest <span class="cnt">)
 */
export const MORE_THAN_WORDS_RAW_HTML = [
  '[Intro] <b>G</b>  <b>G/B</b>  <b>C9</b>  <b>Am7</b>',
  '        <b>C</b>  <b>D</b>  <b>D4</b>',
  '',
  '<span class="tablatura">[Dedilhado - Intro]\n',
  'Parte 1 de 2\n',
  '   <b>G</b>        <b>G/B</b>      <b class="js-modal-trigger">C9</b>\n',
  '<span class="cnt">E|----3--x--3--3--x--3-----x----|\n',
  'B|----3--x--3--3--x--3--3--x----|\n',
  'E|-3-----x--------x-----------x----|</span></span>',
  '',
  '[Primeira Parte]',
  '',
  '<b>G</b>  <b>G/B</b>            <b>C9</b>',
  '       Chord sheet lyric line',
  '    <b>Am7</b>',
  'Another lyric line',
  '   <b>C</b>       <b>D</b>     <b>D4</b>  <b>G</b>',
  'Final lyric line here',
].join('\n');
