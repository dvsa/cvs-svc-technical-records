Feature: PSV Backend service update | Update (PUT)

  Scenario: AC1. PUT request: PSV vehicle is updated, and the appropriate attributes are automatically set
    Given I am the vehicles backend service
    When an existing PSV vehicle is updated via the PUT verb
    Then my PUT action adheres to the PSV validations, present in the linked excel, columns D-E
    And a new identical tech record is created, with the same status, and the updated attributes on it
    And the previous "pre-update" tech record still exists in DynamoDB, with it's status set to archived
    And the appropriate audit attributes are set on the new updated tech record
    And the appropriate audit attributes are set on the "pre-update" tech record (lastUpdatedByName, lastUpdatedByID, lastUpdatedAt, updateType: techRecordUpdate)
    And I am only able to update attributes within the techRecord[] array
