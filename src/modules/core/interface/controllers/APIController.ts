import { DefaultRequest } from "../requests/IDefaultRequest";

/**
 * Represents the interface for an API Controller.
 *
 * @version 1.0.0
 * @since 04/09/23
 * @authur Devitrax
 */
export interface APIController {
    
    /**
     * Fetches data from the API.
     *
     * @param {DefaultRequest} request - The request configuration.
     * @returns {Promise<void>} A promise that resolves when the data is fetched.
     */
    fetch(request: DefaultRequest): Promise<void>;
}