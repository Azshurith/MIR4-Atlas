import { IArc, ICanvas, IFont, IImage, IProgressBar } from "../interface/helpers/ICanvas";
import canvas, { Canvas as CanvasB, Image } from "canvas";
const { Canvas, loadImage, registerFont } = canvas;

/**
 * A class representing the canvas controller
 * 
 * @version 1.0.0
 * @since 04/13/23
 * @author
 *  - Devitrax
 */

export default class HCanvaBuilder {

    /**
     * Creates a canvas with the specified height and width.
     * 
     * @param {ICanvas} canvas - An object that represents the canvas.
     * @returns {canvas.Canvas} - A canvas instance.
     */
    static createCanva(canvas: ICanvas): canvas.Canvas {
        canvas.fonts.forEach(font => {
            registerFont(`${process.cwd()}/${font}.ttf`, { family: font })
        })

        return new Canvas(canvas.height, canvas.width)
    }

    /**
     * Creates an image in the canvas.
     *
     * @param {canvas.CanvasRenderingContext2D} context - The 2D rendering context of the canvas.
     * @param {IImage} image - An object that represents the image.
     * @returns {Promise<void>} - A promise that resolves when the arc is created.
     */
    static async createImage(context: canvas.CanvasRenderingContext2D, iImage: IImage): Promise<void> {
        // context.drawImage(await loadImage(iImage.src), iImage.sx!, iImage.sy!, iImage.sw!, iImage.sh!, iImage.dx, iImage.dy, iImage.dw, iImage.dh);
        // const classImg: Image = new Image();
        // classImg.src = iImage.src;

        // await new Promise<void>((resolve) => {
        //     classImg.onload = () => {
        //         context.drawImage(classImg, iImage.sx!, iImage.sy!, iImage.sw!, iImage.sh!, iImage.dx, iImage.dy, iImage.dw, iImage.dh);
        //         resolve();
        //     };
        // });
        context.drawImage(await loadImage(iImage.src), iImage.sx!, iImage.sy!, iImage.sw!, iImage.sh!, iImage.dx, iImage.dy, iImage.dw, iImage.dh);
    }

    /**
     * Creates an arc in the canvas with the specified image.
     *
     * @param {canvas.CanvasRenderingContext2D} context - The 2D rendering context of the canvas.
     * @param {IArc} arc - An object that represents the arc.
     * @returns {Promise<void>} - A promise that resolves when the arc is created.
     */
    static async createArcFromImage(context: canvas.CanvasRenderingContext2D, arc: IArc): Promise<void> {
        Object.entries(arc).forEach(entry => {
            let [key, value] = entry
            let context2d: any = context

            if (value)
                context2d[key] = value
        })

        context.beginPath()
        context.arc(arc.image.dx + 100, 125, 100, 0, Math.PI * 2, true)
        context.closePath()
        context.clip()
        await this.createImage(context, arc.image)
        context.stroke()
    }

    /**
     * Creates a progress bar in the canvas.
     *
     * @param {canvas.CanvasRenderingContext2D} context - The 2D rendering context of the canvas.
     * @param {IProgressBar} progressBar - An object that represents the progress bar.
     */
    static createProgressBar(context: canvas.CanvasRenderingContext2D, progressBar: IProgressBar): void {
        Object.entries(progressBar).forEach(entry => {
            let [key, value] = entry
            let context2d: any = context

            if (value)
                context2d[key] = value
        })

        let innerLength: number = progressBar.lineWidth - progressBar.cornerRadius * 2
        if (innerLength < 0) innerLength = 0

        let actualCornerRadius: number = progressBar.cornerRadius
        if (progressBar.lineWidth < progressBar.cornerRadius * 2) {
            actualCornerRadius = progressBar.lineWidth / 2
        }

        context.lineWidth = actualCornerRadius

        const leftX: number = progressBar.x + actualCornerRadius / 2
        const rightX: number = leftX + innerLength

        context.beginPath()
        context.moveTo(leftX, progressBar.y)
        context.lineTo(rightX, progressBar.y)
        context.stroke()
    }

    /**
     * Creates text in the canvas.
     *
     * @param {CanvasRenderingContext2D} context - The canvas 2D rendering context to use.
     * @param {Canvas} canvas - The canvas to be used for rendering.
     * @param {IFont} font - An object representing the font style to be applied on the text.
     */
    static createText(context: canvas.CanvasRenderingContext2D, canvas: canvas.Canvas, font: IFont): void {
        Object.entries(font).forEach(entry => {
            let [key, value] = entry
            let context2d: any = context

            if (value)
                context2d[key] = value
        })

        if (font.measureCenter)
            font.x = (canvas.width / 2) - (context.measureText(font.text).width / 2)

        context.fillText(font.text, font.x, font.y)
    }

    /**
     * Resizes the font size of the text until it fits inside the canvas.
     *
     * @param {CanvasRenderingContext2D} context - The canvas 2D rendering context to use.
     * @param {Canvas} canvas - The canvas to be used for rendering.
     * @param {string} text - The text string to resize the font size for.
     * @returns {string} - The font size and font family to be used for the text.
     */
    static resizeText(context: canvas.CanvasRenderingContext2D, canvas: canvas.Canvas, text: string): string {
        let fontSize: number = 50

        do {
            context.font = `${fontSize -= 5}px "Heavitas"`
        } while (context.measureText(text).width > canvas.width - 100)

        return context.font
    }
}