import { CoinGeckoClient } from "coingecko-api-v3"
import { DefaultRequest } from "../../../core/interface/requests/IDefaultRequest";

/**
 * Represents the interface for the NFT Currency
 * 
 * @version 1.0.0
 * @since 04/16/23
 * @author
 *  - Devitrax
 */
export interface NFTCurrencyRequest extends DefaultRequest {
    client: CoinGeckoClient
}