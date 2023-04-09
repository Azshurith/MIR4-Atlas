import { APIController } from "../../../core/interface/controllers/APIController"
import { NFTListRequest } from "../interface/IRetrieveCharacterNft";
import CLogger from "../../../core/interface/utilities/logger/controllers/CLogger.js";
import axios, { AxiosResponse } from "axios"
import queryString from 'query-string';

/**
 * A class representing the mir4 nft retrieve controller
 *
 * @version 1.0.0
 * @since 04/09/23
 * @author
 *  - Devitrax
 */
export default class CRetrieveCharacterNft implements APIController {

    /**
     * Retrieves all nft from all pages
     *
     * @param {NFTListRequest} request - The request object for fetching NFTs.
     * @returns {Promise<void>} A promise that resolves when the NFTs are retrieved.
     */
    async fetch(request: NFTListRequest): Promise<void> {
        try {

            const url = `${process.env.MIR4_CHARACTER_NFT_URL}?${queryString.stringify(request)}`;

            if (!url) {
                CLogger.error(`[${import.meta.url}] The MIR4_CHARACTER_NFT_URL environment variable is not set.`);
                return;
            }

            console.log(url);
            const response: AxiosResponse = await axios.get(url);

            console.log(response.data);

        } catch (error) {
            CLogger.error(`[${import.meta.url}] API Error > NFT List Request: (${error})`);
        };
    }
}
