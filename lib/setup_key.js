const fs = require('fs');
const path = require('path');

const Axios = require('axios').default;

const SetupKey = async () => {
    const { data } = await Axios({
        method: 'GET',
        url: `${ process.env.HUB_SERVICE_AUTHENTICATION }/public_key`,
    });
    const jwtLocation = path.join(__dirname, '../.jwt');
    fs.mkdirSync(jwtLocation, { recursive: true });
    fs.writeFileSync(path.join(jwtLocation, 'keyid'), data.value.keyId);
    fs.writeFileSync(path.join(jwtLocation, 'public_key.pem'), data.value.publicKey);
    return true;
};

module.exports = SetupKey;
