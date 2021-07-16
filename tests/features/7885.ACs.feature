Feature: Updating tech records API spec with put/post verbs
 Scenario: AC1. Vehicles API spec contains GET/POST/PUT/ verbs
   Given I am a consumer of the vehicles API
   When I call the vehicles API
   Then I am able to perform a PUT or POST request
   And I am still able to perform a GET request
