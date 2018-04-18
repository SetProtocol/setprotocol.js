
# #!/bin/bash
SET_PROTOCOL_JS_REPO=`pwd`

bash $SET_PROTOCOL_JS_REPO/scripts/migrate_set_protocol_contracts.sh &

ganache-cli --networkId 70 --accounts 20 --mnemonic 'candy maple cake sugar pudding cream honey rich booboo crumble sweet treat'
