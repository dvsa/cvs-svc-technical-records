Feature: HGV Backend Service | Post Method | Error Handling

  Scenario: AC1. POST: Attempt to create a new vehicle without a mandatory field
    Given I am a consumer of the vehicles API
    When I call the vehicles API via the POST method without a mandatory field in the request body
    Then I am given the 400 error code

  Scenario: AC2. POST: Attempt to create a new vehicle with a not applicable field
    Given I am a consumer of the vehicles API
    When I call the vehicles API via the POST method with at least one not applicable field (for example, a "PSV only" field, onto a HGV)
    Then I am given the 400 error code

  Scenario: AC3. POST: Attempt to create a new vehicle with unexpected values for a field that accepts only specific values
    Given I am a consumer of the vehicles API
    When I call the vehicles API via the POST method with unexpected values for a field that accepts only specific values
    Then I am given the 400 error code

  Scenario: AC4. POST: Attempt to create a new vehicle, using a field which has a field value outside of the min/max length for that field
    Given I am a consumer of the vehicles API
    When I call the vehicles API via the POST method using a field which has a field value outside of the min/max length for that field
    Then I am given the 400 error code
