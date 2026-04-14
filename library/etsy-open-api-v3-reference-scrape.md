# Etsy Open API v3 Reference Scrape (Apify)

Generated: 2026-04-08
Source root: https://developers.etsy.com/documentation
Crawler: apify/website-content-crawler (markdown extraction)

## Crawl Index

- [Etsy Open API v3 | Etsy Open API v3](https://developers.etsy.com/documentation/)
- [Definitions | Etsy Open API v3](https://developers.etsy.com/documentation/essentials/definitions)
- [Authentication | Etsy Open API v3](https://developers.etsy.com/documentation/essentials/oauth2/)
- [Rate Limits | Etsy Open API v3](https://developers.etsy.com/documentation/essentials/rate-limits)
- [Request Standards | Etsy Open API v3](https://developers.etsy.com/documentation/essentials/requests)
- [URL Syntax | Etsy Open API v3](https://developers.etsy.com/documentation/essentials/urlsyntax)
- [Webhooks | Etsy Open API v3](https://developers.etsy.com/documentation/essentials/webhooks)
- [Get help | Etsy Open API v3](https://developers.etsy.com/documentation/get-help/)
- [Reference | Etsy Open API v3](https://developers.etsy.com/documentation/reference/)
- [Fulfillment Tutorial | Etsy Open API v3](https://developers.etsy.com/documentation/tutorials/fulfillment)
- [Listings Tutorial | Etsy Open API v3](https://developers.etsy.com/documentation/tutorials/listings)
- [Processing Profiles Migration | Etsy Open API v3](https://developers.etsy.com/documentation/tutorials/migration)
- [Tutorials Overview | Etsy Open API v3](https://developers.etsy.com/documentation/tutorials/overview/)
- [Payments Tutorial | Etsy Open API v3](https://developers.etsy.com/documentation/tutorials/payments)
- [Multi Personalization Migration Guide | Etsy Open API v3](https://developers.etsy.com/documentation/tutorials/personalization-migration)
- [Endpoint Migration (backwards compatible) | Etsy Open API v3](https://developers.etsy.com/documentation/tutorials/personalization/endpoint-migration)
- [Examples for the Endpoint Migration Period | Etsy Open API v3](https://developers.etsy.com/documentation/tutorials/personalization/endpoint-migration-examples)
- [Multiple + New Question Type Support | Etsy Open API v3](https://developers.etsy.com/documentation/tutorials/personalization/multiple-and-new-question-type-support)
- [Examples for the Multiple + New Questions Type Support Period | Etsy Open API v3](https://developers.etsy.com/documentation/tutorials/personalization/multiple-and-new-question-type-support-examples)
- [Quick Start Tutorial | Etsy Open API v3](https://developers.etsy.com/documentation/tutorials/quickstart/)
- [Shop Management Tutorial | Etsy Open API v3](https://developers.etsy.com/documentation/tutorials/shopmanagement)
- [Third Variation Tutorial | Etsy Open API v3](https://developers.etsy.com/documentation/tutorials/third-variation)

## Scraped Markdown Pages

---

### Etsy Open API v3 | Etsy Open API v3

Source: https://developers.etsy.com/documentation/

# Etsy Open API v3 | Etsy Open API v3

Welcome to the improved Etsy Open API v3, a REST API that extends support for inventory, sales orders, and shop management on the Etsy platform. These guides support current and future app developers as they build tools to integrate with and automate processes for Etsy shops and customers.

## Getting started[#](https://developers.etsy.com/documentation/#getting-started "Direct link to heading")

Our updated documentation is divided into a few sections, geared towards different use cases.

*   [Quick Start Guide](https://developers.etsy.com/documentation/tutorials/quickstart)
*   [API reference](https://developers.etsy.com/documentation/reference)
*   [API essentials](https://developers.etsy.com/documentation/essentials/oauth2/)
*   [Tutorials](https://developers.etsy.com/documentation/tutorials/overview)

## Developing a New Open API App[#](https://developers.etsy.com/documentation/#developing-a-new-open-api-app "Direct link to heading")

To develop a new application using Etsy's Open API v3, [register your app with Etsy](https://www.etsy.com/developers/register). Registration generates an Etsy App API Key _keystring_ and a _shared secret_, which you can find in [Your Apps](https://www.etsy.com/developers/your-apps) and allows you to use v3 Open API endpoints. Registered apps begin with [personal access](https://developers.etsy.com/documentation/#personal-access) to our production systems. An application that has not made a succesful request to Etsy's OpenAPI service in 6 months will be marked as _dormant_ and banned.

### Personal Access[#](https://developers.etsy.com/documentation/#personal-access "Direct link to heading")

By default, all new applications support personal access, which is authenticated read/write access to a shop granted by the owner and controlled by [Oauth token scopes](https://developers.etsy.com/documentation/essentials/oauth2#scopes). This supports designing access controls for different application users into the app, such as reading data on receipts and billing or creating, editing, and deleting your shop's listings. Personal access is permitted to connect with up to 5 shops.

### Commercial Access[#](https://developers.etsy.com/documentation/#commercial-access "Direct link to heading")

General-purpose applications that can assist any seller manage their shop, not just your shop, require commercial access. To request commercial access, click the "Request Commercial Access" link next to your app in [Apps You've Made](https://www.etsy.com/developers/your-apps).

##### important

If you're only accessing data from your own shop, you do not need commercial access. To implement Oauth authentication to protect access to your shop, see [Authentication](https://developers.etsy.com/documentation/essentials/oauth2).

Etsy reviews requests for commercial access against the following criteria:

1.  Applications and their home pages must comply with our [API Terms of Use](https://www.etsy.com/legal/api).
2.  Applications must follow the caching policies identified in [Section 1](https://www.etsy.com/legal/api#license) of the API Terms of Use.
3.  Applications must clearly distinguish themselves from Etsy, as noted in [Section 6](https://www.etsy.com/legal/api#marks) of the API Terms of Use. Particularly, the following phrase must appear in a prominent position in your application: **"The term 'Etsy' is a trademark of Etsy, Inc. This application uses the Etsy API but is not endorsed or certified by Etsy, Inc."**
4.  Applications must not sidestep the API to retrieve or post Etsy data. Screen-scraping is not allowed.
5.  Applications that access private member data must use OAuth authentication to do so.
6.  Application names and artwork, including icons and home pages, must follow our [Trademark Policy](https://www.etsy.com/help/article/481).
7.  Applications with commercial access that use the `transaction_r` permission scope must request access to the `buyer_email` field separately. Etsy approves these requests on a case by case basis.

## Get Help[#](https://developers.etsy.com/documentation/#get-help "Direct link to heading")

When you need more support, please refer to the resources on our [help page](https://developers.etsy.com/documentation/get-help).

---

### Definitions | Etsy Open API v3

Source: https://developers.etsy.com/documentation/essentials/definitions

Definitions | Etsy Open API v3

*   [Introduction](https://developers.etsy.com/documentation/)
*   [API Essentials](https://developers.etsy.com/documentation/essentials/definitions/#!)
    *   [Authentication](https://developers.etsy.com/documentation/essentials/authentication)
    *   [URL Syntax](https://developers.etsy.com/documentation/essentials/urlsyntax)
    *   [Definitions](https://developers.etsy.com/documentation/essentials/definitions)
    *   [Request Standards](https://developers.etsy.com/documentation/essentials/requests)
    *   [Rate Limits](https://developers.etsy.com/documentation/essentials/rate-limits)
    *   [Webhooks](https://developers.etsy.com/documentation/essentials/webhooks)
    *   [Get help](https://developers.etsy.com/documentation/get-help)
    *   [API testing policy](https://www.etsy.com/legal/policy/api-testing-policy/169130941112)
*   [Tutorials](https://developers.etsy.com/documentation/essentials/definitions/#!)
    *   [Overview](https://developers.etsy.com/documentation/tutorials/overview)
    *   [Quick Start Tutorial](https://developers.etsy.com/documentation/tutorials/quickstart)
    *   [Fulfillment Tutorial](https://developers.etsy.com/documentation/tutorials/fulfillment)
    *   [Listings Tutorial](https://developers.etsy.com/documentation/tutorials/listings)
    *   [Processing Profiles Migration](https://developers.etsy.com/documentation/tutorials/migration)
    *   [Third Variation Tutorial](https://developers.etsy.com/documentation/tutorials/third-variation)
    *   [Shop Management Tutorial](https://developers.etsy.com/documentation/tutorials/shopmanagement)
    *   [Payments Tutorial](https://developers.etsy.com/documentation/tutorials/payments)
    *   [Personalization Migration](https://developers.etsy.com/documentation/essentials/definitions/#!)
        *   [Multi Personalization Migration Guide](https://developers.etsy.com/documentation/tutorials/personalization-migration)
        *   [Endpoint Migration (backwards compatible)](https://developers.etsy.com/documentation/tutorials/personalization/endpoint-migration)
        *   [Examples for the Endpoint Migration Period](https://developers.etsy.com/documentation/tutorials/personalization/endpoint-migration-examples)
        *   [Multiple + New Question Type Support](https://developers.etsy.com/documentation/tutorials/personalization/multiple-and-new-question-type-support)
        *   [Examples for the Multiple + New Questions Type Support Period](https://developers.etsy.com/documentation/tutorials/personalization/multiple-and-new-question-type-support-examples)
*   [Manage your apps](https://www.etsy.com/developers)
*   [Terms of use](https://www.etsy.com/legal/api)

# Definitions

The following definitions will help with the OpenAPI reference section to understand what some of the objects and options mean. This is not an exhaustive list, but rather a list of requested clarifications.

## State Field Possible Values[#](https://developers.etsy.com/documentation/essentials/definitions/#state-field-possible-values "Direct link to heading")

In the [ShopListing](https://developers.etsy.com/documentation/reference#tag/ShopListing) endpoints there is a field called `state` with these potential values:

| Value | Meaning |
| --- | --- |
| `active` | Currently active listing that has at least one quantity and is has not expired. |
| `inactive` or `edit` | A listing that once was, but is no longer active and is ready for modifications. |
| `sold_out` | A once active listing that no longer has any available quantity. |
| `draft` | A new listing that has yet to be promoted to active state. |
| `expired` | A once active listing that has reached it's ending date and was not set to auto renew. |

## Money Object[#](https://developers.etsy.com/documentation/essentials/definitions/#money-object "Direct link to heading")

A `money` object represents a price for a listing in a specific currency. The money object contains the following fields:

| Field Name | Meaning |
| --- | --- |
| `amount` | This is the base amount by which the currency can not be divided further. For instance, in United States dollars, the base value is one penny or `1`. So a listing for five dollars US, would be 500 pennies. |
| `divisor` | This is the number used to divide the amount to get the currency value. So a listing for 500 in the amount, will be divided by 100 pennies to come up with 5 dollars. |
| `currency_code` | This is the 3 letter code for a given currency, such as `USD` for United States Dollar or `CAD` for Canadian Dollar. |

## Order Status Values[#](https://developers.etsy.com/documentation/essentials/definitions/#order-status-values "Direct link to heading")

When retrieving receipts in the OpenAPI, an order (AKA receipt) can have one of the following status values:

| Value | Meaning |
| --- | --- |
| `open` | The order has been created, but payment has not yet been submitted. This is a legacy value and was used when sellers were accepting direct payments and not using Etsy checkout. |
| `paid` | The order has been created and paid for and is ready for shipping. |
| `completed` | The order has been shipped and is considered complete. |
| `payment processing` | The order has been created and payment data submitted, but has not been fully processed. |
| `canceled` | The order was canceled. |

*   [State Field Possible Values](https://developers.etsy.com/documentation/essentials/definitions/#state-field-possible-values)
*   [Money Object](https://developers.etsy.com/documentation/essentials/definitions/#money-object)
*   [Order Status Values](https://developers.etsy.com/documentation/essentials/definitions/#order-status-values)

---

### Authentication | Etsy Open API v3

Source: https://developers.etsy.com/documentation/essentials/oauth2/

# Authentication | Etsy Open API v3

Etsy's Open API supports OAuth 2.0 [Authorization Code Grants](https://tools.ietf.org/html/rfc6749#page-24) to generate OAuth tokens for app security. Authorization code grants require users to approve access, which generates an authorization code an app includes in a token request (`https://api.etsy.com/v3/public/oauth/token`) from the [OAuth resource](https://developers.etsy.com/documentation/reference#section/Authentication/oauth2).

[OAuth 2.0](https://tools.ietf.org/html/rfc6749) is fairly well-standardized, so this document focuses on Etsy’s specific implementation of OAuth2.

## Requesting an OAuth Token[#](https://developers.etsy.com/documentation/essentials/authentication/#requesting-an-oauth-token "Direct link to heading")

Gather the following information before starting the **authorization code** grant flow:

1.  Your Etsy App API Key _keystring_, which you can find in [Your Apps](https://www.etsy.com/developers/your-apps).
2.  A _callback URL_ your app uses to receive the authorization code. Typically, this is a page or script that starts the token request using the authorization code, and therefore must implement TLS and use an `https://` prefix. See [Redirect URIs](https://developers.etsy.com/documentation/essentials/authentication/#redirect-uris) below.
3.  The _scopes_ your application requires to use specific endpoints. The [Open API Reference](https://developers.etsy.com/documentation/reference) lists the authorizations required to use each endpoint. For example, the endpoint to [create a listing](https://developers.etsy.com/documentation/reference#operation/createDraftListing) requires an oauth2 token with `listings_w` scope. See [Scopes](https://developers.etsy.com/documentation/essentials/authentication/#scopes) below.
4.  A _state_ string, similar to a [strong password](https://techjury.net/blog/how-to-create-a-strong-password), which protects against [Cross-site request forgery](https://en.wikipedia.org/wiki/Cross-site_request_forgery) exploits.
5.  A _code verifier_ and generated _code challenge_ proof key for code exchange (PKCE) pair required in the token request and authorization code request respectively. See [PKCE](https://developers.etsy.com/documentation/essentials/authentication/#proof-key-for-code-exchange-pkce) below.

### Step 1: Request an Authorization Code[#](https://developers.etsy.com/documentation/essentials/authentication/#step-1-request-an-authorization-code "Direct link to heading")

To begin the flow, direct the user to `https://www.etsy.com/oauth/connect` with a GET request including the following URL parameters:

| Parameter Name | Description |
| --- | --- |
| `response_type` | Must always be the value `code` (no quotes). |
| `client_id` | An Etsy App API Key _keystring_ for the app. |
| `redirect_uri` | A URI your app uses to receive the authorization code or error message; see [Redirect URIs](https://developers.etsy.com/documentation/essentials/authentication/#redirect-uris) below. The URL must have the `https://` prefix or the request will fail. |
| `scope` | A URL-encoded, space-separated list of one or more scopes (e.g., `shops_r%20shops_w`); see [Scopes](https://developers.etsy.com/documentation/essentials/authentication/#scopes) below. |
| `state` | The state parameter must be non-empty and should be a single-use token generated specifically for a given request. It is important that the state parameter is impossible to guess, associated with a specific request, and used once. Use _state_ for [CSRF protection](https://en.wikipedia.org/wiki/Cross-site_request_forgery). |
| `code_challenge` | The PKCE _code challenge_ SHA256-image of a random value for this request flow; see [PKCE](https://developers.etsy.com/documentation/essentials/authentication/#proof-key-for-code-exchange-pkce) below. |
| `code_challenge_method` | Must always be the value `S256` (no quotes). |

For example, to request an authorization code for an Etsy app with an App API Key _keystring_ of `1aa2bb33c44d55eeeeee6fff`, initiate a GET request with the following URL:

where:

*   `response_type=code` is required to request an authorization code.
*   `redirect_uri=https://www.example.com/some/location` directs etsy to send an authorization code response to `https://www.example.com/some/location`.
*   `scope=transactions_r%20transactions_w` adds read and write access to transactions in the authorization _scope_ for the request, which is required to [request shop receipts](https://developers.etsy.com/documentation/reference#operation/getShopReceipts). see [Scopes](https://developers.etsy.com/documentation/essentials/authentication/#scopes) below.
*   `client_id=1aa2bb33c44d55eeeeee6fff` is an API Key _keystring_ for the app.
*   `state=superstate` assigns the _state_ string to `superstate` which Etsy.com should return with the authorization code
*   `code_challenge=DSWlW2Abh-cf8CeLL8-g3hQ2WQyYdKyiu83u_s7nRhI` is the PKCE _code challenge_ generated from the _code verifier_ `vvkdljkejllufrvbhgeiegrnvufrhvrffnkvcknjvfid`, which must be in the OAuth token request with the authorization code.
*   `code_challenge_method=S256` is required to correctly interpret the _code\_challenge_.

### Step 2: Grant Access[#](https://developers.etsy.com/documentation/essentials/authentication/#step-2-grant-access "Direct link to heading")

If the authorization code request is valid, Etsy.com responds by prompting an Etsy.com user (typically the app user) to grant the application access the requested scopes.

![OAuth2 authorization confirmation page](https://img0.etsystatic.com/site-assets/open-api/oauth2-authorize.png)

If the user grants access, Etsy.com sends a request back to the app's `redirect_uri` with the following `GET` parameters:

| Parameter Name | Description |
| --- | --- |
| `state` | The _state_ parameter, exactly as set in the authorization request |
| `code` | An OAuth _authorization code_ required to request an OAuth token |

For example, the following response indicates that the user grants access and supplies an authorization code:

Before using an _authorization code_, validate that the _state_ string in the response matches the _state_ sent with the authorization code request. If they do not match, halt authentication as the request is vulnerable to CSRF attacks. If they match, make a note never to use that _state_ again, and make your next authorization code request with a new _state_ string.

#### Errors[#](https://developers.etsy.com/documentation/essentials/authentication/#errors "Direct link to heading")

If the user does not consent, or there is some other error (e.g. a missing parameter), Etsy.com sends a response to the specified `redirect_uri` with the following `GET` parameters:

| Parameter Name | Description |
| --- | --- |
| `state` | The _state_ parameter, exactly as set in the authorization request |
| `error` | An error code from [RFC 6749](https://tools.ietf.org/html/rfc6749#section-5.2) |
| `error_description` | A human-readable explanation of the error (always in English) |
| `error_uri` | (Optional) A URL with more information about the error. |

### Step 3: Request an Access Token[#](https://developers.etsy.com/documentation/essentials/authentication/#step-3-request-an-access-token "Direct link to heading")

Request an OAuth access token using the _authorization code_ in a POST request to the Etsy Open API `/oauth/token` resource. Most requests to the Etsy Open API require this access token, which has a functional life of 1 hour. The Etsy Open API delivers a [refresh token](https://developers.etsy.com/documentation/essentials/authentication/#Refreshing-an-OAuth-Token) with the access token, which you can use to obtain a new access token through the [refresh\_token grant](https://tools.ietf.org/html/rfc6749#section-6), and has a longer functional lifetime (90 days).

To obtain an access token, make a POST request to `https://api.etsy.com/v3/public/oauth/token` with the following parameters in the request body in `application/x-www-form-urlencoded` format:

| Parameter Name | Description |
| --- | --- |
| `grant_type` | Must always be the value `authorization_code` |
| `client_id` | An Etsy App API Key _keystring_ for the app. |
| `redirect_uri` | The same `redirect_uri` value used in the prior authorization code request. |
| `code` | The _authorization code_ sent back from Etsy.com after [granting access](https://developers.etsy.com/documentation/essentials/authentication/#step-2-grant-access). |
| `code_verifier` | The PKCE _code verifier_ preimage of the `code_challenge` used in the prior authorization code request; see [PKCE](https://developers.etsy.com/documentation/essentials/authentication/#proof-key-for-code-exchange-pkce) below. |

For example, to request access for an Etsy app with an App API Key _keystring_ of `1aa2bb33c44d55eeeeee6fff`, initiate a POST request:

where:

*   `grant_type=authorization_code` is required to request an OAuth token in an authorization token grant flow.
*   `client_id=1aa2bb33c44d55eeeeee6fff` is an API Key _keystring_ for the app.
*   `redirect_uri=https://www.example.com/some/location` directs etsy to send the access token response to `https://www.example.com/some/location`.
*   `code=bftcubu-wownsvftz5kowdmxnqtsuoikwqkha7_4na3igu1uy-ztu1bsken68xnw4spzum8larqbry6zsxnea4or9etuicpra5zi` is the authorization code sent from Etsy.com after the user grants access
*   `code_verifier=vvkdljkejllufrvbhgeiegrnvufrhvrffnkvcknjvfid` is the PKCE _code verifier_ used to generate the _code challenge_ `DSWlW2Abh-cf8CeLL8-g3hQ2WQyYdKyiu83u_s7nRhI`, which we used in the authorization code request.

The Etsy Open API responds to an authentic request for an OAuth token with the following information in JSON format:

where:

*   `access_token` is the OAuth grant token with a user id numeric prefix (`12345678` in the example above), which is the internal `user_id` of the Etsy.com user who grants the application access. The V3 Open API requires the combined user id prefix and OAuth token as formatted in this parameter to authenticate requests.
    
    * * *
    
    NOTE: This numeric OAuth `user_id` is only available from the authorization code grant flow
    
    * * *
    
*   `token_type` is always `Bearer` which indicates that the OAuth token is a bearer token.
*   `expires_in` is the valid duration of the OAuth token in seconds from the moment it is granted; 3600 seconds is 1 hour.
*   `refresh_token` is the OAuth code to request a refresh token with a user id numeric prefix (`12345678` in the example). Use this for a refresh grant access request for a fresh OAuth token without requesting access from the user/seller an additional time.

## Redirect URIs[#](https://developers.etsy.com/documentation/essentials/authentication/#redirect-uris "Direct link to heading")

All `redirect_uri` parameter values must match a precise _callback URL_ string registered with Etsy. These values can be provided by editing your application at [etsy.com/developers/your-apps](https://www.etsy.com/developers/your-apps).

Authorization code or token requests with unregistered or non-matching `redirect_uri` values send an error to the user and Etsy.com does **not** redirect the user back to your app.

URL matching is case-sensitive and is specifically the URL established when you registered. For example, if your registered redirect URL is `https://www.example.com/some/location`, the following strings **fail** to match:

*   `http://www.example.com/some/location` (http, not https)
*   `https://www.example.com/some/location/` (additional trailing slash)
*   `https://www.example.com/some/location?` (additional trailing question mark)
*   `Https://www.example.com/some/location` (uppercase H in https)
*   `https://example.com/some/location` (no www subdomain)

## Scopes[#](https://developers.etsy.com/documentation/essentials/authentication/#scopes "Direct link to heading")

Methods and fields in the Etsy API are tagged with "permission scopes" that control which operations an app can perform and which data an app can read with a given set of credentials. Scopes are the permissions you request from the user, and the access token proves you have permission to act from that user.

The following scopes are available at this time, though are subject to change. The availability of a scope does not necessarily imply the existence of an endpoint to perform that action. Each API endpoint may require zero, one, or more scopes for access. Consult the [Open API Reference](https://developers.etsy.com/documentation/reference) to determine the scopes required for each specific endpoint.

| Name | Description |
| --- | --- |
| `address_r` | Read a member's shipping addresses. |
| `address_w` | Update and delete a member's shipping address. |
| `billing_r` | Read a member's Etsy bill charges and payments. |
| `cart_r` | Read the contents of a member’s cart. |
| `cart_w` | Add and remove listings from a member's cart. |
| `email_r` | Read a user profile |
| `favorites_r` | View a member's favorite listings and users. |
| `favorites_w` | Add to and remove from a member's favorite listings and users. |
| `feedback_r` | View all details of a member's feedback (including purchase history.) |
| `listings_d` | Delete a member's listings. |
| `listings_r` | Read a member's inactive and expired (i.e., non-public) listings. |
| `listings_w` | Create and edit a member's listings. |
| `profile_r` | Read a member's private profile information. |
| `profile_w` | Update a member's private profile information. |
| `recommend_r` | View a member's recommended listings. |
| `recommend_w` | Remove a member's recommended listings. |
| `shops_r` | See a member's shop description, messages and sections, even if not (yet) public. |
| `shops_w` | Update a member's shop description, messages and sections. |
| `transactions_r` | Read a member's purchase and sales data. This applies to buyers as well as sellers. |
| `transactions_w` | Update a member's sales data. |

Scopes are associated with every access token, and any change in scope requires the user to re-authorize the application; to change scopes, you must go through the authorization code grant flow again. Conversely, users are generally less likely to authorize an application that makes a request for more scopes than it requires. As such, you should carefully tailor scope requests to your application.

To request multiple scopes, add them in a space-separated list. For example, to request the scopes to see a user’s shipping addresses and email address, add the `email_r%20address_r` strings for the scope parameter in the request for an authentication code.

## Proof Key for Code Exchange (PKCE)[#](https://developers.etsy.com/documentation/essentials/authentication/#proof-key-for-code-exchange-pkce "Direct link to heading")

A Proof Key for Code Exchange (PKCE) is the implementation of an OAuth2 extension standardized in RFC 7636 that guarantees that an authorization code is valid for only one application and cannot be intercepted by the user or an attacker. The Etsy Open API requires a PKCE on every authorization flow request.

A PKCE works by using a code **verifier** , which must be a high-entropy random string consisting of between 43 and 128 characters from the range `[A-Za-z0-9._~-]` (i.e. unreserved URI characters).

You can generate an appropriate verifier using a cryptographically secure source of randomness and encode 32 bytes of random data into url-safe base 64. Store this value in association with a particular authorization code request.

Then construct a code **challenge** by taking the URL-safe base64-encoded output of the SHA256 hash of the code verifier, and use it in the authorization code request to `https://www.etsy.com/oauth/connect`.

You must provide the verifier in the request for an access token from the Etsy API server, which proves that you are the source of the original authorization request.

For an example of how to generate a code verifier and matching challenge, see [Appendix B of RFC 7636](https://tools.ietf.org/html/rfc7636#appendix-B).

## Requesting a Refresh OAuth Token[#](https://developers.etsy.com/documentation/essentials/authentication/#requesting-a-refresh-oauth-token "Direct link to heading")

Etsy's Open API supports OAuth 2.0 [Refresh Grants](https://datatracker.ietf.org/doc/html/rfc6749#section-1.5) to generate OAuth tokens after the seller grants a user an initial Authorization Code grant token. Refresh tokens do not require sellers to re-approve access and have the same scope as the token granted by the initial Authorization Code grant token. You cannot change the scope of a refresh token from the scope established in the initial Authentication Grant token.

To obtain a refresh token, make a POST request to `https://api.etsy.com/v3/public/oauth/token` with the following parameters in the request body in `application/x-www-form-urlencoded` format:

| Parameter Name | Description |
| --- | --- |
| `grant_type` | Must be the value `refresh_token` |
| `client_id` | An Etsy App API Key _keystring_ for the app. |
| `refresh_token` | The _refresh token_ string sent with a prior Authorization Code Grant or Refresh Grant. |

For example, to request a refresh token for an Etsy app with an App API Key _keystring_ of `1aa2bb33c44d55eeeeee6fff`, initiate a POST request:

where:

*   `grant_type=refresh_code` is required to request an OAuth token in a refresh grant context.
*   `client_id=1aa2bb33c44d55eeeeee6fff` is an API Key _keystring_ for the app.
*   `refresh_token=12345678.JNGIJtvLmwfDMhlYoOJl8aLR1BWottyHC6yhNcET-eC7RogSR5e1GTIXGrgrelWZalvh3YvvyLfKYYqvymd-u37Sjtx` is the refresh code sent from Etsy.com after granting a prior authorization grant token or refresh grant token.

The Etsy Open API responds to an authentic request for an OAuth token with the following information in JSON format:

where:

*   `access_token` is the OAuth refresh code with a user id numeric prefix (`12345678` in the example above), which is the internal `user_id` of the Etsy.com user who grants the application access.
*   `token_type` is always `Bearer` which indicates that the OAuth token is a bearer token.
*   `expires_in` is the valid duration of the OAuth token in seconds from the moment it is granted; 3600 seconds is 1 hour.
*   `refresh_token` is the OAuth code to request another refresh token with a user id numeric prefix (`12345678` in the example). Use this for a refresh grant access request for a fresh OAuth token without requesting access from the user/seller an additional time.

## APIv2 Endpoints and OAuth2 Tokens[#](https://developers.etsy.com/documentation/essentials/authentication/#apiv2-endpoints-and-oauth2-tokens "Direct link to heading")

Requests to v2 endpoints cannot use tokens generated through the OAuth 2.0 flow described above.

Requests to v3 endpoints must use OAuth 2.0 tokens. See [Exchange OAuth 1.0 Token for OAuth 2.0 Token](https://developers.etsy.com/documentation/essentials/authentication/#exchange-oauth-10-token-for-oauth-20-token) to upgrade existing tokens.

### Scopes changed for OAuth 1.0 in the V3 Open API[#](https://developers.etsy.com/documentation/essentials/authentication/#scopes-changed-for-oauth-10-in-the-v3-open-api "Direct link to heading")

The V3 Open API supports most of the same scopes for OAuth 1.0 that were supported in V2. However, the following scopes are different from the scopes supported for V2, so you should update them if you use them:

1.  Several combined read and write scopes from v2 are split into separate read scopes and write scopes in v3

| V2 scope | V3 scopes | Description | Affected Resources |
| --- | --- | --- | --- |
| `favorites_rw` | `favorites_r` | View a member's favorite listings and users. | FavoriteListing and FavoriteUser |
|     | `favorites_w` | Add to and remove from a member's favorite listings and users. | FavoriteListing and FavoriteUser |
| `shops_rw` | `shops_r` | View a member's shop description, messages and ections. | Shop and ShopSection |
|     | `shops_w` | Update a member's shop description, messages and sections. | Shop and ShopSection |
| `cart_rw` | `cart_r` | View listings from a member's shopping cart. | Cart and CartListing |
|     | `cart_w` | Add and remove listings from a member's shopping cart. | Cart and CartListing |
| `recommend_rw` | `recommend_r` | View a member's recommended listings. | Listing |
|     | `recommend_w` | Accept and reject a member's recommended listings. | Listing |

2.  `collection_rw`, `page_collection_rw`, and `activity_r` are not implemented because no active end points use them.
3.  `treasury_r` and `treasury_w` are not valid because we discontinued the treasury feature.

### Exchange OAuth 1.0 Token for OAuth 2.0 Token[#](https://developers.etsy.com/documentation/essentials/authentication/#exchange-oauth-10-token-for-oauth-20-token "Direct link to heading")

Etsy now supports OAuth 2.0 and existing Open API v3 applications that use OAuth 1.0 must either exchange their OAuth 1.0 access tokens for OAuth 2.0 access tokens or generate OAuth 2.0 access tokens using the OAuth 2.0 Authentication Code flow to use Open API v3 endpoints.

To exchange an OAuth 1.0 token for a new OAuth 2.0 token, make a POST request to `https://api.etsy.com/v3/public/oauth/token` with the following parameters in the request body in `application/x-www-form-urlencoded` format:

| Parameter Name | Description |
| --- | --- |
| `grant_type` | Must be the value `token_exchange` |
| `client_id` | An Etsy App API Key _keystring_ for the app. |
| `legacy_token` | The _legacy token_ is the current OAuth 1.0 token used by the application. |

For example, to exchange an access for a new OAuth 2.0 access token on an Etsy app with an App API Key _keystring_ of `1aa2bb33c44d55eeeeee6fff` and legacy token of `eeb39b80e3f43a4671b00dbedaa74e`, initiate a POST request:

The Etsy Open API responds to an authentic token exchange request with the following information in JSON format:

**Note:** OAuth 2.0 tokens generated from an OAuth 1.0 token exchange retain the scope(s) of the original OAuth 1.0 token.

---

### Rate Limits | Etsy Open API v3

Source: https://developers.etsy.com/documentation/essentials/rate-limits

Rate Limits | Etsy Open API v3

*   [Introduction](https://developers.etsy.com/documentation/)
*   [API Essentials](https://developers.etsy.com/documentation/essentials/rate-limits/#!)
    *   [Authentication](https://developers.etsy.com/documentation/essentials/authentication)
    *   [URL Syntax](https://developers.etsy.com/documentation/essentials/urlsyntax)
    *   [Definitions](https://developers.etsy.com/documentation/essentials/definitions)
    *   [Request Standards](https://developers.etsy.com/documentation/essentials/requests)
    *   [Rate Limits](https://developers.etsy.com/documentation/essentials/rate-limits)
    *   [Webhooks](https://developers.etsy.com/documentation/essentials/webhooks)
    *   [Get help](https://developers.etsy.com/documentation/get-help)
    *   [API testing policy](https://www.etsy.com/legal/policy/api-testing-policy/169130941112)
*   [Tutorials](https://developers.etsy.com/documentation/essentials/rate-limits/#!)
    *   [Overview](https://developers.etsy.com/documentation/tutorials/overview)
    *   [Quick Start Tutorial](https://developers.etsy.com/documentation/tutorials/quickstart)
    *   [Fulfillment Tutorial](https://developers.etsy.com/documentation/tutorials/fulfillment)
    *   [Listings Tutorial](https://developers.etsy.com/documentation/tutorials/listings)
    *   [Processing Profiles Migration](https://developers.etsy.com/documentation/tutorials/migration)
    *   [Third Variation Tutorial](https://developers.etsy.com/documentation/tutorials/third-variation)
    *   [Shop Management Tutorial](https://developers.etsy.com/documentation/tutorials/shopmanagement)
    *   [Payments Tutorial](https://developers.etsy.com/documentation/tutorials/payments)
    *   [Personalization Migration](https://developers.etsy.com/documentation/essentials/rate-limits/#!)
        *   [Multi Personalization Migration Guide](https://developers.etsy.com/documentation/tutorials/personalization-migration)
        *   [Endpoint Migration (backwards compatible)](https://developers.etsy.com/documentation/tutorials/personalization/endpoint-migration)
        *   [Examples for the Endpoint Migration Period](https://developers.etsy.com/documentation/tutorials/personalization/endpoint-migration-examples)
        *   [Multiple + New Question Type Support](https://developers.etsy.com/documentation/tutorials/personalization/multiple-and-new-question-type-support)
        *   [Examples for the Multiple + New Questions Type Support Period](https://developers.etsy.com/documentation/tutorials/personalization/multiple-and-new-question-type-support-examples)
*   [Manage your apps](https://www.etsy.com/developers)
*   [Terms of use](https://www.etsy.com/legal/api)

# Rate Limits

## Rate Limits and Authentication Types[#](https://developers.etsy.com/documentation/essentials/rate-limits/#rate-limits-and-authentication-types "Direct link to heading")

The API enforces **application-based rate limits**, which consist of Queries Per Day (**QPD**) and Queries Per Second (**QPS**). These limits apply per API Key for public authentication and per OAuth access token for private authentication.

**You can see your application's current rate limits in the [Developer Portal](https://www.etsy.com/developers/your-apps).**

* * *

## Daily Limit Mechanism (Sliding Window Structure)[#](https://developers.etsy.com/documentation/essentials/rate-limits/#daily-limit-mechanism-sliding-window-structure "Direct link to heading")

The Queries Per Day (**QPD**) limit does not operate on a fixed 24-hour cycle (e.g., midnight-to-midnight). Instead, we employ a progressive **Sliding Window Rate Limiting Algorithm** to maximize your API usage.

This mechanism calculates your usage based on the requests made over the **last rolling 24-hour period**.

### How the Sliding Window Works[#](https://developers.etsy.com/documentation/essentials/rate-limits/#how-the-sliding-window-works "Direct link to heading")

1.  **Buckets:** The 24-hour period is divided into a number of smaller, fixed time intervals called **buckets**. Your requests are recorded within these specific buckets.
2.  **Calculation:** Your application's total usage is the sum of requests recorded in all buckets that fall within the current rolling 24-hour window.
3.  **Sliding:** As time passes, the oldest bucket exits the 24-hour window, and a new, empty bucket enters. The quota consumed by the requests in the exiting bucket is **immediately freed up** and becomes available for use.

![Rate Limit Sliding Window](/assets/images/sliding_window_rate_limit_diagram-a89ed718930bedc79c3d8130b26950cc.png)

* * *

## Rate Limit Headers[#](https://developers.etsy.com/documentation/essentials/rate-limits/#rate-limit-headers "Direct link to heading")

### Successful Response[#](https://developers.etsy.com/documentation/essentials/rate-limits/#successful-response "Direct link to heading")

Every successful API response includes headers detailing your application's current usage status against its allocated limits.

| Header Name | Description | Example Value |
| --- | --- | --- |
| **`x-limit-per-second`** | The total QPS limit for your application's API key. | 150 |
| **`x-remaining-this-secon`** | The remaining number of calls your application can make in the current second. | 149 |
| **`x-limit-per-day`** | The total QPD limit (sliding 24-hour window) for your application's API key. | 100000 |
| **`x-remaining-today`** | The remaining number of calls your application can make within the current 24-hour sliding window. | 99998 |

### Response to Exceeded Limits and Warnings[#](https://developers.etsy.com/documentation/essentials/rate-limits/#response-to-exceeded-limits-and-warnings "Direct link to heading")

Rate limits are evaluated in order: **QPS first, then QPD**. If either limit is exceeded, an error status `429` is returned, along with the `retry-after` header.

| Header Name | Description |
| --- | --- |
| **`retry-after`** | The estimated time (in seconds) the client should wait before retrying a request after hitting a rate limit. |

* * *

## Requesting Higher Limits and Recommendations[#](https://developers.etsy.com/documentation/essentials/rate-limits/#requesting-higher-limits-and-recommendations "Direct link to heading")

### Request for Increased Quota[#](https://developers.etsy.com/documentation/essentials/rate-limits/#request-for-increased-quota "Direct link to heading")

Applications needing higher limits must contact contact us [developer@etsy.com](mailto:developer@etsy.com) to submit an upgrade request. This process requires:

1.  A detailed description of the application.
2.  An estimate of the required call usage (QPD/QPS).

### Optimization Recommendations[#](https://developers.etsy.com/documentation/essentials/rate-limits/#optimization-recommendations "Direct link to heading")

To maximize your existing quota and improve application responsiveness:

*   **Implement Caching:** Utilize caching strategies to minimize the number of redundant API calls.
*   **Handle `429` Responses:** Implement a robust retry strategy, such as **exponential backoff**, when receiving a `429` error. While the `retry-after` header provides an estimate, a strategic backoff prevents immediate retry storms.

*   [Rate Limits and Authentication Types](https://developers.etsy.com/documentation/essentials/rate-limits/#rate-limits-and-authentication-types)
*   [Daily Limit Mechanism (Sliding Window Structure)](https://developers.etsy.com/documentation/essentials/rate-limits/#daily-limit-mechanism-sliding-window-structure)
    *   [How the Sliding Window Works](https://developers.etsy.com/documentation/essentials/rate-limits/#how-the-sliding-window-works)
*   [Rate Limit Headers](https://developers.etsy.com/documentation/essentials/rate-limits/#rate-limit-headers)
    *   [Successful Response](https://developers.etsy.com/documentation/essentials/rate-limits/#successful-response)
    *   [Response to Exceeded Limits and Warnings](https://developers.etsy.com/documentation/essentials/rate-limits/#response-to-exceeded-limits-and-warnings)
*   [Requesting Higher Limits and Recommendations](https://developers.etsy.com/documentation/essentials/rate-limits/#requesting-higher-limits-and-recommendations)
    *   [Request for Increased Quota](https://developers.etsy.com/documentation/essentials/rate-limits/#request-for-increased-quota)
    *   [Optimization Recommendations](https://developers.etsy.com/documentation/essentials/rate-limits/#optimization-recommendations)

---

### Request Standards | Etsy Open API v3

Source: https://developers.etsy.com/documentation/essentials/requests

Request Standards | Etsy Open API v3

*   [Introduction](https://developers.etsy.com/documentation/)
*   [API Essentials](https://developers.etsy.com/documentation/essentials/requests/#!)
    *   [Authentication](https://developers.etsy.com/documentation/essentials/authentication)
    *   [URL Syntax](https://developers.etsy.com/documentation/essentials/urlsyntax)
    *   [Definitions](https://developers.etsy.com/documentation/essentials/definitions)
    *   [Request Standards](https://developers.etsy.com/documentation/essentials/requests)
    *   [Rate Limits](https://developers.etsy.com/documentation/essentials/rate-limits)
    *   [Webhooks](https://developers.etsy.com/documentation/essentials/webhooks)
    *   [Get help](https://developers.etsy.com/documentation/get-help)
    *   [API testing policy](https://www.etsy.com/legal/policy/api-testing-policy/169130941112)
*   [Tutorials](https://developers.etsy.com/documentation/essentials/requests/#!)
    *   [Overview](https://developers.etsy.com/documentation/tutorials/overview)
    *   [Quick Start Tutorial](https://developers.etsy.com/documentation/tutorials/quickstart)
    *   [Fulfillment Tutorial](https://developers.etsy.com/documentation/tutorials/fulfillment)
    *   [Listings Tutorial](https://developers.etsy.com/documentation/tutorials/listings)
    *   [Processing Profiles Migration](https://developers.etsy.com/documentation/tutorials/migration)
    *   [Third Variation Tutorial](https://developers.etsy.com/documentation/tutorials/third-variation)
    *   [Shop Management Tutorial](https://developers.etsy.com/documentation/tutorials/shopmanagement)
    *   [Payments Tutorial](https://developers.etsy.com/documentation/tutorials/payments)
    *   [Personalization Migration](https://developers.etsy.com/documentation/essentials/requests/#!)
        *   [Multi Personalization Migration Guide](https://developers.etsy.com/documentation/tutorials/personalization-migration)
        *   [Endpoint Migration (backwards compatible)](https://developers.etsy.com/documentation/tutorials/personalization/endpoint-migration)
        *   [Examples for the Endpoint Migration Period](https://developers.etsy.com/documentation/tutorials/personalization/endpoint-migration-examples)
        *   [Multiple + New Question Type Support](https://developers.etsy.com/documentation/tutorials/personalization/multiple-and-new-question-type-support)
        *   [Examples for the Multiple + New Questions Type Support Period](https://developers.etsy.com/documentation/tutorials/personalization/multiple-and-new-question-type-support-examples)
*   [Manage your apps](https://www.etsy.com/developers)
*   [Terms of use](https://www.etsy.com/legal/api)

# Request Standards

Etsy API endpoints are accessible at URLs starting with `https://api.etsy.com/v3/` or `https://openapi.etsy.com/v3/`. The two hostnames are equivalent and you can use either. Throughout this document we use `api.etsy.com` but openapi.etsy.com may be substituted instead.

## Making Requests[#](https://developers.etsy.com/documentation/essentials/requests/#making-requests "Direct link to heading")

Every request to a v3 endpoint must include:

| Category | Element | Code | Description |
| --- | --- | --- | --- |
| endpoint | protocol | `https://` | Etsy Open API endpoints require SSL/TLS requests which must use an `https://` prefix. |
| endpoint | URL | `api.etsy.com/v3/` | Etsy API endpoints are accessible at URLs starting with `https://api.etsy.com/v3/`. |
| header | API key | `x-api-key:` ... | Your Etsy App API Key _keystring_ and _shared secret_, separated by a colon (`:`), which you can find in [Your Apps](https://www.etsy.com/developers/your-apps). |
| header | oauth token | `Authorization: Bearer` ... | Any request that requires an oauth2 scope (e.g., `listings_w`) requires an authorization header. The value following `Bearer` combines a numeric user id with an oauth2 token, separted by a period (.). See [Authentication](https://developers.etsy.com/documentation/essentials/requests/authentication) for details. |

For example, if your

*   client ID is `exJeyZtXODeekHfX8VRgMQ`
*   shared secret is `a1b2c3d4e5`
*   numeric user ID is `12345678`
*   access token is `VJTv9qyjwJbYlARxdFmEEQ`

the following is a valid request:

curl --request GET 'https://api.etsy.com/v3/application/listings?state=active' \\

\--header 'x-api-key: exJeyZtXODeekHfX8VRgMQ:a1b2c3d4e5' \\

\--header 'authorization: Bearer 12345678.VJTv9qyjwJbYlARxdFmEEQ' \\

Copy

## Encoding[#](https://developers.etsy.com/documentation/essentials/requests/#encoding "Direct link to heading")

All network communication with Open API v3 uses UTF-8 encoding. When creating HTTP requests for a REST API application, specify UTF-8 encoding support. For example, to set the UTF-8 encoding support in an HTTP header for a POST request, include charset=utf-8 in the content-type field, as shown in the following code:

POST /v3/application/shops/12345/listings HTTPS/1.3

Host: api.etsy.com

Content-Type: application/x-www-form-urlencoded; charset=utf-8

Copy

When creating application code for a REST API application, provide UTF-8 encoding support using the language-specific content type settings. For example, to set the content type to UTF-8 in a Java HttpURLConnection object called `conn`, use the following code:

conn.setRequestProperty("contentType", "application/json; charset=utf-8");

Copy

*   [Making Requests](https://developers.etsy.com/documentation/essentials/requests/#making-requests)
*   [Encoding](https://developers.etsy.com/documentation/essentials/requests/#encoding)

---

### URL Syntax | Etsy Open API v3

Source: https://developers.etsy.com/documentation/essentials/urlsyntax

# URL Syntax | Etsy Open API v3

The URL for any Open API v3 request determines which specific resource or collection of resources services the request. Open API v3 URLs have the following syntax:

where

*   `https://api.etsy.com/v3/application/` is the default context root and directory for accessing REST API resources.
*   `<resource>` is the name of the REST API resource, all of which are listed in [API reference](https://developers.etsy.com/documentation/reference)
*   `?<parameter=value>` specifies a parameter name and value pair that a request accepts. The endpoint definitions provide details on which parameters to use for each request.

For example, in

*   `https://api.etsy.com/v3/application/` is the default context root and directory for accessing REST API resources.
*   `listings` is the name of the shop listings REST API resource, described in the [getListingsByShop](https://developers.etsy.com/documentation/reference/#operation/getListingsByShop) endpoint reference.
*   `?state=active` is a state parameter to filter the listings results.

## Asset ID Parameters[#](https://developers.etsy.com/documentation/essentials/urlsyntax/#asset-id-parameters "Direct link to heading")

Resource paths in a URL can contain the unique IDs of Etsy assets such as shops, listings, transactions, receipts, images, etc. For example, you would use the following URL pattern to send requests to the [delete listing image](https://developers.etsy.com/documentation/reference/#operation/deleteListingImage) endpoint:

Where the `{shop_id}`, `{listing_id}`, and `{listing_image_id}` parameters must be replaced by specific IDs identifying the shop, listing, and listing image to delete. Resource path parameters must appear in the URL; applications cannot send them in the HTTP Header and all ID parameters listed in the URL pattern must be present.

## Parameter Types[#](https://developers.etsy.com/documentation/essentials/urlsyntax/#parameter-types "Direct link to heading")

Many API methods take one or more parameters, either as query parameters of the URL itself, or as POST parameters in the HTTP header. The documentation for each method references these standard types:

| Param Type | Meaning |
| --- | --- |
| Array of <_type_\> | A list of values, separated by commas (","). Do not include parentheses or brackets. Each value must be a valid instance of _type_. |
| boolean | A logical true or false value. May be passed to API requests as the strings "true" or "false" or "1" and "0". In JSON output, symbolic constants are used. |
| Enum: _`values`_ | A predefined list of string values, for example `"oz"`, `"lb"`, `"g"`, and `"kg"` Assigning any value not in the list results in an error. |
| integer | A whole number value. |
| number <_type_\> | A number with or without a decimal point. Represented in output as a string, to avoid precision errors. Values must be a valid instance of _type_. |
| Nullable | Accepts `null` as a value. |
| string | Any string. |
| string <_type_\> | A string representing something other than text. For example, if _type_ is `binary`, the string represents an image or if _type_ is `ISO 3166-1 alpha-2` the string is a country code. |

## Standard Parameters[#](https://developers.etsy.com/documentation/essentials/urlsyntax/#standard-parameters "Direct link to heading")

Here is a list of standard parameters that are accepted by many or all API methods:

| Parameter | Type | Meaning |
| --- | --- | --- |
| `x-api-key` | string | Your Etsy App API Key _keystring_ and _shared secret_, separated by a colon (`:`), which you can find in [Your Apps](https://www.etsy.com/developers/your-apps). Required for all endpoint requests. **Should be passed as a header** |
| `limit` | integer | Specifies the maximum number of records to return for a request that returns multiple results. The default value is 25. |
| `offset` | integer | Skips the first N records before returning results. Combine with `limit` for pagination. The default value is 0. |

## Pagination[#](https://developers.etsy.com/documentation/essentials/urlsyntax/#pagination "Direct link to heading")

The minimum and default records returned per call is 25, and the maximum number that can be returned is 100. We provide `limit` and `offset` parameters to allow navigation through larger data sets. Responses include a count field, which specifies the total number of records available via pagination. For performance reasons, the offset parameter is limited to a maximum value of 12000.

The `count` property in the response body will provide the total number of records without the `limit` applied. Here's an example of sequential requests to paginate through the most recent 300 listings, 50 at a time:

---

### Webhooks | Etsy Open API v3

Source: https://developers.etsy.com/documentation/essentials/webhooks

# Webhooks | Etsy Open API v3

Webhooks provide real-time notifications to approved Etsy applications when defined events occur. Rather than polling the API for changes, your app can subscribe to webhook events and receive updates as soon as they happen.

You can see our available events [here](https://developers.etsy.com/documentation/essentials/webhooks/#available-events). Watch our GitHub Announcements for updates: [https://github.com/etsy/open-api/discussions/categories/announcements](https://github.com/etsy/open-api/discussions/categories/announcements)

Webhook functionality is available for both **commercial** and **personal** applications!

## Webhook Concepts[#](https://developers.etsy.com/documentation/essentials/webhooks/#webhook-concepts "Direct link to heading")

*   **Endpoints** – A destination URL where Etsy delivers webhook messages for the events you subscribe to.
*   **Events** – Specific actions or changes that trigger a webhook.
*   **Messages/Deliveries** – Each time an event occurs, Etsy sends a message (payload) to the configured endpoint.
*   **Signing Secrets** – Used to validate the authenticity of incoming webhook requests.
*   **Retries** – Etsy automatically retries delivery when your endpoint fails to acknowledge receipt.

## Managing Webhooks[#](https://developers.etsy.com/documentation/essentials/webhooks/#managing-webhooks "Direct link to heading")

### Prerequisites[#](https://developers.etsy.com/documentation/essentials/webhooks/#prerequisites "Direct link to heading")

*   You must have a valid OAuth 2.0 access token with the appropriate scopes (depending on your app’s function).
    *   For webhook delivery, provide a publicly accessible callback URL configured to receive POST requests from Etsy.

## Available Events[#](https://developers.etsy.com/documentation/essentials/webhooks/#available-events "Direct link to heading")

We currently support the following events:

*   `order.paid` – delivered immediately when an order receives payment.
*   `order.canceled` - delivered immediately when a seller inititaites a cancelation.
*   `order.shipped` - delivered immediately when shipping information is created for a product of a shop's receipt.
*   `order.delivered` - delivered immediately when an order is marked as delivered.

Stay tuned to our [announcements](https://github.com/etsy/open-api/discussions/categories/announcements) for more events coming soon!

## Payload Structure[#](https://developers.etsy.com/documentation/essentials/webhooks/#payload-structure "Direct link to heading")

Each webhook event is delivered as a JSON payload. Although payloads differ by event type, all webhook deliveries share the following common fields:

## Payload Structure[#](https://developers.etsy.com/documentation/essentials/webhooks/#payload-structure-1 "Direct link to heading")

Each webhook event is delivered as a JSON payload. Although payloads differ by event type, all webhook deliveries share the following common fields:

*   `event_type` – The name of the event that triggered the webhook (e.g., `order.paid`).
*   `resource_url` - A prepared URL to call back and get the updated data related to the event that was triggered.
*   `shop_id` - The id of the shop related to the event that was triggered.

Here’s an example of how an `order.paid` payload would look like:

## Verifying Webhook Signatures[#](https://developers.etsy.com/documentation/essentials/webhooks/#verifying-webhook-signatures "Direct link to heading")

### Why signature verification matters[#](https://developers.etsy.com/documentation/essentials/webhooks/#why-signature-verification-matters "Direct link to heading")

Without verifying signatures, malicious actors could send forged webhook requests to your endpoint and trigger unintended behaviour. Proper verification ensures that:

*   The request originated from Etsy
*   The payload has not been tampered with
*   You avoid processing duplicate or replayed messages

### What do you need[#](https://developers.etsy.com/documentation/essentials/webhooks/#what-do-you-need "Direct link to heading")

*   A signing secret, which you can retrieve from your Webhook Portal ![img](https://developers.etsy.com/assets/images/signing_secret-4c35a363be251ea116371faec17fab7e.png)
*   You can find this in the details of your webhook event.
*   Three special headers + raw body from each request, to be used to validate the payload

### What you will see on incoming requests[#](https://developers.etsy.com/documentation/essentials/webhooks/#what-you-will-see-on-incoming-requests "Direct link to heading")

Each webhook request will be an HTTP POST to your endpoint that includes:

*   Raw request body (JSON)
*   Headers:
    *   `webhook-id` – unique ID of the webhook call (even on retries)
    *   `webhook-timestamp` – unix timestamp (seconds) when the event was emitted
    *   `webhook-signature` – this is what will be used to compare with your signing secret

### How to compute and verify the signature[#](https://developers.etsy.com/documentation/essentials/webhooks/#how-to-compute-and-verify-the-signature "Direct link to heading")

1.  Build the "signed content” string such as:

In this example, `raw_body` is the exact bytes/string of the HTTP body **before** any JSON parsing.

2.  Derive the secret key.

*   Take your secret from the dashboard  
    ![img](https://developers.etsy.com/assets/images/signing_secret-4c35a363be251ea116371faec17fab7e.png)
*   Remove the `whsec_` prefix.
*   Base64-decode the remaining part of the bytes.

3.  Compute the expected signature:

*   HMAC-SHA256 over `signed_content` (step 1) using the decoded secret key (step 2).
*   Base64-encode the result

Here’s a pseudo code example of what this would look like:

4.  Compare against the `webhook-signature` header.

*   Check if any of the entries (if more than one) equals your `expected_sig` (step 3).
*   If there’s **no match**, **reject** the webhook.
*   If it’s a match, you may proceed with JSON parsing of the raw body or what your integration requires to interpret this data.

### Preventing Replay Attacks[#](https://developers.etsy.com/documentation/essentials/webhooks/#preventing-replay-attacks "Direct link to heading")

Even if the signature matches, an attacker could replay an old, captured request. To mitigate that:

1.  Read webhook-timestamp
2.  Compare it to your current server time
3.  Reject if it’s older/newer than your allowed margin.

In your code, it should roughly look like this:

## Managing Webhook Events[#](https://developers.etsy.com/documentation/essentials/webhooks/#managing-webhook-events "Direct link to heading")

From the Webhooks section of your application dashboard, you can:

*   View a list of your active webhook subscriptions.
*   Inspect details of each subscription, including event type, callback URL, secret (masked), creation date, and delivery history.
*   Delete or disable subscriptions you no longer need, which will immediately stop event deliveries.

When you subscribe to an event, Etsy will send a POST request to your callback URL when the event is triggered.

### Access the Webhooks Portal[#](https://developers.etsy.com/documentation/essentials/webhooks/#access-the-webhooks-portal "Direct link to heading")

1.  Navigate to **Manage your apps** in the Developer Portal.

![img](https://developers.etsy.com/assets/images/manage_your_app_step_1-44afde2a232735de449f79ce710bfe6a.png)

2.  Click the dropdown menu for your **commercial** app and select **Go to Webhook portal**.

![img](https://developers.etsy.com/assets/images/dropdown_menu-d1124d8094ced477635869a00790cf3d.png)

![img](https://developers.etsy.com/assets/images/dropdown_menu_show-e0962fb2e37550facf49c7a7dec3d970.png)

You will see your portal.

![img](https://developers.etsy.com/assets/images/portal_view-9296ab48b0ea1401f24a84f4ee9dbedf.png)

### Configure a Subscription[#](https://developers.etsy.com/documentation/essentials/webhooks/#configure-a-subscription "Direct link to heading")

Assuming you followed the steps from [Access the Webhooks Portal](https://developers.etsy.com/documentation/essentials/webhooks/#access-the-webhooks-portal), to configure a subscription:

1.  Choose **+Add Endpoint**.

![img](https://developers.etsy.com/assets/images/add_endpoint-e71abe6d7c4af498053b59625e7e649e.png)

2.  Enter your **callback URL** and the event you wish to subscribe to.

![img](https://developers.etsy.com/assets/images/create_form-e8dd20c373813bae831976a7efee9830.png)

3.  Click **Create**.

Once saved, your callback URL will receive webhook payloads when the event occurs.

##### Important

Because webhooks deliver asynchronous notifications, ensure your server can handle incoming POST requests and validate signatures.

### How to Unsubscribe (Delete or Disable a Webhook)[#](https://developers.etsy.com/documentation/essentials/webhooks/#how-to-unsubscribe-delete-or-disable-a-webhook "Direct link to heading")

##### warning

Disabled endpoints remain visible in your dashboard and can be re-enabled at any time. _Deleted endpoints cannot be recovered._

#### Delete a Webhook[#](https://developers.etsy.com/documentation/essentials/webhooks/#delete-a-webhook "Direct link to heading")

Assuming you followed the steps from [Access the Webhooks Portal](https://developers.etsy.com/documentation/essentials/webhooks/#access-the-webhooks-portal),to fully delete a webhook subscription:

1.  Select the subscription you wish to remove.
    
2.  Click the 3 dots on the upper right corner and select **Delete**. ![img](https://developers.etsy.com/assets/images/select_dropdown-67006efeabdeab843a71e01886dec35c.png) ![img](https://developers.etsy.com/assets/images/delete_select-52642e3c42bd4547ec72cb06fb2555b2.png)
    
3.  Confirm deletion. ![img](https://developers.etsy.com/assets/images/confirm_delete-05d139ee919b98a04b7db1590295b33e.png)
    

After deletion, no further events will be delivered for that subscription.

##### caution

Deleting an endpoint will permanently delete all of its data.

#### Disable a Webhook[#](https://developers.etsy.com/documentation/essentials/webhooks/#disable-a-webhook "Direct link to heading")

Assuming you followed the steps from [Access the Webhooks Portal](https://developers.etsy.com/documentation/essentials/webhooks/#access-the-webhooks-portal), to disable a webhook subscription:

1.  Select the subscription you wish to disable.
    
2.  Click the 3 dots on the upper right corner and select **Disable Endpoint**. ![img](https://developers.etsy.com/assets/images/select_dropdown-67006efeabdeab843a71e01886dec35c.png) ![img](https://developers.etsy.com/assets/images/disable_select-f87acd8b9265456a431ef4fcff23e3cf.png)
    

To enable the event again, do the same process but click **Enable Endpoint**. ![img](https://developers.etsy.com/assets/images/enable_endpoint-4b5cf0487c6d2166a4e261098f2fe8b6.png)

## Monitoring Webhook Activity[#](https://developers.etsy.com/documentation/essentials/webhooks/#monitoring-webhook-activity "Direct link to heading")

Each subscription includes tools and data to help monitor webhook performance and flow. These insights allow developers to troubleshoot issues and understand how the webhook behaves over time.

### General Information[#](https://developers.etsy.com/documentation/essentials/webhooks/#general-information "Direct link to heading")

The detail view displays metadata about the subscription, including the date and time it was created. This helps track when the webhook was first configured.

![img](https://developers.etsy.com/assets/images/webhook_detail-ac7ff9178ed5a17c3100f4a75fa9cd28.png)

### Delivery Stats[#](https://developers.etsy.com/documentation/essentials/webhooks/#delivery-stats "Direct link to heading")

The monitoring section provides an overview of delivery performance. This may include the number of events delivered, recent activity, and overall delivery patterns.

![img](https://developers.etsy.com/assets/images/stats-9c9a98a641913d7aa4219e1ad04edf38.png)

### Message Attempts[#](https://developers.etsy.com/documentation/essentials/webhooks/#message-attempts "Direct link to heading")

For each attempted delivery, you can view whether a message was successfully delivered or if retries occurred. This supports debugging of callback endpoints and helps identify transient or persistent delivery issues.

![img](https://developers.etsy.com/assets/images/message_attempts-6f6f0eb7ca2e74cfd720c4dde7418e58.png)

### Payload Details[#](https://developers.etsy.com/documentation/essentials/webhooks/#payload-details "Direct link to heading")

Recent event payloads appear in the activity log. Developers can inspect these payloads to validate data fields, ensure that their system is parsing them correctly, or verify that events are arriving in the expected format.

By clicking one of the message attempts, you can see the message’s details.

![img](https://developers.etsy.com/assets/images/payload_details-2695c3e53277a800cf13fe1e7ae0ad01.png)

### Endpoint Status[#](https://developers.etsy.com/documentation/essentials/webhooks/#endpoint-status "Direct link to heading")

The detail view displays whether the endpoint is active or disabled. Disabled endpoints do not receive events until re-enabled.

![img](https://developers.etsy.com/assets/images/endpoint_status-40a36c54511edae3ec69b0fc113a9e0e.png)

## Delivery Retries[#](https://developers.etsy.com/documentation/essentials/webhooks/#delivery-retries "Direct link to heading")

We attempt to deliver each webhook message based on a retry schedule with exponential backoff.

### The Schedule[#](https://developers.etsy.com/documentation/essentials/webhooks/#the-schedule "Direct link to heading")

Each message is attempted based on the following schedule, where each period is started following the failure of the preceding attempt:

*   Immediately
*   5 seconds
*   5 minutes
*   30 minutes
*   2 hours
*   5 hours
*   10 hours
*   10 hours (in addition to the previous)

If an endpoint is removed or disabled delivery attempts to the endpoint will be disabled as well.

For example, an attempt that fails three times before eventually succeeding will be delivered roughly 35 minutes and 5 seconds following the first attempt.

### Manual retries[#](https://developers.etsy.com/documentation/essentials/webhooks/#manual-retries "Direct link to heading")

You can also use the application portal to manually retry each message at any time, or automatically retry ("Recover") all failed messages starting from a given date.

![img](https://developers.etsy.com/assets/images/recover_replay-f4a77e2c3f9637ce3f86ebc463fb04a1.png)

## Testing Webhooks[#](https://developers.etsy.com/documentation/essentials/webhooks/#testing-webhooks "Direct link to heading")

The Webhook Portal includes tools for sending test events to your endpoint. Use this to validate:

*   Endpoint availability
*   Signature verification
*   Event-processing logic
*   Error-handling behavior

You can access the testing tab of your webhook event by clicking the event to access its details.

![img](https://developers.etsy.com/assets/images/access_details-28b0aab552bf9091be7aa9748e85ea2a.png)

And then selecting the **Testing** tab.

![img](https://developers.etsy.com/assets/images/testing_tab-b88920ca304fcca418449a66fdd95e5d.png)

---

### Get help | Etsy Open API v3

Source: https://developers.etsy.com/documentation/get-help/

Get help | Etsy Open API v3

*   [Introduction](https://developers.etsy.com/documentation/)
*   [API Essentials](https://developers.etsy.com/documentation/get-help/#!)
    *   [Authentication](https://developers.etsy.com/documentation/essentials/authentication)
    *   [URL Syntax](https://developers.etsy.com/documentation/essentials/urlsyntax)
    *   [Definitions](https://developers.etsy.com/documentation/essentials/definitions)
    *   [Request Standards](https://developers.etsy.com/documentation/essentials/requests)
    *   [Rate Limits](https://developers.etsy.com/documentation/essentials/rate-limits)
    *   [Webhooks](https://developers.etsy.com/documentation/essentials/webhooks)
    *   [Get help](https://developers.etsy.com/documentation/get-help)
    *   [API testing policy](https://www.etsy.com/legal/policy/api-testing-policy/169130941112)
*   [Tutorials](https://developers.etsy.com/documentation/get-help/#!)
    *   [Overview](https://developers.etsy.com/documentation/tutorials/overview)
    *   [Quick Start Tutorial](https://developers.etsy.com/documentation/tutorials/quickstart)
    *   [Fulfillment Tutorial](https://developers.etsy.com/documentation/tutorials/fulfillment)
    *   [Listings Tutorial](https://developers.etsy.com/documentation/tutorials/listings)
    *   [Processing Profiles Migration](https://developers.etsy.com/documentation/tutorials/migration)
    *   [Third Variation Tutorial](https://developers.etsy.com/documentation/tutorials/third-variation)
    *   [Shop Management Tutorial](https://developers.etsy.com/documentation/tutorials/shopmanagement)
    *   [Payments Tutorial](https://developers.etsy.com/documentation/tutorials/payments)
    *   [Personalization Migration](https://developers.etsy.com/documentation/get-help/#!)
        *   [Multi Personalization Migration Guide](https://developers.etsy.com/documentation/tutorials/personalization-migration)
        *   [Endpoint Migration (backwards compatible)](https://developers.etsy.com/documentation/tutorials/personalization/endpoint-migration)
        *   [Examples for the Endpoint Migration Period](https://developers.etsy.com/documentation/tutorials/personalization/endpoint-migration-examples)
        *   [Multiple + New Question Type Support](https://developers.etsy.com/documentation/tutorials/personalization/multiple-and-new-question-type-support)
        *   [Examples for the Multiple + New Questions Type Support Period](https://developers.etsy.com/documentation/tutorials/personalization/multiple-and-new-question-type-support-examples)
*   [Manage your apps](https://www.etsy.com/developers)
*   [Terms of use](https://www.etsy.com/legal/api)

# Get help

*   If you have a suggestion for our new API or documentation, you can discuss with other Etsy Open API developers on [Github Discussions](https://github.com/etsy/open-api/discussions).
*   Similarly, if you suspect you’ve found a bug, please report it on [Github Discussions](https://github.com/etsy/open-api/discussions).
*   If you believe something is wrong with your application, please contact us at [developers@etsy.com](mailto:developers@etsy.com).

---

### Reference | Etsy Open API v3

Source: https://developers.etsy.com/documentation/reference/

# Reference | Etsy Open API v3

`{`

*   `"listing_id": 1,`
    
*   `"user_id": 1,`
    
*   `"shop_id": 1,`
    
*   `"title": "string",`
    
*   `"description": "string",`
    
*   `"state": "active",`
    
*   `"creation_timestamp": 946684800,`
    
*   `"created_timestamp": 946684800,`
    
*   `"ending_timestamp": 946684800,`
    
*   `"original_creation_timestamp": 946684800,`
    
*   `"last_modified_timestamp": 946684800,`
    
*   `"updated_timestamp": 946684800,`
    
*   `"state_timestamp": 946684800,`
    
*   `"quantity": 0,`
    
*   `"shop_section_id": 1,`
    
*   `"featured_rank": 0,`
    
*   `"url": "string",`
    
*   `"num_favorers": 0,`
    
*   `"non_taxable": true,`
    
*   `"is_taxable": true,`
    
*   `"is_customizable": true,`
    
*   `"is_personalizable": true,`
    
*   `"personalization_is_required": true,`
    
*   `"personalization_char_count_max": 0,`
    
*   `"personalization_instructions": "string",`
    
*   `"listing_type": "physical",`
    
*   `"tags": [`
    
    *   `"string"`
        
    
    `],`
    
*   `"materials": [`
    
    *   `"string"`
        
    
    `],`
    
*   `"shipping_profile_id": 1,`
    
*   `"return_policy_id": 1,`
    
*   `"processing_min": 0,`
    
*   `"processing_max": 0,`
    
*   `"who_made": "i_did",`
    
*   `"when_made": "made_to_order",`
    
*   `"is_supply": true,`
    
*   `"item_weight": 0,`
    
*   `"item_weight_unit": "oz",`
    
*   `"item_length": 0,`
    
*   `"item_width": 0,`
    
*   `"item_height": 0,`
    
*   `"item_dimensions_unit": "in",`
    
*   `"is_private": true,`
    
*   `"style": [`
    
    *   `"string"`
        
    
    `],`
    
*   `"file_data": "string",`
    
*   `"has_variations": true,`
    
*   `"should_auto_renew": true,`
    
*   `"language": "string",`
    
*   `"price": {`
    
    *   `"amount": 0,`
        
    *   `"divisor": 0,`
        
    *   `"currency_code": "string"`
        
    
    `},`
    
*   `"converted_price": {`
    
    *   `"amount": 0,`
        
    *   `"divisor": 0,`
        
    *   `"currency_code": "string"`
        
    
    `},`
    
*   `"taxonomy_id": 0,`
    
*   `"readiness_state_id": 1,`
    
*   `"suggested_title": "string",`
    
*   `"shipping_profile": {`
    
    *   `"shipping_profile_id": 1,`
        
    *   `"title": "string",`
        
    *   `"user_id": 1,`
        
    *   `"origin_country_iso": "string",`
        
    *   `"is_deleted": true,`
        
    *   `"shipping_profile_destinations": [`
        
        *   `{`
            
            *   `"shipping_profile_destination_id": 1,`
                
            *   `"shipping_profile_id": 1,`
                
            *   `"origin_country_iso": "string",`
                
            *   `"destination_country_iso": "string",`
                
            *   `"destination_region": "eu",`
                
            *   `"primary_cost": {`
                
                *   `"amount": 0,`
                    
                *   `"divisor": 0,`
                    
                *   `"currency_code": "string"`
                    
                
                `},`
                
            *   `"secondary_cost": {`
                
                *   `"amount": 0,`
                    
                *   `"divisor": 0,`
                    
                *   `"currency_code": "string"`
                    
                
                `},`
                
            *   `"shipping_carrier_id": 0,`
                
            *   `"mail_class": "string",`
                
            *   `"min_delivery_days": 1,`
                
            *   `"max_delivery_days": 1`
                
            
            `}`
            
        
        `],`
        
    *   `"shipping_profile_upgrades": [`
        
        *   `{`
            
            *   `"shipping_profile_id": 1,`
                
            *   `"upgrade_id": 1,`
                
            *   `"upgrade_name": "string",`
                
            *   `"type": 0,`
                
            *   `"rank": 0,`
                
            *   `"language": "string",`
                
            *   `"price": {`
                
                *   `"amount": 0,`
                    
                *   `"divisor": 0,`
                    
                *   `"currency_code": "string"`
                    
                
                `},`
                
            *   `"secondary_price": {`
                
                *   `"amount": 0,`
                    
                *   `"divisor": 0,`
                    
                *   `"currency_code": "string"`
                    
                
                `},`
                
            *   `"shipping_carrier_id": 0,`
                
            *   `"mail_class": "string",`
                
            *   `"min_delivery_days": 1,`
                
            *   `"max_delivery_days": 1`
                
            
            `}`
            
        
        `],`
        
    *   `"origin_postal_code": "string",`
        
    *   `"profile_type": "manual",`
        
    *   `"domestic_handling_fee": 0,`
        
    *   `"international_handling_fee": 0`
        
    
    `},`
    
*   `"user": {`
    
    *   `"user_id": 1,`
        
    *   `"primary_email": "user@example.com",`
        
    *   `"first_name": "string",`
        
    *   `"last_name": "string",`
        
    *   `"image_url_75x75": "string"`
        
    
    `},`
    
*   `"shop": {`
    
    *   `"shop_id": 1,`
        
    *   `"user_id": 1,`
        
    *   `"shop_name": "string",`
        
    *   `"create_date": 0,`
        
    *   `"created_timestamp": 0,`
        
    *   `"title": "string",`
        
    *   `"announcement": "string",`
        
    *   `"currency_code": "string",`
        
    *   `"is_vacation": true,`
        
    *   `"vacation_message": "string",`
        
    *   `"sale_message": "string",`
        
    *   `"digital_sale_message": "string",`
        
    *   `"update_date": 0,`
        
    *   `"updated_timestamp": 0,`
        
    *   `"listing_active_count": 0,`
        
    *   `"digital_listing_count": 0,`
        
    *   `"login_name": "string",`
        
    *   `"accepts_custom_requests": true,`
        
    *   `"policy_welcome": "string",`
        
    *   `"policy_payment": "string",`
        
    *   `"policy_shipping": "string",`
        
    *   `"policy_refunds": "string",`
        
    *   `"policy_additional": "string",`
        
    *   `"policy_seller_info": "string",`
        
    *   `"policy_update_date": 0,`
        
    *   `"policy_has_private_receipt_info": true,`
        
    *   `"has_unstructured_policies": true,`
        
    *   `"policy_privacy": "string",`
        
    *   `"vacation_autoreply": "string",`
        
    *   `"url": "string",`
        
    *   `"image_url_760x100": "string",`
        
    *   `"num_favorers": 0,`
        
    
    *   `"icon_url_fullxfull": "string",`
        
    *   `"is_using_structured_policies": true,`
        
    *   `"has_onboarded_structured_policies": true,`
        
    *   `"include_dispute_form_link": true,`
        
    *   `"is_direct_checkout_onboarded": true,`
        
    *   `"is_etsy_payments_onboarded": true,`
        
    *   `"is_calculated_eligible": true,`
        
    *   `"is_opted_in_to_buyer_promise": true,`
        
    *   `"is_shop_us_based": true,`
        
    *   `"transaction_sold_count": 0,`
        
    *   `"shipping_from_country_iso": "string",`
        
    *   `"shop_location_country_iso": "string",`
        
    *   `"review_count": 0,`
        
    *   `"review_average": 0`
        
    
    `},`
    
*   `"images": [`
    
    *   `{`
        
        *   `"listing_id": 1,`
            
        *   `"listing_image_id": 1,`
            
        *   `"hex_code": "string",`
            
        *   `"red": 0,`
            
        *   `"green": 0,`
            
        *   `"blue": 0,`
            
        *   `"hue": 0,`
            
        *   `"saturation": 0,`
            
        *   `"brightness": 0,`
            
        *   `"is_black_and_white": true,`
            
        *   `"creation_tsz": 0,`
            
        *   `"created_timestamp": 0,`
            
        *   `"rank": 0,`
            
        *   `"url_75x75": "string",`
            
        *   `"url_170x135": "string",`
            
        *   `"url_570xN": "string",`
            
        *   `"url_fullxfull": "string",`
            
        *   `"full_height": 0,`
            
        *   `"full_width": 0,`
            
        *   `"alt_text": "string"`
            
        
        `}`
        
    
    `],`
    
*   `"videos": [`
    
    *   `{`
        
        *   `"video_id": 1,`
            
        *   `"height": 0,`
            
        *   `"width": 0,`
            
        *   `"thumbnail_url": "string",`
            
        *   `"video_url": "string",`
            
        *   `"video_state": "active"`
            
        
        `}`
        
    
    `],`
    
*   `"inventory": {`
    
    *   `"products": [`
        
        *   `{`
            
            *   `"product_id": 1,`
                
            *   `"sku": "string",`
                
            *   `"is_deleted": true,`
                
            *   `"offerings": [`
                
                *   `{`
                    
                    *   `"offering_id": 1,`
                        
                    *   `"quantity": 0,`
                        
                    *   `"is_enabled": true,`
                        
                    *   `"is_deleted": true,`
                        
                    *   `"price": {`
                        
                        *   `"amount": 0,`
                            
                        *   `"divisor": 0,`
                            
                        *   `"currency_code": "string"`
                            
                        
                        `},`
                        
                    *   `"readiness_state_id": 1`
                        
                    
                    `}`
                    
                
                `],`
                
            *   `"property_values": [`
                
                *   `{`
                    
                    *   `"property_id": 1,`
                        
                    *   `"property_name": "string",`
                        
                    *   `"scale_id": 1,`
                        
                    *   `"scale_name": "string",`
                        
                    
                    `}`
                    
                
                `]`
                
            
            `}`
            
        
        `],`
        
    *   `"price_on_property": [`
        
        *   `0`
            
        
        `],`
        
    *   `"quantity_on_property": [`
        
        *   `0`
            
        
        `],`
        
    
    *   `"readiness_state_on_property": [`
        
        *   `1`
            
        
        `]`
        
    
    `},`
    
*   `"production_partners": [`
    
    *   `{`
        
        *   `"production_partner_id": 1,`
            
        *   `"partner_name": "string",`
            
        *   `"location": "string"`
            
        
        `}`
        
    
    `],`
    
*   `"skus": [`
    
    *   `"string"`
        
    
    `],`
    
*   `"translations": {`
    
    *   `"de": {`
        
        *   `"listing_id": 1,`
            
        *   `"language": "string",`
            
        *   `"title": "string",`
            
        *   `"description": "string",`
            
        
        `},`
        
    *   `"en-GB": {`
        
        *   `"listing_id": 1,`
            
        *   `"language": "string",`
            
        *   `"title": "string",`
            
        *   `"description": "string",`
            
        
        `},`
        
    *   `"en-IN": {`
        
        *   `"listing_id": 1,`
            
        *   `"language": "string",`
            
        *   `"title": "string",`
            
        *   `"description": "string",`
            
        
        `},`
        
    *   `"en-US": {`
        
        *   `"listing_id": 1,`
            
        *   `"language": "string",`
            
        *   `"title": "string",`
            
        *   `"description": "string",`
            
        
        `},`
        
    *   `"es": {`
        
        *   `"listing_id": 1,`
            
        *   `"language": "string",`
            
        *   `"title": "string",`
            
        *   `"description": "string",`
            
        
        `},`
        
    *   `"fr": {`
        
        *   `"listing_id": 1,`
            
        *   `"language": "string",`
            
        *   `"title": "string",`
            
        *   `"description": "string",`
            
        
        `},`
        
    *   `"it": {`
        
        *   `"listing_id": 1,`
            
        *   `"language": "string",`
            
        *   `"title": "string",`
            
        *   `"description": "string",`
            
        
        `},`
        
    *   `"ja": {`
        
        *   `"listing_id": 1,`
            
        *   `"language": "string",`
            
        *   `"title": "string",`
            
        *   `"description": "string",`
            
        
        `},`
        
    *   `"nl": {`
        
        *   `"listing_id": 1,`
            
        *   `"language": "string",`
            
        *   `"title": "string",`
            
        *   `"description": "string",`
            
        
        `},`
        
    *   `"pl": {`
        
        *   `"listing_id": 1,`
            
        *   `"language": "string",`
            
        *   `"title": "string",`
            
        *   `"description": "string",`
            
        
        `},`
        
    *   `"pt": {`
        
        *   `"listing_id": 1,`
            
        *   `"language": "string",`
            
        *   `"title": "string",`
            
        *   `"description": "string",`
            
        
        `},`
        
    *   `"ru": {`
        
        *   `"listing_id": 1,`
            
        *   `"language": "string",`
            
        *   `"title": "string",`
            
        *   `"description": "string",`
            
        
        `},`
        
    *   `"sv": {`
        
        *   `"listing_id": 1,`
            
        *   `"language": "string",`
            
        *   `"title": "string",`
            
        *   `"description": "string",`
            
        
        `}`
        
    
    `},`
    
*   `"views": 0,`
    
*   `"personalization": {`
    
    *   `"personalization_questions": [`
        
        *   `{`
            
            *   `"question_id": 1,`
                
            *   `"question_text": "string",`
                
            *   `"instructions": "string",`
                
            *   `"question_type": "string",`
                
            *   `"required": true,`
                
            *   `"max_allowed_characters": 0,`
                
            *   `"max_allowed_files": 0,`
                
            *   `"options": [`
                
                *   `{`
                    
                    *   `"option_id": 1,`
                        
                    *   `"label": "string"`
                        
                    
                    `}`
                    
                
                `]`
                
            
            `}`
            
        
        `]`
        
    
    `},`
    
*   `"buyer_price": {`
    
    *   `"base_price": {`
        
        *   `"amount": 0,`
            
        *   `"divisor": 0,`
            
        *   `"currency_code": "string"`
            
        
        `},`
        
    *   `"shipping_cost": {`
        
        *   `"amount": 0,`
            
        *   `"divisor": 0,`
            
        *   `"currency_code": "string"`
            
        
        `},`
        
    *   `"original_price": {`
        
        *   `"amount": 0,`
            
        *   `"divisor": 0,`
            
        *   `"currency_code": "string"`
            
        
        `},`
        
    *   `"discounted_price": {`
        
        *   `"amount": 0,`
            
        *   `"divisor": 0,`
            
        *   `"currency_code": "string"`
            
        
        `},`
        
    *   `"discount_amount": {`
        
        *   `"amount": 0,`
            
        *   `"divisor": 0,`
            
        *   `"currency_code": "string"`
            
        
        `},`
        
    *   `"discount_percentage": 0,`
        
    *   `"has_discount": true,`
        
    *   `"discount_start_epoch": 0,`
        
    *   `"discount_end_epoch": 0`
        
    
    `}`
    

`}`

---

### Fulfillment Tutorial | Etsy Open API v3

Source: https://developers.etsy.com/documentation/tutorials/fulfillment

# Fulfillment Tutorial | Etsy Open API v3

##### important

These tutorials are subject to change as endpoints change during our feedback period development. We welcome your feedback! If you find an error or have a suggestion, please post it in the [Open API GitHub Repository](https://github.com/etsy/open-api).

Fulfillment covers all shipping and handling activities required to ship and return customer orders. Additionally, when your app submits tracking information for shipping, Etsy triggers the final calculations for the purchase transaction, including Value Added Tax (VAT), tax, and shipping costs, resulting in complete receipts.

_Throughout this tutorial, the instructions reference REST resources, endpoints, parameters, and response fields, which we cover in detail in [Request Standards](https://developers.etsy.com/documentation/essentials/requests) and [URL Syntax](https://developers.etsy.com/documentation/essentials/urlsyntax)._

### `Authorization` and `x-api-key` header parameters[#](https://developers.etsy.com/documentation/tutorials/fulfillment/#authorization-and-x-api-key-header-parameters "Direct link to heading")

The endpoints in this tutorial require an OAuth token in the header with `transactions_r` and `transactions_w` scope. See the [Authentication topic](https://developers.etsy.com/documentation/essentials/authentication) for instructions on how to generate an OAuth token with these scopes.

In addition, all Open API V3 requests require the `x-api-key:` header with your shop's Etsy App API Key _keystring_ and _shared secret_, separated by a colon (`:`), which you can find in [Your Apps](https://www.etsy.com/developers/your-apps).

## Fulfilling Digital Orders[#](https://developers.etsy.com/documentation/tutorials/fulfillment/#fulfilling-digital-orders "Direct link to heading")

A seller typically does not need to do anything to fulfill orders for digital products after creating the listing and uploading files for buyers to buy. Buyers can download files from their purchase history forever once purchased, even if the seller stops offering that digital product for sale. However, there are a few important details a seller should be aware of following the fulfillment of a digital order:

1.  Files purchased by buyers in the past aren't automatically updated when you update the listing with newer version of the file.
2.  You must include any tax amounts applicable to the purchase in the purchase price, as Etsy doesn't add tax automatically to digital products except for calculated Value Added Tax (VAT) amounts. See [How VAT Works on Digital Items](https://help.etsy.com/hc/en-us/articles/115015587567-How-VAT-Works-on-Digital-Items?segment=selling) for more information on calculated VAT for digital products.

## Fulfilling Physical Product Orders[#](https://developers.etsy.com/documentation/tutorials/fulfillment/#fulfilling-physical-product-orders "Direct link to heading")

You fulfill physical product orders by shipping them and using the [`createReceiptShipment`](https://developers.etsy.com/documentation/reference/#operation/createReceiptShipment) to add the carrier and tracking information to your shop and customers. To get a list of shipping carriers for a shop, use [getShippingCarriers](https://developers.etsy.com/documentation/reference/#operation/getShippingCarriers) or see [Tracking updates for shipping carriers](https://developers.etsy.com/documentation/tutorials/fulfillment/#tracking-updates-for-shipping-carriers) below. Etsy posts the final transaction total immidately after a seller posts shipping details, so the response from createReceiptShipment includes calculated taxes, discounts, gift wrap prices, etc. **Additionally, successful createReceiptShipment requests send a notification email to the buyer.**

Sellers enter shipping costs as part of a shipping profile using [Shipping Profile endpoints](https://developers.etsy.com/documentation/reference#tag/Shop-ShippingProfile). See the [listings tutorial](https://developers.etsy.com/documentation/tutorials/listings) for instructions on adding a shipping profile to a listing. Sellers can purchase shipping through Etsy, but the Open API v3 does not include an endpoint to order shipping, so the seller must enter costs into shipping profiles, purchase shipping, and print shipping labels themselves. See [How to Purchase Etsy Shipping Labels](https://help.etsy.com/hc/en-us/articles/360001967188-How-to-Purchase-Etsy-Shipping-Labels?segment=selling) for all carriers Etsy supports directly in the seller tools.

The following procedure adds shipping tracking information to a receipt:

1.  Form a valid URL for [`createReceiptShipment`](https://developers.etsy.com/documentation/reference/#operation/createReceiptShipment), which must include a `shop_id` for the shop and the `receipt_id` for the purchase. For example, if your shop\_id is 12345678 and your receipt\_id is 090898651, the createShopSection URL is:
    
2.  Build the createReceiptShipment request body, which must include `tracking_code` string provided by the carrier and `carrier_name` string to identify the carrier. Etsy supports tracking updates for many shipping carriers as determined by the `carrier_name` parameter. See [Tracking updates for shipping carriers](https://developers.etsy.com/documentation/tutorials/fulfillment/#tracking-updates-for-shipping-carriers) below.
    
3.  Execute a createReceiptShipment POST request with a `transactions_w` scope OAuth token and `x-api-key`. For example, a createReceiptShipment request to create the "Spiral Carpet" section might look like the following:
    

*   JavaScript fetch
*   PHP curl

### Tracking updates for shipping carriers[#](https://developers.etsy.com/documentation/tutorials/fulfillment/#tracking-updates-for-shipping-carriers "Direct link to heading")

Etsy supports tracking updates for several carriers, determined by the `carrier_name` submitted with a createShippingReceipt request. Tracking updates provide a tracking link in the shipping notification email and displays tracking updates for the shipment on Etsy.

The table below lists known carriers, the `carrier_name` parameter values, and whether Etsy supports tracking updates for that organization.

| Carrier | `carrier_name` | Tracking Updates |
| --- | --- | --- |
| 4PX Worldwide Express | 4px | Yes |
| A1Post | a1post | Yes |
| ABF Freight | abf | Yes |
| ACS Courier | acscourier | Yes |
| AeroFlash | aeroflash | Yes |
| Afghan Post | afghan-post | No  |
| Amazon Logistics UK | amazon-uk-api | Yes |
| Amazon Logistics US | amazon | Yes |
| An Post | an-post | Yes |
| Anguilla Postal Service | anguilla-post | No  |
| APC Postal Logistics | apc | Yes |
| Aramex | aramex | Yes |
| Asendia UK | asendia-uk | Yes |
| Asendia USA | asendia-usa | Yes |
| Australia Post | australia-post | Yes |
| Austrian Post | austrian-post | Yes |
| Austrian Post Registered | austrian-post-registered | Yes |
| Bahrain Post | bahrain-post | No  |
| Bangladesh Post Office | bangladesh-post | No  |
| Belgium Post Domestic | bpost | Yes |
| Belgium Post International | bpost-international | Yes |
| Belposhta | belpost | Yes |
| BH Posta | bh-posta | No  |
| Blue Dart | bluedart | Yes |
| BotswanaPost | botswanapost | No  |
| Brunei Postal Services | brunei-post | No  |
| Bulgarian Posts | bgpost | Yes |
| Cambodia Post | cambodia-post | Yes |
| Canada Post | canada-post | Yes |
| Canpar Courier | canpar | Yes |
| Ceska Posta | ceska-posta | Yes |
| China EMS | china-ems | Yes |
| China Post | china-post | Yes |
| Chit Chats | chitchats | Yes |
| Chronopost France | chronopost-france | Yes |
| Chronopost Portugal | chronopost-portugal | Yes |
| Chunghwa Post | taiwan-post | Yes |
| City Link | city-link | Yes |
| Colissimo | colissimo | Yes |
| Collect+ | collectplus | Yes |
| Correios de Brasil | brazil-correios | Yes |
| Correios de Macau | correios-macau | No  |
| Correios de Portugal (CTT) | portugal-ctt | Yes |
| Correo Argentino Domestic | correo-argentino | Yes |
| Correo Argentino International | correo-argentino-intl | Yes |
| Correo Uruguayo | correo-uruguayo | No  |
| Correos - Espana | spain-correos-es | Yes |
| Correos Chile | correos-chile | Yes |
| Correos De Mexico | correos-de-mexico | Yes |
| Correos de Costa Rica | correos-de-costa-rica | Yes |
| Correos del Ecuador | correos-ecuador | No  |
| Courier Post | courierpost | Yes |
| Couriers Please | couriers-please | Yes |
| Cyprus Post | cyprus-post | Yes |
| Deltec Courier | deltec-courier | Yes |
| Deutsche Post | deutsch-post | Yes |
| DHL Benelux | dhl-benelux | Yes |
| DHL Express | dhl | Yes |
| DHL Germany | dhl-germany | Yes |
| DHL Global Mail | dhl-global-mail | Yes |
| DHL Netherlands | dhl-nl | Yes |
| DHL Parcel NL | dhlparcel-nl | Yes |
| DHL Polska | dhl-poland | Yes |
| DHL Spain Domestic | dhl-es | Yes |
| DHL eCommerce | dhl-global-mail-asia | Yes |
| Direct Link | directlink | Yes |
| DPD | dpd | Yes |
| DPD Germany | dpd-de | Yes |
| DPD Polska | dpd-poland | Yes |
| DPD UK | dpd-uk | Yes |
| DTDC India | dtdc | Yes |
| EC-Firstclass | ec-firstclass | Yes |
| Egypt Post | egypt-post | No  |
| El Correo | el-correo | No  |
| Elta Courier | elta-courier | Yes |
| Empost | emirates-post | Yes |
| Empresa de Correos de Bolivia | correos-bolivia | No  |
| Estafeta | estafeta | Yes |
| Estes | estes | Yes |
| Estonian Post | estonian-post | No  |
| Ethiopian Postal Service | ethiopian-post | No  |
| Evergreen | evergreen | No  |
| Fastway Australia | fastway-au | Yes |
| Fastway Couriers | fastway-ireland | Yes |
| Fastway New Zealand | fastway-nz | Yes |
| Fastways Couriers South Africa | fastway-za | Yes |
| FedEx | fedex | Yes |
| Fedex UK (Domestic) | fedex-uk | Yes |
| First Flight Couriers | first-flight | Yes |
| Flash Courier | flash-courier | Yes |
| Freightquote by C. H. Robinson | freightquote | Yes |
| GATI-KWE | gati-kwe | Yes |
| Ghana Post | ghana-post | No  |
| Globegistics | globegistics | Yes |
| GLS | gls | Yes |
| Greyhound | greyhound | Yes |
| Guernsey Post | guernsey-post | No  |
| Hay Post | hay-post | No  |
| Hellenic Post | hellenic-post | No  |
| Hermes | hermes-de | Yes |
| Hermes Italy | hermes-it | Yes |
| Hermes UK | hermes | Yes |
| Hong Kong Post | hong-kong-post | Yes |
| Hrvatska Posta | hrvatska-posta | Yes |
| i-parcel | i-parcel | Yes |
| India Post | india-post | Yes |
| India Post International | india-post-int | Yes |
| Interlink Express | interlink-express | Yes |
| International Seur | international-seur | Yes |
| Ipostel | ipostel | No  |
| Iran Post | iran-post | No  |
| Islandspostur | islandspostur | No  |
| Isle of Man Post Office | isle-of-man-post | No  |
| Israel Post | israel-post | Yes |
| Israel Post Domestic | israel-post-domestic | Yes |
| Jamaica Post | jamaica-post | No  |
| Japan Post | japan-post | Yes |
| Jersey Post | jersey-post | No  |
| Jordan Post | jordan-post | No  |
| Kazpost | kazpost | No  |
| Korea Post | kpost | Yes |
| Korea Post EMS | korea-post | Yes |
| Kuehne + Nagel | kn  | Yes |
| La Poste | la-poste-colissimo | Yes |
| La Poste Monaco | poste-monaco | No  |
| La Poste du Senegal | poste-senegal | No  |
| La Poste Tunisienne | poste-tunisienne | No  |
| Landmark Global | landmark-global | Yes |
| LaserShip | lasership | Yes |
| Latvijas Pasts | latvijas-pasts | No  |
| LibanPost | libanpost | No  |
| Lietuvos Pastas | lietuvos-pastas | Yes |
| Magyar Posta | magyar-posta | Yes |
| Makedonska Posta | makedonska-posta | No  |
| Malaysia Pos Daftar | malaysia-post-posdaftar | Yes |
| Maldives Post | maldives-post | No  |
| MaltaPost | maltapost | No  |
| Mauritius Post | mauritius-post | No  |
| Mondial Relay | mondialrelay | Yes |
| MRW | mrw-spain | Yes |
| Multipack | mexico-multipack | Yes |
| myHermes UK | myhermes-uk | Yes |
| Nacex | nacex-spain | Yes |
| New Zealand Post | new-zealand-post | Yes |
| Nexive | tntpost-it | Yes |
| Nieuwe Post Nederlandse Antillen (PNA) | nieuwe-post-nederlandse-antillen-pna | No  |
| Nigerian Postal Service | nipost | Yes |
| Nova Poshta | nova-poshta | Yes |
| OCA | oca-ar | Yes |
| OPEK | opek | Yes |
| Oman Post | oman-post | No  |
| OnTrac | ontrac | Yes |
| OPT | opt | No  |
| OPT de Nouvelle-Caledonie | opt-nouvelle-caledonie | No  |
| Pakistan Post | pakistan-post | No  |
| Parcelforce Worldwide | parcel-force | Yes |
| Poczta Polska | poczta-polska | Yes |
| Pos Indonesia | pos-indonesia | Yes |
| Pos Indonesia International | pos-indonesia-int | Yes |
| Pos Malaysia | malaysia-post | Yes |
| Post Aruba | post-aruba | No  |
| Post Fiji | post-fiji | No  |
| Post Luxembourg | post-luxembourg | No  |
| PostNL Domestic | postnl | Yes |
| PostNL International | postnl-international | Yes |
| PostNL International 3S | postnl-3s | Yes |
| PostNord | danmark-post | Yes |
| PostNord Logistics | postnord | Yes |
| Posta | posta | No  |
| Posta Kenya | posta-kenya | No  |
| Posta Moldovei | posta-moldovei | No  |
| Posta Romana | posta-romana | Yes |
| Posta Shqiptare | posta-shqiptare | No  |
| Posta Slovenije | posta-slovenije | No  |
| Posta Srbije | posta-srbije | No  |
| Posta Uganda | posta-uganda | No  |
| Poste Italiane | poste-italiane | Yes |
| Poste Italiane Paccocelere | poste-italiane-paccocelere | Yes |
| Poste Maroc | poste-maroc | No  |
| Posten AB | sweden-posten | Yes |
| Posten Norge | posten-norge | Yes |
| Posti | posti | Yes |
| Postmates | postmates | Yes |
| PTT Posta | ptt-posta | Yes |
| Purolator | purolator | Yes |
| Qatar Post | qatar-post | No  |
| Red Express | red-express | Yes |
| Redpack | mexico-redpack | Yes |
| Royal Mail | royal-mail | No  |
| RL Carriers | rl-carriers | Yes |
| RPX Indonesia | rpx | Yes |
| Russian Post | russian-post | Yes |
| S.F International | sfb2c | Yes |
| Safexpress | safexpress | Yes |
| Sagawa | sagawa | Yes |
| Saudi Post | saudi-post | Yes |
| SDA Express Courier | italy-sda | Yes |
| Selektvracht | selektvracht | Yes |
| Senda Express | mexico-senda-express | Yes |
| Sendle | sendle | Yes |
| Serpost | serpost | No  |
| SEUR Espana (Domestico) | spanish-seur | Yes |
| SEUR Portugal (Domestico) | portugal-seur | Yes |
| SF Express | sf-express | Yes |
| Singapore Post | singapore-post | Yes |
| Singapore SpeedPost | singapore-speedpost | Yes |
| Siodemka | siodemka | Yes |
| Skynet Malaysia | skynet-malaysia | Yes |
| SkyNet Wordwide Express | skynetworldwide | Yes |
| Skynet Worldwide Express | skynetworldwide | Yes |
| Slovenska posta | slovenska-posta | No  |
| South Africa Post Office | sapo | Yes |
| Stallion Express | stallionexpress | Yes |
| StarTrack | star-track | Yes |
| Swiss Post | swiss-post | Yes |
| TA-Q-BIN Hong Kong | taqbin-hk | Yes |
| TA-Q-BIN Japan | taqbin-jp | Yes |
| TA-Q-BIN Malaysia | taqbin-my | Yes |
| TA-Q-BIN Singapore | taqbin-sg | Yes |
| TGX | tgx | Yes |
| Thailand Post | thailand-post | Yes |
| TNT | tnt | Yes |
| TNT Australia | tnt-au | Yes |
| TNT France | tnt-fr | Yes |
| TNT Italia | tnt-it | Yes |
| TNT UK | tnt-uk | Yes |
| Toll Global Express | toll-global-express | No  |
| Toll Priority | toll-priority | Yes |
| TTPost | ttpost | No  |
| UK Mail | uk-mail | Yes |
| UkrPoshta | ukrposhta | Yes |
| UPS | ups | Yes |
| UPS Freight | ups-freight | Yes |
| uShip | uship | Yes |
| USPS | usps | Yes |
| Vanuatu Post | vanuatu-post | No  |
| Vietnam Post | vnpost | Yes |
| Vietnam Post EMS | vnpost-ems | Yes |
| Whistl | whistl | Yes |
| Xend | xend | Yes |
| Yakit | yakit | Yes |
| Yanwen | yanwen | Yes |
| Yemen Post | yemen-post | No  |
| Yodel | yodel | Yes |
| Yodel International | yodel-international | Yes |
| YRC Freight | yrc | Yes |
| Zampost | zampost | No  |
| Zimpost | zimpost | No  |

### Countries requiring postal codes[#](https://developers.etsy.com/documentation/tutorials/fulfillment/#countries-requiring-postal-codes "Direct link to heading")

Shipping profiles require valid postal code inputs for the following countries:

| Country name | `iso_code` |
| --- | --- |
| Åland Islands | AX  |
| Albania | AL  |
| Algeria | DZ  |
| American Samoa | AS  |
| Andorra | AD  |
| Argentina | AR  |
| Armenia | AM  |
| Australia | AU  |
| Austria | AT  |
| Azerbaijan | AZ  |
| Bahrain | BH  |
| Bangladesh | BD  |
| Barbados | BB  |
| Belarus | BY  |
| Belgium | BE  |
| Bermuda | BM  |
| Bhutan | BT  |
| Bosnia and Herzegovina | BA  |
| Brazil | BR  |
| British Indian Ocean Territory | IO  |
| British Virgin Islands | VG  |
| Brunei | BN  |
| Bulgaria | BG  |
| Cambodia | KH  |
| Canada | CA  |
| Cape Verde | CV  |
| Cayman Islands | KY  |
| Chile | CL  |
| China | CN  |
| Christmas Island | CX  |
| Cocos (Keeling) Islands | CC  |
| Colombia | CO  |
| Costa Rica | CR  |
| Croatia | HR  |
| Cyprus | CY  |
| Czech Republic | CZ  |
| Denmark | DK  |
| Dominican Republic | DO  |
| Ecuador | EC  |
| Egypt | EG  |
| El Salvador | SV  |
| Estonia | EE  |
| Ethiopia | ET  |
| Falkland Islands (Malvinas) | FK  |
| Faroe Islands | FO  |
| Finland | FI  |
| France | FR  |
| French Guiana | GF  |
| French Polynesia | PF  |
| Georgia | GE  |
| Germany | DE  |
| Gibraltar | GI  |
| Greece | GR  |
| Greenland | GL  |
| Guadeloupe | GP  |
| Guam | GU  |
| Guatemala | GT  |
| Guernsey | GG  |
| Guinea | GN  |
| Guinea-Bissau | GW  |
| Haiti | HT  |
| Heard Island and McDonald Islands | HM  |
| Holy See (Vatican City State) | VA  |
| Honduras | HN  |
| Hungary | HU  |
| Iceland | IS  |
| India | IN  |
| Indonesia | ID  |
| Iran | IR  |
| Iraq | IQ  |
| Ireland | IE  |
| Isle of Man | IM  |
| Israel | IL  |
| Italy | IT  |
| Japan | JP  |
| Jersey | JE  |
| Jordan | JO  |
| Kazakhstan | KZ  |
| Kenya | KE  |
| Kuwait | KW  |
| Kyrgyzstan | KG  |
| Laos | LA  |
| Latvia | LV  |
| Lebanon | LB  |
| Lesotho | LS  |
| Liberia | LR  |
| Liechtenstein | LI  |
| Lithuania | LT  |
| Luxembourg | LU  |
| Macedonia | MK  |
| Madagascar | MG  |
| Malaysia | MY  |
| Maldives | MV  |
| Malta | MT  |
| Marshall Islands | MH  |
| Martinique | MQ  |
| Mauritius | MU  |
| Mayotte | YT  |
| Mexico | MX  |
| Micronesia, Federated States of | FM  |
| Moldova | MD  |
| Monaco | MC  |
| Mongolia | MN  |
| Montenegro | ME  |
| Morocco | MA  |
| Myanmar (Burma) | MM  |
| Nepal | NP  |
| New Caledonia | NC  |
| New Zealand | NZ  |
| Nicaragua | NI  |
| Niger | NE  |
| Nigeria | NG  |
| Norfolk Island | NF  |
| Northern Mariana Islands | MP  |
| Norway | NO  |
| Oman | OM  |
| Pakistan | PK  |
| Palau | PW  |
| Papua New Guinea | PG  |
| Paraguay | PY  |
| Peru | PE  |
| Philippines | PH  |
| Poland | PL  |
| Portugal | PT  |
| Puerto Rico | PR  |
| Reunion | RE  |
| Romania | RO  |
| Russia | RU  |
| Saint Barthélemy | BL  |
| Saint Helena | SH  |
| Saint Martin (French part) | MF  |
| Saint Pierre and Miquelon | PM  |
| Saint Vincent and the Grenadines | VC  |
| San Marino | SM  |
| Saudi Arabia | SA  |
| Senegal | SN  |
| Serbia | RS  |
| Singapore | SG  |
| Slovakia | SK  |
| Slovenia | SI  |
| Somalia | SO  |
| South Africa | ZA  |
| South Georgia and the South Sandwich Islands | GS  |
| South Korea | KR  |
| Spain | ES  |
| Sri Lanka | LK  |
| Svalbard and Jan Mayen | SJ  |
| Swaziland | SZ  |
| Sweden | SE  |
| Switzerland | CH  |
| Taiwan | TW  |
| Tajikistan | TJ  |
| Tanzania | TZ  |
| Thailand | TH  |
| The Netherlands | NL  |
| Tunisia | TN  |
| Turkey | TR  |
| Turkmenistan | TM  |
| Turks and Caicos Islands | TC  |
| Ukraine | UA  |
| United Kingdom | GB  |
| United States | US  |
| United States Minor Outlying Islands | UM  |
| Uruguay | UY  |
| U.S. Virgin Islands | VI  |
| Uzbekistan | UZ  |
| Venezuela | VE  |
| Vietnam | VN  |
| Wallis and Futuna | WF  |
| Western Sahara | EH  |
| Zambia | ZM  |

### Country Holidays[#](https://developers.etsy.com/documentation/tutorials/fulfillment/#country-holidays "Direct link to heading")

Mapping of holidays that each country observes and it's corresponding ID.

| United States | `holiday_id` |
| --- | --- |
| New Years Day | 1   |
| Martin Luther King Jr. Day | 2   |
| Presidents Day | 3   |
| Memorial Day | 4   |
| Juneteenth | 5   |
| Independence Day | 6   |
| Labor Day | 7   |
| Columbus Day | 8   |
| Veterans Day | 9   |
| Thanksgiving Day | 10  |
| Christmas Day | 11  |

| Canada | `holiday_id` |
| --- | --- |
| Good Friday | 12  |
| Easter | 13  |
| Victoria Day | 14  |
| Canada Day | 15  |
| Truth and Reconciliation Day | 16  |
| Rememberance Day | 17  |
| Civic Holiday | 18  |
| Boxing Day | 19  |
| New Years Day | 20  |
| Labour Day | 21  |
| Thanksgiving Day | 22  |
| Christmas Day | 23  |

---

### Listings Tutorial | Etsy Open API v3

Source: https://developers.etsy.com/documentation/tutorials/listings

# Listings Tutorial | Etsy Open API v3

##### important

These tutorials are subject to change as endpoints change during our feedback period development. We welcome your feedback! If you find an error or have a suggestion, please post it in the [Open API GitHub Repository](https://github.com/etsy/open-api).

Listings are the pages containing products for sale in an Etsy shop. The Etsy Open API v3 supports managing listings either for an individual shop or across the Etsy marketplace as a whole, depending on your application's [Access Level](https://developers.etsy.com/documentation/#personal-access).

_Throughout this tutorial, the instructions reference REST resources, endpoints, parameters, and response fields, which we cover in detail in [Request Standards](https://developers.etsy.com/documentation/essentials/requests) and [URL Syntax](https://developers.etsy.com/documentation/essentials/urlsyntax)._

### `Authorization` and `x-api-key` header parameters[#](https://developers.etsy.com/documentation/tutorials/listings/#authorization-and-x-api-key-header-parameters "Direct link to heading")

The endpoints in this tutorial require an OAuth token in the header with `listings_r` and `listings_w` scope. If your app also deletes listings, then the token requires the `listings_d` scope as well. See the [Authentication topic](https://developers.etsy.com/documentation/essentials/oauth2) for instructions on how to generate an OAuth token with these scopes.

In addition, all Open API V3 Requests require the `x-api-key:` parameter in the header with your shop's Etsy App API Key _keystring_ and _shared secret_, separated by a colon (`:`), which you can find in [Your Apps](https://www.etsy.com/developers/your-apps).

### Listing lifecycle and state[#](https://developers.etsy.com/documentation/tutorials/listings/#listing-lifecycle-and-state "Direct link to heading")

After creating a listing, your users, Etsy, or your application can change the listing to reflect several states that determine how customers interact with the listing and the effective changes available to sellers, which map to API endpoints. The following table summarizes the states and the change operations available from the API.

| state | description | Actions and endpoints |
| --- | --- | --- |
| draft | inactive listing because its `state` is not "active" or lacks at least one image | Publish (`updateListing`), Delete (`deleteListing`) |
| published | active listing searchable by users, with > 0 unsold inventory | Deactivate (`updateListing`), Delete (`deleteListing`) |
| deactivated | previously published listing deliberately deactivated, unsearchable, and unsellable | Publish (`updateListing`), Delete (`deleteListing`) |
| sold out | published listing with 0 unsold inventory | Delete (`deleteListing`) |
| expired | previously published listing older that was not renewed after expiring (not charged) | Publish (`updateListing`), Delete (`deleteListing`) |

## Listing a physical product for sale[#](https://developers.etsy.com/documentation/tutorials/listings/#listing-a-physical-product-for-sale "Direct link to heading")

To add a new listing to a shop, use the [`createDraftListing`](https://developers.etsy.com/documentation/reference/#operation/createDraftListing) endpoint, which adds a single item for sale to an Etsy Shop. All published listings require at least one listing image, so your application must either:

*   use images already uploaded to the shop, or
*   upload listing images - see [Adding an image to a listing](https://developers.etsy.com/documentation/tutorials/listings/#adding-an-image-to-a-listing)

The following procedure adds a listing using images already uploaded to the shop:

1.  Form a valid URL for [`createDraftListing`](https://developers.etsy.com/documentation/reference/#operation/createDraftListing), which must include a `shop_id` for the shop that hosts the listing. For example, if your shop\_id is : "12345678", the [`createDraftListing`](https://developers.etsy.com/documentation/reference/#operation/createDraftListing) URL is:
    

2.  Build the [`createDraftListing`](https://developers.etsy.com/documentation/reference/#operation/createDraftListing) request body, which must include at a minimum:
    
    *   `quantity`
    *   `title`
    *   `description`
    *   `price`
    *   `who_made`
    *   `when_made`
    *   `taxonomy_id`
    *   `image_ids` required for active listings
    *   `shipping_profile_id` required for physical listings
    *   `readiness_state_id` required for physical listings
3.  Execute a [`createDraftListing`](https://developers.etsy.com/documentation/reference/#operation/createDraftListing) POST request with your `listings_w` scoped OAuth token and `x-api-key`. For example, a [`createDraftListing`](https://developers.etsy.com/documentation/reference/#operation/createDraftListing) request to list 5 yo-yos might look like the following:
    

*   JavaScript fetch
*   PHP curl

To sell variations of the same product in the same listing, such as different colored products with specific quantities for sale in each color, see [Listing inventory with different properties, quantities, and prices](https://developers.etsy.com/documentation/tutorials/listings/#listing-inventory-with-different-properties-quantities-and-prices) below.

## Listing a digital product for sale[#](https://developers.etsy.com/documentation/tutorials/listings/#listing-a-digital-product-for-sale "Direct link to heading")

To list a digital product for sale, use [`createDraftListing`](https://developers.etsy.com/documentation/reference/#operation/createDraftListing) just as you would for a physical product, but your application must set the listing's `type` parameter to "download" and upload a digital product file for the digital product listing using [`uploadListingFile`](https://developers.etsy.com/documentation/reference/#operation/uploadListingFile). If you already uploaded a digital product file to your shop, for example as part of previous listing, you can associate the file with a listing using [`uploadListingFile`](https://developers.etsy.com/documentation/reference/#operation/uploadListingFile) with its file ID as well. Each file in a shop is unique and managed separately, so you cannot assign or upload a file with [`createDraftListing`](https://developers.etsy.com/documentation/reference/#operation/createDraftListing).

The following procedure uploads a digital product file to a listing and updates the listing's `type` parameter to "download":

1.  Form a valid URL for [`uploadListingFile`](https://developers.etsy.com/documentation/reference/#operation/uploadListingFile), which must include a `shop_id` and `listing_id` to assign the digital product file to a listing. For example, if your `shop_id` is "12345678" and your `listing_id` is "192837465," then the uploadListingFile URL is:
    
2.  Build the [`uploadListingFile`](https://developers.etsy.com/documentation/reference/#operation/uploadListingFile) request body, which must include either a `file` (binary) parameter for a digital product file to upload or a `file_id` for a file already uploaded to the shop, but not both.
    
3.  Execute an [`uploadListingFile`](https://developers.etsy.com/documentation/reference/#operation/uploadListingFile) POST request with your `listings_w` scoped OAuth token and `x-api-key`. For example, an [`uploadListingFile`](https://developers.etsy.com/documentation/reference/#operation/uploadListingFile) request might look like the following:
    

*   JavaScript fetch
*   PHP curl

4.  Set the listing's `type` to "download" with an [`updateListing`](https://developers.etsy.com/documentation/reference/#operation/updateListing) PATCH request that includes `shop_id` and `listing_id` in the URL, a `listings_w` scoped OAuth token and `x-api-key` in the header, and the `type` setting in the request body. For example, an [`updateListing`](https://developers.etsy.com/documentation/reference/#operation/updateListing) request might look like the following:

*   JavaScript fetch
*   PHP curl

## Converting a physical product listing to a digital product listing[#](https://developers.etsy.com/documentation/tutorials/listings/#converting-a-physical-product-listing-to-a-digital-product-listing "Direct link to heading")

In the event that a physical product listing needs to be changed to a digital listing, this can be accomplished via the [`updateListing`](https://developers.etsy.com/documentation/reference/#operation/updateListing) endpoint and passing `type` as "download". However, note that if the physical product listing has any variations or inventory beyond a single product, [`updateListing`](https://developer.etsy.com/documentation/reference/#operation/updateListing) will return a 409 error. Before converting any physical listing to digital, the inventory must be reset to a single product using the [`uploadListingInventory`](https://developers.etsy.com/documentation/reference/#operation/uploadListingInventory) endpoint.

The following is an example body of the [`uploadListingInventory`](https://developers.etsy.com/documentation/reference/#operation/uploadListingInventory) post (set your price as a float value and your sku):

## Adding an image to a listing[#](https://developers.etsy.com/documentation/tutorials/listings/#adding-an-image-to-a-listing "Direct link to heading")

Published listings require at least one listing image, as noted above. To upload a new image and add it to a listing, use the [`uploadListingImage`](https://developers.etsy.com/documentation/reference/#operation/uploadListingImage) endpoint with the shop and listing IDs, and add the image binary file in the `image` parameter. To make a listing active after uploading a required image, use the [`updateListing`](https://developer.etsy.com/documentation/reference/#operation/updateListing) endpoint with the `state` parameter set to "active." As noted above, you can associate images with listings in a `createDraftListing` request using the `image_ids` parameter if images are already uploaded to your shop.

The following procedure uploads an image to a listing and updates the listing to active:

1.  Form a valid URL for [`uploadListingImage`](https://developers.etsy.com/documentation/reference/#operation/uploadListingImage), which must include a `shop_id` and `listing_id` to assign the image to a listing. For example, if your `shop_id` is "12345678" and your `listing_id` is "192837465," then the [`uploadListingImage`](https://developers.etsy.com/documentation/reference/#operation/uploadListingImage) URL is:
    
2.  Build the [`uploadListingImage`](https://developers.etsy.com/documentation/reference/#operation/uploadListingImage) request body, which must include either an `image` (binary) parameter with a digital image as its value or a `listing_image_id` for an image uploaded to the shop, but not both.
    
3.  Execute an [`uploadListingImage`](https://developers.etsy.com/documentation/reference/#operation/uploadListingImage) POST request with your `listings_w` scoped OAuth token and `x-api-key`. For example, an [`uploadListingImage`](https://developers.etsy.com/documentation/reference/#operation/uploadListingImage) request might look like the following:
    

*   JavaScript fetch
*   Node JS
*   PHP curl

4.  Set the Listing's `state` to "active" with an [`updateListing`](https://developers.etsy.com/documentation/reference/#operation/updateListing) PATCH request that includes `shop_id` and `listing_id` in the URL, a `listings_w` scoped OAuth token and `x-api-key` in the header, and the new `state` in the request body. For example, an updateListing request might look like the following:

*   JavaScript fetch
*   PHP curl

## Listing inventory with different properties, quantities, and prices[#](https://developers.etsy.com/documentation/tutorials/listings/#listing-inventory-with-different-properties-quantities-and-prices "Direct link to heading")

Inventory is a list of products for sale in a listing. The products are customizable, so understanding the inventory request structure is vital to offering different variations of the same product in one listing. Inventory defines products using the following components:

*   `sku`: Stock Keeping Unit (SKU) assigned to this product.
*   `offerings`: a list of prices and quantities associated with a specific product, representing purchase options visible to buyers on the Etsy shop.
    *   `quantity`: the number of products available at this offering price
    *   `price`: a number indicating the price of this product interpreted in the default currency of the listing/shop, which is US pennies by default.
    *   `is_enabled`: when true, the offering is visible to buyers in the listing.
    *   `readiness_state_id`: the processing profile associated with the offering, if processing profile is set at listing level this id will be the same across all offerings.
*   `property_values`: A list of properties differentiating this product from other products in a listing. For example, to sell sets of bed sheets in different color (white, blue, magenta, forest green, etc) and size (twin, full, queen, king) combinations, use property\_values for color and size.
    *   `property_id`: a unique number identifying this property.
    *   `property_name`: a string name for a property.
    *   `scale_id`: a number indexing an Etsy-defined scale. There are a lot of these, but for example shoe sizes have three available scales:

| Scale ID | Scale Name | Value IDs and Names |
| --- | --- | --- |
| 17  | US/Canada | value\_id:1329,"name":"0 (Baby)", value\_id:1330,"name":"0.5 (Baby)", value\_id:1331,"name":"1 (Baby)", value\_id:1332,"name":"1.5 (Baby)", value\_id:1333,"name":"2 (Baby)", value\_id:1334,"name":"2.5 (Baby)", value\_id:1335,"name":"3 (Baby)", value\_id:1336,"name":"3.5 (Baby)", value\_id:1337,"name":"4 (Baby)", value\_id:1338,"name":"4.5 (Walker)", value\_id:1339,"name":"5 (Walker)", value\_id:1340,"name":"5.5 (Walker)", value\_id:1341,"name":"6 (Walker)", value\_id:1342,"name":"6.5 (Walker)", value\_id:1343,"name":"7 (Walker)", value\_id:1344,"name":"7.5 (Toddler)", value\_id:1345,"name":"8 (Toddler)", value\_id:1346,"name":"8.5 (Toddler)", value\_id:1347,"name":"9 (Toddler)", value\_id:1348,"name":"9.5 (Toddler)", value\_id:1349,"name":"10 (Toddler)", value\_id:1350,"name":"10.5 (Toddler)", value\_id:1351,"name":"11 (Toddler)", value\_id:1352,"name":"11.5 (Toddler)", value\_id:1353,"name":"12 (Toddler)", value\_id:1354,"name":"12.5 (Youth)", value\_id:1355,"name":"13 (Youth)", value\_id:1356,"name":"13.5 (Youth)", value\_id:1357,"name":"1 (Youth)", value\_id:1358,"name":"1.5 (Youth)", value\_id:1359,"name":"2 (Youth)", value\_id:1360,"name":"2.5 (Youth)", value\_id:1361,"name":"3 (Youth)", value\_id:1362,"name":"3.5 (Youth)", value\_id:1363,"name":"4 (Youth)", value\_id:1364,"name":"4.5 (Youth)", value\_id:1365,"name":"5 (Youth)", value\_id:1366,"name":"5.5 (Youth)", value\_id:1367,"name":"6 (Youth)", value\_id:1368,"name":"6.5 (Youth)", value\_id:1369,"name":"7 (Youth)" |
| 18  | EU  | "value\_id":1370,"name":"15", "value\_id":1371,"name":"16", "value\_id":1372,"name":"17", "value\_id":1373,"name":"18", "value\_id":1374,"name":"19", "value\_id":1375,"name":"20", "value\_id":1376,"name":"21", "value\_id":1377,"name":"22", "value\_id":1378,"name":"23", "value\_id":1379,"name":"24", "value\_id":1380,"name":"25", "value\_id":1381,"name":"26", "value\_id":1382,"name":"27", "value\_id":1383,"name":"28", "value\_id":1385,"name":"29", "value\_id":1386,"name":"30", "value\_id":1387,"name":"31", "value\_id":1388,"name":"32", "value\_id":1389,"name":"33", "value\_id":1390,"name":"34", "value\_id":1391,"name":"35", "value\_id":1392,"name":"36", "value\_id":1393,"name":"37", "value\_id":1394,"name":"38", "value\_id":1395,"name":"39" |
| 19  | UK  | value\_id:1396,"name":"0 (Baby)", value\_id:1397,"name":"0.5 (Baby)", value\_id:1399,"name":"1 (Baby)", value\_id:1401,"name":"1.5 (Baby)", value\_id:1402,"name":"2 (Baby)", value\_id:1403,"name":"2.5 (Baby)", value\_id:1404,"name":"3 (Baby)", value\_id:1405,"name":"3.5 (Walker)", value\_id:1406,"name":"4 (Walker)", value\_id:1407,"name":"4.5 (Walker)", value\_id:1408,"name":"5 (Walker)", value\_id:1409,"name":"5.5 (Walker)", value\_id:1410,"name":"6 (Walker)", value\_id:1411,"name":"6.5 (Toddler)", value\_id:1412,"name":"7 (Toddler)", value\_id:1413,"name":"7.5 (Toddler)", value\_id:1414,"name":"8 (Toddler)", value\_id:1415,"name":"8.5 (Toddler)", value\_id:1416,"name":"9 (Toddler)", value\_id:1417,"name":"9.5 (Toddler)", value\_id:1418,"name":"10 (Toddler)", value\_id:1419,"name":"10.5 (Toddler)", value\_id:1420,"name":"11 (Toddler)", value\_id:1421,"name":"11.5 (Youth)", value\_id:1422,"name":"12 (Youth)", value\_id:1423,"name":"12.5 (Youth)", value\_id:1424,"name":"13 (Youth)", value\_id:1425,"name":"13.5 (Youth)", value\_id:1426,"name":"1 (Youth)", value\_id:1428,"name":"2 (Youth)", value\_id:1429,"name":"2.5 (Youth)", value\_id:1430,"name":"3 (Youth)", value\_id:1431,"name":"3.5 (Youth)", value\_id:1432,"name":"4 (Youth)", value\_id:1433,"name":"4.5 (Youth)", value\_id:1434,"name":"5 (Youth)", value\_id:1435,"name":"5.5 (Youth)", value\_id:1436,"name":"6 (Youth)" |

*   `value_ids`: a list of numbers valid for the `scale_id` selected indicating the product variations.
*   `values`: a list of strings matching the value ids selected.

The following endpoints change the listing properties and inventory for an existing listing:

1.  [`updateListingProperty`](https://developers.etsy.com/documentation/reference/#operation/updateListingProperty) adds properties to a listing
2.  [`updateListingInventory`](https://developers.etsy.com/documentation/reference/#operation/updateListingInventory) assigns skus to offerings for different property combinations

### Updating Inventory[#](https://developers.etsy.com/documentation/tutorials/listings/#updating-inventory "Direct link to heading")

The following procedure adds a product for sale in a listing:

1.  Form a valid URL for [`updateListingInventory`](https://developers.etsy.com/documentation/reference/#operation/updateListingInventory), which must include a `listing_id` to change the inventory in a listing. For example, if your `listing_id` is "192837465," then the updateListingInventory URL is:
    
2.  Build the [`updateListingInventory`](https://developers.etsy.com/documentation/reference/#operation/updateListingInventory) request body, which must include at least one product in the `products` parameter with nested `offerings` and `property_values` lists.
    
3.  Execute an [`updateListingInventory`](https://developers.etsy.com/documentation/reference/#operation/updateListingInventory) PUT request with a `listings_w` scoped OAuth token and `x-api-key`. For example, an [`updateListingInventory`](https://developers.etsy.com/documentation/reference/#operation/updateListingInventory) request to add 10 US/Canada size 4 shoes with a sku of 7836646 might look like the following:
    

*   JavaScript fetch
*   PHP curl

**NOTES:**

1.  When updating inventory, the entire set of products (based on variations) must be in the `products` array.
    
2.  To get the product array, call [`getListingInventory`](https://developer.etsy.com/documentation/reference/#operation/getListingInventory) for the listing. From the [`getListingInventory`](https://developer.etsy.com/documentation/reference/#operation/getListingInventory) response, remove the following fields: `product_id`, `offering_id`, `scale_name`, `is_deleted` and `value_pairs`. Also change the `price` array in offerings to be a decimal value instead of an array.
    
3.  The `*_on_property` values should match the `property_id` values, but only if those properties affect the price, quantity or sku. See the sample below for handling variations.
    
4.  The `*_on_property` fields can be empty, have one property, or all the properties used for variations.
    
5.  Use [Custom Variations](https://developers.etsy.com/documentation/tutorials/listings/#custom-variations) if any of the existing properties don't exist or fit your use case.
    

### Handling Variations in Inventory Updates[#](https://developers.etsy.com/documentation/tutorials/listings/#handling-variations-in-inventory-updates "Direct link to heading")

The following example updates a listing inventory where there are two variations:

1.  Material - "Pine", "Oak", "Walnut"
    
2.  Height - "3", "4", "5"
    

In this example, the material variation affects the price, while the height variation affects the quantity and sku of the product.

In the `products` array, you will have 9 entries (3 materials x 3 heights).

Due to the height affecting both quantity and sku, when quantity is updated it must be the same value across all products sharing the same sku. The sku "woodthing3" has 3 entries in the array, but the `quantity` value for all three of those arrays (inside `offerings`) must be the same value (33 in this example).

Similarly, because material affects pricing, in each product you will see that the "Walnut" property value indicates the `price` in `offerings` is 8.00 while "Oak" is 7.00 and "Pine" is 6.00.

Note that since there is only one variation that affects the price, the `price_on_property` value is a single value of `47626760362`, which is the property\_id for "Material". Since height affects both quantity and sku, the `quantity_on_property` and `sku_on_property` values are a single value of `47626759834`, which is the property\_id for "Height".

The processing profile is shared across all offerings, which means that the profile is set at a listing level. See [`Adding a processing profile to a listing`](https://developers.etsy.com/documentation/tutorials/listings/#adding-an-processing-profile-to-a-listing) for more details about processing profiles.

*   JavaScript fetch
*   PHP curl

### Custom Variations[#](https://developers.etsy.com/documentation/tutorials/listings/#custom-variations "Direct link to heading")

Custom Variations behave just like normal variations, except you can assign your own custom name to them instead of needing to adhere to properties. There can be at most 2 custom variations. The `property_ids` for custom variations are `513` and `514`. Use either of these when creating a custom variation.

### How to Fetch Property Values for the `Products` Array?[#](https://developers.etsy.com/documentation/tutorials/listings/#how-to-fetch-property-values-for-the-products-array "Direct link to heading")

Since variations can not be added at the time of creation of a new listing, the following procedure should help with creating the products array for your [`updateListingInventory`](https://developer.etsy.com/documentation/reference/#operation/updateListingInventory) call.

The `property_values` is required but may be empty when attempting to post to the endpoint. The properties that may be used for variations on any given listing will depend upon the category the listing is placed in.

Property ids and possible values are available via the following endpoints: [`getSellerTaxonomyNodes`](https://developers.etsy.com/documentation/reference/#operation/getSellerTaxonomyNodes) and [`getPropertiesByTaxonomyId`](https://developers.etsy.com/documentation/reference/#operation/getPropertiesByTaxonomyId).

1.  If you don't already have a list of property ids for the product properties you wish to use in the new listing, use a `GET` call to [`getSellerTaxonomyNodes`](https://developers.etsy.com/documentation/reference/#operation/getSellerTaxonomyNodes) first to retrieve the full hierarchy tree of seller taxonomy nodes.
    
2.  In the taxonomy tree, you can look for the category you wish to use and note the id.
    
3.  Perform a `GET` call to the [`getPropertiesByTaxonomyId`](https://developers.etsy.com/documentation/reference/#operation/getPropertiesByTaxonomyId) endpoint with the id of the category. This will give you the possible properties for the category, along with their possible values. Only properties with the field `"supports_variations": true` can be used in `property_values`.
    

**Notes about taxonomy:**

1.  Some of the common taxonomy node properties that Etsy uses, such as `Color` have a list of common values/value ids. When you pass in value\_id `4` we convert that to your shop's unique ID for that color. If it's not already in the system for your shop, it will create one. And then you'll use it over and over again any time you provide 'Green' for the color in the values field OR if you pass in 4 or your custom ID in the value\_ids field and subsequent queries to get inventory should return that custom ID and not our known common ID.
    
2.  There are also [`getBuyerTaxonomyNodes`](https://developers.etsy.com/documentation/reference/#operation/getBuyerTaxonomyNodes) and [`getPropertiesByBuyerTaxonomyId`](https://developers.etsy.com/documentation/reference#operation/getPropertiesByBuyerTaxonomyId) endpoints for use by more buyer-facing apps. The difference between the two is that the levels of hierachy in the seller taxonomy is often deeper than that of Buyers. For example, a listing for "blue yarn" is in `All categories` → `Craft Supplies & Tools`. The `Craft Supplies & Tools` is a buyer taxonomy. But in reality, the listing is inside of `All categories` → `Craft Supplies & Tools` → `Yarn & Fiber` → `Yarn`. The `Yarn & Fiber` and `Yarn` category and sub category are the seller taxonomy. For sellers these are very useful categories for sorting and tracking listings. However, from a Buyer perspective, showing the category and subcategory in the category tree would end up cluttering the buyer experience. Since the yarn is really just a craft supply it makes sense to show it under that more top-level category.
    

## Adding a shipping profile to a listing[#](https://developers.etsy.com/documentation/tutorials/listings/#adding-a-shipping-profile-to-a-listing "Direct link to heading")

Shipping profiles assemble shipping details such as shipping price and processing time for recipients grouped by country or region. Every physical listing requires a shipping profile, so you add shipping profiles to your shop with [`createShopShippingProfile`](https://developers.etsy.com/documentation/reference/#operation/createShopShippingProfile), and assign a shipping profile to a listing using a `shipping_profile_id` when you create or update the listing.

The following procedure creates a new shipping profile and returns the `shipping_profile_id` in the response:

1.  Form a valid URL for [`createShopShippingProfile`](https://developers.etsy.com/documentation/reference/#operation/createShopShippingProfile), which must include a `shop_id`. For example, if your `shop_id` is "12345678", then the [`createShopShippingProfile`](https://developers.etsy.com/documentation/reference/#operation/createShopShippingProfile) URL is:
    
    [https://api.etsy.com/v3/application/shops/12345678/shipping-profiles](https://api.etsy.com/v3/application/shops/12345678/shipping-profiles)
    
2.  Build the [`createShopShippingProfile`](https://developers.etsy.com/documentation/reference/#operation/createShopShippingProfile) request body, which must include at a minimum:
    

*   `title`: Use a title that indicates the country or region.
*   `origin_country_iso`: The ISO code of the country from which the listing ships.
*   `primary_cost`: The cost of shipping to this country/region alone, measured in the store's default currency.
*   `secondary_cost`: The cost of shipping to this country/region with another item, measured in the store's default currency.
*   `min_processing_time`: The minimum processing time required to process to ship listings with this shipping profile. This field is in deprecation phase and will be removed by Q1 2026.
*   `max_processing_time`: The maximum processing time required to process to ship listings with this shipping profile. This field is in deprecation phase and will be removed by Q1 2026.
*   One of `destination_country_iso` ([see list of Alpha-2 codes here](https://www.iban.com/country-codes)) OR `destination_region` (possible values are "eu" "non\_eu" or "none"), but not both.

3.  Execute an [`createShopShippingProfile`](https://developers.etsy.com/documentation/reference/#operation/createShopShippingProfile) POST request with your `shops_w` scoped OAuth token and `x-api-key`, and read the generated `shipping_profile_id` from the response. For example, a [`createShopShippingProfile`](https://developers.etsy.com/documentation/reference/#operation/createShopShippingProfile) request for shipments from the US to the EU with free shipping might look like the following:

*   JavaScript fetch
*   PHP curl

4.  Set the listing's `shipping_profile_id` to the shipping profile ID read from the response to setting the shipping profile ID with an [`updateListing`](https://developers.etsy.com/documentation/reference/#operation/updateListing) PATCH request that includes `shop_id` and `listing_id` in the URL, a `listings_w` scoped OAuth token and `x-api-key` in the header, and the new state in the request body. For example, an [`updateListing`](https://developers.etsy.com/documentation/reference/#operation/updateListing) request might look like the following:

*   JavaScript fetch
*   PHP curl

## Adding a processing profile to a listing[#](https://developers.etsy.com/documentation/tutorials/listings/#adding-a-processing-profile-to-a-listing "Direct link to heading")

Processing profiles contain information about the readiness state and processing time of a product. Every physical listing requires at least one processing profile to be linked to it. You can create processing profiles for your shop with [`createShopReadinessStateDefinition`](https://developers.etsy.com/documentation/reference/#operation/createShopReadinessStateDefinition), and link it to a listing using the `readiness_state_id` when you create a new listing through [`createDraftListing`](https://developers.etsy.com/documentation/reference#operation/createDraftListing) or to specific products when you update a listing's inventory through [`updateListingInventory`](https://developers.etsy.com/documentation/reference#operation/updateListingInventory).

The following procedure creates a new processing profile and returns the `readiness_state_id` in the response:

1.  Form a valid URL for [`createShopReadinessStateDefinition`](https://developers.etsy.com/documentation/reference/#operation/createShopReadinessStateDefinition), which must include a `shop_id`. For example, if your `shop_id` is "12345678", then the [`createShopReadinessStateDefinition`](https://developers.etsy.com/documentation/reference/#operation/createShopReadinessStateDefinition) URL is:
    
    [https://api.etsy.com/v3/application/shops/12345678/readiness-state-definitions](https://api.etsy.com/v3/application/shops/12345678/readiness-state-definitions)
    
2.  Build the [`createShopReadinessStateDefinition`](https://developers.etsy.com/documentation/reference/#operation/createShopReadinessStateDefinition) request body, which must include at a minimum:
    

*   `readiness_state`: The state a product can be in production wise, values can be either "ready\_to\_ship" or "made\_to\_order".
*   `min_processing_time`: The minimum processing time required to process to ship listings with this shipping profile. This field is in deprecation phase and will be removed by Q1 2026.
*   `max_processing_time`: The maximum processing time required to process to ship listings with this shipping profile. This field is in deprecation phase and will be removed by Q1 2026.
*   `processing_time_unit`: The unit used to represent how long a processing time is. A week is equivalent to 5 business days. Values can be "days" or "weeks". If none is provided, the unit is set to "days".

3.  Execute a [`createShopReadinessStateDefinition`](https://developers.etsy.com/documentation/reference/#operation/createShopReadinessStateDefinition) POST request with your `shops_w` scoped OAuth token and `x-api-key`, and read the generated `readiness_state_id` from the response, which you’ll use to link it to specific products later on. For example, a [`createShopReadinessStateDefinition`](https://developers.etsy.com/documentation/reference/#operation/createShopReadinessStateDefinition) request for a product that’s made to order and the processing time is 5-8 days might look like the following:

*   JavaScript fetch
*   PHP curl

4.  Set the listing's `readiness_state_id` to the readiness state ID read from the response while creating a new listing through [`createDraftListing`](https://developers.etsy.com/documentation/reference/#operation/createDraftListing) endpoint or while updating the listing through [`updateListingInventory`](https://developers.etsy.com/documentation/reference#operation/updateListingInventory) endpoint. For example, an [`updateListingInventory`](https://developers.etsy.com/documentation/reference#operation/updateListingInventory) request might look like the following:

*   JavaScript fetch
*   PHP curl

As you can see in the above example, since `processing profiles` vary by the material property like `price`, we'll add a `readiness_state_on_property` value with the property\_id corresponding to "Material" (`47626760362`).

Each product offering will have an associated `readiness_state_id`, in this case the same `readiness_state_id` needs to be used for all the offerings that have the same material. We have two offerings for each material, let’s take “Walnut” as an example:

1.  Walnut - Height 4
2.  Walnut - Height 5

Since they all share the “Walnut” property value they will use the same processing profile.

However, if you’d prefer to set the processing profile at a listing level, the body request for the [updateListingInventory](https://developers.etsy.com/documentation/reference#operation/updateListingInventory) endpoint would be pretty similar to the case above, with two main differences:

1.  The same `readiness_state_id` will be used for all the product offerings.
2.  The `readiness_state_on_property` value will be empty, as none of the properties change the readiness state of the product.

---

### Processing Profiles Migration | Etsy Open API v3

Source: https://developers.etsy.com/documentation/tutorials/migration

# Processing Profiles Migration | Etsy Open API v3

## Summary of changes[#](https://developers.etsy.com/documentation/tutorials/migration/#summary-of-changes "Direct link to heading")

In order to provide a more granular way to distinguish between different processing times for different products inside the same listing, we are introducing **processing profiles**.

Currently, in order to provide Etsy with processing time values, sellers are required to send _min\_processing\_time_ and _max\_processing\_time_ in their shipping profile requests, either through [createShopShippingProfile](https://developers.etsy.com/documentation/reference#operation/createShopShippingProfile) or [updateShopShippingProfile](https://developers.etsy.com/documentation/reference#operation/updateShopShippingProfile). These values are always associated at listing level, which means that even if the listing has variations, all of the resulting products will have the same processing time.

Processing profiles are comprised of:

*   `shop_id`
*   `readiness_state_id` (This value will be automatically assigned, users do not need to provide it)
*   `readiness_state`
*   `min_processing_time`
*   `max_processing_time`

For the `readiness_state` parameter the possible values can be either "made\_to\_order" or "ready\_to\_ship", depending on the state a product listed is in.

Each product will be linked to a specific processing profile through the `readiness_state_id`, which will give us the ability to link their processing time and readiness state values to them. After a listing’s processing times are associated with a processing profile, it can no longer be switched back to using shipping profiles.

##### important

Just like shipping profiles, _requirements for a linked processing profile only applies to physical listings_. Digital listings cannot have processing profiles.

### Customer requirements[#](https://developers.etsy.com/documentation/tutorials/migration/#customer-requirements "Direct link to heading")

To support your customers through this new workflow, your systems will need the following capabilities:

*   Listing creation/updating mechanisms require the ability to set a `readiness_state_id`.
*   Inventory management mechanisms require the ability to optionally vary the `readiness_state_id` by one or both variation properties and set it for each product.
*   Mechanisms for managing processing profiles, including creation, modification, and deletion are encouraged but not required.

## Integration phase[#](https://developers.etsy.com/documentation/tutorials/migration/#integration-phase "Direct link to heading")

Etsy is making this feature available to the OpenAPI developer community on July 16th. This early access period will allow you to familiarize yourselves with the new API calls and update your applications before the feature goes live to all buyers and sellers on Shop Manager and the Etsy Seller app.

Third parties can continue using shipping profile processing time updates for the next 60 days, giving developers time to migrate to the new processing profiles. However, sellers won't be able to set or view processing profiles on Shop Manager until a later date.

This guide will assist you in transitioning from shipping profiles to processing profiles, during this early access phase. Any Processing Profiles you create or link to listings will be considered non-production and transient. As we approach the Shop Manager and Etsy Seller app launch, Etsy will populate this data with values from sellers’ production settings. However, during the transition period, any test data created by third-party developers will not be overwritten.

During this phase, Etsy advises the following:

*   Third-party developers **MUST** use test shops/accounts when implementing and testing the new endpoints.
*   This functionality should **NOT** be exposed to real users or linked to live seller accounts during this migration and testing phase.
*   The new features should **NOT** be made available for real seller/shop data or customer-facing workflows until Etsy officially announces a go-live date.

### Transitioning your system to use processing profiles[#](https://developers.etsy.com/documentation/tutorials/migration/#transitioning-your-system-to-use-processing-profiles "Direct link to heading")

To utilize the new features associated with processing profiles, you’ll need to include a `legacy=false` query parameter in API requests. This will enable the use of the new parameters and response values related to processing profiles.

When using the `legacy=false` flag, API responses may include new fields related to processing profiles. Be sure to update your system to handle these new fields and structures in the API responses to ensure compatibility with the processing profile feature.

Note: Usage of legacy query parameters while utilizing processing profiles via `legacy=false` will result in a 400 status code.

## Linking processing time to a listing or specific products[#](https://developers.etsy.com/documentation/tutorials/migration/#linking-processing-time-to-a-listing-or-specific-products "Direct link to heading")

### Legacy: through shipping profiles[#](https://developers.etsy.com/documentation/tutorials/migration/#legacy-through-shipping-profiles "Direct link to heading")

Shipping profiles assemble shipping details such as shipping price and processing time for recipients grouped by country or region. Every listing requires a shipping profile, so you add shipping profiles to your shop with [createShopShippingProfile](https://developers.etsy.com/documentation/reference#operation/createShopShippingProfile), and assign a shipping profile to a listing using a `shipping_profile_id` when you create or update the listing. For more details you can see the "Adding a shipping profile to a listing" section of the [listings tutorial](https://developers.etsy.com/documentation/tutorials/listings/#adding-a-shipping-profile-to-a-listing).

### New: through processing profiles[#](https://developers.etsy.com/documentation/tutorials/migration/#new-through-processing-profiles "Direct link to heading")

Processing profiles contain information about the processing details of a product. Every listing requires at least one processing profile to be linked to it. You can create processing profiles for your shop with `createShopReadinessStateDefinition`, and link it to a listing using the `readiness_state_id` when you create a new listing through [`createDraftListing`](https://developers.etsy.com/documentation/reference#operation/createDraftListing) or to specific products when you update a listing's inventory through [updateListingInventory](https://developers.etsy.com/documentation/reference#operation/updateListingInventory).

#### Create a processing profile[#](https://developers.etsy.com/documentation/tutorials/migration/#create-a-processing-profile "Direct link to heading")

The following procedure creates a new processing profile and returns the `readiness_state_id` in the response:

1.  Form a valid URL for `createShopReadinessStateDefinition`, which must include a `shop_id`. For example, if your `shop_id` is "12345678", then the _createShopReadinessStateDefinition_ URL is:
    
    [https://api.etsy.com/v3/application/shops/12345678/readiness-state-definitions](https://api.etsy.com/v3/application/shops/12345678/readiness-state-definitions)
    
2.  Build the `createShopReadinessStateDefinition` request body, which must include:
    

*   `readiness_state`: The state a product can be in production wise, values can be either "ready\_to\_ship" or "made\_to\_order".
*   `min_processing_time`: The minimum time required to process to ship products with this processing profile.
*   `max_processing_time`: The maximum time required to process to ship products with this processing profile.
*   `processing_time_unit`: The unit used to represent how long a processing time is. A week is equivalent to 5 business days. Values can be "days" or "weeks". If none is provided, the unit is set to "days".

3.  Execute a createShopReadinessStateDefinition POST request with your `shops_w` scoped OAuth token and `x-api-key`, and read the generated `readiness_state_id` from the response, which you’ll use to link it to specific products later on. For example, a createReadinessStateDefinition request for a product that’s made to order and the processing time is 5-8 days might look like the following:

*   JavaScript fetch
*   PHP curl

#### Link a processing profile through createDraftListing[#](https://developers.etsy.com/documentation/tutorials/migration/#link-a-processing-profile-through-createdraftlisting "Direct link to heading")

_This only applies to physical listings, Digital listings do not need a linked processing profile._

Once you have a `readiness_state_id` you can follow this process to _link_ a processing profile to a physical listing:

1.  Form a valid URL for [`createDraftListing`](https://developers.etsy.com/documentation/reference#operation/createDraftListing), which must include a `shop_id` for the shop that hosts the listing. For example, if your shop\_id is "12345678," the createDraftListing URL is:
    
    The `legacy` query param is required to use processing profiles but only during the transition period.
    
2.  Build the createDraftListing request body, which must include at a minimum:
    
    *   `quantity`
    *   `title`
    *   `description`
    *   `price`
    *   `who_made`
    *   `when_made`
    *   `taxonomy_id`
    *   `image_ids` required for active listings
    *   `readiness_state_id` which you obtained through `createShopReadinessStateDefinition`
3.  Execute a createDraftListing POST request with your `listings_w` scoped OAuth token and `x-api-key`. For example, a createDraftListing request to list 5 yo-yos might look like the following:
    

*   JavaScript fetch
*   PHP curl

Following this process will associate the processing profile with the `readiness_state_id` you provided to the listing, associating in turn the processing times and readiness state stored in the processing profile.

As this endpoint doesn’t allow for the creation of variations of the same product in the same listing, such as different colored products with specific quantities or processing profiles for sale in each color, this will need to be done through the [`updateListingInventory`](https://developers.etsy.com/documentation/reference#operation/updateListingInventory) endpoint.

#### Link a processing profile through updateListingInventory[#](https://developers.etsy.com/documentation/tutorials/migration/#link-a-processing-profile-through-updatelistinginventory "Direct link to heading")

The following example updates a listing inventory where there are two variations:

1.  Material - "Pine", "Walnut"
2.  Size - "4", "5"

In this example, the material variation affects the price, while the size variation affects the quantity and sku of the product.

In the products array, you will have 4 entries (2 materials x 2 sizes).

Due to the size affecting both quantity and sku, when quantity is updated it must be the same value across all products sharing the same sku. The sku "woodthing4" has 2 entries in the array, but the `quantity` value for all three of those arrays (inside `offerings`) must be the same value (44 in this example).

Similarly, because material affects pricing, in each product you will see that the "Walnut" property value indicates the `price` in `offerings` is 8.00 while "Pine" is 6.00.

Note that since there is only one variation that affects the price, the `price_on_property` value is a single value of `507`, which is the property\_id for "Material". Since size affects both quantity and sku, the `quantity_on_property` and `sku_on_property` values are a single value of `100`, which is the property\_id for "Size".

Now, there are two possible approaches to take with processing profiles:

1.  Processing profiles vary per product.
2.  The same processing profile can be linked to all the products inside the listing.

We'll explore how to provide those values in the following examples.

#### Processing profiles vary per product[#](https://developers.etsy.com/documentation/tutorials/migration/#processing-profiles-vary-per-product "Direct link to heading")

Following the example above, let's add to the example that the `processing profiles` vary per material, just like `price`. In Etsy's Shop Manager web UI this distribution would look like this:

![img alt](https://developers.etsy.com/assets/images/readiness_state_definition_example_vary_per_product-a00d0cb74248a0cde0283d52658b28ee.png)

To obtain the available processing profiles for the shop and their corresponding `readiness_state_id` to link it to the specific products you can use the `getShopReadinessStateDefinitions` endpoint. For this example we'll use two different processing profiles for the two different materials the seller offers with the following values:

| Material: Pine | Material: Walnut |
| --- | --- |
| `readiness_state_id`: 18201076875 | `readiness_state_id`: 18201056977 |
| `readiness_state`: mate\_to\_order | `readiness_state`: mate\_to\_order |
| `min_processing_time`: 3 | `min_processing_time`: 4 |
| `max_processing_time`: 5 | `max_processing_time`: 6 |
| `processing_time_unit`: weeks | `processing_time_unit`: days |

Once we have the `readiness_state_id` for each of the profiles we want to use for these products we can include them in the body request for the [`updateListingInventory`](https://developers.etsy.com/documentation/reference#operation/updateListingInventory) endpoint, which would be structured like this:

*   JavaScript fetch
*   PHP curl

As you can see in the above example, since `processing profiles` vary by the material property like `price`, we'll add a `readiness_state_on_property` value with the property\_id corresponding to "Material" (`507`).

Each product offering will have an associated `readiness_state_id`, in this case the same `readiness_state_id` needs to be used for all the offerings that have the same material. We have two offerings for each material, lets take “Walnut” as an example:

1.  Walnut - Size 4
2.  Walnut - Size 5

Since they all share the “Walnut” property value they will use the same processing profile.

#### The same processing profile is used for all the products[#](https://developers.etsy.com/documentation/tutorials/migration/#the-same-processing-profile-is-used-for-all-the-products "Direct link to heading")

In this case the body request for the [updateListingInventory](https://developers.etsy.com/documentation/reference#operation/updateListingInventory) endpoint would be pretty similar to the case above, with two main differences:

1.  The same `readiness_state_id` will be used for all the product offerings.
2.  The `readiness_state_on_property` value will be empty, as none of the properties that change the readiness state of the product.

**NOTES:**

1.  When updating inventory, the entire set of products (based on variations) must be in the `products` array.
    
2.  To get the product array, call `getListingInventory` for the listing. From the `getListingInventory` response, remove the following fields: `product_id`, `offering_id`, `scale_name`, `is_deleted` and `value_pairs`. Also change the `price` array in offerings to be a decimal value instead of an array.
    
3.  The `*_on_property` values should match the `property_id` values, but only if those properties affect the price, quantity, sku, or processing profiles. See the sample below for handling variations.
    

## Get processing time values[#](https://developers.etsy.com/documentation/tutorials/migration/#get-processing-time-values "Direct link to heading")

### Legacy: through shipping profiles[#](https://developers.etsy.com/documentation/tutorials/migration/#legacy-through-shipping-profiles-1 "Direct link to heading")

You can get the processing time values associated with a listing through the [getListing](https://developers.etsy.com/documentation/reference#operation/getListing) endpoint if you have a `listing_id`. The response will show the associated shipping profile and its values, including the processing time.

If you have a specific `shipping_profile_id` you can use the [getShopShippingProfile](https://developers.etsy.com/documentation/reference#operation/getShopShippingProfile) endpoint to obtain the `min_processing_days` and `max_processing_days`.

### New: through processing profiles[#](https://developers.etsy.com/documentation/tutorials/migration/#new-through-processing-profiles-1 "Direct link to heading")

You’ll be able to access the `readiness_state_id` associated with specific products through [getListingInventory](https://developers.etsy.com/documentation/reference#operation/getListingInventory), [getListingOffering](https://developers.etsy.com/documentation/reference#operation/getListingOffering) or [getListingProduct](https://developers.etsy.com/documentation/reference#operation/getListingProduct), where you’ll find the linked `readiness_state_id` inside the product offerings.

You can use the endpoint [getShopReadinessStateDefinition](https://developers.etsy.com/documentation/reference#operation/getShopReadinessStateDefinition) with the `readiness_state_id` and `shop_id` to retrive the specific processing time values associated with that profile.

To get the processing profiles associated with a shop, you can use the endpoint [getShopReadinessStateDefinitions](https://developers.etsy.com/documentation/reference#operation/getShopReadinessStateDefinitions) using the `shop_id`. The response on this endpoint will return a list of all the processing profiles, and will include the processing time values for each one of them.

To get the processing profiles associated with a shop, you can use the endpoint [getShopReadinessStateDefinitions](https://developers.etsy.com/documentation/reference#operation/getShopReadinessStateDefinitions) using the `shop_id`. The response on this endpoint will return a list of all the processing profiles, and will include the processing time values for each one of them.

## Update processing time values[#](https://developers.etsy.com/documentation/tutorials/migration/#update-processing-time-values "Direct link to heading")

### Legacy: through shipping profiles[#](https://developers.etsy.com/documentation/tutorials/migration/#legacy-through-shipping-profiles-2 "Direct link to heading")

To update processing time in shipping profiles currently you need to use the [updateShopShippingProfile](https://developers.etsy.com/documentation/reference#operation/updateShopShippingProfile) endpoint and provide new `min_processing_time`, `max_processing_time` and `processing_time_unit` with the new values.

### New: through processing profiles[#](https://developers.etsy.com/documentation/tutorials/migration/#new-through-processing-profiles-2 "Direct link to heading")

When using processing profiles you’ll need to use the `updateShopReadinessStateDefinition`, which will update an existing processing profile. The fields `shop_id` and `readiness_state_id` are required, while the fields `readiness_state`, `min_processing_time`, and `max_processing_time`, `processing_time_unit` would be optional.

Keep in mind that this update will apply to all product offerings that are linked to the processing profile.

---

### Tutorials Overview | Etsy Open API v3

Source: https://developers.etsy.com/documentation/tutorials/overview/

Tutorials Overview | Etsy Open API v3

*   [Introduction](https://developers.etsy.com/documentation/)
*   [API Essentials](https://developers.etsy.com/documentation/tutorials/overview/#!)
    *   [Authentication](https://developers.etsy.com/documentation/essentials/authentication)
    *   [URL Syntax](https://developers.etsy.com/documentation/essentials/urlsyntax)
    *   [Definitions](https://developers.etsy.com/documentation/essentials/definitions)
    *   [Request Standards](https://developers.etsy.com/documentation/essentials/requests)
    *   [Rate Limits](https://developers.etsy.com/documentation/essentials/rate-limits)
    *   [Webhooks](https://developers.etsy.com/documentation/essentials/webhooks)
    *   [Get help](https://developers.etsy.com/documentation/get-help)
    *   [API testing policy](https://www.etsy.com/legal/policy/api-testing-policy/169130941112)
*   [Tutorials](https://developers.etsy.com/documentation/tutorials/overview/#!)
    *   [Overview](https://developers.etsy.com/documentation/tutorials/overview)
    *   [Quick Start Tutorial](https://developers.etsy.com/documentation/tutorials/quickstart)
    *   [Fulfillment Tutorial](https://developers.etsy.com/documentation/tutorials/fulfillment)
    *   [Listings Tutorial](https://developers.etsy.com/documentation/tutorials/listings)
    *   [Processing Profiles Migration](https://developers.etsy.com/documentation/tutorials/migration)
    *   [Third Variation Tutorial](https://developers.etsy.com/documentation/tutorials/third-variation)
    *   [Shop Management Tutorial](https://developers.etsy.com/documentation/tutorials/shopmanagement)
    *   [Payments Tutorial](https://developers.etsy.com/documentation/tutorials/payments)
    *   [Personalization Migration](https://developers.etsy.com/documentation/tutorials/overview/#!)
        *   [Multi Personalization Migration Guide](https://developers.etsy.com/documentation/tutorials/personalization-migration)
        *   [Endpoint Migration (backwards compatible)](https://developers.etsy.com/documentation/tutorials/personalization/endpoint-migration)
        *   [Examples for the Endpoint Migration Period](https://developers.etsy.com/documentation/tutorials/personalization/endpoint-migration-examples)
        *   [Multiple + New Question Type Support](https://developers.etsy.com/documentation/tutorials/personalization/multiple-and-new-question-type-support)
        *   [Examples for the Multiple + New Questions Type Support Period](https://developers.etsy.com/documentation/tutorials/personalization/multiple-and-new-question-type-support-examples)
*   [Manage your apps](https://www.etsy.com/developers)
*   [Terms of use](https://www.etsy.com/legal/api)

# Tutorials Overview

*   [Quick Start](https://developers.etsy.com/documentation/tutorials/quickstart)
*   [Fulfillment](https://developers.etsy.com/documentation/tutorials/fulfillment)
*   [Listings](https://developers.etsy.com/documentation/tutorials/listings)
*   [Shop Management](https://developers.etsy.com/documentation/tutorials/shopmanagement)
*   [Payments](https://developers.etsy.com/documentation/tutorials/payments)

---

### Payments Tutorial | Etsy Open API v3

Source: https://developers.etsy.com/documentation/tutorials/payments

# Payments Tutorial | Etsy Open API v3

##### important

These tutorials are subject to change as endpoints change during our feedback period development. We welcome your feedback! If you find an error or have a suggestion, please post it in the [Open API GitHub Repository](https://github.com/etsy/open-api).

Payments and the Shop Ledger contain financial information for your shop's transactions. The Open API v3 endpoints for payments and the shop ledger are read-only operations — as buyers make purchases, sellers post shipping costs with the listing, and refunds are not automatic.

The API implements payments and the shop ledger to support reporting, receipt management, fees, and taxes. The differences between these two resources are:

1.  a shop payment account ledger entry, identified by `entry_id` and `ledger_id`, represents the total payment account value after each debit or credit to the shop's payment account, including transactions made for purchases and fulfillment. This is similar to the running total in a bank account and you access it using the [getShopPaymentAccountLedgerEntries](https://developers.etsy.com/documentation/reference/#tag/Ledger-Entry) endpoint. See [Reading a shop payment account ledger](https://developers.etsy.com/documentation/tutorials/payments/#reading-a-shop-payment-account-ledger) below.
2.  a payment, identified by`payment_id` or `receipt_id`, represents all the payment details for a purchase after [fulfillment](https://developers.etsy.com/documentation/tutorials/payments/fulfillment), including fees, shipping, and taxes. This tells you how much a buyer paid, how Etsy divides up the payment to cover costs, and the payment method. You can access payments using the [getPayments](https://developers.etsy.com/documentation/reference/#operation/getPayments) endpoint. See [Viewing payments](https://developers.etsy.com/documentation/tutorials/payments/#viewing-payments) below.

For example, when a buyer pays for a purchase, an entry appears in the shop payment account ledger, but there is no payment record until the purchase ships.

_Throughout this tutorial, the instructions reference REST resources, endpoints, parameters, and response fields, which we cover in detail in [Request Standards](https://developers.etsy.com/documentation/tutorials/essentials/requests) and [URL Syntax](https://developers.etsy.com/documentation/tutorials/essentials/urlsyntax)._

### `Authorization` and `x-api-key` header parameters[#](https://developers.etsy.com/documentation/tutorials/payments/#authorization-and-x-api-key-header-parameters "Direct link to heading")

The endpoints in this tutorial require an OAuth token in the header with `transactions_r` scope. See the [Authentication topic](https://developers.etsy.com/documentation/tutorials/essentials/authentication) for instructions on how to generate an OAuth token with these scopes.

In addition, all Open API V3 requests require the `x-api-key:` parameter in the header with your shop's Etsy App API Key _keystring_ and _shared secret_, separated by a colon (`:`), which you can find in [Your Apps](https://www.etsy.com/developers/your-apps).

## Reading a shop payment account ledger[#](https://developers.etsy.com/documentation/tutorials/payments/#reading-a-shop-payment-account-ledger "Direct link to heading")

Each change in the shop payment account is recorded in an entry in the shop payment account ledger. This includes individual charges and payments recorded at the time they executed. For example, when you pay to renew a listing, Etsy adds an entry to the shop payment account ledger.

The following procedure displays all entries in a shop payment account ledger, 25 entries at a time, in chronological order:

1.  Form a valid URL for [getShopPaymentAccountLedgerEntries](https://developers.etsy.com/documentation/reference/#tag/Ledger-Entry), which must include a `shop_id` for the shop. For example, if your shop\_id is 12345678, the getShopPaymentAccountLedgerEntries URL is:
    
2.  Add the query parameters to get all entries, 25 at a time:
    
3.  Execute a getShopPaymentAccountLedgerEntries GET request with a `transactions_r` scope OAuth token and `x-api-key`, which might look like the following:
    

*   JavaScript fetch
*   PHP curl

## Viewing payments[#](https://developers.etsy.com/documentation/tutorials/payments/#viewing-payments "Direct link to heading")

After [shipping a purchase](https://developers.etsy.com/documentation/tutorials/payments/fulfillment), a buyer's payment posts to the shop and the receipt updates to reflect the changes due to shipping, taxes, and fees. While the receipt contains only the details most useful to the buyer, the payment contains the monetary details of the transaction, such as the currency the buyer used, and the currencies used to pay fees, taxes, and shipping costs.

The following procedure displays all payments posted to an Etsy shop:

1.  Form a valid URL for [getPayments](https://developers.etsy.com/documentation/reference/#operation/getPayments), which must include a `shop_id` for the shop. For example, if your shop\_id is 12345678, the getPayments URL is:
    
2.  Execute a getPayments GET request with a `transactions_r` scope OAuth token and `x-api-key`, which might look like the following:
    

*   JavaScript fetch
*   PHP curl

## Viewing a payment associated with a specific ledger entry[#](https://developers.etsy.com/documentation/tutorials/payments/#viewing-a-payment-associated-with-a-specific-ledger-entry "Direct link to heading")

When you have ledger entries and want to know which payments included them, send a [getPaymentAccountLedgerEntryPayments](https://developers.etsy.com/documentation/reference/#operation/getPaymentAccountLedgerEntryPayments) request including the `ledger_id`. For ledger entries for debits and credits involved in a payment, the response includes the payment details. The response is empty for ledger entries not included in a payment.

The following procedure displays all payments posted to an Etsy shop:

1.  Form a valid URL for [getPaymentAccountLedgerEntryPayments](https://developers.etsy.com/documentation/reference/#operation/getPaymentAccountLedgerEntryPayments), which must include a `shop_id` for the shop. For example, if your shop\_id is 12345678, the getPayments URL is:
    
2.  Add the query parameters to get the payments associated with specific ledger entries. For example, to get the payments associated with ledger entry IDs 42362821 and 42362821, the query parameters would be:
    
3.  Execute a getPaymentAccountLedgerEntryPayments GET request with a `transactions_r` scope OAuth token and `x-api-key`, which might look like the following:
    

*   JavaScript fetch
*   PHP curl

---

### Multi Personalization Migration Guide | Etsy Open API v3

Source: https://developers.etsy.com/documentation/tutorials/personalization-migration

Multi Personalization Migration Guide | Etsy Open API v3

*   [Introduction](https://developers.etsy.com/documentation/)
*   [API Essentials](https://developers.etsy.com/documentation/tutorials/personalization-migration/#!)
    *   [Authentication](https://developers.etsy.com/documentation/essentials/authentication)
    *   [URL Syntax](https://developers.etsy.com/documentation/essentials/urlsyntax)
    *   [Definitions](https://developers.etsy.com/documentation/essentials/definitions)
    *   [Request Standards](https://developers.etsy.com/documentation/essentials/requests)
    *   [Rate Limits](https://developers.etsy.com/documentation/essentials/rate-limits)
    *   [Webhooks](https://developers.etsy.com/documentation/essentials/webhooks)
    *   [Get help](https://developers.etsy.com/documentation/get-help)
    *   [API testing policy](https://www.etsy.com/legal/policy/api-testing-policy/169130941112)
*   [Tutorials](https://developers.etsy.com/documentation/tutorials/personalization-migration/#!)
    *   [Overview](https://developers.etsy.com/documentation/tutorials/overview)
    *   [Quick Start Tutorial](https://developers.etsy.com/documentation/tutorials/quickstart)
    *   [Fulfillment Tutorial](https://developers.etsy.com/documentation/tutorials/fulfillment)
    *   [Listings Tutorial](https://developers.etsy.com/documentation/tutorials/listings)
    *   [Processing Profiles Migration](https://developers.etsy.com/documentation/tutorials/migration)
    *   [Third Variation Tutorial](https://developers.etsy.com/documentation/tutorials/third-variation)
    *   [Shop Management Tutorial](https://developers.etsy.com/documentation/tutorials/shopmanagement)
    *   [Payments Tutorial](https://developers.etsy.com/documentation/tutorials/payments)
    *   [Personalization Migration](https://developers.etsy.com/documentation/tutorials/personalization-migration/#!)
        *   [Multi Personalization Migration Guide](https://developers.etsy.com/documentation/tutorials/personalization-migration)
        *   [Endpoint Migration (backwards compatible)](https://developers.etsy.com/documentation/tutorials/personalization/endpoint-migration)
        *   [Examples for the Endpoint Migration Period](https://developers.etsy.com/documentation/tutorials/personalization/endpoint-migration-examples)
        *   [Multiple + New Question Type Support](https://developers.etsy.com/documentation/tutorials/personalization/multiple-and-new-question-type-support)
        *   [Examples for the Multiple + New Questions Type Support Period](https://developers.etsy.com/documentation/tutorials/personalization/multiple-and-new-question-type-support-examples)
*   [Manage your apps](https://www.etsy.com/developers)
*   [Terms of use](https://www.etsy.com/legal/api)

# Multi Personalization Migration Guide[#](https://developers.etsy.com/documentation/tutorials/personalization-migration/#multi-personalization-migration-guide "Direct link to heading")

To make it easier for sellers with personalizable listings to collect the information they need from buyers and more efficiently process personalizable orders, we are replacing the single free-text personalization field with an architecture that supports multiple, typed personalization inputs: text inputs, dropdowns, and file upload questions. More information about the reasoning behind this project can be found in the [GitHub announcement](https://github.com/etsy/open-api/discussions/1530).

### **Timeline**[#](https://developers.etsy.com/documentation/tutorials/personalization-migration/#timeline "Direct link to heading")

![Multiple personalization migration timeline](/assets/images/perso_migration_timeline-e0162f5de9a428bbcbddd21658207662.svg)

### Integration Stages[#](https://developers.etsy.com/documentation/tutorials/personalization-migration/#integration-stages "Direct link to heading")

**Endpoint Migration** _(60-day migration window, Feb. 6 - Apr. 9 2026)_

*   Starting **February 6th, 2026**, a new personalization data structure will be introduced, along with a new suite of personalization-specific endpoints. Third-party developers can start using the new endpoints and response/data formats for all users from day 1.
*   The new data structure is backwards compatible with the current personalization data. Existing listing personalization data (i.e. instructions, character limit, and required setting) will be returned in the new format (as a single text input question) and can be updated via the new endpoints. No visual changes will be required during this period.
*   Legacy personalization fields will be deprecated on **April 9th, 2026**, and listing create/update requests containing legacy personalization fields will return an error.

**Multiple + New Question Type Support** _(early access for developer test accounts through a Developer Preview begins **Feb. 6**. The General Audience production release is slated for later in 2026, **date TBA, targeted for Late April or Early May**)_

*   Listings will support up to 5 personalization questions and 3 question types: text input, dropdown, and file upload.
*   Third party applications that read listing personalization data must be updated to correctly display multiple personalization questions.
*   Applications that read personalization data on transactions may also be required to update, depending on their integration.
*   For applications that write personalization data, changes allowing sellers to write multiple personalization questions and/or new question types **must not be released to production users until the Etsy General Audience launch date** (TBA; date will be communicated in advance via GitHub announcements).
*   To facilitate development and testing prior to the General Audience launch, we will give developers early access to these features via authorized test accounts starting on **Feb. 6th, 2026**.
*   The file-upload question type is currently under development so it won’t be available starting Feb 6th. This feature will be available for testing on **Feb, 29, 2026**, confirmation of its release will be provided via a GitHub announcement.

Consult other sections of this tutorial for detailed migration guidance, examples, and recommended steps for integrators.

*   [**Timeline**](https://developers.etsy.com/documentation/tutorials/personalization-migration/#timeline)
*   [Integration Stages](https://developers.etsy.com/documentation/tutorials/personalization-migration/#integration-stages)

---

### Endpoint Migration (backwards compatible) | Etsy Open API v3

Source: https://developers.etsy.com/documentation/tutorials/personalization/endpoint-migration

# Endpoint Migration (backwards compatible) | Etsy Open API v3

We are introducing a new data structure for listing personalization, as well as a new suite of endpoints to manage this data. This new structure is designed to maintain backwards compatibility with the existing listing personalization data, which will be modeled as a single text input question.

##### tip

**How to test:** Use your normal process and be sure to follow these [guidelines](https://www.etsy.com/legal/policy/api-testing-policy/169130941112).

**When to release:** Since these changes are backwards compatible, you can release them to your users whenever you’ve finished development work. Keep in mind that POST requests will be enabled only for a single text question per listing during this period, writes of multiple and new question types will be allowed later in 2026. **The legacy personalization fields will be deprecated on April 9th, 2026; your integration must be updated before then to avoid errors or missing data.**

## Required Changes[#](https://developers.etsy.com/documentation/tutorials/personalization/endpoint-migration/#required-changes "Direct link to heading")

### If you read personalization data:[#](https://developers.etsy.com/documentation/tutorials/personalization/endpoint-migration/#if-you-read-personalization-data "Direct link to heading")

*   Update your integration to use the new personalization data structure (details below).
*   Fetch listing personalization data via the new `getListingPersonalization` endpoint or by calling one of the following endpoints with `personalization` in the `includes` query param: [getListingsByShop](https://developers.etsy.com/documentation/reference/#operation/getListingsByShop), [getListing](https://developers.etsy.com/documentation/reference/#operation/getListing), or [getListingsByListingIds](https://developers.etsy.com/documentation/reference/#operation/getListingsByListingIds).
*   The `is_personalizable` property will continue to be returned from the current listing endpoints.

### If you write personalization data:[#](https://developers.etsy.com/documentation/tutorials/personalization/endpoint-migration/#if-you-write-personalization-data "Direct link to heading")

*   Update your integration to use the new personalization POST and DELETE endpoints (`updateListingPersonalization` and `deleteListingPersonalization`). Expect requests to the new POST endpoint to fully replace existing personalization data.
*   Stop sending legacy personalization fields on listing create and update requests.

## Migration Details[#](https://developers.etsy.com/documentation/tutorials/personalization/endpoint-migration/#migration-details "Direct link to heading")

The following sections detail the differences between the current and new behavior. You can consult the [Examples for the Endpoint Migration period](https://developers.etsy.com/documentation/tutorials/personalization/endpoint-migration-examples) section to see detailed examples.

### Reading listing personalization data[#](https://developers.etsy.com/documentation/tutorials/personalization/endpoint-migration/#reading-listing-personalization-data "Direct link to heading")

Currently, listing personalization data is returned in the `is_personalizable`, `personalization_is_required`, `personalization_char_count_max`, and `personalization_instructions` fields from the following endpoints:

*   [getListingsByShop](https://developers.etsy.com/documentation/reference/#operation/getListingsByShop) - `GET /v3/application/shops/{shop_id}/listings`
*   [getListing](https://developers.etsy.com/documentation/reference/#operation/getListing) - `GET /v3/application/listings/{listing_id}`
*   [getListingInventory](https://developers.etsy.com/documentation/reference/#operation/getListingInventory) - `GET /v3/application/listings/{listing_id}/inventory` using `?includes=Listing`
*   [getListingsByListingIds](https://developers.etsy.com/documentation/reference/#operation/getListingsByListingIds) - `GET /v3/application/listings/batch`
*   [findAllListingsActive](https://developers.etsy.com/documentation/reference/#operation/findAllListingsActive) - `GET /v3/application/listings/active`
*   [findAllActiveListingsByShop](https://developers.etsy.com/documentation/reference/#operation/findAllActiveListingsByShop) - `GET /v3/application/shops/{shop_id}/listings/active`
*   [getFeaturedListingsByShop](https://developers.etsy.com/documentation/reference/#operation/getFeaturedListingsByShop) - `GET /v3/application/shops/{shop_id}/listings/featured`
*   [getListingsByShopSectionId](https://developers.etsy.com/documentation/reference/#operation/getListingsByShopSectionId) - `GET /v3/application/shops/{shop_id}/shop-sections/listings`
*   [getListingsByShopReceipt](https://developers.etsy.com/documentation/reference/#operation/getListingsByShopReceipt) - `GET /v3/application/shops/{shop_id}/receipts/{receipt_id}/listings`
*   [getListingsByShopReturnPolicy](https://developers.etsy.com/documentation/reference/#operation/getListingsByShopReturnPolicy) - `GET /v3/application/shops/{shop_id}/policies/return/{return_policy_id}/listings`

##### note

We will continue to return the `is_personalizable` property as part of the base listing data returned from these endpoints.

#### New: Through the dedicated personalization GET endpoint[#](https://developers.etsy.com/documentation/tutorials/personalization/endpoint-migration/#new-through-the-dedicated-personalization-get-endpoint "Direct link to heading")

We are introducing a new `getListingPersonalization` endpoint (`GET https://api.etsy.com/v3/application/listings/{listing_id}/personalization`) to fetch personalization data by `listing_id`. It returns a `personalization_questions` array. If the listing has no personalization configured, the array is empty.

This endpoint will return existing listing personalization data in the following structure:

##### note

During the initial migration phase (before the start of the Multiple + New Question Type Support period), you can expect listings to have at most one `text_input` type question with the `question_text` “Personalization.”

#### New: Via endpoints that return listings with associations[#](https://developers.etsy.com/documentation/tutorials/personalization/endpoint-migration/#new-via-endpoints-that-return-listings-with-associations "Direct link to heading")

Additionally, you can retrieve the personalization data for a listing from the following endpoints by appending the `?includes=personalization` query param:

*   [getListingsByShop](https://developers.etsy.com/documentation/reference/#operation/getListingsByShop) - `GET /v3/application/shops/{shop_id}/listings`
*   [getListing](https://developers.etsy.com/documentation/reference/#operation/getListing) - `GET /v3/application/listings/{listing\_id}`
*   [getListingsByListingIds](https://developers.etsy.com/documentation/reference/#operation/getListingsByListingIds) - `GET /v3/application/listings/batch`

The response body will include a `personalization` key, containing a possibly empty `personalization_questions` array. We will continue to return the `is_personalizable` property as part of the base listing level:

### Adding or updating listing personalization data[#](https://developers.etsy.com/documentation/tutorials/personalization/endpoint-migration/#adding-or-updating-listing-personalization-data "Direct link to heading")

Currently, you can add or update personalization on a listing using the [`createDraftListing`](https://developers.etsy.com/documentation/reference/#operation/createDraftListing) and the [`updateListing`](https://developers.etsy.com/documentation/reference/#operation/updateListing) endpoints by sending the following params: `is_personalizable`, `personalization_is_required`, `personalization_char_count_max`, and `personalization_instructions`.

#### New: Through the dedicated personalization POST endpoint[#](https://developers.etsy.com/documentation/tutorials/personalization/endpoint-migration/#new-through-the-dedicated-personalization-post-endpoint "Direct link to heading")

The new `updateListingPersonalization` endpoint (`POST https://api.etsy.com/v3/application/shops/{shop_id}/listings/{listing_id}/personalization`) creates or updates personalization data for a listing.

##### note

This endpoint fully replaces the existing listing personalization data on the listing with the sent data.

Current personalization data can be modeled as a single `text_input` question:

##### info

Before the Multiple + New Question Type Support period starts, POST requests for production seller accounts must follow the following constraints:

*   The `personalization_question` array must contain one question object.
*   The `question_type` must be `text_input.`
*   To preserve compatibility with legacy UIs, which do not include a configurable title field, **please send '`Personalization`' as the default `question_text` value during the endpoint migration phase**. Once multiple personalization questions are introduced (General Audience launch), this field can be configured by the seller and will be used as the title of each question.
*   `instructions` (if provided):
    *   Must be 256 characters or fewer
    *   Must begin with a letter or number
    *   Must not contain 3 or more consecutive all-caps words (a word being defined as a sequence of 3 or more letters)

### Deleting personalization from a listing[#](https://developers.etsy.com/documentation/tutorials/personalization/endpoint-migration/#deleting-personalization-from-a-listing "Direct link to heading")

Currently, to remove personalization from a listing, you can set `is_personalizable` to `false` via the `updateListing` endpoint.

#### New: Through the dedicated personalization DELETE endpoint[#](https://developers.etsy.com/documentation/tutorials/personalization/endpoint-migration/#new-through-the-dedicated-personalization-delete-endpoint "Direct link to heading")

The new `deleteListingPersonalization` endpoint (`DELETE https://api.etsy.com/v3/application/shops/{shop_id}/listings/{listing_id}/personalization`) can be used to turn off personalization for a listing and remove the associated data.

The `is_personalizable` property will be set to `false` on the main listing record as a result of this action.

---

### Examples for the Endpoint Migration Period | Etsy Open API v3

Source: https://developers.etsy.com/documentation/tutorials/personalization/endpoint-migration-examples

# Examples for the Endpoint Migration Period

## Getting personalization data through the dedicated personalization GET endpoint[#](https://developers.etsy.com/documentation/tutorials/personalization/endpoint-migration-examples/#getting-personalization-data-through-the-dedicated-personalization-get-endpoint "Direct link to heading")

This endpoint retrieves a listing’s personalization questions by listing ID. It returns a `personalization_questions` array. If the listing has no personalization configured, the array is empty.

The following procedure retrieves the personalization questions attached to a listing.

1.  Form a valid URL for `getListingPersonalization`, which must include a `listing_id`. For example, if your `listing_id` is "987654", the URL is:
    
    [https://api.etsy.com/v3/application/listings/987654/personalization](https://api.etsy.com/v3/application/listings/987654/personalization)
    
2.  Execute a `getListingPersonalization` GET request with your x-api-key.
    
3.  The response contains a `personalization_questions` object:
    

## Getting personalization data via endpoints that return listings with associations[#](https://developers.etsy.com/documentation/tutorials/personalization/endpoint-migration-examples/#getting-personalization-data-via-endpoints-that-return-listings-with-associations "Direct link to heading")

You can still retrieve the personalization data for a listing by using the following endpoints and including the parameter `?includes=personalization` in your requests:

*   [getListingsByShop](https://developers.etsy.com/documentation/reference/#operation/getListingsByShop) - `GET /v3/application/shops/{shop_id}/listings`
*   [getListing](https://developers.etsy.com/documentation/reference/#operation/getListing) - `GET /v3/application/listings/{listing_id}`
*   [getListingsByListingIds](https://developers.etsy.com/documentation/reference/#operation/getListingsByListingIds) - `GET /v3/application/listings/batch`

**Example url for the `getListing` endpoint:** [https://api.etsy.com/v3/application/shops/12345678/listings?includes=personalization\\&language=en](https://api.etsy.com/v3/application/shops/12345678/listings?includes=personalization&language=en)

**Example response:**

During this phase we will continue to return the legacy keys related to personalization, since the new data shape is fully backwards compatible with the legacy one.

## Adding or updating personalization data through the dedicated personalization POST endpoint[#](https://developers.etsy.com/documentation/tutorials/personalization/endpoint-migration-examples/#adding-or-updating-personalization-data-through-the-dedicated-personalization-post-endpoint "Direct link to heading")

To create or update personalization questions for a listing you must first have an existing listing. If you do not have one, you can create a new listing using the [`createDraftListing`](https://developers.etsy.com/documentation/reference/#operation/createDraftListing) endpoint before utilizing this endpoint.

The following procedure creates and attaches personalization profile to a specific listing:

1.  Form a valid URL for `updateListingPersonalization`, which must include a `shop_id` and a `listing_id`. For example, if your `shop_id` is "12345678", and your `listing_id` is “987654” then the `createListingPersonalization` URL would be:
    
    [https://api.etsy.com/v3/application/shops/12345678/listings/987654/personalization](https://api.etsy.com/v3/application/shops/12345678/listings/987654/personalization)
    
2.  Build the `updateListingPersonalization` request body, which must include:
    
    1.  `personalization_questions` - Array of `personalization_questions` with a single `text_input` question and the `question_text` value must be “Personalization”, similar to:

3.  Execute a `updateListingPersonalization` POST request with your `listings_w` scoped OAuth token and x-api-key. For example, a request with the previous `personalization_question` might look like this:

*   JavaScript fetch

4.  The response would look something like this:

5.  The content of this request will replace any existing personalization data in this listing.

## Deleting personalization from a listing through the dedicated DELETE endpoint[#](https://developers.etsy.com/documentation/tutorials/personalization/endpoint-migration-examples/#deleting-personalization-from-a-listing-through-the-dedicated-delete-endpoint "Direct link to heading")

This endpoint deletes personalization for a listing. It clears personalization by setting `is_personalizable` to false and removing the listing’s personalization data.

The following procedure deletes the personalization questions attached to a listing.

1.  Form a valid URL for `deleteListingPersonalization`, which must include a `shop_id` and a `listing_id`. For example, if your `shop_id` is "12345678", and your `listing_id` is “987654” then the `deleteListingPersonalization` URL would be:
    
    [https://api.etsy.com/v3/application/shops/12345678/listings/987654/personalization](https://api.etsy.com/v3/application/shops/12345678/listings/987654/personalization)
    
2.  Execute a `deleteListingPersonalization` DELETE request with your listings\_w scoped OAuth token and x-api-key.
    
3.  Check the response. On success, the endpoint returns `204 No Content`.

---

### Multiple + New Question Type Support | Etsy Open API v3

Source: https://developers.etsy.com/documentation/tutorials/personalization/multiple-and-new-question-type-support

# Multiple + New Question Type Support

Later in 2026 (General Audience release date TBA), we will roll out new personalization features to sellers, allowing them to configure up to 5 personalization questions on a listing using 3 question types: text input (introduced during the Endpoint Migration period), dropdown, and file upload.

##### danger

The ability to write multiple questions and/or new question types **must not be released to production users** until the Etsy.com General Audience release (date TBA).

To facilitate development and testing prior to the General Audience launch, we will give developers early access to these features via authorized test accounts starting on **Feb. 6th** (a.k.a. “developer preview”).

## Required changes[#](https://developers.etsy.com/documentation/tutorials/personalization/multiple-and-new-question-type-support/#required-changes "Direct link to heading")

To ensure your integration is compatible with the new personalization features, you **must** make the following changes. These updates should be released to users as soon as possible after Etsy’s General Audience launch (date TBA).

#### If you read personalization data on transactions:[#](https://developers.etsy.com/documentation/tutorials/personalization/multiple-and-new-question-type-support/#if-you-read-personalization-data-on-transactions "Direct link to heading")

*   Personalization data will continue to be returned in the transaction `variation` array in the existing format. If your integration relies on the `formatted_name` being "`Personalization`" or there being one item with `property_id: 54`, this may need to be updated.

#### If you read personalization data on listings:[#](https://developers.etsy.com/documentation/tutorials/personalization/multiple-and-new-question-type-support/#if-you-read-personalization-data-on-listings "Direct link to heading")

*   Your integration will need to be updated to correctly display multiple questions with new types (test input, dropdown, and file-upload).

#### If you write personalization data on listings:[#](https://developers.etsy.com/documentation/tutorials/personalization/multiple-and-new-question-type-support/#if-you-write-personalization-data-on-listings "Direct link to heading")

*   Your integration will need to be updated to support adding multiple questions with new question types.

## Breakdown of the changes[#](https://developers.etsy.com/documentation/tutorials/personalization/multiple-and-new-question-type-support/#breakdown-of-the-changes "Direct link to heading")

With multiple and new question types, we aim to streamline the purchasing experience for personalized items by reducing the amount of text buyers need to read when making a purchase.

As part of this update, we are introducing a new **120 character limit to the `instructions` field** (reduced from the previous 256 character limit). Please review the following sections to understand how this change may affect your application.

### Reading transaction personalization data[#](https://developers.etsy.com/documentation/tutorials/personalization/multiple-and-new-question-type-support/#reading-transaction-personalization-data "Direct link to heading")

Currently, personalization data for a transaction is returned (if present) as part of the `variations` array on a transaction object:

Transaction personalization will continue to be returned in the same format, but be advised of the following changes:

*   The `formatted_name` may be a seller-configured value.
*   There may be multiple objects with `property_id` 54.
*   For file uploads, the `formatted_value` will be a URL.

### Reading listing personalization data[#](https://developers.etsy.com/documentation/tutorials/personalization/multiple-and-new-question-type-support/#reading-listing-personalization-data "Direct link to heading")

As specified in the [Endpoint Migration](https://developers.etsy.com/documentation/tutorials/personalization/endpoint-migration) section of the guide, listing personalization data can be fetched via the following endpoints:

*   getListingPersonalization - `GET /v3/application/listings/{listing_id}/personalization`
*   [getListingsByShop](https://developers.etsy.com/documentation/reference/#operation/getListingsByShop) - `GET /v3/application/shops/{shop_id}/listings?includes=personalization`
*   [getListing](https://developers.etsy.com/documentation/reference/#operation/getListing) - `GET /v3/application/listings/{listing_id}?includes=personalization`
*   [getListingsByListingIds](https://developers.etsy.com/documentation/reference/#operation/getListingsByListingIds) - `GET /v3/application/listings/batch?includes=personalization`

The `personalization_questions` array may contain up to 5 questions with 3 types: text input, dropdown, and file upload. The question data structure introduced in the Endpoint Migration will be extended to encompass the new question types:

Examples of each question type are given in the [Examples for the Multiple + New Question Type Support Period](https://developers.etsy.com/documentation/tutorials/personalization/multiple-and-new-question-type-support-examples) section.

Existing `instructions` values that exceed the 120 character limit will still be returned in full by GET requests and will not be automatically truncated. However, any updates to these questions via POST requests must comply with the new 120 character limit.

### Writing listing personalization data[#](https://developers.etsy.com/documentation/tutorials/personalization/multiple-and-new-question-type-support/#writing-listing-personalization-data "Direct link to heading")

As specified in the [Endpoint Migration](https://developers.etsy.com/documentation/tutorials/personalization/endpoint-migration) section of this guide, listing personalization can be written via the `updatePersonalizationEndpoint` endpoint (`POST https://api.etsy.com/v3/application/shops/{shop_id}/listings/{listing_id}/personalization`).

For authorized developer test accounts during the **Developer Preview** period, and for all production seller accounts following the General Audience launch, this endpoint will accept an array of up to 5 `personalization_questions` and support all question types.

Please note the following constraints:

*   The `personalization_questions` array must contain between 1 and 5 elements.
*   At most one upload-type question (either `unlabeled_upload` or `labeled_upload`) may be sent per listing.

##### warning

**When you release the update to support multiple questions and new question types, please also append `?supports_multiple_personalization_questions=true` when calling this endpoint.** This will allow us to track adoption and prevent inadvertent overwrites of seller data from non-updated apps. Without this query param, attempts to write data that would delete previously configured personalization questions will fail with a `409 Conflict` error.

**Adding the param without updating your application can lead to deleting data provided by the seller on Etsyweb.**

There are also field-level constraints:

*   `question_text`
    *   Must be between 1 and 45 characters
    *   Must begin with a letter or number
*   `instructions`
    *   Must be empty or `null` for dropdowns
    *   Optional for the other question types
    *   Must not exceed 120 characters when provided (requests will fail validation otherwise)
    *   Must begin with a letter or number
    *   Must not contain 3 or more consecutive all-caps words (a word being defined as a sequence of 3 or more letters)
*   `max_allowed_characters`
    *   Required for `text_input` questions; not allowed for other question types
    *   Must be between 1 and 1024
*   `max_allowed_files`
    *   Required for upload questions (either labeled or unlabeled); not allowed for other question types
    *   Must be between 1 and 10
    *   For `labeled_upload` questions, `max_allowed_files` must be 2 or more
*   `options`
    *   Required for `dropdown` and `labeled_upload` questions; not allowed for other question types
    *   For dropdowns:
        *   Must contain 1 - 30 options
        *   Each label must be 1 - 20 characters
        *   Labels must be unique within the question
    *   For labeled uploads:
        *   Length must equal `max_allowed_files`
        *   Each label must be 1 - 45 characters
*   `question_id`
    *   optional, but encouraged if you are updating or adding to existing personalization on a listing ([example](https://developers.etsy.com/documentation/tutorials/personalization/multiple-and-new-question-type-support-examples#updating-a-listing-with-existing-personalization))

---

### Examples for the Multiple + New Questions Type Support Period | Etsy Open API v3

Source: https://developers.etsy.com/documentation/tutorials/personalization/multiple-and-new-question-type-support-examples

# Examples for the Multiple + New Questions Type Support Period

{

"personalization\_questions": \[

{

"question\_text": "What name would you like engraved?",

"instructions": "Please enter your family lastname",

"question\_id": 18205669682,

"question\_type": "text\_input",

"required": true,

"max\_allowed\_characters": 50,

"max\_allowed\_files": null

},

{

"question\_text": "What message would you like in the card?",

"instructions": "Please enter the message you would like added in the giftcard.",

"question\_id": 18205669686,

"question\_type": "text\_input",

"required": true,

"max\_allowed\_characters": 680,

"max\_allowed\_files": null

},

{

"question\_text": "Family pictures",

"instructions": "Add images of the members of your family that you want in your family portrait",

"question\_id": 18205849779,

"question\_type": "unlabeled\_upload",

"required": true,

"max\_allowed\_characters": null,

"max\_allowed\_files": 10

},

{

"question\_text": "Font",

"instructions": null,

"question\_id": 18205849781,

"question\_type": "dropdown",

"required": true,

"max\_allowed\_characters": null,

"max\_allowed\_files": null,

"options": \[

{

"option\_id": 18205669694,

"label": "Arial"

},

{

"option\_id": 18205849785,

"label": "Century Gothic"

},

{

"option\_id": 18205669696,

"label": "Times New Roman"

}

\]

},

{

"question\_text": "Frame color",

"instructions": null,

"question\_id": 18205849787,

"question\_type": "dropdown",

"required": true,

"max\_allowed\_characters": null,

"max\_allowed\_files": null,

"options": \[

{

"option\_id": 18205849789,

"label": "Dark brown"

},

{

"option\_id": 18205849791,

"label": "Light brown"

},

{

"option\_id": 18205849793,

"label": "White"

},

{

"option\_id": 18205849795,

"label": "Black"

}

\]

}

\]

}

---

### Quick Start Tutorial | Etsy Open API v3

Source: https://developers.etsy.com/documentation/tutorials/quickstart/

# Quick Start Tutorial | Etsy Open API v3

This tutorial walks you through building a very simple Node.js application from start to finish. By the end, you will have a working application with a valid OAuth 2.0 access token to make requests to any scoped endpoint.

## Initial setup[#](https://developers.etsy.com/documentation/tutorials/quickstart/#initial-setup "Direct link to heading")

To get setup, follow these general steps:

1.  To begin, you’ll need a development environment with Node.js installed. If you’re unfamiliar with this setup, [follow these official instructions](https://nodejs.org/en/download).
2.  In your environment, create a directory called `etsyapp` and a new file in that directory called `hello.js`:
3.  Write a one line JavaScript program to print a string literal to the console:
4.  Save `hello.js`
5.  Open a terminal window, navigate to the `etsyapp` directory and type the following command:

If your node and development environment is set up correctly, the terminal responds with the message "Hello, world!"

## Get your API key[#](https://developers.etsy.com/documentation/tutorials/quickstart/#get-your-api-key "Direct link to heading")

To complete any request to the Etsy Open API v3, you require an Etsy API key. Etsy issues API keys upon request to develop an application for your Etsy account.

### Register a new application[#](https://developers.etsy.com/documentation/tutorials/quickstart/#register-a-new-application "Direct link to heading")

If you already have an existing Etsy application, you can skip to the next section. If you don’t, you’ll need to create one. Open a web browser and navigate to [https://www.etsy.com/developers/register](https://www.etsy.com/developers/register) and fill out the required information.

### Find the keystring and shared secret for your application[#](https://developers.etsy.com/documentation/tutorials/quickstart/#find-the-keystring-and-shared-secret-for-your-application "Direct link to heading")

1.  Navigate to [Manage your apps](https://www.etsy.com/developers/your-apps) on Etsy’s developer page.
2.  Click on the visibility icon next to the shared secret for the application you want to use in this tutorial. Copy down your Etsy App API Key _keystring_ and _shared secret_. Be sure not to publish the shared secret.

##### Important

Your API key is not active until it has been approved. Once approved, the status will be updated in the "Manage Your Apps" section. Approval is a prerequisite before continuing with this tutorial.

## Start with a simple Express server application[#](https://developers.etsy.com/documentation/tutorials/quickstart/#start-with-a-simple-express-server-application "Direct link to heading")

The OAuth2 Authorization Code flow requires a callback URL to which to send the authorization code, which in this case maps to your application. For a server-side app built with Node, this means Node must be running as a server and the callback URL must map to a specific resource on that server. To keep this example simple, we use the Express package for Node and build a basic web service to handle the OAuth2 Authorization Code response.

To build a simple web server in Node, perform the following steps:

1.  We will be using several npm packages for this tutorial. Start by creating a new file in your `etsyapp` directory called `package.json`. Paste the following code in the file and save it.

2.  From your terminal, run `npm install`.
    
3.  Create a new file called server.js in your etsyapp directory. For example, you can type the following command in the terminal window and press enter:
    
4.  Open `server.js` for editing and write code to start a simple web server on port 3003. For example, if your host URL is localhost:
    
5.  Save `server.js`
    
6.  Open a terminal window and type the following command:
    

If you successfully started the web server, your console log should read:

And if you open http://localhost:3003 in a web browser on the same machine or any connected machine, you should see the message "Hello, world!" on the web page.

### ✓ Checkpoint: Express server running[#](https://developers.etsy.com/documentation/tutorials/quickstart/#%E2%9C%93-checkpoint-express-server-running "Direct link to heading")

At this point you should have:

*   A running Express server on port 3003
*   A browser showing "Hello, world!" at http://localhost:3003
*   Files: `package.json`, `server.js`

## Test your API key[#](https://developers.etsy.com/documentation/tutorials/quickstart/#test-your-api-key "Direct link to heading")

There are a limited set of Open API v3 endpoints that do not require an OAuth token, so you can test your API key before requesting an access token. Test your API key using the following procedure:

1.  Open `server.js` again.
2.  Write code to make a GET request to the [`ping`](https://developers.etsy.com/documentation/reference/#operation/ping) endpoint — which does not require authentication scopes — and print the response to the console. For example, if your API _keystring_ were `1aa2bb33c44d55eeeeee6fff` and your shared secret were `a1b2c3d4e5`, then your updated code might look like the following:

3.  Save `server.js`
4.  Open a terminal window and type the following command:

Open http://localhost:3003/ping in a web browser on the same machine or any connected machine. If your API _keystring_ and _shared secret_ are working properly, you should see a JSON array that includes the application ID for the application associated with this keystring. The response should look like this:

### ✓ Checkpoint: API key verified[#](https://developers.etsy.com/documentation/tutorials/quickstart/#%E2%9C%93-checkpoint-api-key-verified "Direct link to heading")

At this point you should have:

*   A successful response from the `/ping` endpoint showing your application ID
*   Confirmed that your API keystring and shared secret are valid
*   An updated `server.js` with the `/ping` route

## Create the client landing page[#](https://developers.etsy.com/documentation/tutorials/quickstart/#create-the-client-landing-page "Direct link to heading")

We create an entry point to our application by creating a "views" directory — which Express exposes with middleware — and adding a client landing page that makes an OAuth2 request. To create the client landing page, perform the following procedure:

1.  Before you begin, you will need the following authentication parameters:
    
    *   a redirect URI on your web server, such as http://localhost:3003/oauth/redirect, which you will setup as the '/oauth/redirect' route in the next section
    *   a state string, which can be any non-empty, non-whitespace string, but which you must use in all requests in the same Authorization code flow, for example "superstring"
    *   a PKCE _code challenge_ generated from the _code verifier_, which Etsy requires later in the authorization code flow
2.  In your etsyapp directory, create a new directory named "views".
    
3.  Navigate to the `/views` directory and create a new file called "index.hbs".
    
4.  Open index.hbs for editing and code a simple HTML page with an OAuth request. For example, to request an authorization code for an Etsy app requiring an `email_r` scope with an App API Key _keystring_ of `1aa2bb33c44d55eeeeee6fff`, you can create a page with one link like the following:
    

This link in this template has every element required for an OAuth connect request to Etsy, as detailed in the [Authentication topic](https://developers.etsy.com/documentation/essentials/oauth2) on this site. If you need help generating the state and code challenge values, follow the instructions below.

### Generate the PKCE code challenge[#](https://developers.etsy.com/documentation/tutorials/quickstart/#generate-the-pkce-code-challenge "Direct link to heading")

There are a variety ways to generate the _state_, _code challenge_, and _code verifier_ values, but we thought it would be helpful to share an example.

1.  To start, create a new file called `code-generator.js`.
2.  Paste in the following code.

3.  Save the file and run `node code-generator.js` from a terminal prompt. Here’s an example of a successful response in the terminal.

### ✓ Checkpoint: OAuth parameters generated[#](https://developers.etsy.com/documentation/tutorials/quickstart/#%E2%9C%93-checkpoint-oauth-parameters-generated "Direct link to heading")

At this point you should have:

*   A `code-generator.js` file that generates PKCE values
*   Your state, code challenge, and code verifier values (save the code verifier for later!)
*   A `views/` directory with an `index.hbs` file containing your OAuth link
*   The full OAuth URL with your API key and generated values

## Implement the `redirect_uri` route[#](https://developers.etsy.com/documentation/tutorials/quickstart/#implement-the-redirect_uri-route "Direct link to heading")

The URI string for the client landing page above contains a `redirect_uri` "http://localhost:3003/oauth/redirect", which is a local address to which the OAuth server delivers the authorization code. In Node, this `redirect_uri` must be a route to a resource to receive the authentication code and use it to request an OAuth token. Use the following procedure to create the redirect route:

1.  Navigate to your /etsyapp directory and open `server.js` in your editor.
2.  Add code for the "oauth/redirect" route to make a POST request to `https://api.etsy.com/v3/public/oauth/token` with the authentication code gathered from the request , as shown below:

3.  Go back to your terminal prompt and run `node server.js`. Then visit http://localhost:3003. You should see the full JSON payload returned from a successful OAuth flow.

##### tip

If you see an error after clicking the “Authenticate with Etsy” button, you might need to [add your redirect URI](https://developers.etsy.com/documentation/essentials/authentication#redirect-uris).

### ✓ Checkpoint: OAuth flow working[#](https://developers.etsy.com/documentation/tutorials/quickstart/#%E2%9C%93-checkpoint-oauth-flow-working "Direct link to heading")

At this point you should have:

*   A working `/oauth/redirect` route in your `server.js`
*   Successfully clicked “Authenticate with Etsy” and authorized the app
*   Received a JSON response containing an `access_token` after authorization
*   Your `clientID` and `clientVerifier` values properly set in `server.js`

## Display a response from a scoped endpoint[#](https://developers.etsy.com/documentation/tutorials/quickstart/#display-a-response-from-a-scoped-endpoint "Direct link to heading")

To finish the tutorial, we will use the generated access token to make an authenticated request to a scoped endpoint. Follow the steps below to create one last route in your Express application.

1.  Create a "views/welcome.hbs" file. This template will be used to offer a welcome message to the authenticated user. Copy the following code into the file.

2.  Write code in our new route handler to request user information from the Open API v3 [getUser](https://developers.etsy.com/documentation/reference/#operation/getUser) endpoint. This requires an access token with `email_r` scope, which was established in the initial authorization code request. For example, this will welcome the authenticated user by their first name:

3.  Go back to your terminal prompt and run `node server.js`. Then visit http://localhost:3003. If the `code_challenge` value in your index.hbs file is still valid, you should be able to go through the authentication flow and find yourself at the `/welcome` page with the following message:

### ✓ Checkpoint: Complete application[#](https://developers.etsy.com/documentation/tutorials/quickstart/#%E2%9C%93-checkpoint-complete-application "Direct link to heading")

Congratulations! At this point you should have:

*   A complete OAuth 2.0 flow from start to finish
*   A `/welcome` page that displays the authenticated user's first name
*   A `views/welcome.hbs` template file
*   Successfully made an authenticated API request to the `getUser` endpoint
*   All files from the project structure in place and working

## Handling errors[#](https://developers.etsy.com/documentation/tutorials/quickstart/#handling-errors "Direct link to heading")

While thorough error handling is out of scope for this tutorial, here is a simple way to see more of the error response with `fetch`. When `response.ok` returns `false`, you can access the error response with the following code:

If you followed every step of this tutorial, you likely ran into an error when implementing the welcome page as your code value had been used before. If you implement the error handling above, `errorData` would log the following value:

## Wrap up[#](https://developers.etsy.com/documentation/tutorials/quickstart/#wrap-up "Direct link to heading")

That’s where we will wrap up our quickstart guide. Here are a few places you could turn next:

*   [Requesting a Refresh OAuth Token](https://developers.etsy.com/documentation/essentials/authentication#requesting-a-refresh-oauth-token)
*   [API Reference](https://developers.etsy.com/documentation/reference)
*   Explore one of our [other tutorials](https://developers.etsy.com/documentation/tutorials/overview)

---

### Shop Management Tutorial | Etsy Open API v3

Source: https://developers.etsy.com/documentation/tutorials/shopmanagement

# Shop Management Tutorial | Etsy Open API v3

##### important

These tutorials are subject to change as endpoints change during our feedback period development. We welcome your feedback! If you find an error or have a suggestion, please post it in the [Open API GitHub Repository](https://github.com/etsy/open-api).

An Etsy shop is a common resource to organize a seller's listings and service buyers, and every Etsy user has at least one shop. Shops contain references to all resource, listing, and sales records, including previously uploaded files, images, shipping profiles, and deleted listings. Apps create or update most of these references using resource-specific endpoints, but require a shop ID to access them. You can update the shop and create shop sections using requests to the shop resource directly. The Etsy Open API v3 supports managing individual shops or shops across the Etsy marketplace as a whole, depending on your application's [Access Level](https://developers.etsy.com/documentation/tutorials/#personal-access).

_Throughout this tutorial, the instructions reference REST resources, endpoints, parameters, and response fields, which we cover in detail in [Request Standards](https://developers.etsy.com/documentation/tutorials/essentials/requests) and [URL Syntax](https://developers.etsy.com/documentation/tutorials/essentials/urlsyntax)._

### `Authorization` and `x-api-key` header parameters[#](https://developers.etsy.com/documentation/tutorials/shopmanagement/#authorization-and-x-api-key-header-parameters "Direct link to heading")

The endpoints in this tutorial require an OAuth token in the header with `shops_r` and `shops_w` scope. In addition, to assign Listings to a shop section ([see below](https://developers.etsy.com/documentation/tutorials/shopmanagement#add-a-shop-section)), you require an OAuth token with a `listings_w` scope. See the [Authentication topic](https://developers.etsy.com/documentation/tutorials/essentials/authentication) for instructions on how to generate an OAuth token with these scopes.

In addition, all Open API V3 requests require the `x-api-key:` parameter in the header with your shop's Etsy App API Key _keystring_ and _shared secret_, separated by a colon (`:`), which you can find in [Your Apps](https://www.etsy.com/developers/your-apps).

## Customize announcements and sales messages[#](https://developers.etsy.com/documentation/tutorials/shopmanagement/#customize-announcements-and-sales-messages "Direct link to heading")

You can assign and change the following attributes for a shop using the [`updateShop`](https://developers.etsy.com/documentation/reference/#operation/updateShop) endpoint:

*   `title`: The title displayed at the top of all the shop's pages
*   `announcement`: A message displayed on the shop's homepage
*   `sale_message`: A message sent to the buyer's Etsy messages when they purchase any product from this shop
*   `digital_sale_message`: A message sent to the buyer's Etsy messages when they purchase any digital product from this shop

The following procedure changes the messages for a shop:

1.  Form a valid URL for [`updateShop`](https://developers.etsy.com/documentation/reference/#operation/updateShop), which must include your `shop_id`. For example, if your shop\_id is 12345678, the updateShop URL is:
    
2.  Build the updateShop request body with the messages you want to update. All the parameters accept string values.
    
3.  Execute an updateShop PUT request with a `shops_r` and `shops_w` combined scope OAuth token and `x-api-key`. For example, an updateShop request to update all messages for Manny's Land of Carpets would look like the following:
    

*   JavaScript fetch
*   PHP curl

## Add a Shop Section[#](https://developers.etsy.com/documentation/tutorials/shopmanagement/#add-a-shop-section "Direct link to heading")

Shop sections organize listings displayed in an Etsy shop. You can create shop sections using the [`createShopSection`](https://developers.etsy.com/documentation/reference/#operation/createShopSection) endpoint, which provides the new shop section ID in the response. To add a listing to a shop section, use the `updateListing` endpoint with the `section_id` parameter set to a section ID.

The following procedure creates a new shop section and updates a listing to display in the new shop section:

1.  Form a valid URL for [`createShopSection`](https://developers.etsy.com/documentation/reference/#operation/createShopSection), which must include your `shop_id`. For example, if your shop\_id is 12345678, the createShopSection URL is:
    
2.  Build the createShopSection request body, which must include `title` with a string to display at the top of a section in the shop.
    
3.  Execute a createShopSection POST request with a `shops_w` scope OAuth token and `x-api-key`. For example, a createShopSection request to create the "Spiral Carpet" section might look like the following:
    

*   JavaScript fetch
*   PHP curl

4.  Set all listings' section\_ids to the section ID for the section in which you want to display the listings with an [`updateListing`](https://developers.etsy.com/documentation/reference/#operation/updateListing) PUT request that includes `shop_id` and `listing_id` in the URL, a `listings_w` scoped OAuth token and `x-api-key` in the header, and the new section ID in the request body. For example, if your `shop_id` is 12345678, your `listing_id` is 192837465, and your `section_id` is 55566585, then the updateListing URL is:

*   JavaScript fetch
*   PHP curl

---

### Third Variation Tutorial | Etsy Open API v3

Source: https://developers.etsy.com/documentation/tutorials/third-variation

# Third Variation Tutorial | Etsy Open API v3

##### important

This is an upcoming feature. OpenAPI devs need to be ready by **June 1st 2026**, but Etsy will communicate the exact date of launch closer to cutover.

The maximum number of listing properties to be used in a listing's inventory is now 3. Set the _new_ query parameter `max_variations_supported` to `3` to write listing inventory with 3 variations.

The third variation has to be one of the properties of the [listing's taxonomy node](https://developer.etsy.com/documentation/reference#operation/getPropertiesByTaxonomyId) and can only use the property's predefined values(`"possible_values"`). The third variation cannot be a [custom variation](https://developers.etsy.com/documentation/tutorials/third-variation/listings#custom-variations) or have [custom values](https://developers.etsy.com/documentation/tutorials/third-variation/#writing-a-third-variation-value-types). When using predefined properties and values, buyers can find your listings via search filters.

## Reading Listings with a Third Variation[#](https://developers.etsy.com/documentation/tutorials/third-variation/#reading-listings-with-a-third-variation "Direct link to heading")

##### warning

Ensure you update your app to support reading all three variations before June 1st 2026. After that date, your app may incorrectly process listings with three variations and fail silently.

Endpoints that return inventory and variation data may now have up to three variations.

If a listing has three variations:

*   when calling [getListingInventory](https://developer.etsy.com/documentation/reference/#operation/getListingInventory), all the `"products" > "property_values"` arrays have three elements.
*   when calling [getListing](https://developer.etsy.com/documentation/reference/#operation/getListing) with the `includes=Inventory` query param, the `"inventory" > "products" > "property_values"` arrays have three elements.
*   when calling [getShopReceiptTransaction](https://developer.etsy.com/documentation/reference/#operation/getShopReceiptTransaction) for a transaction for the listing, the `"variations"` array has three elements.
*   when calling [getShopReceipt](https://developer.etsy.com/documentation/reference/#operation/getShopReceipt) for a receipt for the listing, the `"transactions" > "product_data"` arrays and the `"transactions" > "variations"` array have three elements.

**Example Response for `getListingInventory`**

## Writing Listings with a Third Variation[#](https://developers.etsy.com/documentation/tutorials/third-variation/#writing-listings-with-a-third-variation "Direct link to heading")

The [updateListingInventory](https://developer.etsy.com/documentation/reference/#operation/updateListingInventory) accepts values for a third variation. If the query parameter `max_variations_supported` is set to `3`, adding or updating the third variation is enabled. The third variation cannot be a custom variation or have custom values. The `*_on_property` fields can have zero, one, or all the variation properties.

*   **Related endpoints:** [updateListingInventory](https://developer.etsy.com/documentation/reference/#operation/updateListingInventory)
*   **Structure changes:** The request and response structures remain the same.
*   **New parameters:** Optional integer query parameter `max_variations_supported` with accepted values `[2, 3]`.
    *   If _included_ and set to `3`, the endpoint accepts requests with three variations and/or updates to listings with three variations.
    *   If _omitted_ or set to `2`, the endpoint rejects requests with three variations and/or updates to listings with three variations and return an appropriate error message.
    *   Invalid values for this parameter return an appropriate error message.
    *   For requests with two or less variations this parameter is not required.
*   **Errors:**
    *   400: Invalid value (X) for query parameter `max_variations_supported`.
    *   400: Could not update inventory with unsupported number of variations. The maximum number of supported variations is X.
    *   400: Could not update inventory because the third variation uses a custom variation property (513 or 514).
    *   400: Could not update inventory because the third variation does not support custom values. Use the property's value ids defined by the listing's taxonomy node.
    *   400: `X_on_property:` unsupported number of property IDs. Supports only zero, one, or all variation properties (Y).

### Parameter Conditionals[#](https://developers.etsy.com/documentation/tutorials/third-variation/#parameter-conditionals "Direct link to heading")

*   Query parameter `max_variations_supported` is omitted or set to `2`.

| Listing | Request Payload | Result |
| --- | --- | --- |
| Has up to two variations | Has up to two variations | Request succeeds, listing has _request_ variations |
| Has **up to three** variations | Has **three** variations | Request fails with a 400 error, listing has _original_ variations |
| Has **three** variations | Has **up to three** variations | Request fails with a 400 error, listing has _original_ variations |

*   Query parameter `max_variations_supported` is set to `3`.

| Listing | Request Payload | Result |
| --- | --- | --- |
| Has **up to three** variations | Has **up to three** variations | Request succeeds, listing has _request_ variations |

**Notes:**

*   If the `max_variations_supported` query parameter is set to a different value than `2` or `3` the request returns a 400 error.
*   If the listing has three variations and the request payload has less than three variations, the missing variations is deleted.

### Writing a Third Variation[#](https://developers.etsy.com/documentation/tutorials/third-variation/#writing-a-third-variation "Direct link to heading")

Use the endpoint [getPropertiesByTaxonomyId](https://developer.etsy.com/documentation/reference#operation/getPropertiesByTaxonomyId) to get the list of properties that can be used for variations (`"supports_variations": true`). The third variation can't be a [custom variation](https://developers.etsy.com/documentation/tutorials/third-variation/listings#custom-variations). Custom variations use `property_id`s `513` and `514`. The first two variations can be custom or property variations.

#### Examples[#](https://developers.etsy.com/documentation/tutorials/third-variation/#examples "Direct link to heading")

*   Parameter set to 3
*   Parameter unset or set to 2
*   Parameter set to 3, custom variation

*   **Context:**
    *   Request for listing with two or less variations, request adds a third variation.
    *   Query parameter `max_variations_supported` is set to `3`. (`max_variations_supported=3`)
*   **Response changes:**
    *   All `products[].property_values` have three elements.
    *   The `*_on_property` fields may have zero, one, or all three properties.

**Example Payload**

**Example Response**

### Writing a Third Variation: Value Types[#](https://developers.etsy.com/documentation/tutorials/third-variation/#writing-a-third-variation-value-types "Direct link to heading")

The values of the third variation must be predefined for the property. There are three kinds of properties that support variations for the third variation:

*   Properties with predefined values, for example `Color(200)`: The third variation can only use the predefined values.
*   Properties with predefined scales and predefined values, for example `Bed pillow size (148789511779)`: The third variation can only use the predefined scales with the predefined values.
*   Properties with predefined scales and no predefined values, for example `Width(47626759898)`: The third variation can use the predefined scales with custom values.

Use the endpoint [getPropertiesByTaxonomyId](https://developer.etsy.com/documentation/reference/#operation/getPropertiesByTaxonomyId) to get the valid `value_id` or `scale_id` for the related properties of the listing's taxonomy node.

#### Examples[#](https://developers.etsy.com/documentation/tutorials/third-variation/#examples-1 "Direct link to heading")

*   Predefined values
*   Predefined scaled values
*   Scaled custom values
*   Custom values

*   **Context:**
    *   Payload has a third variation with predefined values.
    *   Query parameter `max_variations_supported` is set to `3`. (`max_variations_supported=3`)
*   **Response changes:**
    *   All `products[].property_values` have three elements.
    *   The `*_on_property` fields may have zero, one, or all three properties.

**Example Payload**

**Example Response**

### Writing a Third Variation: On Property[#](https://developers.etsy.com/documentation/tutorials/third-variation/#writing-a-third-variation-on-property "Direct link to heading")

For listings with a third variation, you can use the `*_on_property` fields as follows:

*   Leave all of them empty, OR
*   Add _one_ property to any of them, OR
*   Add _all three_ properties to any of them.

When the listing has three variations, adding only two properties to any of these fields returns an error.

#### Examples[#](https://developers.etsy.com/documentation/tutorials/third-variation/#examples-2 "Direct link to heading")

*   Empty on\_property fields
*   Up to one element
*   Three elements
*   Two elements

*   **Context:**
    *   Payload has a third variation and empty `*_on_property` fields.
    *   Query parameter `max_variations_supported` is set to `3`. (`max_variations_supported=3`)
*   **Response changes:**
    *   All `products[].property_values` have three elements.
    *   The `*_on_property` fields are empty.

**Example Payload**

**Example Response**

### Removing the Third Variation[#](https://developers.etsy.com/documentation/tutorials/third-variation/#removing-the-third-variation "Direct link to heading")

To remove the third variation, use the [updateListingInventory](https://developer.etsy.com/documentation/reference/#operation/updateListingInventory) endpoint. Set the query parameter `max_variations_supported` to `3` and remove the variation property from `property_values`. Ensure that `*_on_property` fields only have properties used in the new inventory.

#### Examples[#](https://developers.etsy.com/documentation/tutorials/third-variation/#examples-3 "Direct link to heading")

*   Parameter set to 3
*   Parameter unset or set to 2

*   **Context:**
    *   Request for listing with three variations, payload removes a variation
    *   Query parameter `max_variations_supported` is set to `3`. (`max_variations_supported=3`)
*   **Response changes:**
    *   All `products[].property_values` have two elements.
    *   The `*_on_property` fields may have zero, one, or all two properties.

**Example Payload**

**Example Response**


