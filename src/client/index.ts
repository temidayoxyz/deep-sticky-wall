import { StickyIcon, StickyWall } from './StickyWall.tsx'

export const PANEL_ID = 'deep-sticky-wall'

export const inject = ['slots']

export function apply(ctx: any): void {
  ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
    name: 'sidebar.panellist',
    id: PANEL_ID,
    order: 60,
    label: 'Sticky Notes',
  }, StickyIcon))

  ctx.slots.inject('main', () => ctx.slots.register({
    name: 'main',
    key: PANEL_ID,
  }, StickyWall))
}
