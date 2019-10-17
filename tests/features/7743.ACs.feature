Feature: Backend service updated to allow technical records in VTM to be appropriately searchable

  Scenario: AC1. Backend Service Correctly Interprets The "status" value of "all"
    Given I am a consumer of the vehicles API
    When I call the vehicles API passing a value of "all" for the "status" (in addition to the VIN/VRM)
    Then the JSON response returns ALL technical records for that VIN/VRM (ALL STATUSES)
