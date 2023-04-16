
import { Client } from "discordx";
import { APIController } from "../../../core/interface/controllers/APIController";
import { ActivityOptions, ActivityType, AttachmentBuilder, Colors, EmbedBuilder } from "discord.js";
import { NFTCurrencyRequest } from "../interface/IRetrieveNFTCurrency";
import { SimplePriceResponse } from "coingecko-api-v3"
import CLogger from "../../../core/interface/utilities/logger/controllers/CLogger.js";
import HTextChat from "../../../core/helpers/HTextChat.js";
import path from "path";
import fs from "fs";

/**
 * A class representing the Currency Retrieve retrieve controller.
 *
 * @version 1.0.0
 * @since 04/16/23
 * @author
 *  - Devitrax
 */
export default class CRetrieveNFTCurrency implements APIController {

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
     * Retrieves the latest NFT currency prices from a cryptocurrency API.
     *
     * @param {NFTCurrencyRequest} request - The request object containing the API endpoint URL to retrieve.
     * @returns {Promise<void>} - A promise that resolves with no value when the latest currency prices have been retrieved.
     */
    async fetch(request: NFTCurrencyRequest): Promise<void> {
        try {
            CLogger.info(`[${import.meta.url}] Loading WEMIX currency.`);

            request.client.simplePrice({
                ids: "wemix-token",
                vs_currencies: 'usd,php'
            }).then((result: SimplePriceResponse) => {

                const filePath: string = `${process.cwd()}/src/modules/mir4/currency/resources/data/wemix.json`;
                const directoryPath: string = path.dirname(filePath);

                if (!fs.existsSync(directoryPath)) {
                    fs.mkdirSync(directoryPath, { recursive: true });
                }

                if (!fs.existsSync(filePath)) {
                    fs.writeFileSync(filePath, '{}');
                }

                const file: string = fs.readFileSync(filePath, 'utf-8')
                const oldNews: SimplePriceResponse = JSON.parse(file)

                if (JSON.stringify(oldNews) !== JSON.stringify(result)) {
                    CLogger.info(`[${import.meta.url}] Updating WEMIX value.`);
                    fs.writeFileSync(filePath, JSON.stringify(result))

                    let activity: ActivityOptions = {
                        name: `WEMIX ~ $${result["wemix-token"].usd} 💸`,
                        type: ActivityType.Watching
                    }
    
                    if (!this._client.user) {
                        CLogger.error(`[${import.meta.url}] User does not exist.`);
                        return;
                    }
    
                    this._client.user.setActivity(activity)
                    this.notify(result);
                }
                
            }).catch(error => {
                CLogger.error(`[${import.meta.url}] API Error > NFT Currency Request: (${error})`);
            })

        } catch (error) {
            CLogger.error(`[${import.meta.url}] API Error > NFT Currency Request: (${error})`);
        }
    }

    /**
     * Sends a notification message to the specified text channel containing the details of the updated NFT list.
     * 
     * @param {SimplePriceResponse} result - The response object containing the latest WEMIX currency prices.
     * @returns {void}
     */
    async notify(result: SimplePriceResponse): Promise<void> {
        try {
            const envValidation: string[] = [
                "SERVER_NAME", "SERVER_CRYPTO_FORUM_NAME", "SERVER_CRYPTO_FORUM_THREAD_NAME", "SERVER_CRYPTO_FORUM_THREAD_CONTENT", "SERVER_CRYPTO_ROLE_ID"
            ]

            envValidation.forEach((env: string) => {
                if (!process.env[env]) {
                    CLogger.error(`[${import.meta.url}] The ${env} environment variable is not set.`);
                    return;
                }
            });

            const thread = await HTextChat.getSpecificServerForumThreadByName(this._client, process.env.SERVER_NAME!, process.env.SERVER_CRYPTO_FORUM_NAME!, process.env.SERVER_CRYPTO_FORUM_THREAD_NAME!, process.env.SERVER_CRYPTO_FORUM_THREAD_CONTENT!)
            if (!thread) {
                CLogger.error(`[${import.meta.url}] Thread does not exist.`);
                return;
            }

            const embed: EmbedBuilder = new EmbedBuilder()
                .setTitle(`WEMIX PRICE`)
                .setColor(Colors.Gold)
                .setImage('attachment://profile-image.png')
                .setFooter({
                    text: `${new Date()}`,
                    iconURL: "https://coinalpha.app/images/coin/1_20211022025215.png",
                })
                .addFields({
                    name: `USD/WEMIX`,
                    value: "```" + result["wemix-token"].usd + "```",
                    inline: true
                }, {
                    name: `PHP/WEMIX`,
                    value: "```" + result["wemix-token"].php + "```",
                    inline: true
                })

            thread.send({
                content: HTextChat.tagRole(process.env.SERVER_CRYPTO_ROLE_ID!),
                embeds: [
                    embed
                ],
                files: [
                    new AttachmentBuilder(`${process.cwd()}/src/modules/mir4/currency/resources/images/wemix.png`, { name: 'profile-image.png' })
                ]
            })
        } catch (error) {
            CLogger.error(`[${import.meta.url}] API Error > Unable to send embed: (${error})`);
        }
    }
}
