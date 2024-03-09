type MouseEventStore = {
  e: MouseEvent;
  offsetLeft: number;
  offsetTop: number;
  startWidth: number;
  endWidth: number;
};

// TODO: Store last position as percentage of total width and restore on load
export function enableSplitPanelInteractivity(root: HTMLElement | null) {
  if (!root) {
    log.warn('No root element found for split pane interactivity');
    return;
  }

  if (root.children.length !== 3) {
    log.warn('Root element does not have 3 children; pane, separator, pane');
    return;
  }

  let mousedown: MouseEventStore | undefined = undefined;
  const start = root.children[0] as HTMLElement;
  const separator = root.children[1] as HTMLElement;
  const end = root.children[2] as HTMLElement;
  separator.onmousedown = onMouseDown;

  function onMouseDown(e: MouseEvent) {
    if (!root) return;

    mousedown = {
      e,
      offsetLeft: root.offsetLeft,
      offsetTop: root.offsetTop,
      startWidth: start.offsetWidth,
      endWidth: end.offsetWidth,
    };

    document.onmousemove = onMouseMove;
    document.onmouseup = () => {
      document.onmousemove = document.onmouseup = null;
    };
  }

  function onMouseMove(e: MouseEvent) {
    if (!root || !mousedown) return;

    const delta = { x: e.clientX - mousedown.e.clientX, y: e.clientY - mousedown.e.clientY };

    // Horizontal
    // Prevent negative-sized elements
    delta.x = Math.min(Math.max(delta.x, -mousedown.startWidth), mousedown.endWidth);

    root.style.left = mousedown.offsetLeft + delta.x + 'px';
    start.style.width = mousedown.startWidth + delta.x + 'px';
    end.style.width = mousedown.endWidth - delta.x + 'px';
  }
}
