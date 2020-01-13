Feature: [BE] | HGV Backend Service | Put Method | Autopopulation

  Scenario: AC1. PUT: Vehicle class code is autopopulated
    Given I am a consumer of the vehicles API
    And I have completed the "vehicle class description" field
    When I submit my request via the PUT method
    Then the corresponding vehicle class code is autopopulated, as per the linked excel

  Scenario: AC2. PUT: Body type code is autopopulated
    Given I am a consumer of the vehicles API
    And I have completed the "body type description" field
    When I submit my request via the PUT method
    Then the corresponding body type code is autopopulated, as per the linked excel
