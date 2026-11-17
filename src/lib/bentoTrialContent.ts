import type { ValidityPixelRect } from './bentoValidityLayout'

/** Summary coordinates relative to the card's absolute-positioning containing block. */
export const trialContentRects = (primary: HTMLElement) => {
  const origin = primary.getBoundingClientRect()
  const elements = Array.from(primary.querySelectorAll<HTMLElement>(':scope > .card-heading, :scope > .trial-value, :scope > .trial-progress, :scope > .trial-outcome'))

  return new Map(elements.map(element => {
    const rect = element.getBoundingClientRect()

    return [element, {
      left: rect.left - origin.left - primary.clientLeft,
      top: rect.top - origin.top - primary.clientTop,
      width: rect.width,
      height: rect.height,
    } satisfies ValidityPixelRect]
  }))
}

/** Freeze the departing details before Vue switches the summary to its compact layout. */
export const freezeTrialDetails = (primary: HTMLElement) => {
  const details = primary.querySelector<HTMLElement>('.trial-details')

  if (!details)
    return

  const origin = primary.getBoundingClientRect()
  const rect = details.getBoundingClientRect()

  Object.assign(details.style, {
    position: 'absolute',
    left: `${rect.left - origin.left - primary.clientLeft}px`,
    top: `${rect.top - origin.top - primary.clientTop}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    margin: '0',
  })
  details.setAttribute('inert', '')
}
