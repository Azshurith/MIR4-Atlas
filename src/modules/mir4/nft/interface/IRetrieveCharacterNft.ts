import { DefaultRequest } from "../../../core/interface/requests/IDefaultRequest";

/**
 * Represents the interface for the NFT List
 * 
 * @version 1.0.0
 * @since 04/09/23
 * @author
 *  - Devitrax
 */
export interface NFTListRequest extends DefaultRequest {
    listType: string;
    class: number;
    levMin: number;
    levMax: number;
    powerMin: number;
    powerMax: number;
    priceMin: number;
    priceMax: number;
    sort: string;
    page: number;
    languageCode: string;
}

export interface Root {
    code: number
    data: Data
}

export interface Data {
    firstID: number
    totalCount: number
    more: number
    lists: List[]
}

export interface List {
    rowID: number
    seq: number
    transportID: number
    nftID: string
    sealedDT: number
    characterName: string
    class: number
    lv: number
    powerScore: number
    price: number
    MirageScore: number
    MiraX: number
    Reinforce: number
    stat: Stat[]
}

export interface Stat {
    statName: string
    statValue: number
}
