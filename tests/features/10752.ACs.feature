Feature: Duplicate chassis no, updating the tech record API specs

  Scenario: AC1 API Consumer retrieve the Vehicle Technical Records
    Given I am an API Consumer
    When I send a request to AWS_CVS_DOMAIN/vehicles/[searchIdentifier]/tech-records
    And there is at least one vehicle that can be identified by the value provided for the searchIdentifier
    Then the system returns a body message containing an array of completeTechRecords
    And the systemNumber attribute is present for each vehicle tech record retrieved, at completeTechRecord level
    And the system returns an HTTP status code 200 OK

  Scenario: AC2 No data returned
    Given I am an API Consumer
    When I send a request to AWS_CVS_DOMAIN/vehicles/[searchIdentifier]/tech-records
    And no data is found
    Then the system returns an HTTP status code 404
