import { Client } from "../client.js";
import { Marketplaces } from "./marketplaces.js";

const client = new Client();

async function cooldown(timeout) {
    return new Promise(resolve => setTimeout(resolve, timeout));
}

async function monitorCollectionFloorPrice(mp, floorPrice) {
    const params = "collectionSymbol=aeonsbtc&kind=list&limit=20";
    const url = `${mp.url}/${mp.endpoints.getActivities}?${params}`;

    const activities = await client.makeRequestWithFaultTolerance(url);

    // console.log(activities);

    for (const activity of activities.activities) {

        const listTime = new Date(activity.createdAt);
        const isLessThan30s = ((new Date()).getTime() - listTime.getTime()) < 30000;

        // const isPriceLow = floorPrice * 0.95 >= activity.listedPrice;
        const isPriceLow = floorPrice > activity.listePrice;

        if (isLessThan30s && isPriceLow) {
            const coll = activity.collectionSymbol;
            console.log(`Someone listed a ${coll} below floor`);
            console.log(`List price: ${activity.listedPrice/100000000}`);
            console.log(`Inscription Number: ${activity.tokenInscriptionNumber}`);
            console.log();

            floorPrice = activity.listedPrice;
        }
    }

    await cooldown(30000);
    monitorCollectionFloorPrice(mp, floorPrice);
}

async function run() {

    for (const mp of Marketplaces.retrieveEnabledMarketplaces()) {

        const params = "collectionSymbol=aeonsbtc";
        const url = `${mp.url}/${mp.endpoints.getCollectionStats}?${params}`;

        const collStats = await client.makeRequestWithFaultTolerance(url, null);

        monitorCollectionFloorPrice(mp, collStats.floorPrice);
    };

}

export default { run }