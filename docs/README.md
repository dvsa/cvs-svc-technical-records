# Service definition

Serverless is used to develop locally so that AWS Cloud capabilities can be mocked, however the main service documentation can be found below:

- **API specs**: please ref to the Open API specs for the service specifications in this directory.

- **API Requests**: You can also use the sample of postman requests provided in this directory too.

You will require the following environmental variables in your Postman (or similar third party) to be set-up that can be found in your API Gateway:

```sh
{{api}} # used for deployed APIs in your custom domain names, eg: develop, integration, etc..

{{branch}} # used to map your branch to APIG stages, eg: develop, cvsb-1234

{{bearer_token}} # required for the customer authoriser to allow or deny lambda invocations based on roles and resources
```

You will also require a jwt token to add to the headers of your request:

- `access_token` for /v1 endpoint of Azure
- `id_token` for /v2 endpoint

`{{api_key}}` will also be used when jtw tokens are not provided.