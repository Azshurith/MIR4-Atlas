/**
 * A class representing a NFT Data Helper
 *
 * @version 1.0.0
 * @since 04/10/23
 * @author
 *  - Devitrax
 */
export default class HNFTData {

    /**
     * Retrieves class name
     *
     * @param {number} classId
     * @return {string} class name for embed
     */
    static getClassNameById(classId: number): string {
        switch (classId) {
            case 1: return "Warrior"
            case 2: return "Sorcerer"
            case 3: return "Taoist"
            case 4: return "Arbalist"
            case 5: return "Darkist"
            default: return "Lancer"
        }
    }

}