# #!/bin/bash

SET_PROTOCOL_JS=`pwd`/node_modules/setprotocol.js

BLOCKCHAIN="${SET_PROTOCOL_JS}/blockchain"

bash $SET_PROTOCOL_JS/scripts/migrate_set_protocol_contracts.sh &

ganache-cli --db $BLOCKCHAIN --networkId 50 --accounts 20 -l 10000000 -e 10000000000 --mnemonic 'concert load couple harbor equip island argue ramp clarify fence smart topic'
