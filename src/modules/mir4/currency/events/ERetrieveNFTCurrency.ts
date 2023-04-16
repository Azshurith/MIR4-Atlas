import type { ArgsOf } from "discordx";
import { Discord, On, Client } from "discordx";
import { IOnReadyCron } from "../../../core/interface/events/IOnReadyCron.js";
import { CoinGeckoClient } from "coingecko-api-v3"
import CLogger from "../../../core/interface/utilities/logger/controllers/CLogger.js";
import CRetrieveNFTCurrency from "../controllers/CRetrieveNFTCurrency.js";

/**
 * Represents an event triggered when retrieving a the MIR4 NFT Currency.
 *
 * @version 1.0.0
 * @since 04/15/23
 * @author
 *  - Devitrax
 */
@Discord()
export abstract class ERetrieveNFTCurrency implements IOnReadyCron {

    /**
     * An event that triggers when the bot is ready and retrieving the Currency value.
     * 
     * @param {ArgsOf<"ready">} member - The member associated with the event.
     * @param {Client} client - The Discord client instance.
     */
    @On({ event: "ready" })
    onReady([member]: ArgsOf<"ready">, client: Client): void {
        const coinGecko: CoinGeckoClient = new CoinGeckoClient();
        
        setInterval(async function () {
            try {
                CLogger.info(`[${import.meta.url}] Start > Retrieving MIR4 NFT Currency`);

                await new CRetrieveNFTCurrency(client).fetch({
                    client: coinGecko
                });

                CLogger.info(`[${import.meta.url}] End > Retrieving MIR4 NFT Currency`);
            } catch (error) {
                CLogger.error(`[${import.meta.url}] Exception > Retrieving MIR4 NFT Currency`);
            };
        }, 1000 * 60);
    }

}