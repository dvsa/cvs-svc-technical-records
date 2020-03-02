Feature: Allow vin with special characters by URL encoding and decoding the searchIdentifier
  Scenario: AC2 BE API consumer performs a GET call for tech records microservice
    Given I am an API Consumer
    And the searchIdentifier was URL encoded as per AC1
    When I send a GET request to /vehicles/[searchIdentifier]/tech-records
    Then the searchIdentifier value is URL decoded before making the search in the DB
    And the search is performed using the decoded value of the searchIdentifier
