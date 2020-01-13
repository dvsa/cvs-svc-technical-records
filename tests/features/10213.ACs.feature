Feature: [BE] | HGV Backend Service | Post Method | Autopopulation

  Scenario: AC1. POST: Partial VIN is autopopulated
    Given I am a consumer of the vehicles API
    And I have completed the "vin" field
    When I submit my request via the POST method
    Then the partialVin is autopopulated, as the last 6 digits of the vin

  Scenario: AC2. POST: Vehicle class code is autopopulated
    Given I am a consumer of the vehicles API
    And I have completed the "vehicle class description" field
    When I submit my request via the POST method
    Then the corresponding vehicle class code is autopopulated, as per the linked excel

  Scenario: AC3. POST: Body type code is autopopulated
    Given I am a consumer of the vehicles API
    And I have completed the "body type description" field
    When I submit my request via the POST method
    Then the corresponding body type code is autopopulated, as per the linked excel
