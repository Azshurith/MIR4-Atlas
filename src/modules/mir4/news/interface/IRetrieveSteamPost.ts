import { DefaultRequest } from "../../../core/interface/requests/IDefaultRequest";

/**
 * Represents the interface for the Steam post
 * 
 * @version 1.0.0
 * @since 04/09/23
 * @author
 *  - Devitrax
 */
export interface SteamPostRequest extends DefaultRequest {
    appId: string
    token: string
}

export interface SteamPostResponse {
    gid: string;
    title: string;
    url: string;
    is_external_url: boolean;
    author: string;
    contents: string;
    feedlabel: string;
    date: number;
    feedname: string;
    feed_type: number;
    appid: number;
}

export enum Feedname {
    SteamCommunityAnnouncements = "steam_community_announcements",
}
