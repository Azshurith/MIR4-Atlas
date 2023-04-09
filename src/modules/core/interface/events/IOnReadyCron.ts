import { ArgsOf, Client } from "discordx";

/**
 * Represents the interface for the "ready" event listener.
 * 
 * @version 1.0.0
 * @since 04/09/23
 * @author
 *  - Devitrax
 */
export interface IOnReadyCron {

    /**
     * Called when the bot is ready.
     * 
     * @param {ArgsOf<"ready">} member - The member associated with the event.
     * @param {Client} client - The Discord client instance.
     */
    onReady([member]: ArgsOf<"ready">, client: Client): void;
}
