/** Fonte do asset visual */
export const ClipSource = {
  PEXELS: 'pexels',
  DALLE: 'dalle',
} as const

export type ClipSource = (typeof ClipSource)[keyof typeof ClipSource]
