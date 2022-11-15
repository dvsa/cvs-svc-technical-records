Feature: HGV Backend service update | Retrieval + Creation + Update

  Scenario: AC1. GET request: All attributes applicable to HGVs are returned
    Given I am the vehicles backend service
    When I am called for a HGV, via the GET verb
    Then I return all the attributes applicable to HGV, from the linked excel

  Scenario: POST request: HGV vehicle is created, and the appropriate attributes are automatically set
    Given I am the vehicles backend service
    When a new HGV vehicle is created via the POST verb
    Then my POST action adheres to the HGV validations, present in the linked excel, columns D-E
    And the appropriate audit attributes are set on this new tech record
    And the 'statusCode' of this new tech record is always 'provisional'
    And I am able to POST attributes residing anywhere on the vehicle object

  Scenario: PUT request: HGV vehicle is updated, and the appropriate attributes are automatically set
    Given I am the vehicles backend service
    When an existing HGV vehicle is updated via the PUT verb
    Then my PUT action adheres to the HGV validations, present in the linked excel, columns D-E
    And a new identical tech record is created, with the same status, and the updated attributes on it
    And the previous "pre-update" tech record still exists in DynamoDB, with it's status set to removed
    And the appropriate audit attributes are set on the new updated tech record
    And I am only able to update attributes within the techRecord[] array
