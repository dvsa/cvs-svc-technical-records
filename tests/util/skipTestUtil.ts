import Configuration from "../../src/utils/Configuration";

export const itIf = Configuration.getInstance().getAllowAdrUpdatesOnlyFlag() ? it.skip : it;

export const doNotSkipAssertion = !Configuration.getInstance().getAllowAdrUpdatesOnlyFlag();
