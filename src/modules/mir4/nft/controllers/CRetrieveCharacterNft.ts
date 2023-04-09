import { APIController } from "../../../core/interface/controllers/APIController";
import { NFTListRequest, NFTListResponse, List, CharacterSpiritRequest, CharacterSpiritResponse, Inven, CharacterSkillsRequest, CharacterSkillResponse, Datum } from "../interface/IRetrieveCharacterNft";
import CLogger from "../../../core/interface/utilities/logger/controllers/CLogger.js";
import axios, { AxiosResponse } from "axios";
import queryString from 'query-string';
import * as path from 'path';
import fsExtraPkg from 'fs-extra';
const { ensureDir, outputJson } = fsExtraPkg;
import lodashPkg from 'lodash';
import { Embed, EmbedBuilder } from "discord.js";
import { Client } from "discordx";
const { isEqual } = lodashPkg;

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

            for (let i = 1; i <= totalPages; i++) {
                CLogger.info(`[${import.meta.url}] Retrieving MIR4 NFT Characters: ${i} of ${totalPages}.`);
                request.page = i;
                await this.fetchNft(request);
            }
        } catch (error) {
            CLogger.error(`[${import.meta.url}] API Error > NFT List Request: (${error})`);
        }
    }

    /**
     * Fetches the NFT data and corresponding spirit data for the given request.
     * 
     * @param {NFTListRequest} request - The NFTListRequest object containing the request parameters. 
     * @returns {Promise<void>} - Returns a promise that resolves with void.
     */
    async fetchNft(request: NFTListRequest): Promise<void> {
        try {
            if (!process.env.MIR4_CHARACTER_NFT_URL) {
                CLogger.error(`[${import.meta.url}] The MIR4_CHARACTER_NFT_URL environment variable is not set.`);
                return;
            }

            const listUrl: string = `${process.env.MIR4_CHARACTER_NFT_URL}?${queryString.stringify(request)}`;
            const listResponse: AxiosResponse<NFTListResponse, any> = await axios.get<NFTListResponse>(listUrl)

            await Promise.all(listResponse.data.data.lists.map(async (nft: List) => {
                CLogger.info(`[${import.meta.url}] Retrieving MIR4 NFT Data: ${nft.characterName}`);

                const filePath = `${process.cwd()}/src/modules/mir4/nft/resources/data/users/${nft.nftID}-${request.languageCode}.json`;
                const playerNft = await this.saveDataToFile<List[]>(filePath, []);
                const playerModifiedNft = [nft];

                await this.fetchSpirit({
                    transportID: nft.transportID,
                    languageCode: request.languageCode
                }, nft);

                await this.fetchSkills({
                    transportID: nft.transportID,
                    class: nft.class,
                    languageCode: request.languageCode
                }, nft);

                if (!isEqual(playerModifiedNft, playerNft)) {
                    await this.saveDataToFile(filePath, playerModifiedNft);

                    /***
                     * TEST LAYOUT ONLY
                     */
                    const guild = this._client.guilds.cache.find(guild => guild.name === "MIR4 Atlas");
                    if (guild) {
                        const channel = guild.channels.cache.find(channel => channel.name === '【💬】lobby');
                        if (channel && channel.isTextBased()) {
                            channel.send({
                                embeds: [new EmbedBuilder()
                                    .setTitle(`[NEW] ${nft.characterName}`)
                                    .setDescription(`A new level ${nft.lv} ${nft.class} is posted in the NFT Page, for a price of ${nft.price} WEMIX. Click Here to open the NFT page.`)
                                    .setImage(`https://file.mir4global.com/xdraco-thumb/card-nft/arbalist-grade5.webp`)
                                    .addFields({
                                        name: `Name`,
                                        value: "```" + nft.characterName + "```",
                                        inline: true
                                    }).addFields({
                                        name: `Level`,
                                        value: "```" + nft.lv + "```",
                                        inline: true
                                    }).addFields({
                                        name: `Power Score`,
                                        value: "```" + nft.powerScore + "```",
                                        inline: true
                                    })
                                ]
                            });
                        } else {
                            console.log(`Could not find #general channel in MIR4 Atlas`);
                        }
                    } else {
                        console.log(`Could not find server with name MIR4 Atlas`);
                    }
                }
            }));
        } catch (error) {
            CLogger.error(`[${import.meta.url}] API Error > NFT List Request: (${error})`);
        }
    }

    /**
     * Fetches the spirit data for a given NFT.
     * 
     * @param {CharacterSpiritRequest} request The request containing the transportID and languageCode for the spirit data to be fetched.
     * @param {List} nft The NFT for which the spirit data is to be fetched.
     * @returns {Promise<void>} - Returns a promise that resolves with void.
     */
    async fetchSpirit(request: CharacterSpiritRequest, nft: List): Promise<void> {
        try {
            CLogger.info(`[${import.meta.url}] Retrieving MIR4 Spirit Data: ${nft.characterName}`);

            if (!process.env.MIR4_CHARACTER_SPIRIT_URL) {
                CLogger.error(`[${import.meta.url}] The MIR4_CHARACTER_SPIRIT_URL environment variable is not set.`);
                return;
            }

            const spiritUrl = `${process.env.MIR4_CHARACTER_SPIRIT_URL}?${queryString.stringify(request)}`;
            const spiritResponse: AxiosResponse<CharacterSpiritResponse, any> = await axios.get<CharacterSpiritResponse>(spiritUrl);

            // Save to Library and Player
            const libraryFilePath = `${process.cwd()}/src/modules/mir4/nft/resources/data/spirits/Spirits-${request.languageCode}.json`;
            const playerFilePath = `${process.cwd()}/src/modules/mir4/nft/resources/data/users/spirits/${nft.nftID}-${request.languageCode}.json`;

            const librarySpirits = await this.saveDataToFile<Inven[]>(libraryFilePath, []);
            const playerSpirits = await this.saveDataToFile<Inven[]>(playerFilePath, []);

            const newSpirits = new Set([...spiritResponse.data.data.inven]);
            const libraryModifiedSpirits = [...newSpirits];
            const playerModifiedSpirits = [...spiritResponse.data.data.inven];

            if (!isEqual(libraryModifiedSpirits, librarySpirits)) {
                await this.saveDataToFile(libraryFilePath, libraryModifiedSpirits);
            }

            if (!isEqual(playerModifiedSpirits, playerSpirits)) {
                await this.saveDataToFile(playerFilePath, playerModifiedSpirits);
            }
        } catch (error) {
            CLogger.error(`[${import.meta.url}] API Error > Spirit Fetch Request: (${error})`);
        }
    }

    /**
     * Fetches the skills data for a given NFT.
     * 
     * @param {CharacterSkillsRequest} request The request containing the transportID and languageCode for the skill data to be fetched.
     * @param {List} nft The NFT for which the skill data is to be fetched.
     * @returns {Promise<void>} - Returns a promise that resolves with void.
     */
    async fetchSkills(request: CharacterSkillsRequest, nft: List): Promise<void> {
        try {
            CLogger.info(`[${import.meta.url}] Retrieving MIR4 Skill Data: ${nft.characterName}`);

            if (!process.env.MIR4_CHARACTER_SKILL_URL) {
                CLogger.error(`[${import.meta.url}] The MIR4_CHARACTER_SKILL_URL environment variable is not set.`);
                return;
            }

            const skillUrl = `${process.env.MIR4_CHARACTER_SKILL_URL}?${queryString.stringify(request)}`;
            const skillResponse: AxiosResponse<CharacterSkillResponse, any> = await axios.get<CharacterSkillResponse>(skillUrl);

            // Save to Library and Player
            const libraryFilePath = `${process.cwd()}/src/modules/mir4/nft/resources/data/skills/${nft.class}-${request.languageCode}.json`;
            const playerFilePath = `${process.cwd()}/src/modules/mir4/nft/resources/data/users/skills/${nft.nftID}-${request.languageCode}.json`;

            const librarySkills = await this.saveDataToFile<Inven[]>(libraryFilePath, []);
            const playerSkills = await this.saveDataToFile<Inven[]>(playerFilePath, []);

            const newSkills = new Set([...skillResponse.data.data]);
            const libraryModifiedSkills = [...newSkills];
            const playerModifiedSkills = [...skillResponse.data.data];

            libraryModifiedSkills.forEach(librarySkill => {
                librarySkill.skillLevel = "Library Data";
            })

            if (!isEqual(libraryModifiedSkills, librarySkills)) {
                await this.saveDataToFile(libraryFilePath, libraryModifiedSkills);
            }

            if (!isEqual(playerModifiedSkills, playerSkills)) {
                await this.saveDataToFile(playerFilePath, playerModifiedSkills);
            }
        } catch (error) {
            CLogger.error(`[${import.meta.url}] API Error > Skills Fetch Request: (${error})`);
        }
    }

    /**
     * Writes an array of data to a JSON file at the specified file path.
     * 
     * @template T
     * @param {string} filePath - The file path to save the data to.
     * @param {T[]} data - The array of data to be saved to the file.
     * @returns {Promise<void>} - A promise that resolves with undefined once the data is saved to the file.
     */
    async saveDataToFile<T>(filePath: string, data: T[]): Promise<void> {
        await ensureDir(path.dirname(filePath));
        return await outputJson(filePath, data, { spaces: 2 });
    }

}
