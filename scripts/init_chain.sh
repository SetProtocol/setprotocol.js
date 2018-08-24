
# #!/bin/bash
SET_PROTOCOL_JS_REPO=`pwd`

bash $SET_PROTOCOL_JS_REPO/scripts/migrate_set_protocol_contracts.sh &

ganache-cli --db blockchain --networkId 50 --accounts 20 -l 10000000 -e 10000000000 --mnemonic 'concert load couple harbor equip island argue ramp clarify fence smart topic'
