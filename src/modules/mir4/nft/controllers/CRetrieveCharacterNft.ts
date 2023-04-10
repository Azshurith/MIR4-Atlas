import { APIController } from "../../../core/interface/controllers/APIController";
import { Client } from "discordx";
import { Colors, EmbedBuilder } from "discord.js";
import { NFTListRequest, NFTListResponse, List, CharacterSpiritRequest, CharacterSpiritResponse, Inven, CharacterSkillsRequest, CharacterSkillResponse, Datum, Nft } from "../interface/IRetrieveCharacterNft";
import CLogger from "../../../core/interface/utilities/logger/controllers/CLogger.js";
import HTextChat from "../../../core/helpers/HTextChat.js";
import HNFTData from "../helpers/HNFTData.js";
import axios, { AxiosResponse } from "axios";
import queryString from 'query-string';
import * as path from 'path';
import * as fs from 'fs';

/**
 * A class representing the MIR4 NFT retrieve controller.
 *
 * @version 1.0.0
 * @since 04/09/23
 * @author
 *  - Devitrax
 */
export default class CRetrieveCharacterNft implements APIController {

    private readonly _client: Client

    constructor(client: Client) {
        this._client = client
    }

    /**
     * Retrieves all NFTs from all pages.
     *
     * @param {NFTListRequest} request - The request object for fetching NFTs.
     * @returns {Promise<void>} A promise that resolves when the NFTs are retrieved.
     */
    async fetch(request: NFTListRequest): Promise<void> {
        try {
            if (!process.env.MIR4_CHARACTER_NFT_URL) {
                CLogger.error(`[${import.meta.url}] The MIR4_CHARACTER_NFT_URL environment variable is not set.`);
                return;
            }

            const listUrl: string = `${process.env.MIR4_CHARACTER_NFT_URL}?${queryString.stringify(request)}`;
            const listResponse: AxiosResponse<NFTListResponse, any> = await axios.get<NFTListResponse>(listUrl);
            const totalPages: number = Math.ceil(listResponse.data.data.totalCount / 20);

            const filePath: string = `${process.cwd()}/src/modules/mir4/nft/resources/data/users/nfts-${request.languageCode}.json`;
            const directoryPath: string = path.dirname(filePath);

            if (!fs.existsSync(directoryPath)) {
                fs.mkdirSync(directoryPath, { recursive: true });
            }

            if (!fs.existsSync(filePath)) {
                fs.writeFileSync(filePath, '[]');
            }

            const file: string = fs.readFileSync(filePath, 'utf-8')
            const oldNft: List[] = JSON.parse(file)
            let newNft: List[] = [];

            for (let i = 1; i <= totalPages; i++) {
                CLogger.info(`[${import.meta.url}] Retrieving MIR4 NFT Characters: ${i} of ${totalPages}.`)

                request.page = i;
                newNft = newNft.concat(
                    await this.fetchNft(request)
                )
            }

            const removedNft: List[] = oldNft.filter((nft: List) => !newNft.some((newNft: List) => newNft.transportID === nft.transportID))
            const addedNft: List[] = newNft.filter((newNft: List) => !oldNft.some((nft: List) => newNft.transportID === nft.transportID))

            if (removedNft.length > 0) {
                CLogger.info(`[${import.meta.url}] Removing ${removedNft.length} NFT items from (${filePath}).`)
                removedNft.forEach((nft: List) => {
                    const index: number = oldNft.findIndex((item: List) => item.transportID === nft.transportID)
                    oldNft.splice(index, 1)
                    this.notify(nft, "Sold")
                });
            }

            if (addedNft.length > 0) {
                CLogger.info(`[${import.meta.url}] Adding ${addedNft.length} NFT items to (${filePath}).`)
                addedNft.forEach((nft: List) => {
                    oldNft.push(nft)
                    this.notify(nft, "Sale")
                });
            }

            if (removedNft.length > 0 || addedNft.length > 0) {
                CLogger.info(`[${import.meta.url}] Updating nft list (${filePath}).`);
                fs.writeFileSync(filePath, JSON.stringify(oldNft))
            }

        } catch (error) {
            CLogger.error(`[${import.meta.url}] API Error > NFT List Request: (${error})`);
        }
    }

    /**
     * Fetches the NFT data and corresponding spirit data for the given request.
     * 
     * @param {NFTListRequest} request - The NFTListRequest object containing the request parameters. 
     * @returns {Promise<List[]>} - Returns a promise that resolves with void.
     */
    async fetchNft(request: NFTListRequest): Promise<List[]> {

        const listNfts: List[] = [];

        try {
            const listUrl: string = `${process.env.MIR4_CHARACTER_NFT_URL}?${queryString.stringify(request)}`;
            const listResponse: AxiosResponse<NFTListResponse, any> = await axios.get<NFTListResponse>(listUrl)

            await Promise.all(listResponse.data.data.lists.map(async (nft: List) => {
                CLogger.info(`[${import.meta.url}] Retrieving MIR4 NFT Data: ${nft.characterName}`);
                listNfts.push(nft)

                // await this.fetchSpirit({
                //     transportID: nft.transportID,
                //     languageCode: request.languageCode
                // }, nft);

                // await this.fetchSkills({
                //     transportID: nft.transportID,
                //     class: nft.class,
                //     languageCode: request.languageCode
                // }, nft);

            }));
        } catch (error) {
            CLogger.error(`[${import.meta.url}] API Error > NFT List Request: (${error})`);
        }

        return listNfts;
    }

    /**
     * Sends a notification message to the specified text channel containing the details of the updated NFT list.
     * 
     * @param {List} nft - The NFT list to be notified about.
     * @param {string} mode - The mode in which the NFT list is being updated (e.g. added or removed).
     * @returns {void}
     */
    notify(nft: List, mode: string): void {
        const channel = HTextChat.getSpecificServerTextChannelByName(this._client, "MIR4 Atlas", "【💬】lobby")

        if (!channel) {
            CLogger.error(`[${import.meta.url}] Channel does not exist.`);
            return;
        }

        if (!process.env.MIR4_CHARACTER_NFT_PROFILE_URL) {
            CLogger.error(`[${import.meta.url}] The MIR4_CHARACTER_NFT_PROFILE_URL environment variable is not set.`);
            return;
        }

        const embed: EmbedBuilder = new EmbedBuilder()
            .setTitle(`[${mode}] NFT List is updated`)
            .setDescription(`**From your story, to our legacyFrom your story, to our legacy**. Character NFT is an innovation that takes game asset ownership to the next level by tokenizing your unique character, storing unique character data on the WEMIX blockchain.`)
            .setColor(Colors.Green)
            .setURL(`${process.env.MIR4_CHARACTER_NFT_PROFILE_URL}${nft.seq}`)
            .setThumbnail("https://file.mir4global.com/xdraco/img/desktop/subnav/logo-nft.webp")
            .setImage("https://file.mir4global.com/xdraco-thumb/card-nft/arbalist-grade4.webp")
            .setFooter({
                text: `# ${nft.seq}`,
                iconURL: "https://coinalpha.app/images/coin/1_20211022025215.png",
            })
            .addFields({
                name: `Name`,
                value: "```" + nft.characterName + "```",
                inline: true
            }, {
                name: `Level`,
                value: "```" + nft.lv + "```",
                inline: true
            }, {
                name: `Class`,
                value: "```" + HNFTData.getClassNameById(nft.class) + "```",
                inline: true
            }, {
                name: `Power Score`,
                value: "```" + nft.powerScore + "```",
                inline: true
            }, {
                name: `Mirage Score`,
                value: "```" + nft.MirageScore + "```",
                inline: true
            }, {
                name: `Price`,
                value: "```" + nft.price + "```",
                inline: true
            })

        channel.send({
            embeds: [
                embed
            ]
        })
    }

}
