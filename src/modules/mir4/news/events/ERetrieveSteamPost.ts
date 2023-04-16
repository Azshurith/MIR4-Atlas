import type { ArgsOf } from "discordx";
import { Discord, On, Client } from "discordx";
import { IOnReadyCron } from "../../../core/interface/events/IOnReadyCron.js";
import CLogger from "../../../core/interface/utilities/logger/controllers/CLogger.js";
import CRetrieveSteamPost from "../controllers/CRetrieveSteamPost.js";

/**
 * Represents an event triggered when retrieving a Steam post for the MIR4 game.
 * 
 * @version 1.0.0
 * @since 04/15/23
 * @author
 *  - Devitrax
 */
@Discord()
export abstract class ERetrieveSteamPost implements IOnReadyCron {

    /**
     * An event that triggers when the bot is ready and retrieving the Steam post.
     * 
     * @param {ArgsOf<"ready">} member - The member associated with the event.
     * @param {Client} client - The Discord client instance.
     */
    @On({ event: "ready" })
    onReady([member]: ArgsOf<"ready">, client: Client): void {
        setInterval(async function () {
            try {
                CLogger.info(`[${import.meta.url}] Start > Retrieving MIR4 Steam Post`,);

                const envValidation: string[] = [
                    "SERVER_NEWS_APP_ID", "SERVER_NEWS_API_TOKEN"
                ]
    
                envValidation.forEach((env: string) => {
                    if (!process.env[env]) {
                        CLogger.error(`[${import.meta.url}] The ${env} environment variable is not set.`);
                        return;
                    }
                });

                await new CRetrieveSteamPost(client).fetch({
                    appId: process.env.SERVER_NEWS_APP_ID!,
                    token: process.env.SERVER_NEWS_API_TOKEN!
                });

                CLogger.info(`[${import.meta.url}] End > Retrieving MIR4 Steam Post`);
            } catch (error) {
                CLogger.error(`[${import.meta.url}] Exception > Retrieving MIR4 Steam Post`);
            };
        }, 1000 * 60);
    }

}