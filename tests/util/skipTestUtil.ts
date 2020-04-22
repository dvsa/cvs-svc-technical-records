import Configuration from "../../src/utils/Configuration";

export const doNotSkipAssertionWhenAdrFlagIsDisabled = !Configuration.getInstance().getAllowAdrUpdatesOnlyFlag();
