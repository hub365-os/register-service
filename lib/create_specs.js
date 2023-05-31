/* eslint-disable no-await-in-loop */
const Axios = require('axios').default;
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const Specs = [];

const CreateSpecs = async () => {
    const codeVerifier = crypto.randomBytes(32).toString('base64url');
    const codeChallenge = crypto.createHash('SHA256').update(codeVerifier).digest('base64url');
    fs.writeFileSync(path.join(__dirname, 'code_verifier.txt'), codeVerifier);

    const { data: token } = await Axios({
        method: 'POST',
        url: `${ process.env.HUB_SERVICE_AUTHENTICATION }/servicetoken`,
        data: {
            codeChallenge,
            service: `${ process.env.HUB_SERVICE_TYPE }-${ process.env.HUB_SERVICE_NAME }`,
            scopes: [
                `service.${ process.env.HUB_SERVICE_TYPE }.all`,
            ],
        },
    });

    const { data: services } = await Axios({
        method: 'GET',
        url: `${ process.env.HUB_SERVICE_CORE }/services`,
        params: {
            type: process.env.HUB_SERVICE_TYPE,
            search: process.env.HUB_SERVICE_NAME,
        },
        headers: {
            authorization: `Bearer ${ token.value.value }`,
        },
    });
    if (services.value.values.length === 0) {
        await Axios({
            method: 'POST',
            url: `${ process.env.HUB_SERVICE_CORE }/services`,
            data: {
                type: process.env.HUB_SERVICE_TYPE,
                name: process.env.HUB_SERVICE_NAME,
                url: `http://hub365-os-service-${ process.env.HUB_SERVICE }-${ process.env.HUB_SERVICE_NAME }-service.hub365.svc.cluster.local`,
            },
            headers: {
                authorization: `Bearer ${ token.value.value }`,
            },
        });
    }

    const { data: apis } = await Axios({
        method: 'GET',
        url: `${ process.env.HUB_SERVICE_CORE }/serviceapis`,
        params: {
            service: process.env.HUB_SERVICE_TYPE,
            service_name: process.env.HUB_SERVICE_NAME,
        },
        headers: {
            authorization: `Bearer ${ token.value.value }`,
        },
    });
    if (apis.value.values.length === 0) {
        for (let i = 0; i < Specs.length; i += 1) {
            const spec = Specs[ i ];
            await Axios({
                method: 'POST',
                url: `${ process.env.HUB_SERVICE_CORE }/serviceapis`,
                params: {
                    service: process.env.HUB_SERVICE_TYPE,
                    service_name: process.env.HUB_SERVICE_NAME,
                },
                data: spec,
                headers: {
                    authorization: `Bearer ${ token.value.value }`,
                },
            });
        }
    }
};

module.exports = CreateSpecs;
