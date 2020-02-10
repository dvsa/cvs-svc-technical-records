Feature: PSV Backend service update | Retrieval + Creation

  Scenario: AC1. GET request: All attributes applicable to PSVs are returned
    Given I am the vehicles backend service
    When I am called for a PSV, via the GET verb
    Then I return all the attributes applicable to PSV, from the linked excel

  Scenario: POST request: PSV vehicle is created, and the appropriate attributes are automatically set
    Given I am the vehicles backend service
    When a new PSV vehicle is created via the POST verb
    Then my POST action adheres to the PSV validations, present in the linked excel, columns D-E
    And the appropriate audit attributes are set on this new tech record
    And the 'statusCode' of this new tech record is always 'provisional'
    And I am able to POST attributes residing anywhere on the vehicle object
