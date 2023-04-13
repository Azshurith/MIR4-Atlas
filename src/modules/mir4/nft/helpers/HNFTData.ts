import HCanvaBuilder from "../../../core/helpers/HCanvaBuilder"
import canvas, { Canvas as CanvasB } from "canvas";
import { List } from "../interface/IRetrieveCharacterNft";

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
     * @return {Promise<canvas.Canvas>} - the canvas object with character items drawn on it
     */
    static async getCharacterCanva(nft: List): Promise<canvas.Canvas> {
        const canvas: canvas.Canvas = HCanvaBuilder.createCanva({
            height: 800,
            width: 800,
            fonts: []
        });

        const context: canvas.CanvasRenderingContext2D = canvas.getContext('2d');

        const avatarPromise = this.loadAvatar(context);
        const pathPromise = this.loadPath(context);
        const item1Promise = this.loadItem(
            context,
            4,
            1,
            "https://file.mir4global.com/xdraco-thumb/Content/UI/Atlas_N_Resource/Icon/Item/Equip/Item_Equip_Pca_01/Icon_WPN_PCA_10.png"
        );
        const item2Promise = this.loadItem(
            context,
            4,
            2,
            "https://file.mir4global.com/xdraco-thumb/Content/UI/Atlas_N_Resource/Icon/Item/Equip/Item_Equip_Pca_01/PCA_SubWeapon_07.png"
        );
        const item3Promise = this.loadItem(
            context,
            4,
            3,
            "https://file.mir4global.com/xdraco-thumb/Content/UI/Atlas_N_Resource/Icon/Item/Equip/Item_Equip_Pca_01/PCA_Armor_07_Top.png"
        );
        const item4Promise = this.loadItem(
            context,
            4,
            4,
            "https://file.mir4global.com/xdraco-thumb/Content/UI/Atlas_N_Resource/Icon/Item/Equip/Item_Equip_Pca_01/PCA_Armor_07_Pants.png"
        );
        const item5Promise = this.loadItem(
            context,
            4,
            5,
            "https://file.mir4global.com/xdraco-thumb/Content/UI/Atlas_N_Resource/Icon/Item/Equip/Item_Equip_Pca_01/PCA_Armor_07_Gloves.png"
        );
        const item6Promise = this.loadItem(
            context,
            4,
            6,
            "https://file.mir4global.com/xdraco-thumb/Content/UI/Atlas_N_Resource/Icon/Item/Equip/Item_Equip_Pca_01/PCA_Armor_07_Shose.png"
        );
        const item7Promise = this.loadItem(
            context,
            4,
            7,
            "https://file.mir4global.com/xdraco-thumb/Content/UI/Atlas_N_Resource/Icon/Item/Equip/Item_Equip_Accessory_01/Pcc_Accessory_Necklace_004.png"
        );
        const item8Promise = this.loadItem(
            context,
            4,
            8,
            "https://file.mir4global.com/xdraco-thumb/Content/UI/Atlas_N_Resource/Icon/Item/Equip/Item_Equip_Accessory_01/Pcc_Accessory_Bracelet_004.png"
        );
        const item9Promise = this.loadItem(
            context,
            4,
            9,
            "https://file.mir4global.com/xdraco-thumb/Content/UI/Atlas_N_Resource/Icon/Item/Equip/Item_Equip_Accessory_01/Pcc_Accessory_Ring_004.png"
        );
        const item10Promise = this.loadItem(
            context,
            4,
            10,
            "https://file.mir4global.com/xdraco-thumb/Content/UI/Atlas_N_Resource/Icon/Item/Equip/Item_Equip_Accessory_01/Pcc_Accessory_EarRing_007.png"
        );

        await Promise.all([
            avatarPromise,
            pathPromise,
            item1Promise,
            item2Promise,
            item3Promise,
            item4Promise,
            item5Promise,
            item6Promise,
            item7Promise,
            item8Promise,
            item9Promise,
            item10Promise
        ]);

        return canvas;
    }

    /**
     * Loads an avatar image onto the canvas.
     * 
     * @param {CanvasRenderingContext2D} context - The 2D rendering context for the canvas.
     * @return {Promise<void>} - A promise that resolves when the image has been loaded onto the canvas.
     */
    static async loadAvatar(context: canvas.CanvasRenderingContext2D): Promise<void> {
        await HCanvaBuilder.createImage(context, {
            src: `https://file.mir4global.com/xdraco/img/common/nft-detail/nft-detail-arbalist5.webp`,
            dx: 0,
            dy: 0,
            dw: 700,
            dh: 700
        })
    }

    /**
     * Loads a path image onto the canvas.
     * 
     * @param {CanvasRenderingContext2D} context - The 2D rendering context for the canvas.
     * @return {Promise<void>} - A promise that resolves when the image has been loaded onto the canvas.
     */
    static async loadPath(context: canvas.CanvasRenderingContext2D): Promise<void> {
        await HCanvaBuilder.createImage(context, {
            src: `https://file.mir4global.com/xdraco/img/common/nft-detail/bg-character-equip.webp`,
            dx: 100,
            dy: 100,
            dw: 600,
            dh: 600
        })
    }

    /**
     * Loads an item image onto the canvas with a specified rarity, item type, and URL.
     * 
     * @param {CanvasRenderingContext2D} context - The canvas rendering context to draw the item image onto.
     * @param {number} rarity - The rarity of the item.
     * @param {number} itemType - The type of the item.
     * @param {string} itemUrl - The URL of the item image.
     * @returns {Promise<void>} A Promise that resolves when the item image has been loaded onto the canvas.
     */
    static async loadItem(context: canvas.CanvasRenderingContext2D, rarity: number, itemType: number, itemUrl: string): Promise<void> {
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

        await Promise.all([
            HCanvaBuilder.createImage(context, {
                src: `https://file.mir4global.com/xdraco/img/common/nft-detail/sp-item-frame.webp`,
                sx: 0,
                sy: 0 + 144 * rarity,
                sw: size,
                sh: size,
                dx: bgPositionX,
                dy: bgPositionY,
                dw: 100,
                dh: 100
            }),
            HCanvaBuilder.createImage(context, {
                src: `https://file.mir4global.com/xdraco/img/common/nft-detail/sp-item-frame.webp`,
                sx: bgPositionX + 10,
                sy: bgPositionY + 10,
                sw: 75,
                sh: 75,
                dx: 0,
                dy: 0,
                dw: 0,
                dh: 0
            })
        ]);

        context.font = "bold 20px Arial";
        context.fillStyle = "#FFFFFF";
        context.strokeStyle = "black";
        context.lineWidth = 4;
        context.lineJoin = "miter";
        context.miterLimit = 2;
        context.strokeText("+1", bgPositionX + 75, bgPositionY + 20);
        context.fillText("+1", bgPositionX + 75, bgPositionY + 20);
        context.strokeText("IV", bgPositionX + 5, bgPositionY + 90);
        context.fillText("IV", bgPositionX + 5, bgPositionY + 90);
    }
}