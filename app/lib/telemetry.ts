export function initTelemetry() {}

export function createSpan(_name: string, callback: () => void) {
  callback()
}

export function addSpanAttributes(
  _attributes: Record<string, string | number | boolean>,
) {}
