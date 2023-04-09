import { APIController } from "../../../core/interface/controllers/APIController";
import { NFTListRequest, NFTListResponse, List, CharacterSpiritRequest, CharacterSpiritResponse, Inven, CharacterSkillsRequest, CharacterSkillResponse, Datum } from "../interface/IRetrieveCharacterNft";
import CLogger from "../../../core/interface/utilities/logger/controllers/CLogger.js";
import axios, { AxiosResponse } from "axios";
import queryString from 'query-string';
import * as fs from 'fs';
import * as path from 'path';

/**
 * A class representing the MIR4 NFT retrieve controller.
 *
 * @version 1.0.0
 * @since 04/09/23
 * @author
 *  - Devitrax
 */
export default class CRetrieveCharacterNft implements APIController {

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

                await this.fetchSpirit({
                    transportID: nft.transportID,
                    languageCode: request.languageCode
                }, nft);

                await this.fetchSkill({
                    transportID: nft.transportID,
                    class: nft.class,
                    languageCode: request.languageCode
                }, nft);
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
                CLogger.error(`[${import.meta.url}] The MIR4_CHARACTER_SPIRIT_URL environment variable is not set.`)
                return;
            }

            const spiritUrl = `${process.env.MIR4_CHARACTER_SPIRIT_URL}?${queryString.stringify(request)}`
            const spiritResponse: AxiosResponse<CharacterSpiritResponse, any> = await axios.get<CharacterSpiritResponse>(spiritUrl)
            const filePath = `${process.cwd()}/src/modules/mir4/nft/resources/data/spirits/Spirits-${request.languageCode}.json`;
            const directoryPath = path.dirname(filePath);

            if (!fs.existsSync(directoryPath)) {
                fs.mkdirSync(directoryPath, { recursive: true });
            }

            if (!fs.existsSync(filePath)) {
                fs.writeFileSync(filePath, '[]');
            }

            const file = fs.readFileSync(filePath, 'utf-8')
            const modifiedSpirits: Inven[] = JSON.parse(file)
            const oldSpirits = [...modifiedSpirits]

            spiritResponse.data.data.inven.forEach(spirit => {
                if (!modifiedSpirits.some(cacheSpirit => cacheSpirit.petName === spirit.petName)) {
                    modifiedSpirits.push(spirit);
                }
            })

            if (JSON.stringify(modifiedSpirits) !== JSON.stringify(oldSpirits)) {
                fs.writeFileSync(filePath, JSON.stringify(modifiedSpirits))
            }
        } catch (error) {
            CLogger.error(`[${import.meta.url}] API Error > Spirit Fetch Request: (${error})`);
        };
    }

    /**
     * Fetches the skill data for a given NFT.
     * 
     * @param {CharacterSkillsRequest} request The request containing the transportID and languageCode for the skill data to be fetched.
     * @param {List} nft The NFT for which the skill data is to be fetched.
     * @returns {Promise<void>} - Returns a promise that resolves with void.
     */
    async fetchSkill(request: CharacterSkillsRequest, nft: List): Promise<void> {
        try {
            CLogger.info(`[${import.meta.url}] Retrieving MIR4 Skill Data: ${nft.characterName}`);

            if (!process.env.MIR4_CHARACTER_SKILL_URL) {
                CLogger.error(`[${import.meta.url}] The MIR4_CHARACTER_SKILL_URL environment variable is not set.`)
                return;
            }

            const skillUrl = `${process.env.MIR4_CHARACTER_SKILL_URL}?${queryString.stringify(request)}`
            const skillResponse: AxiosResponse<CharacterSkillResponse, any> = await axios.get<CharacterSkillResponse>(skillUrl)
            const filePath = `${process.cwd()}/src/modules/mir4/nft/resources/data/skills/${nft.class}-${request.languageCode}.json`;
            const directoryPath = path.dirname(filePath);

            if (!fs.existsSync(directoryPath)) {
                fs.mkdirSync(directoryPath, { recursive: true });
            }

            if (!fs.existsSync(filePath)) {
                fs.writeFileSync(filePath, '[]');
            }

            const file = fs.readFileSync(filePath, 'utf-8')
            const modifiedSkills: Datum[] = JSON.parse(file)
            const oldSkills = [...modifiedSkills]

            skillResponse.data.data.forEach(skill => {
                if (!modifiedSkills.some(cacheSkill => cacheSkill.skillName === skill.skillName)) {
                    modifiedSkills.push(skill);
                }
            })

            if (JSON.stringify(modifiedSkills) !== JSON.stringify(oldSkills)) {
                fs.writeFileSync(filePath, JSON.stringify(modifiedSkills))
            }

        } catch (error) {
            CLogger.error(`[${import.meta.url}] API Error > Skill Fetch Request: (${error})`);
        };
    }

}
