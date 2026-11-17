export interface BentoLayoutLifecycle {
  isActive: () => boolean
  requestClose: (requested: boolean) => void
  animate: (opening: boolean) => Promise<boolean>
}

/** A busy opening records a close request; a cancelled close never settles the screen. */
export const closeBentoLayout = async (
  layout: BentoLayoutLifecycle,
  busy: boolean,
  settled: () => void,
): Promise<void> => {
  if (busy) {
    layout.requestClose(true)

    return
  }

  layout.requestClose(false)
  if (await layout.animate(false))
    settled()
}
