import { Client } from "discordx";
import { ChannelType, TextChannel } from "discord.js";
import CLogger from "../interface/utilities/logger/controllers/CLogger.js";

/**
 * A class representing a Text Channel Helper
 *
 * @version 1.0.0
 * @since 04/09/23
 * @author
 *  - Devitrax
 */
export default class HTextChat {

    /**
     * Returns the text channel with the given name on the specified server.
     * 
     * @param {Client} client - The Discord client instance to use.
     * @param {string} serverName - The name of the server to search for the channel on.
     * @param {string} channelName - The name of the channel to search for.
     * @returns {TextChannel|null|undefined} - The text channel with the given name, or null/undefined if not found.
     */
    static getSpecificServerTextChannelByName(client: Client, serverName: string, channelName: string): TextChannel | null | undefined {
        try {
            const guild = client.guilds.cache.find((guild) => guild.name === serverName);
            if (!guild) {
                CLogger.error(`[${import.meta.url}] Request Error > Server not found: (${serverName})`);
                return null;
            }

            const channel = guild.channels.cache.find((channel) => channel.name === channelName) as TextChannel;
            if (!channel) {
                CLogger.error(`[${import.meta.url}] Request Error > Channel not found: (${channelName})`);
                return null;
            }

            if (channel.type !== ChannelType.GuildText) {
                CLogger.error(`[${import.meta.url}] Request Error > Channel is not text-based: (${channelName})`);
                return null;
            }

            return channel;
        } catch (error) {
            CLogger.error(`[${import.meta.url}] Request Error > Server Error: (${error})`);
        }
    }


}