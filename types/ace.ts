export type AceSelectionEvent = 'changeCursor' | 'changeSelection';

export type AceSelectionEventHandler<K extends AceSelectionEvent> = (
  event: {
    type: K;
    stopPropagation: () => void;
    preventDefault: () => void;
  },
  details: {
    anchor: AceAjax.Position;
    lead: AceAjax.Position;
  }
) => void;
