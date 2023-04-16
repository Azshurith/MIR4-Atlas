import type { ArgsOf } from "discordx";
import { Discord, On, Client } from "discordx";
import { IOnReadyCron } from "../../../core/interface/events/IOnReadyCron.js";
import CRetrieveCharacterNft from "../controllers/CRetrieveCharacterNft.js";
import CLogger from "../../../core/interface/utilities/logger/controllers/CLogger.js";

/**
 * An event representing the Character NFT retrieve process.
 * 
 * @version 1.0.0
 * @since 04/09/23
 * @author
 *  - Devitrax
 */
@Discord()
export abstract class ERetrieveCharacterNft implements IOnReadyCron {

    /**
     * An event that triggers when the bot is ready and retrieving NFT characters.
     * 
     * @param {ArgsOf<"ready">} member - The member associated with the event.
     * @param {Client} client - The Discord client instance.
     */
    @On({ event: "ready" })
    onReady([member]: ArgsOf<"ready">, client: Client): void {
        // setInterval(async function () {
        //     try {
        //         CLogger.info(`[${import.meta.url}] Start > Retrieving Character NFT`,);
        //         await new CRetrieveCharacterNft(client).fetch({
        //             listType: 'sale',
        //             class: 0,
        //             levMin: 0,
        //             levMax: 0,
        //             powerMin: 0,
        //             powerMax: 0,
        //             priceMin: 0,
        //             priceMax: 0,
        //             sort: 'latest',
        //             page: 1,
        //             languageCode: 'en'
        //         });
        //         CLogger.info(`[${import.meta.url}] End > Retrieving Character NFT`);
        //     } catch (error) {
        //         CLogger.error(`[${import.meta.url}] Exception > Retrieving Character NFT`);
        //     };
        // }, 1000 * 60);
    }

}