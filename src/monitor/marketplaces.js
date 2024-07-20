import { config } from "dotenv";
config();

import meEndpoints from "../magic-eden/endpoints.js"

export class Marketplaces {
    static MAGIC_EDEN = {
        name: "Magic Eden",
        url: process.env.ME_ENDPOINT,
        key: process.env.ME_APIKEY,
        endpoints: meEndpoints,
        enabled: true
    }

    static retrieveEnabledMarketplaces() {
        let marketplaces = [];

        for (const p of Object.getOwnPropertyNames(Marketplaces)) {
            if (Marketplaces[p].enabled) {
                marketplaces.push(Marketplaces[p])
            }
        }

        return marketplaces;
    }
}