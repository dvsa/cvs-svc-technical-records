Feature: HGV Backend Service | Post Method | Error Handling

  Scenario: AC4. POST: Attempt to create a new vehicle, using a field which has a field value outside of the min/max length for that field
    Given I am a consumer of the vehicles API
    When I call the vehicles API via the POST method using a field which has a field value outside of the min/max length for that field
    Then I am given the 400 error code
