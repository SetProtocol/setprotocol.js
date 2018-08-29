import * as chai from 'chai';
import ChaiAsPromised = require('chai-as-promised');

export class ChaiSetup {
    private isConfigured: boolean;

    constructor() {
        this.isConfigured = false;
    }

    public configure() {
        if (this.isConfigured) {
            return;
        }

        chai.config.includeStack = true;
        chai.use(require('chai-bignumber')());
        chai.use(ChaiAsPromised);
        this.isConfigured = true;
    }
}

export default new ChaiSetup();
