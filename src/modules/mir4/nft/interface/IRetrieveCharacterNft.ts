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

export interface NFTListResponse {
    code: number
    data: ListData
}

export interface ListData {
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

export interface CharacterSpiritRequest extends DefaultRequest {
    transportID: number;
    languageCode: string;
}

export interface CharacterSpiritResponse {
    code: number;
    data: SpiritData;
}

export interface SpiritData {
    equip: { [key: string]: { [key: string]: Inven } };
    inven: Inven[];
}

export interface Inven {
    transcend: number;
    grade: number;
    petName: string;
    petOrigin: PetOrigin;
    iconPath: string;
}

export enum PetOrigin {
    EarthSpirit = "Earth Spirit",
    FireSpirit = "Fire Spirit",
    ForestSpirit = "Forest Spirit",
    LightSpirit = "Light Spirit",
    WaterSpirit = "Water Spirit",
    WindSpirit = "Wind Spirit",
}

export interface CharacterSkillsRequest extends DefaultRequest {
    transportID: number;
    class: number;
    languageCode: string;
}

export interface CharacterSkillResponse {
    code: number;
    data: Datum[];
}

export interface Datum {
    skillLevel: string;
    skillName:  string;
}

export interface Nft {
    transportID: number
    nftID: string
    characterName: string
}