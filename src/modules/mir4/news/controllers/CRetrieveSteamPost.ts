
import { Client } from "discordx";
import { APIController } from "../../../core/interface/controllers/APIController";
import { SteamPostRequest, SteamPostResponse } from "../interface/IRetrieveSteamPost";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Colors, EmbedBuilder, MessageActionRowComponentBuilder, TextChannel } from "discord.js";
import CLogger from "../../../core/interface/utilities/logger/controllers/CLogger.js";
import HTextChat from "../../../core/helpers/HTextChat.js";
import SteamAPI from "steamapi";
import path from "path";
import fs from "fs";

/**
 * A class representing the MIR4 NFT retrieve controller.
 *
 * @version 1.0.0
 * @since 04/15/23
 * @author
 *  - Devitrax
 */
export default class CRetrieveSteamPost implements APIController {

    /**
     * @var {Client} client - The client object used to interact with the API.
     */
    private readonly _client: Client

    /**
     * Create a new instance of the class.
     * 
     * @param {Client} client - The client object used to interact with the API.
     */
    constructor(client: Client) {
        this._client = client
    }

    /**
     * Fetches the latest post from a Steam page using the Steam Web API.
     * 
     * @param {SteamPostRequest} request - The request object containing the app ID to retrieve.
     * @returns {Promise<void>} - A promise that resolves with no value when the latest post has been retrieved.
     */
    async fetch(request: SteamPostRequest): Promise<void> {
        try {
            CLogger.info(`[${import.meta.url}] Loading MIR4 news from Steam`);

            const steam: SteamAPI = new SteamAPI(request.token);
            await steam.getGameNews(request.appId).then((news: Record<string, unknown>[]) => {
                const steamPostResponseList: SteamPostResponse[] = news.map((post) => {
                    const steamPostResponse: SteamPostResponse = {
                        gid: post.gid as string,
                        title: post.title as string,
                        url: post.url as string,
                        is_external_url: post.is_external_url as boolean,
                        author: post.author as string,
                        contents: post.contents as string,
                        feedlabel: post.feedlabel as string,
                        date: post.date as number,
                        feedname: post.feedname as string,
                        feed_type: post.feed_type as number,
                        appid: post.appid as number,
                    };
                    return steamPostResponse;
                });

                steamPostResponseList.sort((a, b) => a.date - b.date);

                steamPostResponseList.forEach((news: SteamPostResponse) => {
                    const filePath: string = `${process.cwd()}/src/modules/mir4/news/resources/data/news/${news.gid}.json`;
                    const directoryPath: string = path.dirname(filePath);

                    if (!fs.existsSync(directoryPath)) {
                        fs.mkdirSync(directoryPath, { recursive: true });
                    }

                    if (!fs.existsSync(filePath)) {
                        fs.writeFileSync(filePath, '{}');
                    }

                    const file: string = fs.readFileSync(filePath, 'utf-8')
                    const oldNews: SteamPostResponse = JSON.parse(file)

                    if (JSON.stringify(oldNews) !== JSON.stringify(news)) {
                        CLogger.info(`[${import.meta.url}] Posting News > Steam Post Request: (${news.title})`);
                        fs.writeFileSync(filePath, JSON.stringify(news))
                        this.notify(news)
                    }
                })

            });
        } catch (error) {
            CLogger.error(`[${import.meta.url}] API Error > Steam Post Request: (${error})`);
        }
    }

    /**
     * Sends a notification message to the specified text channel containing the details of the updated Steam news post.
     * 
     * @param {SteamPostResponse} news - The Steam news post to be notified about.
     * @returns {Promise<void>}
     */
    async notify(news: SteamPostResponse): Promise<void> {
        try {

            const envValidation: string[] = [
                "SERVER_NAME", "SERVER_NEWS_CHANNEL_NAME", "SERVER_NEWS_CDN_URL", "SERVER_NEWS_ROLE_ID"
            ]

            envValidation.forEach((env: string) => {
                if (!process.env[env]) {
                    CLogger.error(`[${import.meta.url}] The ${env} environment variable is not set.`);
                    return;
                }
            });

            const channel: TextChannel = HTextChat.getSpecificServerTextChannelByName(this._client, process.env.SERVER_NAME!, process.env.SERVER_NEWS_CHANNEL_NAME!) as TextChannel
            if (!channel) {
                CLogger.error(`[${import.meta.url}] Channel does not exist.`);
                return;
            }
            const date: Date = new Date(news.date * 1000);
            const embed: EmbedBuilder = new EmbedBuilder()
                .setTitle(news.title)
                .setURL(news.url)
                .setColor(Colors.Aqua)
                .setFooter({
                    text: `${date}`,
                    iconURL: "https://coinalpha.app/images/coin/1_20211022025215.png",
                })

            const regex: RegExp = /\[img\](.*?)\[\/img\]/;
            const match: RegExpExecArray | null = regex.exec(news.contents);
            let image: string = "";
            if (match) {
                image = match[1].replace(/\{STEAM_CLAN_IMAGE\}/g, process.env.SERVER_NEWS_CDN_URL!)
                embed.setImage(image)
            }

            news.contents = HTextChat.bbCodeToDiscord(news.contents)
            embed.setDescription(HTextChat.bbCodeToDiscord(news.contents))

            const menuRow: ActionRowBuilder<MessageActionRowComponentBuilder> = new ActionRowBuilder<MessageActionRowComponentBuilder>()
                .addComponents(new ButtonBuilder()
                    .setLabel("Read More")
                    .setStyle(ButtonStyle.Link)
                    .setURL(news.url)
                )

            channel.send({
                content: HTextChat.tagRole(process.env.SERVER_NEWS_ROLE_ID!),
                embeds: [
                    embed
                ],
                components: [
                    menuRow
                ]
            })

            channel.guild.scheduledEvents.create({
                name: news.title,
                scheduledStartTime: new Date(),
                scheduledEndTime: new Date(date.getFullYear(), date.getMonth() + 1, 0),
                privacyLevel: 2,
                entityType: 3,
                entityMetadata: {
                    location: "MIR4"
                },
                description: news.contents,
                image: image
            })
        } catch (error) {
            CLogger.error(`[${import.meta.url}] API Error > Unable to send embed: (${error})`);
        }
    }
}
