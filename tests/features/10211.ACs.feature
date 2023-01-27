Feature: HGV Backend Service | Put Method | Error Handling

  Scenario: AC4. PUT: Attempt to update a new vehicle, using a field which has a field value outside of the min/max length for that field
    Given I am a consumer of the vehicles API
    When I call the vehicles API via the PUT method using a field which has a field value outside of the min/max length for that field
    Then I am given the 400 error code
