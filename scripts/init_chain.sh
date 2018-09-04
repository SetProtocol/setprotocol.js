# #!/bin/bash

SET_PROTOCOL_JS=`pwd`/node_modules/setprotocol.js

rm -rf blockchain && cp -r snapshots/set_protocol blockchain

BLOCKCHAIN="${SET_PROTOCOL_JS}/blockchain"

echo -e "${YELLOW} *     *             *     *        *${NO_COLOR}"
echo -e "${YELLOW}           *       *                 ${NO_COLOR}"
echo -e "${YELLOW}   *         * ▓▓▒▒▒▒▒░ *    *       ${NO_COLOR}"
echo -e "${YELLOW}          *  ▓▓▓▒▒▒▒▒░░░░          * ${NO_COLOR}"
echo -e "${YELLOW}*           ▓▓▓▓▒▒▒▒▒░░░░░*          ${NO_COLOR}"
echo -e "${YELLOW}     *      ▓▓▓▓▓▓▒▒▒░░░░░           ${NO_COLOR}"
echo -e "${YELLOW}             ▓▓▓▓▓▓▓▒▒░░░        *   ${NO_COLOR}"
echo -e "${YELLOW}    *    *    ▓▓▓▓▓▓▓▓▓▓             ${NO_COLOR}"
echo -e "${YELLOW}             ░░░▒▒▓▓▓▓▓▓▓   *        ${NO_COLOR}"
echo -e "${YELLOW}*           ░░░░░▒▒▒▓▓▓▓▓▓           ${NO_COLOR}"
echo -e "${YELLOW}      *     ░░░░░▒▒▒▒▒▓▓▓▓      *  * ${NO_COLOR}"
echo -e "${YELLOW}            *░░░░▒▒▒▒▒▓▓▓            ${NO_COLOR}"
echo -e "${YELLOW}               ░▒▒▒▒▒▓▓  *           ${NO_COLOR}"
echo -e "${YELLOW} *          *        *  *   *      * ${NO_COLOR}"
echo -e "${YELLOW}╔═══════════════════════════════════╗${NO_COLOR}"
echo -e "${YELLOW}║                                   ║${NO_COLOR}"
echo -e "${YELLOW}║   █▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀█   ║${NO_COLOR}"
echo -e "${YELLOW}║   █                           █   ║${NO_COLOR}"
echo -e "${YELLOW}║   █  Welcome to Set Protocol  █   ║${NO_COLOR}"
echo -e "${YELLOW}║   █                           █   ║${NO_COLOR}"
echo -e "${YELLOW}║   █▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄█   ║${NO_COLOR}"
echo -e "${YELLOW}║                                   ║${NO_COLOR}"
echo -e "${YELLOW}║      Your journey awaits you      ║${NO_COLOR}"
echo -e "${YELLOW}║         Settler of Tokan          ║${NO_COLOR}"
echo -e "${YELLOW}║                                   ║${NO_COLOR}"
echo -e "${YELLOW}║         Vires in Numeris          ║${NO_COLOR}"
echo -e "${YELLOW}║                                   ║${NO_COLOR}"
echo -e "${YELLOW}╚═══════════════════════════════════╝${NO_COLOR}"
echo -e "\n"

echo -e "${GREEN}Dependency contract migrations complete, test chain is ready for use!${NO_COLOR}"
echo -e "${GREEN}Artifacts for the contracts deployed to the test chain can be imported directly from the \
SetProtocol/set-protocol-contracts package.${NO_COLOR}"

ganache-cli --db $BLOCKCHAIN --networkId 50 --accounts 20 -l 10000000 -e 10000000000 --mnemonic 'concert load couple harbor equip island argue ramp clarify fence smart topic'