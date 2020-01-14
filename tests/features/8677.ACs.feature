Feature: VTM ADR - Backend Service Updates For Vehicles API Spec

  Scenario: AC1. PUT: Add adrDetails{} object onto an existing tech record
    Given I am a consumer of the vehicles API
    When I call the vehicles API via the PUT method
    Then I am able to create a new identical tech record with the adrDetails{} object on it
    And the existing tech record is archived
    And my PUT action adheres to the adrDetails{} API validations, present in the attached updated API spec

  Scenario: AC2. PUT: Update adrDetails{} object on an existing tech record
    Given I am a consumer of the vehicles API
    When I call the vehicles API via the PUT method
    Then I am able to create a new identical tech record with the updated adrDetails{} object on it
    And the existing tech record (with the 'old' adrDetails{} object on it) is archived
    And my PUT action adheres to the adrDetails{} API validations, present in the attached updated API spec

  Scenario: AC3. GET: All attributes are returned
    Given I am a consumer of the vehicles API
    When I call the vehicles API via the GET method
    Then the JSON response contains the entire vehicle object
    And this JSON response contains the adrDetails{} object
    And the adrDetails{} object contains all the attributes from both CVSB-8464 + CVSB-8714

  Scenario: AC4. Adding of adrDetails{} is audited
  Given I am a consumer of the vehicles API
  When I add adrDetails{} as per AC1 above
  Then the following attributes are also set on my "new identical new tech record with the adrDetails{} on it
        """
        createdAt: Date + time of this action
        createdByName: Microsoft AD username, of the person who performed this action
        createdById: Microsoft AD OID, of the person who performed this action
        """
  And the following attributes are also set on my "existing tech record (without the adrDetails{} object on it)" (which got archived in AC1)
        """
        lastUpdatedAt: Date + time of this action
        lastUpdatedByName: Microsoft AD username, of the person who performed this action
        lastUpdatedById: Microsoft AD OID, of the person who performed this action
        updateType: adrUpdate
        """

  Scenario: AC5. Adding of adrDetails{} is audited
    Given I am a consumer of the vehicles API
    When I update adrDetails{} as per AC2 above
    Then the following attributes are also set on my "new identical tech record with the updated adrDetails{} on it
        """
        createdAt: Date + time of this action
        createdByName: Microsoft AD username, of the person who performed this action
        createdById: Microsoft AD OID, of the person who performed this action
        """
    And the following attributes are also set on my "existing tech record (with the 'old' adrDetails{} object on it)" (which got archived in AC2)
        """
        lastUpdatedAt: Date + time of this action
        lastUpdatedByName: Microsoft AD username, of the person who performed this action
        lastUpdatedById: Microsoft AD OID, of the person who performed this action
        updateType: adrUpdate
        """
