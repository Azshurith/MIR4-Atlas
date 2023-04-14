import HCanvaBuilder from "../../../core/helpers/HCanvaBuilder.js"
import canvas, { Canvas as CanvasB } from "canvas";
const { loadImage } = canvas;
import { CharacterSummaryRequest, CharacterSummaryResponse, List } from "../interface/IRetrieveCharacterNft";
import CLogger from "../../../core/interface/utilities/logger/controllers/CLogger.js";
import fs from 'fs';
import queryString from 'query-string';
import axios, { AxiosResponse } from 'axios';

/**
 * A class representing a NFT Data Helper
 *
 * @version 1.0.0
 * @since 04/10/23
 * @author
 *  - Devitrax
 */
export default class HNFTData {

    /**
     * Retrieves class name
     *
     * @param {number} classId
     * @return {string} class name for embed
     */
    static getClassNameById(classId: number): string {
        switch (classId) {
            case 1: return "Warrior"
            case 2: return "Sorcerer"
            case 3: return "Taoist"
            case 4: return "Arbalist"
            case 5: return "Darkist"
            default: return "Lancer"
        }
    }

    /**
     * Returns a canvas object with all the character items drawn on it
     * 
     * @param {List} nft - a list of character items
     * @param {CharacterSummaryRequest} request - the request object containing character summary parameters
     * @return {Promise<canvas.Canvas>} - the canvas object with character items drawn on it
     */
    static async getCharacterCanva(nft: List, request: CharacterSummaryRequest): Promise<canvas.Canvas> {
        const summaryUrl: string = `${process.env.MIR4_CHARACTER_SUMMARY_URL}?${queryString.stringify(request)}`;
        const summaryResponse: AxiosResponse<CharacterSummaryResponse, any> = await axios.get<CharacterSummaryResponse>(summaryUrl);

        const canvas: canvas.Canvas = HCanvaBuilder.createCanva({
            height: 800,
            width: 800,
            fonts: []
        });

        const context: canvas.CanvasRenderingContext2D = canvas.getContext('2d');

        await this.loadAvatar(context, nft);
        await this.loadPath(context);
        for (let i = 1; i <= 10; i++) {
            const equipItem = summaryResponse.data.data.equipItem[i];
            CLogger.error(JSON.stringify(equipItem));
            await this.loadItem(
                context,
                equipItem.grade,
                i,
                equipItem.itemPath,
                equipItem.tier,
                equipItem.enhance
            );
        }
        return canvas;
    }

    /**
     * Loads an avatar image onto the canvas.
     * 
     * @param {CanvasRenderingContext2D} context - The 2D rendering context for the canvas.
     * @param {List} nft - a list of character items
     * @return {Promise<void>} - A promise that resolves when the image has been loaded onto the canvas.
     */
    static async loadAvatar(context: canvas.CanvasRenderingContext2D, nft: List): Promise<void> {
        const min: number = 2;
        const max: number = 5;
        const randomNum: number = Math.floor(Math.random() * (max - min + 1)) + min;
        context.drawImage(await loadImage(`${process.cwd()}/src/modules/mir4/nft/resources/images/classes/nft-detail-${this.getClassNameById(nft.class)}${randomNum}.png`), 0, 0, 700, 700);
    }

    /**
     * Loads a path image onto the canvas.
     * 
     * @param {CanvasRenderingContext2D} context - The 2D rendering context for the canvas.
     * @return {Promise<void>} - A promise that resolves when the image has been loaded onto the canvas.
     */
    static async loadPath(context: canvas.CanvasRenderingContext2D): Promise<void> {
        context.drawImage(await loadImage(`${process.cwd()}/src/modules/mir4/nft/resources/images/nft-detail/bg-character-equip.png`), 100, 100, 600, 600);
    }

    /**
     * Loads an image asset from a given URL and returns a Promise that resolves to an Image object.
     *
     * @param {string} url - The URL of the image asset to load.
     * @returns {Promise<canvas.Image>} A Promise that resolves to an Image object of the loaded asset.
     */
    static async loadAsset(url: string): Promise<canvas.Image> {
        const directoryPath: string = `${process.cwd()}/src/modules/mir4/nft/resources/images/nft-detail/items/`;
        const lastSlashIndex = url.lastIndexOf('/');
        let localPath: string = directoryPath;

        if (lastSlashIndex >= 0) {
            localPath += url.substring(lastSlashIndex + 1);
        }

        if (!fs.existsSync(directoryPath)) {
            fs.mkdirSync(directoryPath, { recursive: true });
        }

        if (!fs.existsSync(localPath)) {
            const response: AxiosResponse = await axios.get(url, { responseType: 'arraybuffer' });
            const imageData = Buffer.from(response.data, 'binary');
            fs.writeFileSync(localPath, imageData);
        }

        return await loadImage(localPath);
    }

    /**
     * Loads an item image onto the canvas with a specified rarity, item type, and URL.
     * 
     * @param {CanvasRenderingContext2D} context - The canvas rendering context to draw the item image onto.
     * @param {number} grade - The grade of the item.
     * @param {number} itemType - The type of the item.
     * @param {string} itemUrl - The URL of the item image.
     * @param {number} tier - The tier of the item.
     * @param {number} enhance - The enhancement level of the item.
     * @returns {Promise<void>} A Promise that resolves when the item image has been loaded onto the canvas.
     */
    static async loadItem(context: canvas.CanvasRenderingContext2D, grade: number, itemType: number, itemUrl: string, tier: number, enhance: number): Promise<void> {
        const bgPositions = [
            [180, 100],
            [90, 200],
            [55, 330],
            [70, 460],
            [150, 560],
            [260, 640],
            [400, 630],
            [530, 580],
            [630, 470],
            [650, 335]
        ];

        const bgPositionX = bgPositions[itemType - 1][0];
        const bgPositionY = bgPositions[itemType - 1][1];
        const size = 145;

        context.drawImage(await loadImage(`${process.cwd()}/src/modules/mir4/nft/resources/images/nft-detail/sp-item-frame.png`), 0, (grade - 1) * 144, size, size, bgPositionX, bgPositionY, 100, 100);
        context.drawImage(await this.loadAsset(itemUrl), bgPositionX + 10, bgPositionY + 10, 75, 75);

        context.font = "bold 30px Arial";
        context.fillStyle = "#FFFFFF";
        context.strokeStyle = "black";
        context.lineWidth = 4;
        context.lineJoin = "miter";
        context.miterLimit = 2;
        context.strokeText(`+${enhance}`, bgPositionX + 75, bgPositionY + 20);
        context.fillText(`+${enhance}`, bgPositionX + 75, bgPositionY + 20);
        context.strokeText(this.romanize(tier), bgPositionX, bgPositionY + 90);
        context.fillText(this.romanize(tier), bgPositionX, bgPositionY + 90);
    }

    /**
     * Converts a number to a Roman numeral string.
     * 
     * @param {number} num - The number to convert.
     * @returns {string} The Roman numeral string.
     */
    static romanize(num: number) {
        var lookup: any = { M: 1000, CM: 900, D: 500, CD: 400, C: 100, XC: 90, L: 50, XL: 40, X: 10, IX: 9, V: 5, IV: 4, I: 1 }, roman = '', i;
        for (i in lookup) {
            while (num >= lookup[i]) {
                roman += i;
                num -= lookup[i];
            }
        }
        return roman;
    }
}