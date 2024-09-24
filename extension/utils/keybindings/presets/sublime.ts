export const bindings = [
  {
    bindKey: {
      mac: 'cmd-k cmd-backspace|cmd-backspace',
      win: 'ctrl-shift-backspace|ctrl-k ctrl-backspace',
    },
    name: 'removetolinestarthard',
  },
  {
    bindKey: { mac: 'cmd-k cmd-k|cmd-delete|ctrl-k', win: 'ctrl-shift-delete|ctrl-k ctrl-k' },
    name: 'removetolineendhard',
  },
  {
    bindKey: { mac: 'cmd-shift-d', win: 'ctrl-shift-d' },
    name: 'duplicateSelection',
  },
  {
    bindKey: { mac: 'cmd-l', win: 'ctrl-l' },
    name: 'expandtoline',
  },
  {
    bindKey: { mac: 'cmd-shift-a', win: 'ctrl-shift-a' },
    name: 'expandSelection',
    args: { to: 'tag' },
  },
  {
    bindKey: { mac: 'cmd-shift-j', win: 'ctrl-shift-j' },
    name: 'expandSelection',
    args: { to: 'indentation' },
  },
  {
    bindKey: { mac: 'ctrl-shift-m', win: 'ctrl-shift-m' },
    name: 'expandSelection',
    args: { to: 'brackets' },
  },
  {
    bindKey: { mac: 'cmd-shift-space', win: 'ctrl-shift-space' },
    name: 'expandSelection',
    args: { to: 'scope' },
  },
  {
    bindKey: { mac: 'ctrl-cmd-g', win: 'alt-f3' },
    name: 'find_all_under',
  },
  {
    bindKey: { mac: 'alt-cmd-g', win: 'ctrl-f3' },
    name: 'find_under',
  },
  {
    bindKey: { mac: 'shift-alt-cmd-g', win: 'ctrl-shift-f3' },
    name: 'find_under_prev',
  },
  {
    bindKey: { mac: 'cmd-g', win: 'f3' },
    name: 'findnext',
  },
  {
    bindKey: { mac: 'shift-cmd-g', win: 'shift-f3' },
    name: 'findprevious',
  },
  {
    bindKey: { mac: 'cmd-d', win: 'ctrl-d' },
    name: 'find_under_expand',
  },
  {
    bindKey: { mac: 'cmd-k cmd-d', win: 'ctrl-k ctrl-d' },
    name: 'find_under_expand_skip',
  },

  /* fold */
  {
    bindKey: { mac: 'cmd-alt-[', win: 'ctrl-shift-[' },
    name: 'toggleFoldWidget',
  },
  {
    bindKey: { mac: 'cmd-alt-]', win: 'ctrl-shift-]' },
    name: 'unfold',
  },
  {
    bindKey: { mac: 'cmd-k cmd-0|cmd-k cmd-j', win: 'ctrl-k ctrl-0|ctrl-k ctrl-j' },
    name: 'unfoldall',
  },
  {
    bindKey: { mac: 'cmd-k cmd-1', win: 'ctrl-k ctrl-1' },
    name: 'foldOther',
    args: { level: 1 },
  },

  /* move */
  {
    bindKey: { win: 'ctrl-left', mac: 'alt-left' },
    name: 'moveToWordStartLeft',
  },
  {
    bindKey: { win: 'ctrl-right', mac: 'alt-right' },
    name: 'moveToWordEndRight',
  },
  {
    bindKey: { win: 'ctrl-shift-left', mac: 'alt-shift-left' },
    name: 'selectToWordStartLeft',
  },
  {
    bindKey: { win: 'ctrl-shift-right', mac: 'alt-shift-right' },
    name: 'selectToWordEndRight',
  },

  // subwords
  {
    bindKey: { mac: 'ctrl-alt-shift-right|ctrl-shift-right', win: 'alt-shift-right' },
    name: 'selectSubWordRight',
  },
  {
    bindKey: { mac: 'ctrl-alt-shift-left|ctrl-shift-left', win: 'alt-shift-left' },
    name: 'selectSubWordLeft',
  },
  {
    bindKey: { mac: 'ctrl-alt-right|ctrl-right', win: 'alt-right' },
    name: 'moveSubWordRight',
  },
  {
    bindKey: { mac: 'ctrl-alt-left|ctrl-left', win: 'alt-left' },
    name: 'moveSubWordLeft',
  },
  {
    bindKey: { mac: 'ctrl-m', win: 'ctrl-m' },
    name: 'jumptomatching',
    args: { to: 'brackets' },
  },
  {
    bindKey: { mac: 'ctrl-f6', win: 'ctrl-f6' },
    name: 'goToNextError',
  },
  {
    bindKey: { mac: 'ctrl-shift-f6', win: 'ctrl-shift-f6' },
    name: 'goToPreviousError',
  },
  {
    bindKey: { mac: 'ctrl-o' },
    name: 'splitline',
  },
  {
    bindKey: { mac: 'ctrl-shift-w', win: 'alt-shift-w' },
    name: 'surrowndWithTag',
  },
  {
    bindKey: { mac: 'cmd-alt-.', win: 'alt-.' },
    name: 'close_tag',
  },
  {
    bindKey: { mac: 'cmd-j', win: 'ctrl-j' },
    name: 'joinlines',
  },
  {
    bindKey: { mac: 'ctrl--', win: 'alt--' },
    name: 'jumpBack',
  },
  {
    bindKey: { mac: 'ctrl-shift--', win: 'alt-shift--' },
    name: 'jumpForward',
  },
  {
    bindKey: { mac: 'cmd-k cmd-l', win: 'ctrl-k ctrl-l' },
    name: 'tolowercase',
  },
  {
    bindKey: { mac: 'cmd-k cmd-u', win: 'ctrl-k ctrl-u' },
    name: 'touppercase',
  },
  {
    bindKey: { mac: 'cmd-shift-v', win: 'ctrl-shift-v' },
    name: 'paste_and_indent',
  },
  {
    bindKey: { mac: 'cmd-k cmd-v|cmd-alt-v', win: 'ctrl-k ctrl-v' },
    name: 'paste_from_history',
  },
  {
    bindKey: { mac: 'cmd-shift-enter', win: 'ctrl-shift-enter' },
    name: 'addLineBefore',
  },
  {
    bindKey: { mac: 'cmd-enter', win: 'ctrl-enter' },
    name: 'addLineAfter',
  },
  {
    bindKey: { mac: 'ctrl-shift-k', win: 'ctrl-shift-k' },
    name: 'removeline',
  },
  {
    bindKey: { mac: 'ctrl-alt-up', win: 'ctrl-up' },
    name: 'scrollup',
  },
  {
    bindKey: { mac: 'ctrl-alt-down', win: 'ctrl-down' },
    name: 'scrolldown',
  },
  {
    bindKey: { mac: 'cmd-a', win: 'ctrl-a' },
    name: 'selectall',
  },
  {
    bindKey: { linux: 'alt-shift-down', mac: 'ctrl-shift-down', win: 'ctrl-alt-down' },
    name: 'addCursorBelow',
  },
  {
    bindKey: { linux: 'alt-shift-up', mac: 'ctrl-shift-up', win: 'ctrl-alt-up' },
    name: 'addCursorAbove',
  },
  {
    bindKey: { mac: 'cmd-k cmd-c|ctrl-l', win: 'ctrl-k ctrl-c' },
    name: 'centerselection',
  },
  {
    bindKey: { mac: 'f5', win: 'f9' },
    name: 'sortlines',
  },
  {
    bindKey: { mac: 'ctrl-f5', win: 'ctrl-f9' },
    name: 'sortlines',
    args: { caseSensitive: true },
  },
  {
    bindKey: { mac: 'cmd-shift-l', win: 'ctrl-shift-l' },
    name: 'splitSelectionIntoLines',
  },
  {
    bindKey: { mac: 'ctrl-cmd-down', win: 'ctrl-shift-down' },
    name: 'movelinesdown',
  },
  {
    bindKey: { mac: 'ctrl-cmd-up', win: 'ctrl-shift-up' },
    name: 'movelinesup',
  },
  {
    bindKey: { mac: 'alt-down', win: 'alt-down' },
    name: 'modifyNumberDown',
  },
  {
    bindKey: { mac: 'alt-up', win: 'alt-up' },
    name: 'modifyNumberUp',
  },
  {
    bindKey: { mac: 'cmd-/', win: 'ctrl-/' },
    name: 'togglecomment',
  },
  {
    bindKey: { mac: 'cmd-alt-/', win: 'ctrl-shift-/' },
    name: 'toggleBlockComment',
  },
  {
    bindKey: { linux: 'ctrl-alt-q', mac: 'ctrl-q', win: 'ctrl-q' },
    name: 'togglerecording',
  },
  {
    bindKey: { linux: 'ctrl-alt-shift-q', mac: 'ctrl-shift-q', win: 'ctrl-shift-q' },
    name: 'replaymacro',
  },
  {
    bindKey: { mac: 'ctrl-t', win: 'ctrl-t' },
    name: 'transpose',
  },
];
