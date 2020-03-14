# #!/bin/bash

SET_PROTOCOL_JS=`pwd`

rm -rf blockchain && cp -r snapshots/0x-Kyber-Compound blockchain

ganache-cli --db blockchain --networkId 50 --accounts 20 -l 20000000 -e 10000000000 --mnemonic 'concert load couple harbor equip island argue ramp clarify fence smart topic'
