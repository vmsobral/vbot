import monitor from "./monitor/monitor.js"

async function run() {
    // function jsonToURLParams(jsonObj) {
    //     let string = ''; for (key in jsonObj) { string += key + '=' + jsonObj[key] + '&'; } return string.slice(0, -1);
    // }

    // let paramsURL = jsonToURLParams({
    //     feerateTier: 'halfHourFee',
    //     address: paymentAddress,
    //     buyerPublicKey: publicKey
    // });

    monitor.run();
}

run().then(
    () => { console.log("Application Running") },
    err => {
        if (err.response) {
            console.log(err.response.status, err.response.headers, err.response.data);
        } else {
            console.log(err);
        }
    }
);