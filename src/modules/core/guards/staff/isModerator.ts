import { GuardFunction, ArgsOf, Next } from "discordx";
import { Client, CommandInteraction, GuildMemberRoleManager, Role } from "discord.js";
import CLogger from "../../interface/utilities/logger/controllers/CLogger.js";
import HTextChat from "../../helpers/HTextChat.js";

/**
 * Middleware that checks if the interaction member has the moderator role.
 * 
 * @author  Devitrax
 * @version 1.0, 11/17/22
 * 
 * @param {CommandInteraction} interaction - The interaction being executed.
 * @param {Client} client - The Discord.js client instance.
 * @param {Next} next - The function to call if the interaction member has the moderator role.
 * @returns {Promise<void>}
 */
export async function isModerator(interaction: CommandInteraction, client: Client, next: Next): Promise<void> {
    if (!process.env.SERVER_MODERATOR_ROLE_ID) {
        CLogger.error(`[${import.meta.url}] The SERVER_MODERATOR_ROLE_ID environment variable is not set.`);
        return;
    }

    if (!client.user) {
        CLogger.error(`[${import.meta.url}] User not found.`);
        return;
    }

    if (!interaction.guild) {
        CLogger.error(`[${import.meta.url}] Guild not found.`);
        return;
    }

    if (!interaction.member) {
        CLogger.error(`[${import.meta.url}] Member not found.`);
        return;
    }

    const role: Role | undefined = interaction.guild.roles.cache.find(role => role.id === process.env.SERVER_MODERATOR_ROLE_ID);

    if (!role) {
        CLogger.error(`[${import.meta.url}] Role not found.`);
        return;
    }

    const roles: GuildMemberRoleManager | string[] = interaction.member.roles as GuildMemberRoleManager
    if (roles.cache.has(role.id)) {
        await next();
    } else {
        interaction.reply(`Only ${HTextChat.tagRole(role.id)} is allowed to execute this command.`)
    }
}