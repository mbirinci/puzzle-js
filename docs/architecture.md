# Architecture

PuzzleJs implements micro-services architecture into front-end. The idea of micro-frontend comes from [BigPipe](https://www.facebook.com/notes/facebook-engineering/bigpipe-pipelining-web-pages-for-high-performance/389414033919/), Facebook's fundamental redesign of the dynamic web page serving system. Here is how a PuzzleJs website architecture looks like.

![Architecture](https://i.gyazo.com/647c7733aa6fb47839037d3fab2d3ee0.png)

There are two types of PuzzleJs implementation, storefront and gateway.

## Storefront Application

Storefront is the main application that handles requests coming from user's browser. A basic storefront application has two important configurations.

1. Gateways it should connect
2. Pages it should render

Whenever a storefront Application starts, PuzzleJs executes some steps before creating http server to handle requests.

1. Fetch configuration from gateways
2. Parse page html files to detect [fragments](#fragments)
3. Compile html files into javascript functions based on configurations fetched from gateways.

After compiling html files into javascript functions it creates a http server. Whenever a request comes, response is sent with several steps.

1. Send initial chunk without waiting anything
2. Request responsible gateways for their fragments
3. Stream each fragment content into browser
4. When all fragments are streamed, finish response and close connection.

## Gateway Application

Gateway is the application where you can implement your fragments and apis. It is responsible for collecting data from other applications and rendering smaller html contents(fragments) with them. Gateways can be used for these features.

* Rendering fragments
* Public Apis


## Fragments

Fragments are small html contents which can work standalone and has independent data for other html contents. Think about an e-commerce website.

![Fragment Example](https://i.gyazo.com/ea17e2485308b0319a82e00eba303161.png)

There are 5 fragments in this page. They are fully different applications independent from each other and communicating others through a shared publish-subscribe bus.

Fragments can have multiple parts. Same fragment can put content into header and footer or even a meta tag. Check [Template](#template)

### Fragment Types

There are 4 types of fragments

| Name | Description |
| - | - |
| Chunked | Storefront will stream this fragment's contents into browser with [individual chunk](#individual-chunk) |
| ShouldWait | Storefront will send this fragments contents in [initial chunk](#initial-chunk) |
| Primary | Storefront will send this fragments contents in initial chunk and reflect gateways status code |
| Static | This fragment contents are fetched on compile time and storefront won't request to gateway again for this. It is sent on initial chunk |

#### Chunked Fragments

Chunked fragments are sent after initial chunk whenever they are ready. You can check them in tcp stream using `curl --raw http://127.0.0.1:8080`, and example below.
```html
0xf3
<html>
    <head></head>
    <body>
        <div>Initial chunk</div>
0xa2
        <div>Chunked Div</div>
    </body>
</html>
```
There two hex numbers in stream (0xf3, 0xa2). They are representing the size of the chunk. Lets assume that second chunk is sent after 600ms. Browser already parsed and rendered contents of the first chunk. Whenever second chunk is arrived browser parses it too and render it's contents.

Chunked fragments are sent after the initial chunk. Like the example above `<div>Chunked Div</div>` is a chunked fragment

#### ShouldWait Fragments

ShoudWait fragment are the fragments that should be waited and injected into initial chunk. Lets assume a page with 2 fragments. One is shouldWait and the other is chunked.
```html
0xf3
<html>
    <head></head>
    <body>
        <div>ShouldWait fragment</div>
0xa2
        <div>Chunked Fragment</div>
    </body>
</html>
```

If a fragment or it's partial is in `<head>`, PuzzleJs makes that fragment shouldWait automatically.
ShouldWait fragments will be requested from gateways by storefront on each request. Adding meta tags is a great example for usage of shouldWait fragments.

#### Primary Fragments

These fragments has all features of [ShouldWait Fragments](#shouldwait-fragments), but in addition primary fragments are unique and the main content of the page.

A primary fragment can change status code and the headers of the response.
Assume that there is a fragment that brings product contents by product id. But requested product id doesn't exists. Gateway can decide to send reponse status code 404 with product not found content.

Or gateway can redirect storefront using 301 and `location` header.

#### Static Fragments

These fragments are fetched during compile time and directly injected into compiled function. They are sent on initial chunk.
Only gateway can decide if a fragment should be static or not.
