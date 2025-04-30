import { request } from 'undici';
import pWaitFor from 'p-wait-for';
import { BASE_URL_TRADE_IMPORTS_DECISION_COMPARER, AUTHORIZATION_HEADER, TRADE_IMPORTS_DECISION_COMPARER_USER, TRADE_IMPORTS_DECISION_COMPARER_KEY } from '../config.js';

export async function waitForDecision(mrn, timeout = 60000, interval = 3000) {
    const url = `${BASE_URL_TRADE_IMPORTS_DECISION_COMPARER}/decisions/${mrn}`;
     
    let responseText = '';
    console.log(TRADE_IMPORTS_DECISION_COMPARER_USER)
    console.log(TRADE_IMPORTS_DECISION_COMPARER_KEY)
    console.log(AUTHORIZATION_HEADER)

    await pWaitFor(async () => {
        try {
            const resp = await request(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': AUTHORIZATION_HEADER,
                },
            });

            console.log('Response status:', resp.statusCode);
            console.log('Response headers:', resp.headers);

            responseText = await resp.body.text();

            console.log(url);
            console.log('Response text:', responseText);

            // ToDo: this is too simple for scenarios with multiple/existing decisions.
            // Need adapt this to wait for a new deicision since the initial request. 
            return responseText.includes('"btmsDecision":{"id":"25');
        } catch (error) {
            console.error('Error during request:', error);
            return false;
        }
    }, { interval, timeout });

    return responseText;
}