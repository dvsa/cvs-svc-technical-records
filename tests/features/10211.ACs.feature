Feature: HGV Backend Service | Put Method | Error Handling

  Scenario: AC1. PUT: Attempt to update a new vehicle without a mandatory field
    Given I am a consumer of the vehicles API
    When I call the vehicles API via the PUT method without a mandatory field in the request body
    Then I am given the 400 error code

  Scenario: AC2. PUT: Attempt to update a new vehicle with a not applicable field
    Given I am a consumer of the vehicles API
    When I call the vehicles API via the PUT method with at least one not applicable field (for example, a "PSV only" field, onto a HGV)
    Then I am given the 400 error code

  Scenario: AC3. PUT: Attempt to update a new vehicle with unexpected values for a field that accepts only specific values
    Given I am a consumer of the vehicles API
    When I call the vehicles API via the PUT method with unexpected values for a field that accepts only specific values
    Then I am given the 400 error code

  Scenario: AC4. PUT: Attempt to update a new vehicle, using a field which has a field value outside of the min/max length for that field
    Given I am a consumer of the vehicles API
    When I call the vehicles API via the PUT method using a field which has a field value outside of the min/max length for that field
    Then I am given the 400 error code
