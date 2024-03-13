import { SnippetInput } from '@/utils/snippets/repo';

export const defaultSnippets: SnippetInput[] = [
  {
    code: `(function() {
  return {
    init: function(comp, context) {
      update()

      function update(payload = comp.getPayload2()) {
        console.log(payload)
      }

      comp.addListener('payload_changed', (_, msg, e) => {
        if (msg.compositionId !== comp.id) return

        const payload = comp.getPayload2();
        update(payload)

        e.stopPropagation()
      });
    },
    close: function(comp, context) {}
  };
})();
`,
    context: 'composition',
    lang: 'javascript',
    name: 'Boilerplate',
    desc: 'Boilerplate for a composition script',
  },

  {
    code: `(function() {
  return {
    init: function(context) {
      context.global.fn = () => {}
    },
    close: function(comp, context) {}
  };
})();
`,
    context: 'global',
    lang: 'javascript',
    name: 'Init',
    desc: 'Boilerplate for a global script',
  },

  {
    code: `function addTimelineListener(comp, {
  inStart,
  inStop,
  outStart,
  outStop
}) {
  comp.addListener('timeline_event', (event, msg, e) => {
    if (msg.compositionId !== comp.id) return
    e.stopPropagation()

    if (msg.message.event === 'start') {
      if (msg.message.targetState === "In") {
        if (inStart) inStart(msg.message)
      } else {
        if (outStart) outStart(msg.message)
      }
    } else if (msg.message.event === 'stop') {
      if (msg.message.targetState === "In") {
        if (inStop) inStop(msg.message)
      } else {
        if (outStop) outStop(msg.message)
      }
    }
  }, {
    passive: true
  })
}
context.global.timeline = context.global.timeline || {}
context.global.timeline.addListener = addTimelineListener`,
    context: 'global',
    lang: 'javascript',
    name: 'Timeline events',
    desc: 'Simpler API for listening to timeline events',
  },

  {
    code: `context.global.timeline.addListener(comp, {
  inStart: (message) => console.log("inStart", message),
  inStop: (message) => console.log("inStop", message),
  outStart: (message) => console.log("outStart", message),
  outStop: (message) => console.log("outStop", message),
})`,
    context: 'composition',
    lang: 'javascript',
    name: 'Timeline events',
    desc: 'Usage of the global timeline events snippet',
  },

  {
    code: `(function() {
  return {
    init: function(comp, context) {},
    close: function(comp, context) {}
  }
})()
`,
    context: 'composition',
    name: 'Init',
    desc: 'Minimum code required for a composition script',
    lang: 'javascript',
  },

  {
    code: `<html>
  <div style="overflow:hidden; display:inline-block;">
    <div style="background:#161818; padding: 0 20px">\${text}</div>
  </div>
</html>`,
    context: 'composition',
    lang: 'html',
    name: 'Text background',
    desc: 'Template for a Text widget with a background equal to its width',
  },

  {
    code: `/**
 * Injects a font face into a document
 * @param {widget} widget - A built-in or custom widget
 * @param {string} fontName - The name the font will be available under
 * @param {string} url - The URL of the font resource
 * @param {string} [format] - The format of the font. Only required if it cannot be determined from the URL
 * 
 * Usage:
 * // In composition script
 * injectFontFace(comp.findWidget("Widget")[0], 'Avenir', <font url here>)
 * Can use context.global.getWidget instead of comp.findWidget(...)[0] if using the official global utilities snippet
 * 
 * // In widget
 * <div style="font-name: \${fontName}">...</div>
 */
function injectFontFace(widget, fontName, url, format) {
  const formatPeriod = url.lastIndexOf('.')
  if (formatPeriod === -1) {
    console.warn("Couldn't determine format, please provide it as the last parameter")
    return
  }

  try {
    const documentNode = widget.getDomElement().querySelector("iframe").contentDocument
    const format = url.substring(formatPeriod + 1)
    const style = documentNode.createElement('style')
    
    style.appendChild(documentNode.createTextNode(\`@font-face { font-family: "\${fontName}"; src: url('\${url}') format('\${format}'); }\`));
    documentNode.body.appendChild(style)
  } catch (e) {
    console.warn("Unable to get widget DOM element. Widget:", widget, e)
  }
}
context.global.injectFontFace = injectFontFace
`,
    context: 'composition',
    lang: 'javascript',
    name: 'Font face injection',
    desc: "Makes a font available inside a widget. Could be used for an HTML widget or a custom widget. Only use this if the Text widget doesn't solve your use case",
    favourite: false,
  },

  {
    code: `type ExmapleArgs = {
  name: string;
  value: number;
};
function typescriptExample(args: ExmapleArgs) {
  // Type annotations ar removed on copy / insert
  // No transforms are applied, no downleveling to ES6 etc occurs
  console.log(args.name, args.value);
}`,
    context: 'shared',
    lang: 'typescript',
    name: 'Typescript example',
    favourite: false,
  },
];
