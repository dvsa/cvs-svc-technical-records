import Configuration from "../../src/utils/Configuration";

export const doNotSkipAssertion = !Configuration.getInstance().getAllowAdrUpdatesOnlyFlag();
