/**
 * Represents the canvas interfaces
 * 
 * @version 1.0.0
 * @since 04/13/23
 * @author
 *  - Devitrax
 */
export interface ICanvas {
    height: number
    width: number
    fonts: string[]
}

export interface IFont {
    text: string
    font: string | undefined
    fillStyle: string | undefined
    shadowColor: string | undefined
    shadowOffsetX: number | undefined
    shadowOffsetY: number | undefined
    shadowBlur: number | undefined
    x: number,
    y: number,
    maxWidth?: number | undefined,
    measureCenter: boolean
}

export interface IImage {
    src: string
    sx?: number
    sy?: number
    sw?: number
    sh?: number
    dx: number
    dy: number
    dw: number
    dh: number
}

export interface IArc {
    image: IImage
    lineWidth: number
    strokeStyle: string
}

export interface IProgressBar {
    lineCap: string
    lineWidth: number
    cornerRadius: number
    strokeStyle: string
    x: number
    y: number
}
