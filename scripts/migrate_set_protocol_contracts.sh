# #!/bin/bash

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NO_COLOR='\033[0m'

mkdir -p logs

CURRENT_DIR=`pwd`
LOGS=$CURRENT_DIR/logs/set_protocol_contract_migration.txt

SET_PROTOCOL_SMART_CONTRACTS=$CURRENT_DIR/node_modules/set-protocol-contracts

BLOCKCHAIN=$CURRENT_DIR/node_modules/setprotocol.js/blockchain

cd $SET_PROTOCOL_SMART_CONTRACTS

sleep 3

echo -e "${CYAN}Installing Set Protocol contract deployment dependencies...${NO_COLOR}"
yarn install >> $LOGS 2>&1
echo -e "\n"

echo -e "${CYAN}Transpiling newly generated artifacts for usage in the setProtocol.js repo...${NO_COLOR}"
yarn run dist >> $LOGS 2>&1
echo -e "\n"

echo -e "${CYAN}Running Set Protocol smart contract migrations...${NO_COLOR}"
truffle migrate --network development
echo -e "\n"

echo -e "${CYAN}Set Protocol Contracts migration complete!${NO_COLOR}"
echo -e "\n"

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
