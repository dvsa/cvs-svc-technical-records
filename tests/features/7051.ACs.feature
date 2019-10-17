Feature: Retrieve (v7) - Update the endpoint to retrieve the technical records

  Scenario: AC1.1 API Consumer retrieve the Vehicle Technical Records for - query parameter "status" not provided & vehicle has both "current" and "provisional" technical records
    Given I am an API Consumer
    When I send a request to AWS_CVS_DOMAIN/vehicles/{searchIdentifier}/tech-records
    And for the identified vehicle in the database there is a Technical Record with the "statusCode" = "current"
    And for the identified vehicle in the database there is a Technical Record with the "statusCode" = "provisional"
    Then for the query parameter "status", the default value "provisional_over_current" will be taken into account
    And the system returns a body message containing a single CompleteTechRecord
    And the statusCode of the Technical Records "provisional"
    And the system returns an HTTP status code 200 OK


  Scenario: AC1.2 API Consumer retrieve the Vehicle Technical Records for - query parameter "status" not provided & vehicle has only one "current" OR "provisional" technical record
    Given I am an API Consumer
    When I send a request to AWS_CVS_DOMAIN/vehicles/{searchIdentifier}/tech-records
    And the query parameter "status" is not provided
    And for the identified vehicle in the database there is only one "current" OR "provisional" Technical Record - not both of them at the same time
    Then for the query parameter "status", the default value "provisional_over_current" will be taken into account
    And the system returns a body message containing a single CompleteTechRecord
    And the specific Technical Record found in database is returned - "current" or "provisional" as it is in the database
    And the system returns an HTTP status code 200 OK

  Scenario: AC2.1 API Consumer retrieve the Vehicle Technical Records for - query parameter "status" is "provisional_over_current" & vehicle has both "current" and "provisional" technical records
    Given I am an API Consumer
    When I send a request to AWS_CVS_DOMAIN/vehicles/{searchIdentifier}/tech-records?status=provisional_over_current
    And the query parameter "status" is "provisional_over_current"
    And for the identified vehicle in the database there is a Technical Record with the "statusCode" = "current"
    And for the identified vehicle in the database there is a Technical Record with the "statusCode" = "provisional"
    Then the system returns a body message containing a single CompleteTechRecord
    And the statusCode of the Technical Records "provisional"
    And the system returns an HTTP status code 200 OK

  Scenario: AC2.2 API Consumer retrieve the Vehicle Technical Records for - query parameter "status" is "provisional_over_current" & vehicle has only one "current" OR "provisional" technical record
    Given I am an API Consumer
    When I send a request to AWS_CVS_DOMAIN/vehicles/{searchIdentifier}/tech-records?status=provisional_over_current
    And the query parameter "status" is "provisional_over_current"
    And for the identified vehicle in the database there is only one "current" OR "provisional" Technical Record - not both of them at the same time
    Then the system returns a body message containing a single CompleteTechRecord
    And the specific Technical Record found in database is returned - "current" or "provisional" as it is in the database
    And the system returns an HTTP status code 200 OK

  Scenario: AC3 No data returned
    Given I am an API Consumer
    When I send a request to AWS_CVS_DOMAIN/vehicles/{searchIdentifier}/tech-records
    And no data is found
    Then the system returns an HTTP status code 404

  Scenario: AC4 Multiple results returned
    Given I am an API Consumer
    When I send a request to AWS_CVS_DOMAIN/vehicles/{searchIdentifier}/tech-records
    And multiple results found (more than one CompleteTechRecord object is returned)
    Then the system returns an HTTP status code 422
