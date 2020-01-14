Feature: Iteration on technical records API specs to cover ADR details

  Scenario: AC1 API Consumer retrieve the Vehicle Technical Records
    Given I am an API Consumer
    When I send a request to AWS_CVS_DOMAIN/vehicles/{searchIdentifier}/tech-records
    And there is a vehicle that can be identified by the value provided for the searchIdentifier
    Then the system returns a body message containing a single CompleteTechRecord
    And the system returns an HTTP status code 200 OK

  Scenario: AC2 No data returned
    Given I am an API Consumer
    When I send a request to AWS_CVS_DOMAIN/vehicles/{searchIdentifier}/tech-records
    And no data is found
    Then the system returns an HTTP status code 404

#  Made redundant by 10752
#
#  Scenario: AC3 Multiple results returned
#    Given I am an API Consumer
#    When I send a request to AWS_CVS_DOMAIN/vehicles/{searchIdentifier}/tech-records
#    And multiple results found (more than one CompleteTechRecord object is returned)
#    Then the system returns an HTTP status code 422
